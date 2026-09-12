/**
 * The public address of this site.
 *
 * Needed wherever a URL leaves the browser — a prompt handed to the reader's
 * own LLM, for instance. `import.meta.env.BASE_URL` only yields a path, and a
 * path has no host for anyone outside this page to resolve against.
 */
export const SITE_URL = 'https://llm-coding.github.io'
