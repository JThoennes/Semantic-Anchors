import { describe, it, expect } from 'vitest'
import { promptAttribute, CATALOG_PROMPT } from './talk-it-over.js'

const decode = (value) => value.replace(/&#10;/g, '\n')

describe('promptAttribute', () => {
  const prompts = [
    CATALOG_PROMPT,
    'one line, no break at all',
    'two\nlines',
    'a paragraph\n\nand another\n\nand a third',
    '\nleading and trailing\n',
    'ümläute, & ampersand, "quotes" and 🤖',
  ]

  // The invariant that matters: every newline becomes exactly one entity, and
  // nothing else changes. A serialiser that swallowed one break, or doubled the
  // last one, would still produce an attribute that looks fine.
  it.each(prompts)('turns every newline into exactly one entity: %j', (prompt) => {
    const attribute = promptAttribute(prompt)
    const newlines = (prompt.match(/\n/g) || []).length
    const entities = (attribute.match(/&#10;/g) || []).length

    expect(entities).toBe(newlines)
    expect(attribute).not.toContain('\n')
  })

  it.each(prompts)('round-trips back to the original prompt: %j', (prompt) => {
    expect(decode(promptAttribute(prompt))).toBe(prompt)
  })

  it('leaves a prompt without newlines untouched', () => {
    expect(promptAttribute('nothing to escape')).toBe('nothing to escape')
  })
})
