/**
 * Prompts for the TalkItOver buttons.
 *
 * Taken verbatim from the content-type prompts on
 * https://raifdmueller.github.io/talkitover/prompts/ and inserted here at
 * commit time. They are not fetched at runtime: a button must not stop working
 * because another site is down.
 *
 * Buttons carry the version as data-prompt="<type>@<n>" so a later update can
 * find them. Nothing reads that attribute at runtime.
 */

/** referenz@1 — a page the reader looks things up in. */
export const REFERENCE_PROMPT = [
  'Load {url}. It is a reference page, and I want to use it — not have it summarised.',
  '',
  'Ask me what I am trying to look up before you answer anything.',
  '',
  'Then keep your answers short and name the section you took them from. If the',
  'page does not cover what I ask, say so instead of filling the gap from memory.',
].join('\n')

export const REFERENCE_VERSION = 'referenz@1'

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
