import { getDoc, getPrevNext, getRawContent, preloadDocsRegistry } from '$lib/docs/index';
import { buildDocsPageLoadExtras } from '$lib/docs/utils/buildDocsPageLoadExtras';
import { error } from '@sveltejs/kit';

// SSR only: a prerendered `/docs` page becomes a file and blocks `/docs/<slug>` children.
export const prerender = false;

export async function load() {
	await preloadDocsRegistry(undefined);
	const doc = getDoc('getting-started');
	if (!doc) throw error(404, 'Documentation not found');

	const { prev, next } = getPrevNext('getting-started');
	const rawContent = await getRawContent('getting-started');

	return {
		meta: doc.meta,
		slug: 'getting-started',
		prev,
		next,
		rawContent,
		content: await doc.loadContent(),
		...buildDocsPageLoadExtras(rawContent)
	};
}
