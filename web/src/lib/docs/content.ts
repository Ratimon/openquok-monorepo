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

/** Lazy raw sources — `eager: true` would inline every doc into the client bundle (~10MB+). */
const rawLoaders = import.meta.glob<string>('/src/content/docs/**/*.{md,svx}', {
	query: '?raw',
	eager: false,
	import: 'default'
});

const rawLocalizedLoaders = import.meta.glob<string>('/src/content/docs-*/**/*.{md,svx}', {
	query: '?raw',
	eager: false,
	import: 'default'
});

const defaultLocale = () => docsConfig.i18n?.defaultLocale ?? 'en';

function localeCacheKey(locale: string | undefined): string {
	return !locale || locale === defaultLocale() ? defaultLocale() : locale;
}

const resolvedRegistry = new Map<string, DocPage[]>();
const inflightRegistry = new Map<string, Promise<DocPage[]>>();

function slugFromPath(path: string, prefix: string): string {
	return path
		.replace(prefix, '')
		.replace(/\.(md|svx)$/, '')
		.replace(/(?:^|\/)index$/, '');
}

async function metaByPathFromRawLoaders(
	loaders: Record<string, () => Promise<DocFile>>,
	rawGlob: Record<string, () => Promise<string>>
): Promise<Record<string, DocMeta>> {
	const rawByNorm = new Map<string, () => Promise<string>>();
	for (const [globKey, load] of Object.entries(rawGlob)) {
		rawByNorm.set(normalizeGlobKey(globKey).replace(/\\/g, '/'), load);
	}

	const out: Record<string, DocMeta> = {};
	await Promise.all(
		Object.keys(loaders).map(async (path) => {
			const norm = normalizeGlobKey(path).replace(/\\/g, '/');
			const loadRaw = rawByNorm.get(norm);
			if (!loadRaw) return;
			const raw = await loadRaw();
			out[path] = docMetaFromRawSource(raw);
		})
	);
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
				lastUpdated: meta?.lastUpdated,
				openapi: meta?.openapi,
				docsLayout: meta?.docsLayout
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
 * unrelated sections, e.g. getting-started-for-dev and documentation-contribution both using 1.)
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

async function buildDocsForLocale(locale?: string): Promise<DocPage[]> {
	const def = defaultLocale();

	if (!locale || locale === def) {
		const metaByPath = await metaByPathFromRawLoaders(contentLoaders, rawLoaders);
		return buildDocs(contentLoaders, metaByPath, '/src/content/docs/', '/docs');
	}

	const prefix = `/src/content/docs-${locale}/`;
	const filteredLoaders: Record<string, () => Promise<DocFile>> = {};
	const filteredRaw: Record<string, () => Promise<string>> = {};

	for (const [path, load] of Object.entries(localizedLoaders)) {
		if (path.startsWith(prefix)) filteredLoaders[path] = load;
	}
	for (const [path, load] of Object.entries(rawLocalizedLoaders)) {
		if (path.startsWith(prefix)) filteredRaw[path] = load;
	}

	const metaByPath = await metaByPathFromRawLoaders(filteredLoaders, filteredRaw);
	return buildDocs(filteredLoaders, metaByPath, prefix, `/docs/${locale}`);
}

/**
 * Loads doc metadata + nav ordering for one locale into memory. Call from docs layouts (and
 * prerender `entries()` / server routes) before `getAllDocs` / `getDoc`.
 */
export async function preloadDocsRegistry(locale?: string): Promise<void> {
	const key = localeCacheKey(locale);
	if (resolvedRegistry.has(key)) return;

	let p = inflightRegistry.get(key);
	if (!p) {
		p = (async () => {
			const docs = await buildDocsForLocale(locale);
			resolvedRegistry.set(key, docs);
			inflightRegistry.delete(key);
			return docs;
		})();
		inflightRegistry.set(key, p);
	}
	await p;
}

/** Preload every configured locale (RSS, llms, sitemap merge, etc.). */
export async function preloadAllDocLocales(): Promise<void> {
	const locales = docsConfig.i18n?.locales ?? [{ code: 'en', label: 'English' }];
	await Promise.all(
		locales.map((l) => preloadDocsRegistry(l.code === defaultLocale() ? undefined : l.code))
	);
}

export function getAllDocs(locale?: string): DocPage[] {
	const key = localeCacheKey(locale);
	const docs = resolvedRegistry.get(key);
	if (!docs) {
		throw new Error(
			`Docs registry not loaded for locale "${key}". Await preloadDocsRegistry() from a parent load or server handler first.`
		);
	}
	return docs;
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
	const localized = Boolean(locale && locale !== defaultLocale());
	const root = localized ? `/src/content/docs-${locale}` : '/src/content/docs';

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

async function findRawByPathSuffix(
	modules: Record<string, () => Promise<string>>,
	slug: string,
	locale: string | undefined
): Promise<string | undefined> {
	const dir = locale && locale !== defaultLocale() ? `docs-${locale}` : 'docs';

	const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const dirRe = escapeRegExp(dir);
	const slugRe = escapeRegExp(slug);
	const matcher = slug
		? new RegExp(
				`(?:^|/)${dirRe}/${slugRe}(?:\\.(?:md|svx)|/(?:index\\.(?:md|svx)))$`
			)
		: new RegExp(`(?:^|/)${dirRe}/index\\.(?:md|svx)$`);

	for (const [path, load] of Object.entries(modules)) {
		const n = normalizeGlobKey(path);
		if (matcher.test(n)) return await load();
	}
	return undefined;
}

export async function getRawContent(slug: string, locale?: string): Promise<string> {
	const localized = Boolean(locale && locale !== defaultLocale());
	const modules = localized ? rawLocalizedLoaders : rawLoaders;

	for (const p of rawPathCandidates(slug, locale)) {
		const load = modules[p] ?? modules[p.replace(/^\//, '')];
		if (load) return await load();
	}

	return (await findRawByPathSuffix(modules, slug, locale)) ?? '';
}

export function getDocsByDirectory(directory: string, locale?: string): DocPage[] {
	return getAllDocs(locale).filter(
		(doc) => doc.slug.startsWith(directory + '/') || doc.slug === directory
	);
}

/**
 * Slugs safe to prerender when other docs live under the same path prefix.
 * A prerendered section index (`getting-started-for-dev`) becomes a file and blocks
 * child slugs (`getting-started-for-dev/installation`) — same constraint as `/docs` landing routes.
 */
export function docSlugsSafeForPrerender(slugs: Iterable<string>): string[] {
	const all = [...slugs];
	return all.filter(
		(slug) => !all.some((other) => other !== slug && other.startsWith(`${slug}/`))
	);
}

/** All published doc pages per locale (for sitemaps, RSS, llms.txt). Await `preloadAllDocLocales()` first unless each caller already did. */
export async function eachLocaleDocPages(): Promise<
	{
		locale: string;
		localeLabel: string;
		pages: DocPage[];
	}[]
> {
	await preloadAllDocLocales();
	const locales = docsConfig.i18n?.locales ?? [{ code: 'en', label: 'English' }];
	const def = defaultLocale();
	return locales.map((l) => ({
		locale: l.code,
		localeLabel: l.label,
		pages: getAllDocs(l.code === def ? undefined : l.code)
	}));
}
