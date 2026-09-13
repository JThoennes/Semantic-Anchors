import { describe, it, expect } from 'vitest'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
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
