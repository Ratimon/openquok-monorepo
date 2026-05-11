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
	const doc = getDoc('getting-started-for-cli', params.lang);
	if (!doc) throw error(404, 'CLI documentation not found');

	const { prev, next } = getPrevNext('getting-started-for-cli', params.lang);

	return {
		meta: doc.meta,
		slug: 'getting-started-for-cli',
		locale: params.lang,
		prev,
		next,
		rawContent: getRawContent('getting-started-for-cli', params.lang)
	};
};
