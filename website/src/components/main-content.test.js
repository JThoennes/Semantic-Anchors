import { describe, it, expect, vi } from 'vitest'

vi.mock('../i18n.js', () => ({
  i18n: {
    t: (key) => key,
    currentLang: () => 'en',
  },
}))

import { renderMain } from './main-content.js'
import { APPEARANCES } from '../data/appearances.js'

describe('renderMain — appearances strip', () => {
  it('shows every appearance above the fold', () => {
    const html = renderMain()
    for (const { href, logo } of APPEARANCES) {
      expect(html).toContain(`href="${href}"`)
      expect(html).toContain(logo)
    }
  })

  // Measured on a 1280x720 laptop: sitting after the how-to-use steps put the
  // strip 35px below the fold, which defeats the point of moving it out of the
  // footer. It belongs directly after the before/after example.
  it('places the strip after the example and before the how-to-use steps', () => {
    const html = renderMain()
    const hero = html.indexOf('id="hero"')
    const strip = html.indexOf('id="appearances"')
    const howTo = html.indexOf('hero.howToUseTitle')
    const filters = html.indexOf('id="filters"')
    expect(hero).toBeGreaterThan(-1)
    expect(strip).toBeGreaterThan(hero)
    expect(strip).toBeLessThan(howTo)
    expect(howTo).toBeLessThan(filters)
  })

  it('keeps press and appearances as separately labelled groups', () => {
    const html = renderMain()
    const strip = html.slice(html.indexOf('id="appearances"'), html.indexOf('id="filters"'))
    expect(strip).toContain('footer.featuredIn')
    expect(strip).toContain('footer.asSeenOn')
  })
})
