import type { MetaTagsProps } from 'svelte-meta-tags';

export const ssr = true;

const noindexMetaTags = Object.freeze({
	robots: 'noindex, nofollow'
}) satisfies MetaTagsProps;

export async function load({ parent }) {
	const parentData = await parent();

	return {
		...parentData,
		pageMetaTags: noindexMetaTags
	};
}
