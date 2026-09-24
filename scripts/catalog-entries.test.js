import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

/*
 * Reported as #724: DRY appeared twice in the translator catalogue, once in
 * full and once as a one-line stub. The catalogue is maintained by hand on
 * every new anchor, so a second entry is easy to add and invisible to read.
 * A duplicate is not cosmetic here: the catalogue is what the translator skill
 * reads, and two entries for one term hand the model two definitions.
 */
describe('translator catalogue', () => {
  const catalogue = readFileSync(
    path.join(import.meta.dirname, '..', 'skill/semantic-anchor-translator/references/catalog.md'),
    'utf-8'
  )

  it('names every term exactly once', () => {
    const seen = new Map()
    for (const [, term] of catalogue.matchAll(/^### (.+)$/gm)) {
      seen.set(term, (seen.get(term) ?? 0) + 1)
    }
    const duplicates = [...seen].filter(([, count]) => count > 1).map(([term]) => term)
    expect(duplicates, `listed more than once: ${duplicates.join(', ')}`).toEqual([])
  })
})
