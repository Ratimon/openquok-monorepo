export type RemotePaginationOptions = {
	initialPage?: number;
	initialItemsPerPage?: number;
};

/**
 * Holds **page index** and **page size** for server-backed lists.
 *
 * Totals (`totalItems`, `totalPages`) stay elsewhere (presenter / API response). Pair this with a fetch that
 * passes `page` and `itemsPerPage`, then assigns `currentPage` from the server when the response returns.
 *
 * Compare: {@link createPagination} slices an in-memory array; URL-driven loaders sync `page`/`ipp` query params.
 */
export function createRemotePagination(options?: RemotePaginationOptions) {
	let currentPage = $state(options?.initialPage ?? 1);
	let itemsPerPage = $state(options?.initialItemsPerPage ?? 24);

	return {
		get currentPage() {
			return currentPage;
		},
		set currentPage(page: number) {
			currentPage = page;
		},
		get itemsPerPage() {
			return itemsPerPage;
		},
		setItemsPerPage(size: number): void {
			itemsPerPage = size;
			currentPage = 1;
		},
		resetToFirstPage(): void {
			currentPage = 1;
		}
	};
}
