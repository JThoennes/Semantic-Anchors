import { describe, it, expect, vi } from 'vitest'
import { renderCardGrid } from './card-grid.js'

// Mock i18n module
vi.mock('../i18n.js', () => ({
  i18n: {
    t: (key) => key,
  },
}))

// Mock search-index module
vi.mock('../utils/search-index.js', () => ({
  search: () => [],
  isIndexReady: () => false,
}))

describe('umbrella anchors', () => {
  it('should not render sub-anchors in the main catalog', () => {
    const categories = [{ id: 'design-principles', name: 'Design Principles' }]
    const anchors = [
      { id: 'gof-design-patterns', title: 'GoF', categories: ['design-principles'], roles: ['software-developer'], subAnchors: ['gof-strategy-pattern'], tags: [], proponents: [] },
      { id: 'gof-strategy-pattern', title: 'GoF-Strategy', categories: ['design-principles'], roles: ['software-developer'], umbrella: 'gof-design-patterns', tier: 1, tags: [], proponents: [] },
    ]
    const html = renderCardGrid(categories, anchors)
    expect(html).toContain('gof-design-patterns')
    expect(html).not.toContain('data-anchor="gof-strategy-pattern"')
  })

  it('should add umbrella class to umbrella cards', () => {
    const categories = [{ id: 'design-principles', name: 'Design Principles' }]
    const anchors = [
      { id: 'gof-design-patterns', title: 'GoF', categories: ['design-principles'], roles: ['software-developer'], subAnchors: ['gof-strategy-pattern'], tags: [], proponents: [] },
    ]
    const html = renderCardGrid(categories, anchors)
    expect(html).toContain('anchor-card-umbrella')
  })
})
