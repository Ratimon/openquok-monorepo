export const HUB_LIST_DEFAULT_PAGE_SIZE = 20;
export const HUB_LIST_PAGE_SIZE_OPTIONS = [20, 40, 60] as const;
export const HUB_LIST_MAX_PAGE_SIZE = 100;
export const HUB_LIST_FETCH_LIMIT = 500;

export type HubListPagination = {
	page: number;
	itemsPerPage: number;
};

export function parseHubListPagination(
	searchParams: URLSearchParams,
	defaults: { itemsPerPage?: number } = {}
): HubListPagination {
	const defaultItemsPerPage = defaults.itemsPerPage ?? HUB_LIST_DEFAULT_PAGE_SIZE;

	const rawPage = searchParams.get('page');
	const pageSanitized = rawPage?.replace(/\D/g, '') ?? '';
	const pageParsed = pageSanitized ? parseInt(pageSanitized, 10) : 1;
	const page = Number.isFinite(pageParsed) && pageParsed > 0 ? pageParsed : 1;

	const rawIpp = searchParams.get('ipp');
	const ippSanitized = rawIpp?.replace(/\D/g, '') ?? '';
	const ippParsed = ippSanitized ? parseInt(ippSanitized, 10) : defaultItemsPerPage;
	const itemsPerPage = Math.min(
		HUB_LIST_MAX_PAGE_SIZE,
		Math.max(1, Number.isFinite(ippParsed) ? ippParsed : defaultItemsPerPage)
	);

	return { page, itemsPerPage };
}

export function paginateHubList<T>(
	items: T[],
	page: number,
	itemsPerPage: number
): {
	page: number;
	itemsPerPage: number;
	count: number;
	totalPages: number;
	items: T[];
	listOffset: number;
} {
	const count = items.length;
	const totalPages = Math.max(1, Math.ceil(count / Math.max(itemsPerPage, 1)));
	const safePage = Math.min(Math.max(1, page), totalPages);
	const listOffset = (safePage - 1) * itemsPerPage;

	return {
		page: safePage,
		itemsPerPage,
		count,
		totalPages,
		items: items.slice(listOffset, listOffset + itemsPerPage),
		listOffset
	};
}

export function buildHubListUrl(
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
	if (sp.get('ipp') === String(HUB_LIST_DEFAULT_PAGE_SIZE)) {
		sp.delete('ipp');
	}
	const q = sp.toString();
	return `${pathname}${q ? `?${q}` : ''}`;
}
