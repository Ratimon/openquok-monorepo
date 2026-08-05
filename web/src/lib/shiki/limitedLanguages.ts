/**
 * Curated Shiki grammars for the web client.
 *
 * Bare `shiki` and Streamdown/plugin-core otherwise register dozens (or hundreds) of
 * language dynamic imports — each emitted as its own chunk (cpp / emacs-lisp alone are
 * hundreds of KB). Keep this list aligned with docs + AI markdown fences we actually highlight.
 *
 * Use `shiki/langs/*.mjs` (not `@shikijs/langs/*`) so Vite resolves through the `shiki`
 * package dependency rather than a nested pnpm path.
 */

export type LimitedLanguageInfo = {
	id: string;
	aliases?: string[];
	import: () => Promise<unknown>;
};

/** Canonical grammar ids (and aliases) allowed in the client graph. */
export const LIMITED_SHIKI_LANGUAGE_IDS = [
	'javascript',
	'typescript',
	'jsx',
	'tsx',
	'html',
	'css',
	'json',
	'markdown',
	'yaml',
	'xml',
	'shellscript',
	'python',
	'go',
	'rust',
	'sql',
	'docker',
	'toml',
	'graphql',
	'svelte'
] as const;

export type LimitedShikiLanguageId = (typeof LIMITED_SHIKI_LANGUAGE_IDS)[number];

const ALLOWED = new Set<string>([
	...LIMITED_SHIKI_LANGUAGE_IDS,
	// Common fence aliases (must match entries below / Streamdown LanguageInfo aliases).
	'js',
	'ts',
	'md',
	'yml',
	'bash',
	'sh',
	'shell',
	'zsh',
	'py',
	'rs',
	'dockerfile',
	'gql'
]);

export function isAllowedShikiLanguageId(id: string): boolean {
	return ALLOWED.has(id.trim().toLowerCase());
}

/**
 * Streamdown / `@streamdown-svelte/plugin-core` LanguageInfo list.
 * Dynamic imports only — Rollup emits a chunk per entry, so keep this short.
 */
export const limitedStreamdownLanguages: LimitedLanguageInfo[] = [
	{
		id: 'javascript',
		aliases: ['js'],
		import: () => import('shiki/langs/javascript.mjs')
	},
	{
		id: 'typescript',
		aliases: ['ts'],
		import: () => import('shiki/langs/typescript.mjs')
	},
	{
		id: 'jsx',
		import: () => import('shiki/langs/jsx.mjs')
	},
	{
		id: 'tsx',
		import: () => import('shiki/langs/tsx.mjs')
	},
	{
		id: 'html',
		import: () => import('shiki/langs/html.mjs')
	},
	{
		id: 'css',
		import: () => import('shiki/langs/css.mjs')
	},
	{
		id: 'json',
		import: () => import('shiki/langs/json.mjs')
	},
	{
		id: 'markdown',
		aliases: ['md'],
		import: () => import('shiki/langs/markdown.mjs')
	},
	{
		id: 'yaml',
		aliases: ['yml'],
		import: () => import('shiki/langs/yaml.mjs')
	},
	{
		id: 'xml',
		import: () => import('shiki/langs/xml.mjs')
	},
	{
		id: 'shellscript',
		aliases: ['bash', 'sh', 'shell', 'zsh'],
		import: () => import('shiki/langs/shellscript.mjs')
	},
	{
		id: 'python',
		aliases: ['py'],
		import: () => import('shiki/langs/python.mjs')
	},
	{
		id: 'go',
		import: () => import('shiki/langs/go.mjs')
	},
	{
		id: 'rust',
		aliases: ['rs'],
		import: () => import('shiki/langs/rust.mjs')
	},
	{
		id: 'sql',
		import: () => import('shiki/langs/sql.mjs')
	},
	{
		id: 'docker',
		aliases: ['dockerfile'],
		import: () => import('shiki/langs/docker.mjs')
	},
	{
		id: 'toml',
		import: () => import('shiki/langs/toml.mjs')
	},
	{
		id: 'graphql',
		aliases: ['gql'],
		import: () => import('shiki/langs/graphql.mjs')
	},
	{
		id: 'svelte',
		import: () => import('shiki/langs/svelte.mjs')
	}
];

/** Carta / `shikiOptions.langs` string ids (canonical only). */
export const limitedCartaShikiLangs: LimitedShikiLanguageId[] = [...LIMITED_SHIKI_LANGUAGE_IDS];
