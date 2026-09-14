import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import * as manifest from '../utils/llms-index-manifest.js'

/**
 * Everything the button names must be served as text/plain.
 *
 * GitHub Pages derives the content type from the extension: .md becomes
 * text/markdown, and ChatGPT answers that with "400 Unsupported content-type".
 * It does not tell the reader it lacks the file — it searches the web and
 * answers from what it finds. Measured 2026-09-14: asked three times about
 * files it could not fetch, wrong three times, each answer plausible enough to
 * pass unnoticed without the file in hand.
 *
 * So .txt is not cosmetic here. It is the difference between a reader getting
 * the catalog and a reader getting something invented about the catalog.
 */

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const PUBLIC = path.join(ROOT, 'website/public')

/** Every address the prompt hands to the reader's LLM. */
function addressesInPrompt() {
  return [
    ...manifest.BUNDLES.map((bundle) => bundle.url),
    ...manifest.DOC_PAGES.map((page) => page.url),
    manifest.CONTRACTS_URL,
    manifest.FULL_TEXT_URL,
  ].filter(Boolean)
}

describe('the button only names plain text', () => {
  it('names no address with a markdown extension', () => {
    const markdown = addressesInPrompt().filter((url) => url.endsWith('.md'))

    expect(
      markdown,
      'These are served as text/markdown. ChatGPT refuses them and invents an ' +
        'answer instead of saying so.'
    ).toEqual([])
  })

  it('writes every bundle as .txt', () => {
    const dir = path.join(PUBLIC, 'bundles')
    if (!fs.existsSync(dir)) return // not generated in this checkout

    expect(fs.readdirSync(dir).filter((file) => !file.endsWith('.txt'))).toEqual([])
  })

  it('writes every anchor file as .txt', () => {
    const dir = path.join(PUBLIC, 'anchors')
    if (!fs.existsSync(dir)) return

    expect(fs.readdirSync(dir).filter((file) => !file.endsWith('.txt'))).toEqual([])
  })

  it('names a bundle that was actually written', () => {
    const dir = path.join(PUBLIC, 'bundles')
    if (!fs.existsSync(dir)) return

    const missing = manifest.BUNDLES.map((bundle) => bundle.url.split('/bundles/')[1])
      .filter((file) => file && !fs.existsSync(path.join(dir, file)))

    expect(missing, 'The prompt names a file the build did not write').toEqual([])
  })
})
