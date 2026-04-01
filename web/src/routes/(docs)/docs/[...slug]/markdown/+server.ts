import { docsConfig, getAllDocs, getRawContent } from '$lib/docs/index';
import { markdownResourceHeaders } from '$lib/docs/utils/markdown-route-headers';
import { error } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

export const prerender = true;

export function entries() {
	const docs = getAllDocs();
	const defaultLocale = docsConfig.i18n?.defaultLocale ?? 'en';
	const localeCodes = new Set(
		(docsConfig.i18n?.locales ?? [])
			.map((l) => l.code)
			.filter((code) => code && code !== defaultLocale)
	);

	return docs
		.filter((d) => d.slug && !localeCodes.has(d.slug))
		.map((d) => ({ slug: d.slug }));
}

export const GET: RequestHandler = ({ params }) => {
	const raw = getRawContent(params.slug);
	if (!raw) throw error(404, 'Not found');
	return new Response(raw, {
		headers: {
			...markdownResourceHeaders,
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
