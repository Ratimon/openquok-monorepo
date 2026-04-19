/**
 * Infinite template/search list: debounced reset on query change + paginated fetch.
 */
export async function fetcherJson<T>(url: string, signal?: AbortSignal): Promise<T> {
	const r = await fetch(url, { signal });
	if (!r.ok) {
		throw new Error(`Request failed (${r.status})`);
	}
	return r.json() as Promise<T>;
}

export type InfiniteApiOptions<T> =
	| {
			defaultQuery?: string;
			timeout?: number;
			/** Loads a page by query + page index (e.g. repository `fetchPolotnoTemplateListPagePm`). */
			fetchPage: (ctx: { query: string; page: number }, signal?: AbortSignal) => Promise<T>;
			getSize?: (page: T) => number;
	  }
	| {
			defaultQuery?: string;
			timeout?: number;
			getAPI: (params: { query: string; page: number }) => string;
			getSize?: (page: T) => number;
			fetchFunc?: (url: string, signal?: AbortSignal) => Promise<T>;
	  };

export function createInfiniteApi<T>(options: InfiniteApiOptions<T>) {
	const defaultQuery = options.defaultQuery ?? '';
	const timeout = options.timeout ?? 1000;
	const getSize =
		options.getSize ??
		((page: unknown) => {
			const p = page as { total_pages?: number; totalPages?: number };
			return p.totalPages ?? p.total_pages ?? 0;
		});

	const fetchPage = 'fetchPage' in options ? options.fetchPage : undefined;
	const getAPI = 'getAPI' in options ? options.getAPI : undefined;
	const fetchFunc =
		'fetchFunc' in options ? (options.fetchFunc ?? fetcherJson<T>) : fetcherJson<T>;

	if (!fetchPage && !getAPI) {
		throw new Error('createInfiniteApi: provide fetchPage or getAPI');
	}

	let queryRef = defaultQuery;
	let data = $state<(T | undefined)[]>([]);
	let requestedCount = $state(0);
	let loading = $state(false);
	let error = $state<unknown>(undefined);
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let fetchSeq = 0;
	let abortCtl: AbortController | undefined;

	function cancelInFlight() {
		abortCtl?.abort();
		abortCtl = undefined;
	}

	async function fetchPageAt(index: number) {
		const seq = ++fetchSeq;
		const pageNum = index + 1;
		cancelInFlight();
		abortCtl = new AbortController();
		loading = true;
		error = undefined;
		try {
			let page: T;
			if (fetchPage) {
				page = await fetchPage({ query: queryRef, page: pageNum }, abortCtl.signal);
			} else {
				const url = getAPI!({ query: queryRef, page: pageNum });
				page = await fetchFunc(url, abortCtl.signal);
			}
			if (seq !== fetchSeq) return;
			const next = [...data];
			next[index] = page;
			data = next;
		} catch (e) {
			if (seq !== fetchSeq) return;
			if ((e as Error).name === 'AbortError') return;
			error = e;
		} finally {
			if (seq === fetchSeq) loading = false;
		}
	}

	/** Update query immediately; debounce list reset + refetch. */
	function setQuery(query: string) {
		queryRef = query;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			reset();
		}, timeout);
	}

	function reset() {
		clearTimeout(debounceTimer);
		fetchSeq++;
		cancelInFlight();
		data = [];
		requestedCount = 0;
		error = undefined;
		void ensureFirstPage();
	}

	async function ensureFirstPage() {
		if (requestedCount >= 1) return;
		requestedCount = 1;
		await fetchPageAt(0);
	}

	const flatData = $derived(data.filter(Boolean) as T[]);

	const flattenedItems = $derived(
		flatData.flatMap((page: unknown) => {
			const p = page as { items?: unknown[] };
			return p.items ?? [];
		})
	);

	const lastPage = $derived(data.length ? (data[data.length - 1] as T | undefined) : undefined);

	const isEmpty = $derived(
		data[0] !== undefined &&
			Array.isArray((data[0] as { items?: unknown[] })?.items) &&
			((data[0] as { items: unknown[] }).items?.length ?? 0) === 0
	);

	const isReachingEnd = $derived.by(() => {
		if (isEmpty) return true;
		if (!lastPage) return false;
		const total = getSize(lastPage);
		if (!total || total < 1) return true;
		return requestedCount >= total;
	});

	const hasMore = $derived(!isReachingEnd && !error);

	function loadMore() {
		if (error || loading) return;
		if (requestedCount === 0 || data[0] === undefined) return;
		if (isEmpty) return;
		const lp = data[data.length - 1] as T | undefined;
		if (lp) {
			const total = getSize(lp);
			if (total >= 1 && requestedCount >= total) return;
		}
		const next = requestedCount + 1;
		requestedCount = next;
		void fetchPageAt(next - 1);
	}

	const isLoading = $derived(
		loading || (requestedCount > 0 && data.length > 0 && data[data.length - 1] === undefined)
	);

	function init() {
		reset();
	}

	return {
		init,
		setQuery,
		loadMore,
		get hasMore() {
			return hasMore;
		},
		reset,
		get data() {
			return data;
		},
		get items() {
			return flattenedItems;
		},
		get isLoading() {
			return isLoading;
		},
		get error() {
			return error;
		}
	};
}
