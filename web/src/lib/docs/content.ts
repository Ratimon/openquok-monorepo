import { docsConfig } from '$lib/docs/constants';
import type { DocFile, DocMeta, DocPage } from '$lib/docs/types';

const contentModules = import.meta.glob<DocFile>('/src/content/docs/**/*.{md,svx}', {
	eager: true
});

const rawModules = import.meta.glob<string>('/src/content/docs/**/*.{md,svx}', {
	query: '?raw',
	eager: true,
	import: 'default'
});

const localizedModules = import.meta.glob<DocFile>('/src/content/docs-*/**/*.{md,svx}', {
	eager: true
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

function buildDocs(modules: Record<string, DocFile>, prefix: string, hrefPrefix: string): DocPage[] {
	const docs: DocPage[] = [];

	for (const [path, mod] of Object.entries(modules)) {
		const meta = mod.metadata as DocMeta;
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
			component: mod.default
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
		return buildDocs(contentModules, '/src/content/docs/', '/docs');
	}

	const prefix = `/src/content/docs-${locale}/`;
	const filtered: Record<string, DocFile> = {};
	for (const [path, mod] of Object.entries(localizedModules)) {
		if (path.startsWith(prefix)) {
			filtered[path] = mod;
		}
	}

	return buildDocs(filtered, prefix, `/docs/${locale}`);
}

export function getDoc(slug: string, locale?: string): DocPage | undefined {
	return getAllDocs(locale).find((doc) => doc.slug === slug);
}

export function getRawContent(slug: string, locale?: string): string {
	const defaultLocale = docsConfig.i18n?.defaultLocale ?? 'en';
	if (!locale || locale === defaultLocale) {
		const path = slug ? `/src/content/docs/${slug}.md` : '/src/content/docs/index.md';
		return rawModules[path] ?? '';
	}
	const path = slug
		? `/src/content/docs-${locale}/${slug}.md`
		: `/src/content/docs-${locale}/index.md`;
	return rawLocalizedModules[path] ?? '';
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
