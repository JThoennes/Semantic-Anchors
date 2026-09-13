import { describe, it, expect } from 'vitest'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const root = path.join(import.meta.dirname, '..')
const index = readFileSync(path.join(root, 'website/public/llms-index.md'), 'utf-8')
const versionFile = readFileSync(
  path.join(root, 'website/src/utils/llms-index-version.js'),
  'utf-8'
)

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
