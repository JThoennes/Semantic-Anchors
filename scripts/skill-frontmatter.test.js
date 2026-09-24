import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const skillDir = path.join(import.meta.dirname, '..', 'skill')
const skills = readdirSync(skillDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)

/*
 * Reported as #723: JetBrains Rider refused the arc42 skill with "Invalid
 * front matter" and loaded nothing. The cause was a colon-space inside an
 * unquoted YAML scalar — YAML reads it as a nested mapping key, so the whole
 * document fails to parse. Claude Code happens to tolerate it; other harnesses
 * do not, and a skill that does not load fails silently.
 *
 * Checked without a YAML dependency, because one hazard covers the realistic
 * case: prose descriptions grow a colon. A quoted or block scalar is immune,
 * so only plain scalars are examined.
 */
describe('skill front matter parses everywhere, not just in Claude Code', () => {
  const frontMatterOf = (name) => {
    const text = readFileSync(path.join(skillDir, name, 'SKILL.md'), 'utf-8')
    const match = /^---\n(.*?)\n---/s.exec(text)
    expect(match, `${name}/SKILL.md has no front matter`).not.toBeNull()
    return match[1]
  }

  it.each(skills)('%s: no colon-space inside a plain scalar', (name) => {
    const fm = frontMatterOf(name)
    for (const [, key, raw] of fm.matchAll(/^(\w[\w-]*):[ \t]*(.*)$/gm)) {
      const value = raw.trim()
      if (value === '' || /^[>|"'[{&*!#]/.test(value)) continue // block, quoted or empty
      expect(value, `${name}: "${key}" is a plain scalar and contains ": "`).not.toContain(': ')
    }
  })

  it.each(skills)('%s: declares a name and a description', (name) => {
    const fm = frontMatterOf(name)
    expect(fm, `${name} has no name:`).toMatch(/^name:/m)
    expect(fm, `${name} has no description:`).toMatch(/^description:/m)
  })
})
