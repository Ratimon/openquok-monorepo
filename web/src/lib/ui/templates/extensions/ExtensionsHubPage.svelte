<script lang="ts">
	import type {
		ExtensionCardViewModel,
		ExtensionCategoryViewModel,
		ExtensionsHubStatsViewModel,
		ExtensionSort,
		ExtensionTypeFilter,
		ExtensionsHubFilters
	} from '$lib/listings/index';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import { publicExtensionsPagePresenter } from '$lib/area-public/index';

	import ExtensionsCategorySidebar from '$lib/ui/templates/extensions/ExtensionsCategorySidebar.svelte';
	import ExtensionCard from '$lib/ui/templates/extensions/ExtensionCard.svelte';
	import ExtensionsHubStats from '$lib/ui/templates/extensions/ExtensionsHubStats.svelte';
	import ExtensionsSearchBar from '$lib/ui/templates/extensions/ExtensionsSearchBar.svelte';
	import ExtensionsTypeChips from '$lib/ui/templates/extensions/ExtensionsTypeChips.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';

	type Props = {
		metaTitle: string;
		metaDescription: string;
		extensions: ExtensionCardViewModel[];
		categories: ExtensionCategoryViewModel[];
		stats: ExtensionsHubStatsViewModel;
		filters: ExtensionsHubFilters;
	};

	let { metaTitle, metaDescription, extensions, categories, stats, filters }: Props = $props();

	const pagePresenter = publicExtensionsPagePresenter;

	let expandedId = $state<string | null>(null);
	let searchDraft = $state('');

	$effect(() => {
		searchDraft = filters.search ?? '';
	});

	const sortOptions: { id: ExtensionSort; label: string }[] = [
		{ id: 'newest', label: 'Newest' },
		{ id: 'oldest', label: 'Oldest' },
		{ id: 'popular', label: 'Most liked' },
		{ id: 'views', label: 'Most viewed' }
	];

	function navigateFilters(overrides: Partial<ExtensionsHubFilters>) {
		const href = pagePresenter.buildFilterUrl(page.url.pathname, filters, overrides);
		void goto(href, { keepFocus: true, noScroll: true });
	}

	function handleSearchChange(value: string) {
		searchDraft = value;
		navigateFilters({ search: value.trim() || undefined });
	}

	function handleTypeSelect(type: ExtensionTypeFilter) {
		navigateFilters({ type });
	}

	function handleCategorySelect(slug: string | null) {
		navigateFilters({ category: slug ?? undefined });
	}

	function handleSortChange(event: Event) {
		const value = (event.currentTarget as HTMLSelectElement).value as ExtensionSort;
		navigateFilters({ sort: value });
	}

	function toggleExpanded(id: string) {
		expandedId = expandedId === id ? null : id;
	}
</script>

<SectionOuterContainer class="py-10 md:py-14">
	<header class="container mx-auto max-w-6xl space-y-4 px-4 text-center">
		<p class="text-xs font-bold tracking-wider text-primary uppercase sm:text-sm">Extensions</p>
		<h1 class="text-3xl font-black tracking-tight text-balance text-base-content sm:text-4xl">
			{metaTitle}
		</h1>
		<p class="mx-auto max-w-3xl text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
			{metaDescription}
		</p>
		<div class="flex justify-center pt-2">
			<ExtensionsHubStats stats={stats} />
		</div>
	</header>

	<div class="container mx-auto mt-10 max-w-6xl space-y-6 px-4">
		<div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
			<ExtensionsSearchBar bind:value={searchDraft} onchange={handleSearchChange} class="flex-1" />
			<label class="flex items-center gap-2 text-sm text-base-content/70">
				<span>Sort</span>
				<select
					class="select select-bordered select-sm"
					value={filters.sort ?? 'newest'}
					onchange={handleSortChange}
				>
					{#each sortOptions as option (option.id)}
						<option value={option.id}>{option.label}</option>
					{/each}
				</select>
			</label>
		</div>

		<ExtensionsTypeChips activeType={filters.type ?? 'all'} onSelect={handleTypeSelect} />

		<div class="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
			<aside class="lg:sticky lg:top-24 lg:self-start">
				<h2 class="mb-3 text-sm font-semibold text-base-content/70">Categories</h2>
				<ExtensionsCategorySidebar
					categories={categories}
					activeCategorySlug={filters.category ?? null}
					onSelect={handleCategorySelect}
				/>
			</aside>

			<section aria-label="Extension listings">
				{#if extensions.length === 0}
					<p class="rounded-2xl border border-dashed border-base-content/15 p-8 text-center text-base-content/70">
						No extensions match your filters yet.
					</p>
				{:else}
					<ul class="space-y-4">
						{#each extensions as extension (extension.id)}
							<li>
								<ExtensionCard
									extension={extension}
									expanded={expandedId === extension.id}
									onToggle={toggleExpanded}
								/>
							</li>
						{/each}
					</ul>
				{/if}
			</section>
		</div>
	</div>
</SectionOuterContainer>
