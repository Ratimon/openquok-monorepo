<script lang="ts">
	import type {
		BuildBacklinksHubFilters,
		LinkDirectoryCategoryDto,
		LinkDirectoryTagDto
	} from '$lib/link-directory/index';

	import { goto } from '$app/navigation';

	import {
		getRootPathPublicBuildBacklinks,
		getRootPathPublicBuildBacklinksCategory
	} from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
	import { isBuildBacklinksEditorialTagSlug } from '$lib/link-directory/constants/buildBacklinksTagTaxonomy';
	import { publicBuildBacklinksPagePresenter } from '$lib/link-directory/index';
	import { route } from '$lib/utils/path';

	import { icons } from '$data/icons';

	import { cn } from '$lib/ui/helpers/common';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import PublicHubSearchBar from '$lib/ui/templates/public-hub/PublicHubSearchBar.svelte';

	type Props = {
		filtersVm: BuildBacklinksHubFilters;
		categoriesVm: LinkDirectoryCategoryDto[];
		tagsVm: LinkDirectoryTagDto[];
		linkMode?: 'public' | 'inPlace';
		buildFilterUrl?: (
			current: BuildBacklinksHubFilters,
			overrides: Partial<BuildBacklinksHubFilters>
		) => string;
		bookmarkCount?: number;
		class?: string;
	};

	let {
		filtersVm,
		categoriesVm,
		tagsVm,
		linkMode = 'public',
		buildFilterUrl,
		bookmarkCount = 0,
		class: className = ''
	}: Props = $props();

	const pagePresenter = publicBuildBacklinksPagePresenter;

	const editorialTagsVm = $derived(tagsVm.filter((tag) => isBuildBacklinksEditorialTagSlug(tag.slug)));

	let searchDraft = $state('');

	$effect(() => {
		searchDraft = filtersVm.search ?? '';
	});

	function navigate(overrides: Partial<BuildBacklinksHubFilters>) {
		const href = buildFilterUrl
			? buildFilterUrl(filtersVm, overrides)
			: pagePresenter.buildFilterUrl(filtersVm, overrides);
		void goto(href, { keepFocus: true, noScroll: linkMode === 'inPlace' });
	}

	function toggleArrayFilter<T extends string>(
		key: 'costTiers' | 'dofollow' | 'effort' | 'approvalMode',
		value: T
	) {
		const current = (filtersVm[key] ?? []) as T[];
		const next = current.includes(value)
			? current.filter((item) => item !== value)
			: [...current, value];
		navigate({ [key]: next.length > 0 ? next : undefined });
	}

	function isActive(key: 'costTiers' | 'dofollow' | 'effort' | 'approvalMode', value: string): boolean {
		return (filtersVm[key] ?? []).includes(value as never);
	}

	function applySearch() {
		const term = searchDraft.trim();
		navigate({ search: term || undefined });
	}

	const panelShell =
		'rounded-xl border border-primary/25 bg-primary/5 p-3.5 shadow-sm shadow-primary/5';
	const sectionDivider = 'border-t border-primary/20 pt-5';
	const sectionTitle = 'text-xs font-semibold uppercase tracking-wide text-primary/90';
	const navLinkClass = (active: boolean) =>
		cn(
			'block rounded-md px-2 py-1.5 text-sm transition-colors',
			active ? 'bg-primary/15 font-semibold text-base-content' : 'hover:bg-primary/10'
		);
</script>

