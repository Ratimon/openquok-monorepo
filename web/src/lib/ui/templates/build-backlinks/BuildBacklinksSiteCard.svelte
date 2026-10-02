<script lang="ts">
	import type {
		BuildBacklinksHubFilters,
		LinkDirectorySiteDto,
		LinkDirectoryTagDto
	} from '$lib/link-directory/index';
	import type { BuildBacklinksFacetClick } from '$lib/link-directory/utils/buildBacklinksFacetActions';
	import { buildBacklinksSiteElementId } from '$lib/link-directory/utils/buildBacklinksSiteElementId';

	import { icons } from '$data/icons';

	import { getRootPathPublicBuildBacklinksSite } from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
	import { isBuildBacklinksEditorialTagSlug } from '$lib/link-directory/constants/buildBacklinksTagTaxonomy';
	import {
		formatMetricsUpdatedLabel,
		formatMonthlyVisitsLabel
	} from '$lib/link-directory/utils/formatLinkDirectoryMetrics';
	import { route, url } from '$lib/utils/path';

	import { cn } from '$lib/ui/helpers/common';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ExternalLink from '$lib/ui/links/ExternalLink.svelte';
	import InternalLink from '$lib/ui/links/InternalLink.svelte';
	import BuildBacklinksBookmarkButton from '$lib/ui/templates/build-backlinks/BuildBacklinksBookmarkButton.svelte';
	import BuildBacklinksOpportunityCard from '$lib/ui/templates/build-backlinks/BuildBacklinksOpportunityCard.svelte';
	import { buildBacklinksFilterBadgeClass } from '$lib/ui/templates/build-backlinks/buildBacklinksFilterBadgeClass';
	import * as Collapsible from '$lib/ui/collapsible/index.js';

	type BookmarkToggleParams = { siteId: string; siteSlug: string; title?: string };
	type BookmarkToggleResult =
		| { ok: true; bookmarked: boolean }
		| { ok: false; error: string };

	type Props = {
		site: LinkDirectorySiteDto;
		tagsCatalog: LinkDirectoryTagDto[];
		filtersVm: BuildBacklinksHubFilters;
		isBookmarked?: boolean;
		onToggleBookmark?: (params: BookmarkToggleParams) => Promise<BookmarkToggleResult>;
		onFacetClick?: (facet: BuildBacklinksFacetClick) => void;
		opportunitiesOpen?: boolean;
		onOpportunitiesOpenChange?: (open: boolean) => void;
		class?: string;
	};

	let {
		site,
		tagsCatalog,
		filtersVm,
		isBookmarked = false,
		onToggleBookmark,
		onFacetClick,
		opportunitiesOpen = false,
		onOpportunitiesOpenChange,
		class: className = ''
	}: Props = $props();

	const detailHref = $derived(url(route(getRootPathPublicBuildBacklinksSite(site.slug))));
	const siteElementId = $derived(buildBacklinksSiteElementId(site.slug));
	const visitsLabel = $derived(formatMonthlyVisitsLabel(site.monthlyVisits));
	const metricsUpdated = $derived(formatMetricsUpdatedLabel(site.metricsUpdatedAt));

	const editorialTags = $derived.by(() => {
		const bySlug = new Map(tagsCatalog.map((tag) => [tag.slug, tag.name]));
		return (site.tagSlugs ?? [])
			.filter((slug) => isBuildBacklinksEditorialTagSlug(slug))
			.map((slug) => ({ slug, label: bySlug.get(slug) ?? slug }));
	});

	const opportunityCostTiers = $derived(
		[...new Set((site.opportunities ?? []).map((opportunity) => opportunity.costTier))].sort()
	);
	const opportunityDofollow = $derived(
		[...new Set((site.opportunities ?? []).map((opportunity) => opportunity.dofollow))].sort()
	);

	function isCostActive(tier: string): boolean {
		return (filtersVm.costTiers ?? []).includes(tier as never);
	}

	function isDofollowActive(value: string): boolean {
		return (filtersVm.dofollow ?? []).includes(value as never);
	}

	function isCategoryActive(slug: string): boolean {
		return filtersVm.category === slug;
	}

	function isSiteTagActive(slug: string): boolean {
		return filtersVm.tags?.includes(slug) ?? false;
	}

	const sortedOpportunities = $derived(
		[...(site.opportunities ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)
	);

	const opportunityCountLabel = $derived(
		`${sortedOpportunities.length} backlink opportunit${sortedOpportunities.length === 1 ? 'y' : 'ies'}`
	);
</script>

<article
	id={siteElementId}
	class={cn(
		'scroll-mt-28 rounded-xl border border-base-300/80 bg-base-100 shadow-sm transition-shadow hover:shadow-md',
		className
	)}
>
	<div class="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5">
		{#if site.logoUrl}
			<img
				src={site.logoUrl}
				alt=""
				width="56"
				height="56"
				class="size-14 shrink-0 rounded-lg border border-base-300/60 bg-base-200 object-contain"
				loading="lazy"
				decoding="async"
			/>
		{:else}
			<div
				class="flex size-14 shrink-0 items-center justify-center rounded-lg border border-base-300/60 bg-base-200 text-base-content/40"
				aria-hidden="true"
			>
				<AbstractIcon name={icons.Link.name} width="24" height="24" />
			</div>
		{/if}

		<div class="min-w-0 flex-1 space-y-2">
			<div class="flex flex-wrap items-start justify-between gap-2">
				<div class="min-w-0">
					<h2 class="text-lg font-bold tracking-tight text-base-content">
						<InternalLink href={detailHref} class="hover:underline">
							{site.title}
						</InternalLink>
					</h2>
					<p class="text-sm text-base-content/60">
						<ExternalLink href={site.siteUrl} class="link link-hover text-sm">
							{site.siteUrl.replace(/^https?:\/\//, '')}
						</ExternalLink>
					</p>
				</div>
				<div class="flex flex-wrap items-center gap-2">
					{#if onToggleBookmark}
						<BuildBacklinksBookmarkButton
							siteId={site.id}
							siteSlug={site.slug}
							{isBookmarked}
							onToggle={async (params) =>
								onToggleBookmark({ ...params, title: site.title })}
						/>
					{/if}
					{#if site.domainRating != null}
						<span class="badge badge-neutral font-semibold">DR {site.domainRating}</span>
					{/if}
					{#if visitsLabel}
						<button
							type="button"
							class={buildBacklinksFilterBadgeClass(filtersVm.sort === 'visits_desc')}
							title="Sort by monthly traffic"
							onclick={() => onFacetClick?.({ kind: 'sortTrafficDesc' })}
						>
							{visitsLabel}
						</button>
					{/if}
					<InternalLink
						href={detailHref}
						class="btn btn-primary btn-sm rounded-full bg-gradient-to-r from-primary via-primary/90 to-primary/70 px-3 text-primary-content hover:from-primary/90 hover:via-primary/70 hover:to-primary/70"
					>
						View site guide
					</InternalLink>
				</div>
			</div>

			<div class="flex flex-wrap gap-1.5">
				{#if site.category?.slug}
					<button
						type="button"
						class={buildBacklinksFilterBadgeClass(isCategoryActive(site.category.slug))}
						onclick={() => onFacetClick?.({ kind: 'category', slug: site.category!.slug })}
					>
						{site.category.name}
					</button>
				{/if}
				{#each editorialTags as tag (tag.slug)}
					<button
						type="button"
						class={buildBacklinksFilterBadgeClass(isSiteTagActive(tag.slug))}
						onclick={() => onFacetClick?.({ kind: 'siteTag', slug: tag.slug })}
					>
						{tag.label}
					</button>
				{/each}
				{#each opportunityDofollow as value (value)}
					<button
						type="button"
						class={buildBacklinksFilterBadgeClass(isDofollowActive(value))}
						onclick={() => onFacetClick?.({ kind: 'dofollow', value })}
					>
						{value}
					</button>
				{/each}
				{#each opportunityCostTiers as tier (tier)}
					<button
						type="button"
						class={buildBacklinksFilterBadgeClass(isCostActive(tier))}
						onclick={() => onFacetClick?.({ kind: 'costTier', value: tier })}
					>
						{tier}
					</button>
				{/each}
			</div>

			{#if site.shortDescription?.trim()}
				<p class="text-sm leading-relaxed text-base-content/75">{site.shortDescription}</p>
			{/if}

			{#if metricsUpdated}
				<p class="text-xs text-base-content/50">Updated {metricsUpdated}</p>
			{/if}
		</div>
	</div>

	{#if sortedOpportunities.length > 0}
		<Collapsible.Root
			class="border-t border-base-300/60"
			open={opportunitiesOpen}
			onOpenChange={(open) => onOpportunitiesOpenChange?.(open)}
		>
			<div class="px-4 py-3 sm:px-5">
				<Collapsible.Trigger
					class="flex w-full items-center justify-between gap-2 text-left text-sm font-semibold text-base-content transition-colors hover:text-primary"
				>
					<span>{opportunityCountLabel}</span>
					<AbstractIcon
						name={icons.ChevronDown.name}
						class={cn(
							'size-4 shrink-0 text-base-content/55 transition-transform',
							opportunitiesOpen && 'rotate-180'
						)}
						width="16"
						height="16"
						aria-hidden="true"
					/>
				</Collapsible.Trigger>
			</div>
			<Collapsible.Content class="px-4 pb-5 pt-0 sm:px-5">
				<div class="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory" role="list">
					{#each sortedOpportunities as opportunity (opportunity.id)}
						<BuildBacklinksOpportunityCard
							{opportunity}
							siteSlug={site.slug}
							{filtersVm}
							{onFacetClick}
						/>
					{/each}
				</div>
			</Collapsible.Content>
		</Collapsible.Root>
	{/if}
</article>
