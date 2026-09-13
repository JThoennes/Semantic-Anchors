import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const index = readFileSync(
  path.join(import.meta.dirname, '../website/public/llms-index.txt'),
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
