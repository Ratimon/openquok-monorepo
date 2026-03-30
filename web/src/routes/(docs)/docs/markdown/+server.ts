import { getRawContent } from '$lib/docs/index';
import { markdownResourceHeaders } from '$lib/docs/utils/markdown-route-headers';
import { error } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = () => {
	const raw = getRawContent('');
	if (!raw) throw error(404, 'Not found');
	return new Response(raw, {
		headers: markdownResourceHeaders
	});
};
