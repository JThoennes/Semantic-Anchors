/**
 * Bundle the anchors so the reader's LLM never has to follow a link.
 *
 * Measured: it fetches a URL that stood in the message it was given, and
 * refuses one it only found inside a document it fetched. The prompt can
 * therefore hand over a few dozen URLs, but not 196 — they do not fit in the
 * provider URL the button builds. So the anchors travel in bundles: one fetch
 * per category, full text, nothing left to follow.
 *
 * Splitting matters because the other end truncates. A bundle that grows past
 * the limit is split at an anchor boundary, never inside one: half an anchor
 * reads like a whole one, and the LLM would answer from it without noticing.
 */

/**
 * Greedy packing, in category order.
 *
 * Operation: no file system, no site URL. The caller passes sizes, so the same
 * function is testable with numbers and used with bytes on disk.
 */
function packBundles(categories, sizeOf, limit) {
  const bundles = []

  for (const category of categories) {
    const parts = []
    let current = []
    let bytes = 0

    for (const anchor of category.anchors) {
      const size = sizeOf(anchor)
      // An id with no file behind it would become an empty section, and the
      // LLM would report the term as having no content. Leaving it out is the
      // lesser wrong; the index is what claims the anchor exists.
      if (size === undefined) continue
      if (current.length && bytes + size > limit) {
        parts.push(current)
        current = []
        bytes = 0
      }
      current.push(anchor)
      bytes += size
    }
    if (current.length) parts.push(current)

    parts.forEach((anchors, index) => {
      const suffix = parts.length > 1 ? `-${index + 1}` : ''
      bundles.push({
        id: `${category.id}${suffix}`,
        title:
          parts.length > 1
            ? `${category.name} (${index + 1}/${parts.length})`
            : category.name,
        anchors,
      })
    })
  }

  return bundles
}

module.exports = { packBundles }
