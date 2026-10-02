<script lang="ts">
	import type { BuildBacklinksHubFilters, LinkDirectoryOpportunityDto } from '$lib/link-directory/index';
	import type { BuildBacklinksFacetClick } from '$lib/link-directory/utils/buildBacklinksFacetActions';

	import { icons } from '$data/icons';

	import { getRootPathPublicBuildBacklinksSite } from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
	import { route, url } from '$lib/utils/path';

	import { cn } from '$lib/ui/helpers/common';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import InternalLink from '$lib/ui/links/InternalLink.svelte';
	import { buildBacklinksFilterBadgeClass } from '$lib/ui/templates/build-backlinks/buildBacklinksFilterBadgeClass';

	type Props = {
		opportunity: LinkDirectoryOpportunityDto;
		siteSlug: string;
		filtersVm?: BuildBacklinksHubFilters;
		onFacetClick?: (facet: BuildBacklinksFacetClick) => void;
		class?: string;
	};

	let { opportunity, siteSlug, filtersVm, onFacetClick, class: className = '' }: Props = $props();

	const detailHref = $derived(
		url(route(`${getRootPathPublicBuildBacklinksSite(siteSlug)}#${opportunity.slug}`))
	);

	const typeLabel = $derived(
		opportunity.opportunityType?.label ?? 'Opportunity'
	);
</script>

<article
	class={cn(
		'flex h-full w-[13.5rem] shrink-0 snap-start flex-col rounded-xl border border-base-300/80 bg-base-100 p-3 shadow-sm transition-shadow hover:shadow-md sm:w-[14.5rem]',
		className
	)}
>
	<div class="flex items-start justify-between gap-2">
		<h3 class="text-sm font-bold leading-snug text-base-content">{opportunity.title}</h3>
		<InternalLink
			href={detailHref}
			class="shrink-0 text-base-content/45 transition-colors hover:text-primary"
			aria-label="Open opportunity on site page"
		>
			<AbstractIcon
				name={icons.ArrowRight.name}
				class="size-4 -rotate-45"
				width="16"
				height="16"
				aria-hidden="true"
			/>
		</InternalLink>
	</div>

	<p class="mt-1 text-xs font-medium uppercase tracking-wide text-base-content/55">{typeLabel}</p>

	{#if opportunity.description?.trim()}
		<p class="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-base-content/70">
			{opportunity.description}
		</p>
	{/if}

	<div class="mt-3 flex flex-wrap gap-1">
		{#if onFacetClick}
			<button
				type="button"
				class={buildBacklinksFilterBadgeClass(
					(filtersVm?.dofollow ?? []).includes(opportunity.dofollow)
				)}
				onclick={() => onFacetClick({ kind: 'dofollow', value: opportunity.dofollow })}
			>
				{opportunity.dofollow}
			</button>
			<button
				type="button"
				class={buildBacklinksFilterBadgeClass(
					(filtersVm?.costTiers ?? []).includes(opportunity.costTier)
				)}
				onclick={() => onFacetClick({ kind: 'costTier', value: opportunity.costTier })}
			>
				{opportunity.costTier}
			</button>
			<button
				type="button"
				class={buildBacklinksFilterBadgeClass(
					(filtersVm?.effort ?? []).includes(opportunity.effort)
				)}
				onclick={() => onFacetClick({ kind: 'effort', value: opportunity.effort })}
			>
				{opportunity.effort}
			</button>
		{:else}
			<span class="badge badge-xs badge-ghost capitalize">{opportunity.dofollow}</span>
			<span class="badge badge-xs badge-ghost capitalize">{opportunity.costTier}</span>
			<span class="badge badge-xs badge-ghost capitalize">{opportunity.effort}</span>
		{/if}
	</div>
</article>
