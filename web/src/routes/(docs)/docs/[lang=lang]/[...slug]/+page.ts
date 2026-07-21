import {
	docsConfig,
	docSlugsSafeForPrerender,
	getAllDocs,
	getDoc,
	getPrevNext,
	getRawContent,
	preloadDocsRegistry
} from '$lib/docs/index';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const prerender = true;

export async function entries() {
	const locales = docsConfig.i18n?.locales ?? [];
	const defaultLocale = docsConfig.i18n?.defaultLocale ?? 'en';
	const results: { lang: string; slug: string }[] = [];

	for (const locale of locales) {
		if (locale.code === defaultLocale) continue;
		await preloadDocsRegistry(locale.code);
		const docs = getAllDocs(locale.code);
		const slugs = docs.map((doc) => doc.slug).filter((slug): slug is string => Boolean(slug));
		for (const slug of docSlugsSafeForPrerender(slugs)) {
			results.push({ lang: locale.code, slug });
		}
	}

	return results;
}

export const load: PageLoad = async ({ params }) => {
	await preloadDocsRegistry(params.lang);
	const doc = getDoc(params.slug, params.lang);
	if (!doc) throw error(404, `Page not found: ${params.slug}`);

	const { prev, next } = getPrevNext(params.slug, params.lang);

	return {
		meta: doc.meta,
		slug: params.slug,
		locale: params.lang,
		prev,
		next,
		rawContent: await getRawContent(params.slug, params.lang)
	};
};
