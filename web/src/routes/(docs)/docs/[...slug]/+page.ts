import {
	docSlugsSafeForPrerender,
	getAllDocs,
	getDoc,
	getPrevNext,
	getRawContent,
	preloadDocsRegistry
} from '$lib/docs/index';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

// Leaf pages are prerendered via `entries()`. Section indexes are omitted from entries
// (file vs directory conflict) and must SSR — `true` would 404 those hubs at runtime.
export const prerender = 'auto';

export async function entries() {
	await preloadDocsRegistry(undefined);
	const slugs = getAllDocs().map((doc) => doc.slug);
	return docSlugsSafeForPrerender(slugs).map((slug) => ({ slug }));
}

export const load: PageLoad = async ({ params }) => {
	await preloadDocsRegistry(undefined);
	const doc = getDoc(params.slug);
	if (!doc) throw error(404, `Page not found: ${params.slug}`);

	const { prev, next } = getPrevNext(params.slug);

	return {
		meta: doc.meta,
		slug: params.slug,
		prev,
		next,
		rawContent: await getRawContent(params.slug)
	};
};
