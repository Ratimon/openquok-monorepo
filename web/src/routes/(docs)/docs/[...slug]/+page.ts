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

export const prerender = true;

export async function entries() {
	await preloadDocsRegistry(undefined);
	const slugs = getAllDocs()
		.map((doc) => doc.slug)
		.filter((slug): slug is string => Boolean(slug));
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
