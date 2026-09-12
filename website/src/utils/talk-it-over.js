/**
 * Prompt for the TalkItOver button.
 *
 * Taken verbatim from the content-type prompts on
 * https://raifdmueller.github.io/talkitover/prompts/ and inserted here at
 * commit time. They are not fetched at runtime: a button must not stop working
 * because another site is down.
 *
 * Buttons carry the version as data-prompt="<type>@<n>" so a later update can
 * find them. Nothing reads that attribute at runtime.
 */

/** katalog@1 — an index the reader wants to find their way through. */
export const CATALOG_PROMPT = [
  'Load {url}. It is an index of reference pages, not the content itself: every',
  'entry links to a source file.',
  '',
  'Ask me what I am looking for before you fetch anything.',
  '',
  'Then fetch only the entries that match, read them, and answer from what you',
  'read. Keep it short and name the entry each answer came from. If no entry fits,',
  'say so instead of answering from memory.',
].join('\n')

export const CATALOG_VERSION = 'katalog@1'

/**
 * Serialise a prompt for an HTML attribute.
 *
 * A blank line inside an attribute value ends the HTML block in kramdown and in
 * most template pipelines, which tears the page apart at exactly that spot. The
 * newlines therefore travel as &#10; — the browser decodes them back before the
 * component ever reads the attribute.
 */
export function promptAttribute(prompt) {
  return String(prompt).replace(/\n/g, '&#10;')
}
