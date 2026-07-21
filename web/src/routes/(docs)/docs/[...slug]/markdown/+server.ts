import { getRawContent } from '$lib/docs/index';
import { markdownResourceHeaders } from '$lib/docs/utils/markdown-route-headers';
import { error } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

// Do not prerender raw-markdown endpoints; they are runtime resources.
export const prerender = false;

export const GET: RequestHandler = async ({ params }) => {
	const raw = await getRawContent(params.slug);
	if (!raw) throw error(404, 'Not found');
	return new Response(raw, {
		headers: {
			...markdownResourceHeaders,
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
