import { docsConfig, getDoc, getPrevNext, getRawContent, preloadDocsRegistry } from '$lib/docs/index';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

/** Matches default `/docs` landing when that tab is translated; otherwise localized `index.md` (slug ``). */
const defaultLocaleLandingSlug = 'getting-started-for-cli';

function landingSlugForLocale(lang: string): string {
	if (getDoc(defaultLocaleLandingSlug, lang)) return defaultLocaleLandingSlug;
	if (getDoc('', lang)) return '';
	throw error(404, 'Documentation landing not found for locale');
}

export const prerender = true;

export function entries() {
	const locales = docsConfig.i18n?.locales ?? [];
	const defaultLocale = docsConfig.i18n?.defaultLocale ?? 'en';
	return locales.filter((l) => l.code !== defaultLocale).map((l) => ({ lang: l.code }));
}

export const load: PageLoad = async ({ params }) => {
	await preloadDocsRegistry(params.lang);
	const slug = landingSlugForLocale(params.lang);
	const doc = getDoc(slug, params.lang);
	if (!doc) throw error(404, 'Documentation landing not found for locale');

	const { prev, next } = getPrevNext(slug, params.lang);

	return {
		meta: doc.meta,
		slug,
		locale: params.lang,
		prev,
		next,
		rawContent: await getRawContent(slug, params.lang)
	};
};
