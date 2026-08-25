import { describe, it, expect, vi } from 'vitest'

vi.mock('../i18n.js', () => ({
  i18n: {
    t: (key) => key,
    currentLang: () => 'en',
  },
}))

import { renderFooter } from './footer.js'

describe('renderFooter — "as seen on" row', () => {
  // Every appearance is one external link plus one logo. A future edit that
  // drops one of them is silent otherwise: the row still renders, just shorter.
  const appearances = [
    { label: 'HMZE', href: 'https://www.youtube.com/watch?v=rQj-B3VTx48', logo: 'hmze-logo.png' },
    { label: 'rabauer.dev', href: 'https://rabauer.dev', logo: 'rabauer-logo.png' },
    {
      label: 'Beyond Code',
      href: 'https://byndcode.com/episodes/ep016-ralf-d-mueller/',
      logo: 'byndcode-logo.png',
    },
  ]

  // Slice out the one <a> element that carries this href, so a logo sitting
  // on the wrong link cannot satisfy the assertion from somewhere else in
  // the footer.
  const anchorFor = (html, href) => {
    const start = html.indexOf(`href="${href}"`)
    expect(start).toBeGreaterThan(-1)
    const open = html.lastIndexOf('<a', start)
    const close = html.indexOf('</a>', start)
    return html.slice(open, close)
  }

  it.each(appearances)('links to $label with its own logo', ({ href, logo }) => {
    const anchor = anchorFor(renderFooter('1.2.3'), href)
    expect(anchor).toContain(logo)
  })

  it('opens every appearance in a new tab without handing over the opener', () => {
    const html = renderFooter('1.2.3')
    for (const { href } of appearances) {
      const anchor = anchorFor(html, href)
      expect(anchor).toContain('target="_blank"')
      expect(anchor).toContain('rel="noopener noreferrer"')
    }
  })

  it('marks the German-language appearances so English readers are not surprised', () => {
    const html = renderFooter('1.2.3')
    expect(html).toContain('HMZE (DE)')
    expect(html).toContain('Beyond Code (DE)')
  })
})
