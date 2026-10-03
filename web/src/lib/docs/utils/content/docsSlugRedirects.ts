/** Maps legacy docs slugs to current slugs (permanent redirects). */
export function resolveLegacyDocsSlug(slug: string): string | null {
	if (slug === 'playbooks') return 'saved';
	if (slug.startsWith('playbooks/')) {
		return `saved/${slug.slice('playbooks/'.length)}`;
	}
	return null;
}

export function docsRedirectPath(
	legacySlug: string,
	opts: { localePrefix?: string; markdown?: boolean; search?: string } = {}
): string | null {
	const nextSlug = resolveLegacyDocsSlug(legacySlug);
	if (nextSlug === null) return null;

	const base = opts.localePrefix ? `/docs/${opts.localePrefix}` : '/docs';
	const path = `${base}/${nextSlug}`;
	const markdownSuffix = opts.markdown ? '/markdown' : '';
	const search = opts.search ?? '';
	return `${path}${markdownSuffix}${search}`;
}
