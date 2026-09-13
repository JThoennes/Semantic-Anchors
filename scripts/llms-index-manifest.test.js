import { describe, it, expect } from 'vitest'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = path.join(import.meta.dirname, '..')
const index = readFileSync(path.join(root, 'website/public/llms-index.md'), 'utf-8')
const manifestPath = path.join(root, 'website/src/utils/llms-index-manifest.js')
const versionFile = readFileSync(manifestPath, 'utf-8')

describe('llms-index version', () => {
  /*
   * The version is what makes a cached copy of the index expire. If the two
   * files drift apart — index regenerated, version forgotten — readers keep
   * getting the old index and nothing announces it.
   */
  it('matches the index it is supposed to version', () => {
    const expected = createHash('sha256').update(index).digest('hex').slice(0, 8)
    expect(versionFile).toContain(`'${expected}'`)
  })
})

describe('llms-index manifest — the URLs the prompt hands over', () => {
  const load = () => import(pathToFileURL(manifestPath).href)

  /*
   * The prompt names these pages so the reader's LLM may fetch them: a URL it
   * only found inside the fetched index is refused. Hand-writing the list in
   * the prompt would let it drift the first time a page is renamed, so the
   * generator writes it from the same source as the index.
   */
  it('lists exactly the documentation pages the index lists', async () => {
    const { DOC_PAGES } = await load()
    const listed = index
      .slice(index.indexOf('## Documentation'), index.indexOf('## Semantic Contracts'))
      .match(/\((https:\/\/[^)]*)\)/g)
      .map((m) => m.slice(1, -1))

    expect(DOC_PAGES.map((page) => page.url)).toEqual(listed)
  })

  it('names every page absolutely and without a redirect', async () => {
    const { DOC_PAGES, CONTRACTS_URL, FULL_TEXT_URL } = await load()

    for (const { url } of DOC_PAGES) {
      expect(url).toMatch(/^https:\/\//)
      // Without the trailing slash every page answers 301 first, and a redirect
      // is one more thing that can go wrong on the reader's side.
      expect(url.endsWith('/')).toBe(true)
    }
    expect(CONTRACTS_URL).toMatch(/^https:\/\/.*\/contracts\.txt$/)
    expect(FULL_TEXT_URL).toMatch(/^https:\/\/.*\/llms\.txt$/)
  })

  it('carries a title for every page, so the LLM can choose before it fetches', async () => {
    const { DOC_PAGES } = await load()

    expect(DOC_PAGES.length).toBeGreaterThan(0)
    for (const { title } of DOC_PAGES) expect(String(title).trim()).not.toBe('')
  })
})

describe('llms-index manifest — the anchor bundles', () => {
  const load = () => import(pathToFileURL(manifestPath).href)
  const root2 = root

  /*
   * The bundles exist so the prompt can hand over the whole catalogue in a few
   * dozen URLs. A manifest entry without a file behind it sends the reader's
   * LLM to a 404, which it reports as "the site does not cover this".
   */
  it('names a bundle file that exists for every entry', async () => {
    const { BUNDLES } = await load()

    expect(BUNDLES.length).toBeGreaterThan(0)
    for (const { url } of BUNDLES) {
      const name = url.slice(url.lastIndexOf('/') + 1)
      expect(existsSync(path.join(root2, 'website/public/bundles', name))).toBe(true)
    }
  })

  // Cardinality: one manifest entry per generated file, in both directions. A
  // bundle on disk that no entry names is unreachable from the prompt.
  it('names every generated bundle exactly once', async () => {
    const { BUNDLES } = await load()
    const onDisk = readdirSync(path.join(root2, 'website/public/bundles')).sort()
    const named = BUNDLES.map(({ url }) => url.slice(url.lastIndexOf('/') + 1)).sort()

    expect(named).toEqual(onDisk)
  })

  it('lists the same bundles in the index', async () => {
    const { BUNDLES } = await load()

    for (const { url } of BUNDLES) expect(index).toContain(url)
  })
})

describe('anchor bundles — nothing falls out of the catalogue', () => {
  const bundleDir = path.join(root, 'website/public/bundles')
  const anchorDir = path.join(root, 'website/public/anchors')

  /*
   * The invariant the whole design rests on: after the bundles, no anchor is
   * reachable only through a link the reader's LLM may not follow. An anchor
   * that is in the index but in no bundle looks present and answers nothing.
   *
   * Checked end to end, against the generated files — the packer's own unit
   * test cannot see a wiring mistake between packing and writing.
   */
  it('carries every anchor of the catalogue in some bundle', () => {
    const categories = JSON.parse(
      readFileSync(path.join(root, 'website/public/data/categories.json'), 'utf-8')
    )
    const all = readdirSync(bundleDir)
      .map((name) => readFileSync(path.join(bundleDir, name), 'utf-8'))
      .join('\n')

    // Compared by the anchor's own heading rather than by its file name: that
    // is the text a reader's LLM matches against, and it survives a change to
    // the slugging rules.
    const missing = [...new Set(categories.flatMap((c) => c.anchors))].filter((id) => {
      const heading = readFileSync(path.join(anchorDir, `${id}.md`), 'utf-8')
        .split('\n')
        .find((line) => line.startsWith('# '))
      return heading === undefined || !all.includes(heading)
    })

    expect(missing).toEqual([])
  })

  // An anchor listed under two categories belongs in both bundles — the
  // catalogue says it is two things. The total therefore counts memberships,
  // not anchors, and a drop shows up here even when nothing is missing above.
  it('writes one section per category membership', () => {
    const categories = JSON.parse(
      readFileSync(path.join(root, 'website/public/data/categories.json'), 'utf-8')
    )
    const sections = readdirSync(bundleDir).reduce(
      (n, name) =>
        n +
        (readFileSync(path.join(bundleDir, name), 'utf-8').match(/^# /gm).length - 1),
      0
    )

    expect(sections).toBe(categories.flatMap((c) => c.anchors).length)
  })

  it('keeps every bundle inside the size limit it was packed with', () => {
    for (const name of readdirSync(bundleDir)) {
      const bytes = statSync(path.join(bundleDir, name)).size
      // The limit is 40 KB of anchor text; the bundle adds a short header.
      expect(bytes).toBeLessThan(48 * 1024)
    }
  })
})
