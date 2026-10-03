import { getRawContent } from '$lib/docs/index';
import { docsRedirectPath } from '$lib/docs/utils/content/docsSlugRedirects';
import { markdownResourceHeaders } from '$lib/docs/utils/site/markdownRouteHeaders';
import { error, redirect } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

// Do not prerender raw-markdown endpoints; they are runtime resources.
export const prerender = false;

export const GET: RequestHandler = async ({ params, url }) => {
	const redirectTarget = docsRedirectPath(params.slug, { markdown: true, search: url.search });
	if (redirectTarget) {
		throw redirect(308, redirectTarget);
	}

	const raw = await getRawContent(params.slug);
	if (!raw) throw error(404, 'Not found');
	return new Response(raw, {
		headers: {
			...markdownResourceHeaders,
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
