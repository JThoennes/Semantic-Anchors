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

/**
 * katalog@3 — an index the reader wants to find their way through.
 *
 * The prompt names the site's own pages instead of leaving them to the index.
 * Measured on 2026-09-13: the reader's LLM fetches a URL that stood in the
 * message it was given, and refuses one it only found inside a document it
 * fetched — "not in any prior search or fetch result", for text/plain,
 * text/markdown and HTML alike. An index of links alone therefore opens
 * nothing. Whatever the prompt names is reachable; whatever it omits may not be.
 *
 * Searching was the other way in, and it failed on measurement: four searches
 * against this site returned five of its 459 pages, no anchor among them, and
 * answered the question from heise and two unrelated blogs instead.
 */
export function catalogPrompt({ docPages, bundles, contractsUrl, fullTextUrl }) {
  return [
    'Load {url}. It is the index of one site: it names everything published',
    'there and holds none of it.',
    '',
    'Your fetch tool may refuse a link it only found inside that index, so',
    'every URL you need is here in my message.',
    '',
    'Pages about the project. A question about a workflow or a method is',
    'usually answered here, not by a single term:',
    '',
    ...docPages.map((page) => `- ${page.title}: ${page.url}`),
    '',
    'The named terms by category, each file holding its terms in full:',
    '',
    ...bundles.map((bundle) => `- ${bundle.title}: ${bundle.url}`),
    '',
    `All the contracts in one file: ${contractsUrl}`,
    `Everything at once, large and likely cut short: ${fullTextUrl}`,
    '',
    'Use the index to find a term\'s category, then fetch that category above.',
    'If a fetch is refused, say so and ask me to paste the URL.',
    '',
    'When I ask for a link, give me the page a person can open — each bundle',
    'names it under the term — never the .md file you read from.',
    '',
    'Ask what I am looking for before you fetch anything. Then fetch what',
    'matches, read it, and answer from what you read. Keep it short and name',
    'where each answer came from.',
    '',
    'If nothing here fits, say so — do not answer from memory and do not go',
    'looking elsewhere.',
  ].join('\n')
}

export const CATALOG_VERSION = 'katalog@3'

/**
 * The seam between the generated manifest and the prompt.
 *
 * The generator names things the way a generated file does, the prompt the way
 * a prompt does. Mapping them in one place keeps a rename in the generator from
 * reaching into the prompt text.
 */
export function fromManifest(manifest) {
  return {
    docPages: manifest.DOC_PAGES,
    bundles: manifest.BUNDLES,
    contractsUrl: manifest.CONTRACTS_URL,
    fullTextUrl: manifest.FULL_TEXT_URL,
  }
}

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
