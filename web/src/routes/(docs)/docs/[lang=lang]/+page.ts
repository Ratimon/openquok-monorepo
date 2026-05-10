import { docsConfig, getDoc, getPrevNext, getRawContent } from '$lib/docs/index';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const prerender = true;

export function entries() {
	const locales = docsConfig.i18n?.locales ?? [];
	const defaultLocale = docsConfig.i18n?.defaultLocale ?? 'en';
	return locales.filter((l) => l.code !== defaultLocale).map((l) => ({ lang: l.code }));
}

export const load: PageLoad = ({ params }) => {
	const doc = getDoc('cli', params.lang);
	if (!doc) throw error(404, 'CLI documentation not found');

	const { prev, next } = getPrevNext('cli', params.lang);

	return {
		meta: doc.meta,
		slug: 'cli',
		locale: params.lang,
		prev,
		next,
		rawContent: getRawContent('cli', params.lang)
	};
};
