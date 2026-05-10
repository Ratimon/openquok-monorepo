import { getDoc, getPrevNext, getRawContent } from '$lib/docs/index';
import { error } from '@sveltejs/kit';

export const prerender = true;

export function load() {
	const doc = getDoc('cli');
	if (!doc) throw error(404, 'CLI documentation not found');

	const { prev, next } = getPrevNext('cli');

	return {
		meta: doc.meta,
		slug: 'cli',
		prev,
		next,
		rawContent: getRawContent('cli')
	};
}
