import { docsConfig, getRawContent } from '$lib/docs/index';
import { markdownResourceHeaders } from '$lib/docs/utils/markdown-route-headers';
import { error } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

export const prerender = true;

export function entries() {
	const locales = docsConfig.i18n?.locales ?? [];
	const defaultLocale = docsConfig.i18n?.defaultLocale ?? 'en';
	return locales.filter((l) => l.code !== defaultLocale).map((l) => ({ lang: l.code }));
}

export const GET: RequestHandler = ({ params }) => {
	const raw = getRawContent('', params.lang);
	if (!raw) throw error(404, 'Not found');
	return new Response(raw, {
		headers: markdownResourceHeaders
	});
};
