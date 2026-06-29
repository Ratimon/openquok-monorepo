<script lang="ts">
	import type { PageData } from './$types';
	import type { ExtensionSort, ExtensionTypeFilter, ExtensionsHubFilters } from '$lib/listings/index';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import { publicExtensionsPagePresenter } from '$lib/area-public/index';

	import ExtensionsCategorySidebar from '$lib/ui/templates/extensions/ExtensionsCategorySidebar.svelte';
	import ExtensionCard from '$lib/ui/templates/extensions/ExtensionCard.svelte';
	import ExtensionsHubStats from '$lib/ui/templates/extensions/ExtensionsHubStats.svelte';
	import ExtensionsSearchBar from '$lib/ui/templates/extensions/ExtensionsSearchBar.svelte';
	import ExtensionsTypeChips from '$lib/ui/templates/extensions/ExtensionsTypeChips.svelte';
	import ExtensionsTagFilter from '$lib/ui/templates/extensions/ExtensionsTagFilter.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let metaTitle = $derived(data.metaTitle);
	let metaDescription = $derived(data.metaDescription);
	let extensionsVm = $derived(data.extensionsVm);
	let categoriesVm = $derived(data.categoriesVm);
	let statsVm = $derived(data.statsVm);
	let filtersVm = $derived(data.filtersVm);
	let tagFilterVm = $derived(data.tagFilterVm);
	let schemaData = $derived(data.schemaData);

	const pagePresenter = publicExtensionsPagePresenter;

	let expandedId = $state<string | null>(null);
	let searchDraft = $state('');

	$effect(() => {
		searchDraft = filtersVm.search ?? '';
	});

	const sortOptions: { id: ExtensionSort; label: string }[] = [
		{ id: 'newest', label: 'Newest' },
		{ id: 'oldest', label: 'Oldest' },
		{ id: 'popular', label: 'Most liked' },
		{ id: 'views', label: 'Most viewed' }
	];

	function navigateFilters(overrides: Partial<ExtensionsHubFilters>) {
		const href = pagePresenter.buildFilterUrl(page.url.pathname, filtersVm, overrides);
		void goto(href, { keepFocus: true, noScroll: true });
	}

	function handleSearchChange(value: string) {
		searchDraft = value;
		navigateFilters({ search: value.trim() || undefined });
	}

	function handleTypeSelect(type: ExtensionTypeFilter) {
		navigateFilters({ type });
	}

	function handleTagGroupSelect(groupSlug: string | null) {
		navigateFilters({ tagGroup: groupSlug ?? undefined, tags: undefined });
	}

	function handleTagToggle(tagSlug: string) {
		const current = new Set(filtersVm.tags ?? []);
		if (current.has(tagSlug)) current.delete(tagSlug);
		else current.add(tagSlug);
		const tags = [...current];
		navigateFilters({
			tags: tags.length ? tags : undefined,
			tagGroup: tags.length ? undefined : filtersVm.tagGroup
		});
	}

	function handleTagClear() {
		navigateFilters({ tags: undefined, tagGroup: undefined });
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

<JsonLdHead schemaData={schemaData} />

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
			<ExtensionsHubStats statsVm={statsVm} />
		</div>
	</header>

	<div class="container mx-auto mt-10 max-w-6xl space-y-6 px-4">
		<div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
			<ExtensionsSearchBar bind:value={searchDraft} onchange={handleSearchChange} class="flex-1" />
			<label class="flex items-center gap-2 text-sm text-base-content/70">
				<span>Sort</span>
				<select
					class="select select-bordered select-sm"
					value={filtersVm.sort ?? 'newest'}
					onchange={handleSortChange}
				>
					{#each sortOptions as option (option.id)}
						<option value={option.id}>{option.label}</option>
					{/each}
				</select>
			</label>
		</div>

		<ExtensionsTypeChips
			activeType={filtersVm.type ?? 'all'}
			onSelect={handleTypeSelect}
		/>

		<ExtensionsTagFilter
			tagFilterVm={tagFilterVm}
			activeTagGroup={filtersVm.tagGroup ?? null}
			activeTags={filtersVm.tags ?? []}
			onGroupSelect={handleTagGroupSelect}
			onTagToggle={handleTagToggle}
			onClear={handleTagClear}
		/>

		<div class="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
			<aside class="lg:sticky lg:top-24 lg:self-start">
				<h2 class="mb-3 text-sm font-semibold text-base-content/70">Categories</h2>
				<ExtensionsCategorySidebar
					categoriesVm={categoriesVm}
					activeCategorySlug={filtersVm.category ?? null}
					onSelect={handleCategorySelect}
				/>
			</aside>

			<section aria-label="Extension listings">
				{#if extensionsVm.length === 0}
					<p class="rounded-2xl border border-dashed border-base-content/15 p-8 text-center text-base-content/70">
						No extensions match your filters yet.
					</p>
				{:else}
					<ul class="space-y-4">
						{#each extensionsVm as extensionVm (extensionVm.id)}
							<li>
								<ExtensionCard
									extensionVm={extensionVm}
									expanded={expandedId === extensionVm.id}
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
