import { docsConfig, getRawContent } from '$lib/docs/index';
import { markdownResourceHeaders } from '$lib/docs/utils/markdown-route-headers';
import { error } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

// Do not prerender localized raw-markdown endpoints; they are runtime resources.
export const prerender = false;

export const GET: RequestHandler = ({ params }) => {
	const raw = getRawContent('', params.lang);
	if (!raw) throw error(404, 'Not found');
	return new Response(raw, {
		headers: markdownResourceHeaders
	});
};
