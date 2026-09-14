import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * The llms.txt index is what a reader's LLM gets handed by the TalkItOver
 * button. It can only fetch what that index names.
 *
 * A URL the LLM finds *inside* a fetched document is refused — it was not in
 * the message it was given. So a page mentioned in an anchor's prose is not
 * reachable; it has to be named in the index itself.
 *
 * DOC_PAGES in scripts/generate-llms-txt.js is maintained by hand, on purpose:
 * its summaries are written for an LLM choosing what to fetch, while the
 * descriptions in scripts/prerender-routes.js are meta descriptions written for
 * search engines. Two readers, two texts.
 *
 * What must not differ is the SET of pages. These tests compare the two lists
 * in both directions, so a new page cannot reach the site without reaching the
 * index — that is how seven pages went missing before this test existed.
 */

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const SITE_URL = 'https://llm-coding.github.io/Semantic-Anchors'

/** Paths of the routes that get a pre-rendered documentation page. */
function prerenderedDocPaths() {
  const source = fs.readFileSync(path.join(ROOT, 'scripts/prerender-routes.js'), 'utf-8')
  const routes = source.slice(source.indexOf('const ROUTES = ['))

  // Split on entry boundaries so a route's other fields stay with its path —
  // matching `path:` lines alone would count redirects as pages.
  return routes
    .split(/^ {2}\{$/m)
    .map((entry) => ({
      path: entry.match(/^ {4}path: '([^']+)'/m)?.[1],
      redirect: / {4}redirectTo:/.test(entry),
    }))
    .filter((route) => route.path && !route.redirect)
    .map((route) => route.path)
    // Anchor pages carry their full text inside llms.txt already, and the
    // German tree is a translation of pages the index names in English.
    .filter((route) => !route.startsWith('/anchor/') && !route.startsWith('/de/'))
}

/** Paths the generated index names as documentation pages. */
function indexedDocPaths() {
  const source = fs.readFileSync(path.join(ROOT, 'scripts/generate-llms-txt.js'), 'utf-8')
  const start = source.indexOf('const DOC_PAGES = [')
  const block = source.slice(start, source.indexOf('\n]', start))
  return [...block.matchAll(new RegExp(`'${SITE_URL}([^']*)'`, 'g'))].map((match) => match[1])
}

describe('llms.txt names every documentation page', () => {
  it('leaves no pre-rendered page out of the index', () => {
    const missing = prerenderedDocPaths().filter((route) => !indexedDocPaths().includes(route))

    expect(
      missing,
      `These pages are on the site but not in llms.txt, so the reader's LLM ` +
        `cannot fetch them. Add an entry to DOC_PAGES in ` +
        `scripts/generate-llms-txt.js — with a summary written for an LLM ` +
        `deciding what to read, not the meta description.`
    ).toEqual([])
  })

  it('names no page that the site does not build', () => {
    const dangling = indexedDocPaths().filter((page) => !prerenderedDocPaths().includes(page))

    expect(
      dangling,
      `These pages are named in llms.txt but have no pre-rendered route, so ` +
        `fetching them returns the empty SPA shell instead of the page.`
    ).toEqual([])
  })

  it('gives every indexed page a summary of its own', () => {
    const source = fs.readFileSync(path.join(ROOT, 'scripts/generate-llms-txt.js'), 'utf-8')
    const start = source.indexOf('const DOC_PAGES = [')
    const block = source.slice(start, source.indexOf('\n]', start))
    const summaries = [...block.matchAll(/summary:\s*\n?\s*'([^']*)'/g)].map((m) => m[1])

    expect(summaries).toHaveLength(indexedDocPaths().length)
    expect(summaries.filter((text) => text.trim().length < 20)).toEqual([])
    expect(new Set(summaries).size).toBe(summaries.length)
  })
})
