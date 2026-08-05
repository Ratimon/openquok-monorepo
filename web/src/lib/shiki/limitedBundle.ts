/**
 * Client-facing `shiki` entry that only registers curated grammars.
 *
 * `carta-md` and `@streamdown-svelte/plugin-core` import `createHighlighter` / `bundledLanguages`
 * from bare `shiki`, which otherwise pulls `bundle-full` + every `@shikijs/langs/*` chunk.
 * Vite aliases `shiki` → this module (see `vite.config.ts`).
 */
import {
	createBundledHighlighter,
	createSingletonShorthands,
	guessEmbeddedLanguages
} from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

import { limitedStreamdownLanguages } from '$lib/shiki/limitedLanguages';

type LangModule = { default?: unknown };
type ThemeModule = { default?: unknown };

const bundledLanguagesInfo = limitedStreamdownLanguages.map((lang) => ({
	id: lang.id,
	name: lang.id,
	aliases: lang.aliases,
	import: async () => {
		const mod = (await lang.import()) as LangModule;
		return mod;
	}
}));

const bundledLanguagesBase = Object.fromEntries(
	bundledLanguagesInfo.map((lang) => [lang.id, lang.import])
) as Record<string, () => Promise<LangModule>>;

const bundledLanguagesAlias = Object.fromEntries(
	bundledLanguagesInfo.flatMap((lang) =>
		(lang.aliases ?? []).map((alias) => [alias, lang.import] as const)
	)
) as Record<string, () => Promise<LangModule>>;

const bundledLanguages = {
	...bundledLanguagesBase,
	...bundledLanguagesAlias
};

/** Themes used by Streamdown / docs; avoid registering every Shiki theme. */
const bundledThemesInfo = [
	{
		id: 'github-light',
		displayName: 'GitHub Light',
		type: 'light' as const,
		import: () => import('@shikijs/themes/github-light') as Promise<ThemeModule>
	},
	{
		id: 'github-dark',
		displayName: 'GitHub Dark',
		type: 'dark' as const,
		import: () => import('@shikijs/themes/github-dark') as Promise<ThemeModule>
	},
	{
		id: 'github-light-default',
		displayName: 'GitHub Light Default',
		type: 'light' as const,
		import: () => import('@shikijs/themes/github-light-default') as Promise<ThemeModule>
	},
	{
		id: 'github-dark-default',
		displayName: 'GitHub Dark Default',
		type: 'dark' as const,
		import: () => import('@shikijs/themes/github-dark-default') as Promise<ThemeModule>
	}
];

const bundledThemes = Object.fromEntries(
	bundledThemesInfo.map((theme) => [theme.id, theme.import])
) as Record<string, () => Promise<ThemeModule>>;

const jsEngine = createJavaScriptRegexEngine({ forgiving: true });

// createBundledHighlighter's generics expect the full BundledLanguage union; our curated
// maps are intentionally narrower — cast at the boundary.
const createHighlighter = createBundledHighlighter({
	langs: bundledLanguages as never,
	themes: bundledThemes as never,
	engine: () => jsEngine
});

const {
	codeToHtml,
	codeToHast,
	codeToTokens,
	codeToTokensBase,
	codeToTokensWithThemes,
	getSingletonHighlighter,
	getLastGrammarState
} = createSingletonShorthands(createHighlighter, { guessEmbeddedLanguages });

export * from 'shiki/core';
export {
	bundledLanguages,
	bundledLanguagesAlias,
	bundledLanguagesBase,
	bundledLanguagesInfo,
	bundledThemes,
	bundledThemesInfo,
	codeToHast,
	codeToHtml,
	codeToTokens,
	codeToTokensBase,
	codeToTokensWithThemes,
	createHighlighter,
	getLastGrammarState,
	getSingletonHighlighter
};
