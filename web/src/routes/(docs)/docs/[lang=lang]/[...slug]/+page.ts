import { docsConfig, getAllDocs, getDoc, getPrevNext, getRawContent } from '$lib/docs/index';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const prerender = true;

export function entries() {
	const locales = docsConfig.i18n?.locales ?? [];
	const defaultLocale = docsConfig.i18n?.defaultLocale ?? 'en';
	const results: { lang: string; slug: string }[] = [];

	for (const locale of locales) {
		if (locale.code === defaultLocale) continue;
		const docs = getAllDocs(locale.code);
		for (const doc of docs) {
			if (doc.slug) {
				results.push({ lang: locale.code, slug: doc.slug });
			}
		}
	}

	return results;
}

export const load: PageLoad = ({ params }) => {
	const doc = getDoc(params.slug, params.lang);
	if (!doc) throw error(404, `Page not found: ${params.slug}`);

	const { prev, next } = getPrevNext(params.slug, params.lang);

	return {
		meta: doc.meta,
		slug: params.slug,
		locale: params.lang,
		prev,
		next,
		rawContent: getRawContent(params.slug, params.lang)
	};
};
