import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const index = readFileSync(
  path.join(import.meta.dirname, '../website/public/llms-index.md'),
  'utf-8'
)
const links = [...index.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map((m) => m[1])

describe('llms-index.txt', () => {
  it('lists something from every part of the site', () => {
    expect(links.length).toBeGreaterThan(200)
    expect(index).toContain('## Documentation')
    expect(index).toContain('## Semantic Contracts')
    expect(index).toContain('## Anchors')
  })

  /*
   * The point of the index is that a reader's LLM can follow its links. GitHub
   * Pages serves .adoc as application/octet-stream — a binary download, which
   * web fetchers refuse — so anchors are linked as .md. Measured on the live
   * site after a reader's fetch failed on exactly that.
   */
  it('never links a file type that is served as a binary download', () => {
    const bad = links.filter((url) => /\.(adoc|asciidoc)$/.test(url))
    expect(bad).toEqual([])
  })

  it('links pages so they answer directly instead of redirecting first', () => {
    const pages = links.filter((url) => !/\.[a-z]+$/.test(url))
    expect(pages.length).toBeGreaterThan(0)
    for (const url of pages) expect(url.endsWith('/')).toBe(true)
  })

  /*
   * llms.txt carries the whole site as full text, over half a megabyte. A
   * fetcher gives up on it, so the index must not send anyone there.
   */
  it('does not point at the full-text file', () => {
    expect(index).not.toContain('llms.txt')
  })
})

describe('llms-index in three shapes', () => {
  const read = (name) =>
    readFileSync(path.join(import.meta.dirname, `../website/public/${name}`), 'utf-8')

  it('serves the same entries as markdown, plain text and html', () => {
    expect(read('llms-index.txt')).toBe(read('llms-index.md'))

    const html = read('llms-index.html')
    for (const url of links) expect(html).toContain(`href="${url}"`)
  })

  /*
   * A reader's assistant listed the matching entries by name and then refused to
   * fetch them: "not in any prior search or fetch result". The links were in the
   * file — they had arrived as text/plain, and the tool had not recognised them
   * as links. Markup is what makes a link a link to a parser.
   */
  it('marks every link up as a link in the html shape', () => {
    const html = read('llms-index.html')
    const anchors = [...html.matchAll(/<a href="([^"]+)"/g)].map((m) => m[1])

    expect(anchors.length).toBe(links.length)
  })
})
