export type { RemotePaginationOptions } from '$lib/ui/helpers/createRemotePagination.svelte';
export { createRemotePagination } from '$lib/ui/helpers/createRemotePagination.svelte';

type ClientPaginationProps<T> = {
	initialPage?: number;
	initialItemsPerPage?: number;
	initialData: T[];
	searchField?: keyof T;
};

/**
 * Client-side pagination: filter optional `searchField`, then slice `initialData` by page.
 *
 * For API-paginated screens use {@link createRemotePagination} instead.
 */
export function createPagination<T>({
	initialPage = 1,
	initialItemsPerPage = 10,
	initialData,
	searchField
}: ClientPaginationProps<T>) {
	let currentPage = $state(initialPage);
	let itemsPerPage = $state(initialItemsPerPage);
	let data = $state(initialData);
	let searchTerm = $state('');

	$effect(() => {
		data = initialData;
	});

	const filteredData = $derived(
		searchField && searchTerm && searchTerm !== ''
			? data.filter((item) =>
					String(item[searchField]).toLowerCase().includes(searchTerm.toLowerCase())
				)
			: data
	);

	const totalPages = $derived(Math.ceil(filteredData.length / itemsPerPage));

	const startIndex = $derived((currentPage - 1) * itemsPerPage);
	const endIndex = $derived(currentPage * itemsPerPage);

	const currentData = $derived(filteredData.slice(startIndex, endIndex));

	function setCurrentPage(page: number) {
		currentPage = page;
	}

	function setItemsPerPage(size: number) {
		itemsPerPage = size;
		setCurrentPage(1);
	}

	function paginateFront() {
		setCurrentPage(Math.min(currentPage + 1, totalPages));
	}

	function paginateBack() {
		setCurrentPage(Math.max(currentPage - 1, 1));
	}

	function paginateFrontFF() {
		setCurrentPage(totalPages);
	}

	function paginateBackFF() {
		setCurrentPage(1);
	}

	return {
		get currentData() {
			return currentData;
		},
		get currentPage() {
			return currentPage;
		},
		get totalPages() {
			return totalPages;
		},
		get totalFilteredItems() {
			return filteredData.length;
		},
		get itemsPerPage() {
			return itemsPerPage;
		},
		get searchTerm() {
			return searchTerm;
		},
		set searchTerm(val: string) {
			searchTerm = val;
		},
		paginateFront,
		paginateBack,
		paginateFrontFF,
		paginateBackFF,
		setItemsPerPage,
		setCurrentPage
	};
}
