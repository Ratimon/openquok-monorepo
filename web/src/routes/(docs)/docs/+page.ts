import { getDoc, getPrevNext, getRawContent, preloadDocsRegistry } from '$lib/docs/index';
import { error } from '@sveltejs/kit';

// SSR only: a prerendered `/docs` page becomes a file and blocks `/docs/<slug>` children.
export const prerender = false;

export async function load() {
	await preloadDocsRegistry(undefined);
	const doc = getDoc('getting-started-for-cli');
	if (!doc) throw error(404, 'CLI documentation not found');

	const { prev, next } = getPrevNext('getting-started-for-cli');

	return {
		meta: doc.meta,
		slug: 'getting-started-for-cli',
		prev,
		next,
		rawContent: await getRawContent('getting-started-for-cli')
	};
}
