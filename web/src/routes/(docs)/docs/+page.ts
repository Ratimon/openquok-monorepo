import { getDoc, getPrevNext, getRawContent } from '$lib/docs/index';
import { error } from '@sveltejs/kit';

export const prerender = true;

export function load() {
	const doc = getDoc('');
	if (!doc) throw error(404, 'Documentation index not found');

	const { prev, next } = getPrevNext('');

	return {
		meta: doc.meta,
		slug: '',
		prev,
		next,
		rawContent: getRawContent('')
	};
}
