<script lang="ts">
	import type { BlogImageLibraryItemDto } from '$lib/core/Image.repository.svelte';

	import { icons } from '$data/icons';
	import { buildBlogInlineImageSrc } from '$lib/blogs/utils/blogImages';
	import { imageRepository } from '$lib/core/index';
	import { createRemotePagination } from '$lib/ui/helpers/createRemotePagination.svelte';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import PaginationComposite from '$lib/ui/pagination/pagination-composite.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import * as InputGroup from '$lib/ui/input-group';

	const PAGE_SIZE = 24;
	const SEARCH_DEBOUNCE_MS = 300;

	type Props = {
		open?: boolean;
		disabled?: boolean;
		onSelect?: (storagePath: string) => void;
	};

	let { open = $bindable(false), disabled = false, onSelect }: Props = $props();

	const pagination = createRemotePagination({ initialItemsPerPage: PAGE_SIZE });

	let loading = $state(false);
	let items = $state<BlogImageLibraryItemDto[]>([]);
	let hasMore = $state(false);
	let searchQuery = $state('');
	let debouncedSearch = $state('');
	let searchInput = $state.raw<HTMLInputElement | null>(null);
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	const pickerDisabled = $derived(disabled);
	const currentPage = $derived(pagination.currentPage);
	const itemsPerPage = $derived(pagination.itemsPerPage);
	const totalItems = $derived(
		hasMore
			? currentPage * itemsPerPage + 1
			: (currentPage - 1) * itemsPerPage + items.length
	);
	const totalPages = $derived(Math.max(1, Math.ceil(totalItems / Math.max(itemsPerPage, 1))));
	const showPagination = $derived(totalPages > 1 || hasMore);

	function thumbSrc(item: BlogImageLibraryItemDto): string {
		return buildBlogInlineImageSrc(item.storagePath);
	}

	function resetBrowseState(): void {
		searchQuery = '';
		debouncedSearch = '';
		clearTimeout(debounceTimer);
		pagination.resetToFirstPage();
		items = [];
		hasMore = false;
	}

	function setCurrentPage(page: number): void {
		if (page < 1 || page === pagination.currentPage) return;
		pagination.currentPage = page;
	}

	function setItemsPerPage(size: number): void {
		pagination.setItemsPerPage(size);
	}

	function paginateFrontFF(): void {
		const tp = Math.max(totalPages, 1);
		if (tp > 1) setCurrentPage(tp);
	}

	function paginateBackFF(): void {
		setCurrentPage(1);
	}

	function focusSearch(): void {
		searchInput?.focus();
	}

	function onSearchInput(e: Event): void {
		const next = (e.currentTarget as HTMLInputElement).value;
		searchQuery = next;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			debouncedSearch = next.trim();
			pagination.resetToFirstPage();
		}, SEARCH_DEBOUNCE_MS);
	}

	function selectItem(item: BlogImageLibraryItemDto): void {
		if (pickerDisabled) return;
		const path = item.storagePath?.trim();
		if (!path) return;
		onSelect?.(path);
		open = false;
	}

	$effect(() => {
		if (!open) {
			resetBrowseState();
			return;
		}
		resetBrowseState();
	});

	$effect(() => {
		if (!open) return;
		const page = pagination.currentPage;
		const perPage = pagination.itemsPerPage;
		const term = debouncedSearch;

		let cancelled = false;
		loading = true;
		void (async () => {
			try {
				const result = await imageRepository.listBlogImages({
					page,
					limit: perPage,
					search: term || undefined
				});
				if (cancelled) return;
				items = result.items;
				hasMore = result.hasMore;
			} finally {
				if (!cancelled) loading = false;
			}
		})();

		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		if (pagination.currentPage > totalPages) {
			pagination.currentPage = totalPages;
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="max-h-[90vh] max-w-xl gap-4 overflow-y-auto"
		onOpenAutoFocus={(e) => e.preventDefault()}
	>
		<Dialog.Header>
			<Dialog.Title>Blog image library</Dialog.Title>
			<Dialog.Description class="text-base-content/75 text-sm">
				Search by file name, then click a thumbnail to insert an image from the blog CMS bucket.
			</Dialog.Description>
		</Dialog.Header>

		<label class="sr-only" for="blog-image-library-search">Search blog image library</label>
		<InputGroup.Root class="shadow-xs">
			<InputGroup.Addon align="inline-start" class="pl-2.5">
				<button
					type="button"
					tabindex="-1"
					class="text-base-content/50 hover:text-base-content/80 flex touch-manipulation items-center justify-center rounded p-0.5 transition-colors"
					aria-label="Focus search"
					onclick={focusSearch}
				>
					<AbstractIcon
						name={icons.Search.name}
						class="pointer-events-none size-4"
						width="16"
						height="16"
					/>
				</button>
			</InputGroup.Addon>
			<InputGroup.Input
				bind:ref={searchInput}
				id="blog-image-library-search"
				type="search"
				bind:value={searchQuery}
				placeholder="Search by file name…"
				autocomplete="off"
				disabled={loading && items.length === 0}
				oninput={onSearchInput}
			/>
		</InputGroup.Root>

		{#if loading && items.length === 0}
			<div class="flex items-center justify-center gap-2 py-10 text-sm text-base-content/70">
				<AbstractIcon
					name={icons.LoaderCircle.name}
					class="size-4 animate-spin"
					width="16"
					height="16"
				/>
				Loading library…
			</div>
		{:else if items.length === 0 && !loading}
			<div class="flex flex-col items-center gap-3 py-8 text-center">
				<AbstractIcon
					name={icons.Image.name}
					class="size-10 text-base-content/45"
					width="40"
					height="40"
				/>
				{#if debouncedSearch}
					<p class="text-sm text-base-content/70">No images match your search.</p>
				{:else}
					<p class="text-sm text-base-content/70">No images in the blog library yet.</p>
					<p class="text-base-content/55 max-w-xs text-xs">
						Upload images from the editor toolbar or hero section, then pick them here.
					</p>
				{/if}
			</div>
		{:else}
			<div class="relative">
				{#if loading}
					<div
						class="bg-base-100/70 absolute inset-0 z-10 flex items-center justify-center rounded-lg backdrop-blur-[1px]"
						aria-busy="true"
						aria-label="Loading library"
					>
						<AbstractIcon
							name={icons.LoaderCircle.name}
							class="size-5 animate-spin text-primary"
							width="20"
							height="20"
						/>
					</div>
				{/if}
				<div class="grid max-h-[min(48vh,20rem)] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
					{#each items as item (item.storagePath)}
						<button
							type="button"
							class="relative overflow-hidden rounded-lg border border-base-300 bg-base-100 transition-shadow hover:ring-2 hover:ring-primary disabled:cursor-not-allowed disabled:opacity-45"
							disabled={pickerDisabled}
							title={item.name}
							aria-label={`Select ${item.name}`}
							onclick={() => selectItem(item)}
						>
							<img
								src={thumbSrc(item)}
								alt=""
								class="aspect-square w-full object-cover"
								loading="lazy"
							/>
						</button>
					{/each}
				</div>
			</div>

			{#if showPagination}
				<PaginationComposite
					class="!mt-2 gap-3"
					{itemsPerPage}
					{totalItems}
					currentPage={currentPage}
					{totalPages}
					{setItemsPerPage}
					{setCurrentPage}
					{paginateFrontFF}
					{paginateBackFF}
					nameOfItems="images"
					pageSizeOptions={[12, 24, 48]}
				/>
			{/if}
		{/if}

		<Dialog.Footer>
			<Button type="button" variant="ghost" onclick={() => (open = false)}>Cancel</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
