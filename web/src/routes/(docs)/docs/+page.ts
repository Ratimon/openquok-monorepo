import { getDoc, getPrevNext, getRawContent } from '$lib/docs/index';
import { error } from '@sveltejs/kit';

export const prerender = true;

export function load() {
	const doc = getDoc('getting-started-for-cli');
	if (!doc) throw error(404, 'CLI documentation not found');

	const { prev, next } = getPrevNext('getting-started-for-cli');

	return {
		meta: doc.meta,
		slug: 'getting-started-for-cli',
		prev,
		next,
		rawContent: getRawContent('getting-started-for-cli')
	};
}