<aside class={cn(className)} aria-label="Filter backlink sites">
	<div class={cn(panelShell, 'space-y-5')}>
		<PublicHubSearchBar
			class="[&_input]:border-primary/20 [&_input]:bg-base-100/50"
			bind:value={searchDraft}
			placeholder="Sites or Opportunities…"
			onchange={() => applySearch()}
		/>

		<div class={sectionDivider}>
			<h3 class={sectionTitle}>Saved</h3>
			<div
				class={cn(
					'mt-2 flex w-full overflow-hidden rounded-lg border',
					filtersVm.bookmarkedOnly
						? 'border-warning bg-warning text-warning-content shadow-sm'
						: 'border-warning/45 bg-warning/15'
				)}
			>
				<button
					type="button"
					class={cn(
						'btn btn-sm inline-flex min-w-0 flex-1 gap-1.5 rounded-none border-0 shadow-none',
						filtersVm.bookmarkedOnly
							? 'btn-warning text-warning-content hover:bg-warning'
							: 'bg-transparent text-warning-content hover:bg-warning/25'
					)}
					aria-pressed={filtersVm.bookmarkedOnly === true}
					onclick={() => navigate({ bookmarkedOnly: filtersVm.bookmarkedOnly ? undefined : true })}
				>
					<AbstractIcon
						name={icons.Bookmark.name}
						class={cn('size-3.5', filtersVm.bookmarkedOnly && 'fill-current')}
						width="14"
						height="14"
					/>
					Bookmarked
					{#if bookmarkCount > 0}
						<span class="ms-auto tabular-nums opacity-80">{bookmarkCount.toLocaleString()}</span>
					{/if}
				</button>
				{#if filtersVm.bookmarkedOnly}
					<button
						type="button"
						class="btn btn-sm shrink-0 rounded-none border-0 border-s border-warning/40 bg-transparent px-2.5 text-error shadow-none hover:bg-error/15"
						aria-label="Clear bookmarked filter"
						onclick={() => navigate({ bookmarkedOnly: undefined })}
					>
						<AbstractIcon name={icons.X2.name} class="size-3.5" width="14" height="14" />
					</button>
				{/if}
			</div>
		</div>

		<div class={sectionDivider}>
			<h3 class={sectionTitle}>Categories</h3>
			<ul class="mt-2 space-y-1">
				<li>
					{#if linkMode === 'inPlace'}
						<button
							type="button"
							class={cn(navLinkClass(!filtersVm.category), 'w-full text-left')}
							onclick={() => navigate({ category: undefined })}
						>
							All categories
						</button>
					{:else}
						<a
							href={route(getRootPathPublicBuildBacklinks())}
							class={navLinkClass(!filtersVm.category)}
						>
							All categories
						</a>
					{/if}
				</li>
				{#each categoriesVm as category (category.id)}
					<li>
						{#if linkMode === 'inPlace'}
							<button
								type="button"
								class={cn(
									navLinkClass(filtersVm.category === category.slug),
									'w-full text-left'
								)}
								onclick={() => navigate({ category: category.slug })}
							>
								{category.name}
							</button>
						{:else}
							<a
								href={route(getRootPathPublicBuildBacklinksCategory(category.slug))}
								class={navLinkClass(filtersVm.category === category.slug)}
							>
								{category.name}
							</a>
						{/if}
					</li>
				{/each}
			</ul>
		</div>

		<section class={sectionDivider} aria-labelledby="bb-filter-site-tags-heading">
		<h3 id="bb-filter-site-tags-heading" class={sectionTitle}>
			Site tag filter
		</h3>
		<p class="mt-1.5 text-xs leading-relaxed text-base-content/55">
			Editor labels on the whole platform. Filters which <span class="text-base-content/70">sites</span> appear
			in the list.
		</p>
		{#if editorialTagsVm.length > 0}
			<div class="mt-3 flex flex-wrap gap-1.5">
				{#each editorialTagsVm as tag (tag.id)}
					<button
						type="button"
						class={cn(
							'badge badge-sm cursor-pointer',
							filtersVm.tags?.includes(tag.slug) ? 'badge-primary' : 'badge-outline'
						)}
						onclick={() =>
							navigate({
								tags: filtersVm.tags?.includes(tag.slug) ? undefined : [tag.slug]
							})}
					>
						{tag.name}
					</button>
				{/each}
			</div>
		{:else}
			<p class="mt-3 text-xs text-base-content/45">No site tags in the catalog yet.</p>
		{/if}
		</section>

		<section class={cn(sectionDivider, 'space-y-4')} aria-labelledby="bb-filter-opportunity-heading">
		<div>
			<h3 id="bb-filter-opportunity-heading" class={sectionTitle}>
				Opportunity filters
			</h3>
			<p class="mt-1.5 text-xs leading-relaxed text-base-content/55">
				Cost, dofollow, effort, and approval apply to each link path. A
				<span class="text-base-content/70">site</span> shows if any published opportunity matches.
			</p>
		</div>

		<div>
			<h4 class="text-xs font-medium text-base-content/65">Cost</h4>
			<div class="mt-2 flex flex-wrap gap-1.5">
				{#each ['free', 'freemium', 'paid'] as tier (tier)}
					<button
						type="button"
						class={cn(
							'badge badge-sm cursor-pointer capitalize',
							isActive('costTiers', tier) ? 'badge-primary' : 'badge-outline'
						)}
						onclick={() => toggleArrayFilter('costTiers', tier)}
					>
						{tier}
					</button>
				{/each}
			</div>
		</div>

		<div>
			<h4 class="text-xs font-medium text-base-content/65">Dofollow</h4>
			<div class="mt-2 flex flex-wrap gap-1.5">
				{#each ['dofollow', 'nofollow', 'unknown'] as value (value)}
					<button
						type="button"
						class={cn(
							'badge badge-sm cursor-pointer capitalize',
							isActive('dofollow', value) ? 'badge-primary' : 'badge-outline'
						)}
						onclick={() => toggleArrayFilter('dofollow', value)}
					>
						{value}
					</button>
				{/each}
			</div>
		</div>

		<div>
			<h4 class="text-xs font-medium text-base-content/65">Effort</h4>
			<div class="mt-2 flex flex-wrap gap-1.5">
				{#each ['easy', 'medium', 'hard'] as value (value)}
					<button
						type="button"
						class={cn(
							'badge badge-sm cursor-pointer capitalize',
							isActive('effort', value) ? 'badge-primary' : 'badge-outline'
						)}
						onclick={() => toggleArrayFilter('effort', value)}
					>
						{value}
					</button>
				{/each}
			</div>
		</div>

		<div>
			<h4 class="text-xs font-medium text-base-content/65">Approval</h4>
			<div class="mt-2 flex flex-wrap gap-1.5">
				<button
					type="button"
					class={cn(
						'badge badge-sm cursor-pointer',
						isActive('approvalMode', 'instant') ? 'badge-primary' : 'badge-outline'
					)}
					onclick={() => toggleArrayFilter('approvalMode', 'instant')}
				>
					Instant
				</button>
				<button
					type="button"
					class={cn(
						'badge badge-sm cursor-pointer',
						isActive('approvalMode', 'manual_review') ? 'badge-primary' : 'badge-outline'
					)}
					onclick={() => toggleArrayFilter('approvalMode', 'manual_review')}
				>
					Manual review
				</button>
			</div>
		</div>
		</section>
	</div>
</aside>
