<script lang="ts">
	import type { BuildBacklinksHubFilters, LinkDirectoryOpportunityDto } from '$lib/link-directory/index';
	import type { BuildBacklinksFacetClick } from '$lib/link-directory/utils/buildBacklinksFacetActions';

	import { page } from '$app/state';

	import { resolveOpportunityCta } from '$lib/link-directory/utils/resolveOpportunityCtaHref';
	import { hostedMarketingAnchorAttrs } from '$lib/utils/hostedMarketingHref';
	import { prepareLinkDirectoryRichTextForDisplay } from '$lib/link-directory/utils/linkDirectoryRichText';

	import ExternalLink from '$lib/ui/links/ExternalLink.svelte';
	import InternalLink from '$lib/ui/links/InternalLink.svelte';

	import * as Collapsible from '$lib/ui/collapsible/index.js';
	import { buildBacklinksFilterBadgeClass } from '$lib/ui/templates/build-backlinks/buildBacklinksFilterBadgeClass';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		opportunity: LinkDirectoryOpportunityDto;
		filtersVm?: BuildBacklinksHubFilters;
		onFacetClick?: (facet: BuildBacklinksFacetClick) => void;
		defaultOpen?: boolean;
		/** Site guide pages show steps inline; hub detail rows stay collapsible. */
		layout?: 'collapsible' | 'expanded';
		playbookStep?: number;
		playbookTotal?: number;
		class?: string;
	};

	let {
		opportunity,
		filtersVm,
		onFacetClick,
		defaultOpen = false,
		layout = 'collapsible',
		playbookStep,
		playbookTotal,
		class: className = ''
	}: Props = $props();

	const cta = $derived(
		resolveOpportunityCta({
			kind: opportunity.openquokCtaKind,
			channelSlug: opportunity.openquokChannelSlug,
			ctaHref: opportunity.ctaHref,
			ctaLabel: opportunity.ctaLabel
		})
	);

	const marketingCta = $derived(
		cta && !cta.external ? hostedMarketingAnchorAttrs(cta.href, page.url.origin) : null
	);

	const sortedSteps = $derived(
		[...(opportunity.steps ?? [])].sort((a, b) => a.order - b.order)
	);

	const isExpanded = $derived(layout === 'expanded');

	const descriptionHtml = $derived(
		opportunity.description?.trim()
			? prepareLinkDirectoryRichTextForDisplay(opportunity.description)
			: ''
	);

	function stepBodyHtml(body: string): string {
		return body.trim() ? prepareLinkDirectoryRichTextForDisplay(body) : '';
	}
</script>

{#snippet badges()}
	<div class="mt-2 flex flex-wrap gap-1.5">
		{#if opportunity.opportunityType?.slug}
			{#if onFacetClick}
				<button
					type="button"
					class={buildBacklinksFilterBadgeClass(
						(filtersVm?.opportunityTypeSlugs ?? []).includes(opportunity.opportunityType.slug)
					)}
					onclick={() =>
						onFacetClick({
							kind: 'opportunityType',
							slug: opportunity.opportunityType!.slug
						})}
				>
					{opportunity.opportunityType.label}
				</button>
			{:else}
				<span class="badge badge-sm badge-ghost">{opportunity.opportunityType.label}</span>
			{/if}
		{/if}
		{#if onFacetClick}
			<button
				type="button"
				class={buildBacklinksFilterBadgeClass(
					(filtersVm?.effort ?? []).includes(opportunity.effort)
				)}
				onclick={() => onFacetClick({ kind: 'effort', value: opportunity.effort })}
			>
				{opportunity.effort}
			</button>
			<button
				type="button"
				class={buildBacklinksFilterBadgeClass(
					(filtersVm?.approvalMode ?? []).includes(opportunity.approvalMode)
				)}
				onclick={() => onFacetClick({ kind: 'approvalMode', value: opportunity.approvalMode })}
			>
				{opportunity.approvalMode === 'instant' ? 'Instant' : 'Manual review'}
			</button>
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
		{:else}
			<span class="badge badge-sm badge-ghost capitalize">{opportunity.effort}</span>
			<span class="badge badge-sm badge-ghost capitalize">
				{opportunity.approvalMode === 'instant' ? 'Instant' : 'Manual review'}
			</span>
			<span class="badge badge-sm badge-ghost capitalize">{opportunity.dofollow}</span>
			<span class="badge badge-sm badge-ghost capitalize">{opportunity.costTier}</span>
		{/if}
	</div>
{/snippet}

{#snippet body()}
	<div class="text-sm text-base-content/80">
		{#if descriptionHtml}
			<div class="prose prose-sm max-w-none leading-relaxed dark:prose-invert">
				{@html descriptionHtml}
			</div>
		{/if}
		{#if opportunity.approvalTimeHint?.trim()}
			<p class="mt-2 text-xs text-base-content/60">Approval: {opportunity.approvalTimeHint}</p>
		{/if}
		{#if opportunity.costNote?.trim()}
			<p class="mt-1 text-xs text-base-content/60">{opportunity.costNote}</p>
		{/if}

		{#if sortedSteps.length > 0}
			<ol class="mt-3 list-decimal space-y-2 ps-5">
				{#each sortedSteps as step (step.order)}
					<li id={isExpanded ? opportunity.slug : undefined}>
						<span class="font-medium text-base-content">{step.title}</span>
						<div class="prose prose-sm max-w-none text-base-content/75 dark:prose-invert">
							{@html stepBodyHtml(step.body)}
						</div>
					</li>
				{/each}
			</ol>
		{/if}

		{#if cta}
			<div class="mt-4">
				{#if cta.external}
					<ExternalLink href={cta.href} class="link link-primary font-semibold">
						{cta.label}
					</ExternalLink>
				{:else if marketingCta}
					<a
						href={marketingCta.href}
						target={marketingCta.target}
						rel={marketingCta.rel}
						class="link link-primary font-semibold"
					>
						{cta.label}
					</a>
				{:else}
					<InternalLink href={cta.href} class="link link-primary font-semibold">
						{cta.label}
					</InternalLink>
				{/if}
			</div>
		{/if}
	</div>
{/snippet}

{#if isExpanded}
	<article
		id={opportunity.slug}
		class={cn('scroll-mt-28 rounded-lg border border-base-300/80 bg-base-100', className)}
	>
		<div class="px-4 py-3">
			{#if playbookStep != null && playbookTotal != null && playbookTotal > 1}
				<p class="text-xs font-semibold uppercase tracking-wide text-primary">
					Step {playbookStep} of {playbookTotal}
				</p>
			{/if}
			<h3 class="font-semibold text-base-content">{opportunity.title}</h3>
			{@render badges()}
		</div>
		<div class="border-t border-base-300/60 px-4 py-3">
			{@render body()}
		</div>
	</article>
{:else}
	<Collapsible.Root
		class={cn('rounded-lg border border-base-300/80 bg-base-100', className)}
		open={defaultOpen}
	>
		<div class="px-4 py-3">
			<Collapsible.Trigger
				class="flex w-full text-left font-semibold text-base-content transition-colors hover:text-primary"
			>
				{opportunity.title}
			</Collapsible.Trigger>
			{@render badges()}
		</div>
		<Collapsible.Content class="border-t border-base-300/60 px-4 py-3">
			{@render body()}
		</Collapsible.Content>
	</Collapsible.Root>
{/if}
