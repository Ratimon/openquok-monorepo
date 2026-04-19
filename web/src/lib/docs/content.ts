import { docsConfig } from '$lib/docs/constants';
import type { DocFile, DocMeta, DocPage } from '$lib/docs/types';
import type { Component } from 'svelte';

import { docMetaFromRawSource } from '$lib/docs/utils/parse-doc-frontmatter';

/** Compiled doc modules (default export = page body). Sole import of each file besides `?raw` — avoids Vite duplicate-import warnings. */
const contentLoaders = import.meta.glob<DocFile>('/src/content/docs/**/*.{md,svx}', {
	eager: false
});

const localizedLoaders = import.meta.glob<DocFile>('/src/content/docs-*/**/*.{md,svx}', {
	eager: false
});

const rawModules = import.meta.glob<string>('/src/content/docs/**/*.{md,svx}', {
	query: '?raw',
	eager: true,
	import: 'default'
});

const rawLocalizedModules = import.meta.glob<string>('/src/content/docs-*/**/*.{md,svx}', {
	query: '?raw',
	eager: true,
	import: 'default'
});

function slugFromPath(path: string, prefix: string): string {
	return path
		.replace(prefix, '')
		.replace(/\.(md|svx)$/, '')
		.replace(/(?:^|\/)index$/, '');
}

/** Align lazy loader paths with `?raw` glob keys (strip query differences). */
function metaByPathFromRaw(
	loaders: Record<string, () => Promise<DocFile>>,
	rawGlob: Record<string, string>
): Record<string, DocMeta> {
	const rawByNorm = new Map<string, string>();
	for (const [globKey, text] of Object.entries(rawGlob)) {
		rawByNorm.set(normalizeGlobKey(globKey).replace(/\\/g, '/'), text);
	}

	const out: Record<string, DocMeta> = {};
	for (const path of Object.keys(loaders)) {
		const norm = normalizeGlobKey(path).replace(/\\/g, '/');
		const raw = rawByNorm.get(norm);
		if (raw === undefined) continue;
		out[path] = docMetaFromRawSource(raw);
	}
	return out;
}

function buildDocs(
	loaders: Record<string, () => Promise<DocFile>>,
	metaByPath: Record<string, DocMeta>,
	prefix: string,
	hrefPrefix: string
): DocPage[] {
	const docs: DocPage[] = [];

	for (const [path, loader] of Object.entries(loaders)) {
		const meta = metaByPath[path];
		if (meta?.draft) continue;

		const slug = slugFromPath(path, prefix);
		docs.push({
			slug,
			href: slug ? `${hrefPrefix}/${slug}` : hrefPrefix,
			meta: {
				title: meta?.title ?? slug.split('/').pop() ?? '',
				description: meta?.description ?? '',
				order: meta?.order,
				sidebar: meta?.sidebar,
				lastUpdated: meta?.lastUpdated
			},
			loadContent: async (): Promise<Component> => {
				const mod = await loader();
				return mod.default as Component;
			}
		});
	}

	return orderDocsBySidebar(docs);
}

/**
 * Order pages for prev/next and flat listings: sidebar section order first,
 * then `meta.order` within each section. (Global `order` alone interleaves
 * unrelated sections, e.g. getting-started and how-to-write-docs both using 1.)
 */
function orderDocsBySidebar(docs: DocPage[]): DocPage[] {
	const used = new Set<string>();
	const ordered: DocPage[] = [];

	const push = (d: DocPage) => {
		if (!used.has(d.slug)) {
			ordered.push(d);
			used.add(d.slug);
		}
	};

	const root = docs.find((d) => d.slug === '');
	if (root) push(root);

	for (const section of docsConfig.sidebar) {
		if (!section.autogenerate) continue;
		const dir = section.autogenerate.directory;
		const inSection = docs
			.filter((d) => d.slug === dir || d.slug.startsWith(`${dir}/`))
			.sort(
				(a, b) =>
					(a.meta.order ?? 999) - (b.meta.order ?? 999) || a.slug.localeCompare(b.slug)
			);
		for (const d of inSection) push(d);
	}

	for (const d of docs) {
		if (!used.has(d.slug)) push(d);
	}
	return ordered;
}

