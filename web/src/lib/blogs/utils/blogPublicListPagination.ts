export const BLOG_PUBLIC_LIST_DEFAULT_PAGE_SIZE = 12;
export const BLOG_PUBLIC_LIST_PAGE_SIZE_OPTIONS = [6, 12, 24] as const;
export const BLOG_PUBLIC_LIST_MAX_PAGE_SIZE = 100;

export type BlogPublicListPagination = {
	page: number;
	itemsPerPage: number;
};

export function parseBlogPublicListPagination(
	searchParams: URLSearchParams,
	defaults: { itemsPerPage?: number } = {}
): BlogPublicListPagination {
	const defaultItemsPerPage = defaults.itemsPerPage ?? BLOG_PUBLIC_LIST_DEFAULT_PAGE_SIZE;

	const rawPage = searchParams.get('page');
	const pageSanitized = rawPage?.replace(/\D/g, '') ?? '';
	const pageParsed = pageSanitized ? parseInt(pageSanitized, 10) : 1;
	const page = Number.isFinite(pageParsed) && pageParsed > 0 ? pageParsed : 1;

	const rawIpp = searchParams.get('ipp');
	const ippSanitized = rawIpp?.replace(/\D/g, '') ?? '';
	const ippParsed = ippSanitized ? parseInt(ippSanitized, 10) : defaultItemsPerPage;
	const itemsPerPage = Math.min(
		BLOG_PUBLIC_LIST_MAX_PAGE_SIZE,
		Math.max(1, Number.isFinite(ippParsed) ? ippParsed : defaultItemsPerPage)
	);

	return { page, itemsPerPage };
}

export function buildBlogPublicListUrl(
	pathname: string,
	searchParams: URLSearchParams,
	overrides: Record<string, string | null | undefined>
): string {
	const sp = new URLSearchParams(searchParams);
	for (const [key, val] of Object.entries(overrides)) {
		if (val === null || val === undefined || val === '') {
			sp.delete(key);
		} else {
			sp.set(key, val);
		}
	}
	if (sp.get('page') === '1') {
		sp.delete('page');
	}
	if (sp.get('ipp') === String(BLOG_PUBLIC_LIST_DEFAULT_PAGE_SIZE)) {
		sp.delete('ipp');
	}
	const q = sp.toString();
	return `${pathname}${q ? `?${q}` : ''}`;
}
