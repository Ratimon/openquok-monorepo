import {
	docsConfig,
	docSlugsSafeForPrerender,
	getAllDocs,
	getDoc,
	getPrevNext,
	getRawContent,
	preloadDocsRegistry
} from '$lib/docs/index';
import { docsRedirectPath } from '$lib/docs/utils/content/docsSlugRedirects';
import { docsUrlSearch } from '$lib/docs/utils/site/docsRequestUrl';
import { resolvePublicSiteUrl } from '$lib/docs/utils/site/resolvePublicSiteUrl';
import { buildDocsPageLoadExtras } from '$lib/docs/utils/seo/buildDocsPageLoadExtras';
import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

// Leaf pages are prerendered via `entries()`. Section indexes are omitted from entries
// (file vs directory conflict) and must SSR — `true` would 404 those hubs at runtime.
export const prerender = 'auto';

export async function entries() {
	const locales = docsConfig.i18n?.locales ?? [];
	const defaultLocale = docsConfig.i18n?.defaultLocale ?? 'en';
	const results: { lang: string; slug: string }[] = [];

	for (const locale of locales) {
		if (locale.code === defaultLocale) continue;
		await preloadDocsRegistry(locale.code);
		const docs = getAllDocs(locale.code);
		const slugs = docs.map((doc) => doc.slug);
		for (const slug of docSlugsSafeForPrerender(slugs)) {
			results.push({ lang: locale.code, slug });
		}
	}

	return results;
}

export const load: PageLoad = async ({ params, url }) => {
	const redirectTarget = docsRedirectPath(params.slug, {
		localePrefix: params.lang,
		search: docsUrlSearch(url)
	});
	if (redirectTarget) {
		throw redirect(308, redirectTarget);
	}

	await preloadDocsRegistry(params.lang);
	const doc = getDoc(params.slug, params.lang);
	if (!doc) throw error(404, `Page not found: ${params.slug}`);

	const { prev, next } = getPrevNext(params.slug, params.lang);
	const rawContent = await getRawContent(params.slug, params.lang);

	return {
		meta: doc.meta,
		slug: params.slug,
		locale: params.lang,
		prev,
		next,
		rawContent,
		content: await doc.loadContent(),
		...(await buildDocsPageLoadExtras(rawContent, {
			meta: doc.meta,
			origin: resolvePublicSiteUrl(url)
		}))
	};
};
