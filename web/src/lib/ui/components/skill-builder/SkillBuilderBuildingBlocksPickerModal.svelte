<script lang="ts">
	import type { ListingPublicViewModel } from '$lib/listings/GetListing.presenter.svelte';

	import { icons } from '$data/icons';
	import { getListingPresenter } from '$lib/listings';
	import { OPENQUOK_CORE_EXTENSION_SLUG } from '$lib/skill-builder/constants/defaults';
	import { createRemotePagination } from '$lib/ui/helpers/createRemotePagination.svelte';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import PaginationComposite from '$lib/ui/pagination/pagination-composite.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import * as InputGroup from '$lib/ui/input-group';

	const PAGE_SIZE = 12;
	const SEARCH_DEBOUNCE_MS = 300;

	type Props = {
		open?: boolean;
		selectedSlugs?: readonly string[];
		loadingSlug?: string | null;
		onSelectSlug?: (slug: string) => void | Promise<void>;
	};

	let {
		open = $bindable(false),
		selectedSlugs = [],
		loadingSlug = null,
		onSelectSlug
	}: Props = $props();

	function isRequiredBuildingBlock(slug: string): boolean {
		return slug === OPENQUOK_CORE_EXTENSION_SLUG;
	}

	const pagination = createRemotePagination({ initialItemsPerPage: PAGE_SIZE });

	let loading = $state(false);
	let listingsVm = $state<ListingPublicViewModel[]>([]);
	let totalCount = $state(0);
	let searchQuery = $state('');
	let debouncedSearch = $state('');
	let searchInput = $state.raw<HTMLInputElement | null>(null);
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	const selectedSlugSet = $derived(new Set(selectedSlugs));
	const currentPage = $derived(pagination.currentPage);
	const itemsPerPage = $derived(pagination.itemsPerPage);
	const totalPages = $derived(Math.max(1, Math.ceil(totalCount / Math.max(itemsPerPage, 1))));
	const showPagination = $derived(totalPages > 1);

	function resetBrowseState(): void {
		searchQuery = '';
		debouncedSearch = '';
		clearTimeout(debounceTimer);
		pagination.resetToFirstPage();
		listingsVm = [];
		totalCount = 0;
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

	async function handleToggle(listing: ListingPublicViewModel): Promise<void> {
		if (loadingSlug === listing.slug) return;
		const selected = selectedSlugSet.has(listing.slug);
		if (selected && isRequiredBuildingBlock(listing.slug)) return;
		await onSelectSlug?.(listing.slug);
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
				const skip = (page - 1) * perPage;
				const result = await getListingPresenter.loadPublishedExtensionsVm({
					limit: perPage,
					skip,
					searchTerm: term || null
				});
				if (cancelled) return;
				listingsVm = result.listings;
				totalCount = result.count;
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
			<Dialog.Title>Building blocks</Dialog.Title>
			<Dialog.Description class="text-base-content/75 text-sm">
				Search the catalog, then add or remove building blocks for your skill. OpenQuok Core stays
				selected. You can also pick blocks on the building blocks hub and open the skill builder from
				there.
			</Dialog.Description>
		</Dialog.Header>

		<label class="sr-only" for="skill-builder-building-blocks-search">Search building blocks</label>
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
				id="skill-builder-building-blocks-search"
				type="search"
				bind:value={searchQuery}
				placeholder="Search by name or description…"
				autocomplete="off"
				disabled={loading && listingsVm.length === 0}
				oninput={onSearchInput}
			/>
		</InputGroup.Root>

		{#if loading && listingsVm.length === 0}
			<div class="flex items-center justify-center gap-2 py-10 text-sm text-base-content/70">
				<AbstractIcon
					name={icons.LoaderCircle.name}
					class="size-4 animate-spin"
					width="16"
					height="16"
				/>
				Loading building blocks…
			</div>
		{:else if totalCount === 0 && !loading}
			<div class="flex flex-col items-center gap-3 py-8 text-center">
				<AbstractIcon
					name={icons.Grid3x3.name}
					class="size-10 text-base-content/45"
					width="40"
					height="40"
				/>
				<p class="text-sm text-base-content/70">
					{debouncedSearch.trim()
						? 'No building blocks match your search.'
						: 'No building blocks are available yet.'}
				</p>
			</div>
		{:else}
			<div class="relative">
				{#if loading}
					<div
						class="bg-base-100/70 absolute inset-0 z-10 flex items-center justify-center rounded-lg backdrop-blur-[1px]"
						aria-busy="true"
						aria-label="Loading building blocks"
					>
						<AbstractIcon
							name={icons.LoaderCircle.name}
							class="size-5 animate-spin text-primary"
							width="20"
							height="20"
						/>
					</div>
				{/if}

				<ul class="max-h-[min(48vh,20rem)] space-y-2 overflow-y-auto" aria-label="Building blocks">
					{#each listingsVm as listing (listing.id)}
						{@const selected = selectedSlugSet.has(listing.slug)}
						{@const required = isRequiredBuildingBlock(listing.slug)}
						{@const rowLoading = loadingSlug === listing.slug}
						<li>
							<button
								type="button"
								class="flex w-full items-center gap-3 rounded-xl border border-base-300/80 bg-base-100 px-3 py-2.5 text-left transition-shadow hover:ring-2 hover:ring-primary disabled:cursor-not-allowed disabled:opacity-50 {selected
									? 'ring-2 ring-primary/60'
									: ''}"
								disabled={rowLoading || (selected && required)}
								aria-label={selected
									? required
										? `${listing.title} (required)`
										: `Remove ${listing.title}`
									: `Add ${listing.title}`}
								onclick={() => void handleToggle(listing)}
							>
								{#if listing.logoImageUrl}
									<img
										src={listing.logoImageUrl}
										alt=""
										class="size-10 shrink-0 rounded-lg border border-base-300/60 object-cover"
										loading="lazy"
									/>
								{:else}
									<span
										class="bg-base-200 text-base-content/50 flex size-10 shrink-0 items-center justify-center rounded-lg border border-base-300/60"
										aria-hidden="true"
									>
										<AbstractIcon
											name={icons.Grid3x3.name}
											class="size-5"
											width="20"
											height="20"
										/>
									</span>
								{/if}
								<span class="min-w-0 flex-1">
									<span class="block truncate font-medium text-base-content">{listing.title}</span>
									{#if listing.excerpt?.trim() || listing.description?.trim()}
										<span class="text-base-content/60 line-clamp-1 text-xs">
											{listing.excerpt?.trim() || listing.description?.trim()}
										</span>
									{/if}
								</span>
								{#if rowLoading}
									<span class="loading loading-spinner loading-sm text-primary shrink-0"></span>
								{:else if selected && required}
									<span class="badge badge-primary badge-sm shrink-0">Required</span>
								{:else if selected}
									<span class="text-error shrink-0 text-xs font-medium">Remove</span>
								{:else}
									<span class="text-primary shrink-0 text-xs font-medium">Add</span>
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			</div>

			{#if showPagination}
				<PaginationComposite
					class="!mt-2 gap-3"
					{itemsPerPage}
					totalItems={totalCount}
					currentPage={currentPage}
					{totalPages}
					{setItemsPerPage}
					{setCurrentPage}
					{paginateFrontFF}
					{paginateBackFF}
					nameOfItems="building blocks"
					pageSizeOptions={[12, 24, 48]}
				/>
			{/if}
		{/if}

		<Dialog.Footer>
			<Button type="button" variant="ghost" onclick={() => (open = false)}>Done</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