export function getAllDocs(locale?: string): DocPage[] {
	const defaultLocale = docsConfig.i18n?.defaultLocale ?? 'en';

	if (!locale || locale === defaultLocale) {
		return buildDocs(
			contentLoaders,
			metaByPathFromRaw(contentLoaders, rawModules),
			'/src/content/docs/',
			'/docs'
		);
	}

	const prefix = `/src/content/docs-${locale}/`;
	const filteredLoaders: Record<string, () => Promise<DocFile>> = {};
	const filteredRaw: Record<string, string> = {};

	for (const [path, load] of Object.entries(localizedLoaders)) {
		if (path.startsWith(prefix)) filteredLoaders[path] = load;
	}
	for (const [path, text] of Object.entries(rawLocalizedModules)) {
		if (path.startsWith(prefix)) filteredRaw[path] = text;
	}

	return buildDocs(filteredLoaders, metaByPathFromRaw(filteredLoaders, filteredRaw), prefix, `/docs/${locale}`);
}

export function getDoc(slug: string, locale?: string): DocPage | undefined {
	return getAllDocs(locale).find((doc) => doc.slug === slug);
}

/** Normalize glob keys so suffix matching works across platforms / Vite key shapes. */
function normalizeGlobKey(p: string): string {
	// Vite glob keys can include query strings (e.g. `?raw`). We only care about the file path.
	return p.replace(/\\/g, '/').split('?')[0] ?? '';
}

/**
 * Candidate paths for a doc slug. Section roots use `dir/index.md` (URL slug is `dir`, not `dir/index`).
 */
function rawPathCandidates(slug: string, locale: string | undefined): string[] {
	const defaultLocale = docsConfig.i18n?.defaultLocale ?? 'en';
	const localized = Boolean(locale && locale !== defaultLocale);
	const root = localized
		? `/src/content/docs-${locale}`
		: '/src/content/docs';

	if (!slug) {
		return [`${root}/index.md`, `${root}/index.svx`];
	}

	return [
		`${root}/${slug}.md`,
		`${root}/${slug}/index.md`,
		`${root}/${slug}.svx`,
		`${root}/${slug}/index.svx`
	];
}

/**
 * Resolve raw file text when direct `/src/content/...` keys miss (Vite glob keys can differ).
 */
function findRawByPathSuffix(
	modules: Record<string, string>,
	slug: string,
	locale: string | undefined
): string {
	const defaultLocale = docsConfig.i18n?.defaultLocale ?? 'en';
	const dir = locale && locale !== defaultLocale ? `docs-${locale}` : 'docs';

	const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const dirRe = escapeRegExp(dir);
	const slugRe = escapeRegExp(slug);
	const matcher = slug
		? new RegExp(
				// Matches:
				// - .../docs-<locale>/<slug>.md
				// - .../docs-<locale>/<slug>.svx
				// - .../docs-<locale>/<slug>/index.md
				// - .../docs-<locale>/<slug>/index.svx
				`(?:^|/)${dirRe}/${slugRe}(?:\\.(?:md|svx)|/(?:index\\.(?:md|svx)))$`
			)
		: new RegExp(`(?:^|/)${dirRe}/index\\.(?:md|svx)$`);

	for (const [path, raw] of Object.entries(modules)) {
		const n = normalizeGlobKey(path);
		if (matcher.test(n)) return raw;
	}
	return '';
}

export function getRawContent(slug: string, locale?: string): string {
	const defaultLocale = docsConfig.i18n?.defaultLocale ?? 'en';
	const localized = Boolean(locale && locale !== defaultLocale);
	const modules = localized ? rawLocalizedModules : rawModules;

	for (const p of rawPathCandidates(slug, locale)) {
		const direct = modules[p] ?? modules[p.replace(/^\//, '')];
		if (direct) return direct;
	}

	return findRawByPathSuffix(modules, slug, locale);
}

export function getDocsByDirectory(directory: string, locale?: string): DocPage[] {
	return getAllDocs(locale).filter(
		(doc) => doc.slug.startsWith(directory + '/') || doc.slug === directory
	);
}

/** All published doc pages per locale (for sitemaps, RSS, llms.txt). */
export function eachLocaleDocPages(): {
	locale: string;
	localeLabel: string;
	pages: DocPage[];
}[] {
	const locales = docsConfig.i18n?.locales ?? [{ code: 'en', label: 'English' }];
	return locales.map((l) => ({
		locale: l.code,
		localeLabel: l.label,
		pages: getAllDocs(l.code)
	}));
}
