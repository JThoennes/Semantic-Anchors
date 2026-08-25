/**
 * Where Semantic Anchors has been covered or discussed.
 *
 * The list itself lives in appearances.json, because it is read from two
 * module systems: this ESM module renders it for the app (footer and the
 * strip under the landing hero), and scripts/prerender-routes.js — plain
 * CommonJS — reads the same JSON to emit the static home page. A .js module
 * could not serve both without an async refactor of that script.
 *
 * `kind` splits the list into the two groups the site labels differently:
 * 'press' is coverage written about us, 'appearance' is a conversation we
 * took part in. They are not the same claim and are not merged.
 */

import appearances from './appearances.json'

export const APPEARANCES = appearances

const SEPARATOR = '<span class="text-gray-300 dark:text-gray-600">|</span>'

function renderOne(entry, basePath, t) {
  const imgClass = entry.imgClass || 'h-6 w-auto'
  const linkClass = [
    'inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity',
    entry.linkClass || '',
  ]
    .join(' ')
    .trim()
  const labelClass = entry.labelClass || 'text-[var(--color-text-secondary)]'
  return `<a
              href="${entry.href}"
              target="_blank"
              rel="noopener noreferrer"
              class="${linkClass}"
              title="${t(entry.titleKey)}"
            >
              <img
                src="${basePath}${entry.logo}"
                alt="${entry.alt}"
                width="${entry.width}"
                height="${entry.height}"
                class="${imgClass}"
                loading="lazy"
              />
              <span class="text-xs ${labelClass}">${entry.label}</span>
            </a>`
}

/**
 * Render the links of one group, separated by the usual pipe. Returns '' when
 * the group is empty, so a caller can drop the whole row without a special
 * case.
 */
export function renderAppearances(kind, basePath, t) {
  return APPEARANCES.filter((entry) => entry.kind === kind)
    .map((entry) => renderOne(entry, basePath, t))
    .join(`\n            ${SEPARATOR}\n            `)
}
