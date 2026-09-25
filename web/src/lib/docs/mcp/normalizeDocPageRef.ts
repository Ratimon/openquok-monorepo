import { docsConfig } from '$lib/docs/constants';

export type NormalizedDocPageRef = {
	slug: string;
	locale?: string;
};

/** Map slug or `/docs/…` path to registry slug + optional locale. */
export function normalizeDocPageRef(input: string): NormalizedDocPageRef {
	const defaultLocale = docsConfig.i18n?.defaultLocale ?? 'en';
	let s = input.trim();
	if (!s) return { slug: '' };

	if (s.startsWith('http://') || s.startsWith('https://')) {
		try {
			s = new URL(s).pathname;
		} catch {
			// keep raw string
		}
	}

	s = s.replace(/\/markdown\/?$/, '');
	if (s === '/docs' || s === 'docs') return { slug: '' };
	if (s.startsWith('/docs/')) s = s.slice('/docs/'.length);
	else if (s.startsWith('docs/')) s = s.slice('docs/'.length);

	s = s.replace(/^\/+/, '');

	const localeCodes =
		docsConfig.i18n?.locales?.map((l) => l.code).filter((code) => code !== defaultLocale) ?? [];
	for (const loc of localeCodes) {
		if (s === loc) return { slug: '', locale: loc };
		if (s.startsWith(`${loc}/`)) {
			return { slug: s.slice(loc.length + 1), locale: loc };
		}
	}

	return { slug: s };
}
