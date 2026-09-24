import { describe, it, expect } from 'vitest'
import { packBundles, withPageLink } from './anchor-bundles.js'

const sizes = (map) => (id) => map[id]
const allAnchors = (bundles) => bundles.flatMap((b) => b.anchors)

describe('packBundles', () => {
  const categories = [
    { id: 'a', name: 'Alpha', anchors: ['a1', 'a2', 'a3'] },
    { id: 'b', name: 'Beta', anchors: ['b1'] },
  ]
  const sizeOf = sizes({ a1: 10, a2: 10, a3: 10, b1: 5 })

  // The invariant that decides whether the site stays whole: every anchor ends
  // up in exactly one bundle, whatever the limit. A packer that dropped the
  // anchor that did not fit, or wrote it into two parts, would still produce
  // bundles that look right.
  it.each([1, 5, 9, 10, 11, 15, 20, 25, 100, 1000])(
    'places every anchor exactly once at limit %i',
    (limit) => {
      const placed = allAnchors(packBundles(categories, sizeOf, limit))

      expect([...placed].sort()).toEqual(['a1', 'a2', 'a3', 'b1'])
    }
  )

  // Granularity: the limit is a byte budget, not a count. A packer that split
  // "every N anchors" would pass the test above and produce a 200 KB bundle the
  // moment the anchors grew.
  it.each([15, 20, 25, 40])('keeps every bundle within the limit at %i', (limit) => {
    for (const bundle of packBundles(categories, sizeOf, limit)) {
      const bytes = bundle.anchors.reduce((sum, id) => sum + sizeOf(id), 0)
      // One anchor larger than the limit is the single case that cannot be
      // split, so a bundle may exceed the limit only when it holds one anchor.
      if (bundle.anchors.length > 1) expect(bytes).toBeLessThanOrEqual(limit)
    }
  })

  it('never splits inside an anchor', () => {
    const bundles = packBundles(categories, sizeOf, 4)

    for (const bundle of bundles) expect(bundle.anchors.length).toBeGreaterThan(0)
    expect(allAnchors(bundles)).toHaveLength(4)
  })

  // A category that fits keeps its plain name; one that splits says which part
  // it is, so the LLM can tell two halves of the same category apart.
  it('numbers the parts only when a category is split', () => {
    const whole = packBundles(categories, sizeOf, 1000)
    const split = packBundles(categories, sizeOf, 10)

    expect(whole.map((b) => b.title)).toEqual(['Alpha', 'Beta'])
    expect(split.map((b) => b.title)).toEqual(['Alpha (1/3)', 'Alpha (2/3)', 'Alpha (3/3)', 'Beta'])
    expect(whole.map((b) => b.id)).toEqual(['a', 'b'])
    expect(split.map((b) => b.id)).toEqual(['a-1', 'a-2', 'a-3', 'b'])
  })

  it('keeps a category together in one bundle when it fits', () => {
    expect(packBundles(categories, sizeOf, 30)).toHaveLength(2)
  })

  // An id that no file backs would otherwise be written into a bundle as an
  // empty section, and the LLM would report the term as having no content.
  it('skips an anchor it cannot measure', () => {
    const bundles = packBundles(categories, sizes({ a1: 10, a3: 10, b1: 5 }), 100)

    expect(allAnchors(bundles)).toEqual(['a1', 'a3', 'b1'])
  })

  it('returns nothing for no categories', () => {
    expect(packBundles([], sizeOf, 100)).toEqual([])
  })
})

describe('withPageLink', () => {
  const url = 'https://example.org/anchor/mikado-method'

  /*
   * A reader who asks "give me the link" wants the page, not the raw Markdown
   * the LLM happened to read. The bundle is what it reads from, so the bundle
   * carries the link — otherwise the LLM has nothing to quote but the file it
   * was handed, and hands the reader a download.
   */
  it('puts the page link directly under the heading', () => {
    const out = withPageLink('# Mikado Method\n\nBody text.\n', url)

    expect(out.split('\n')[0]).toBe('# Mikado Method')
    expect(out.split('\n').slice(0, 3).join('\n')).toContain(url)
    expect(out).toContain('Body text.')
  })

  it.each([
    '# Title\n\nBody.\n',
    '# Title\nBody with no blank line.\n',
    '\n\n# Title\n\nLeading blank lines.\n',
    '# Title\n\n## Sub\n\n# Not the first heading\n',
  ])('keeps the body intact: %j', (markdown) => {
    const out = withPageLink(markdown, url)

    // Exactly one link is added, and every original line survives.
    expect(out.split(url)).toHaveLength(2)
    for (const line of markdown.split('\n')) expect(out).toContain(line)
  })

  it('adds the link only once, however often it is applied', () => {
    const once = withPageLink('# Title\n\nBody.\n', url)

    expect(withPageLink(once, url).split(url)).toHaveLength(2)
  })

  // Without a heading there is nothing to attach the link to. Prepending it
  // would silently change what the section looks like it is about.
  it('leaves markdown without a heading alone', () => {
    expect(withPageLink('No heading here.\n', url)).toBe('No heading here.\n')
  })
})
