import { docsConfig, getAllDocs, getRawContent } from '$lib/docs/index';
import { markdownResourceHeaders } from '$lib/docs/utils/markdown-route-headers';
import { error } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

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

export const GET: RequestHandler = ({ params }) => {
	const raw = getRawContent(params.slug, params.lang);
	if (!raw) throw error(404, 'Not found');
	return new Response(raw, {
		headers: {
			...markdownResourceHeaders,
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
