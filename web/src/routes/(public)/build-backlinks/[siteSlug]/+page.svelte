<script lang="ts">
	import { browser } from '$app/environment';

	import type { PageData } from './$types';

	import { prepareBlogRichTextForDisplay } from '$lib/blogs/utils';
	import { getPublicChannelBySlug } from '$lib/content/constants/channels';
	import { publicBuildBacklinksBookmarksPresenter } from '$lib/link-directory/index';
	import {
		formatMetricsUpdatedLabel,
		formatMonthlyVisitsLabel
	} from '$lib/link-directory/utils/formatLinkDirectoryMetrics';

	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import BuildBacklinksBookmarkButton from '$lib/ui/templates/build-backlinks/BuildBacklinksBookmarkButton.svelte';
	import BuildBacklinksOpportunityRow from '$lib/ui/templates/build-backlinks/BuildBacklinksOpportunityRow.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import PublicListingsHubBreadcrumb from '$lib/ui/templates/listings/PublicListingsHubBreadcrumb.svelte';
	import ExternalLink from '$lib/ui/links/ExternalLink.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let siteVm = $derived(data.siteVm);
	let schemaData = $derived(data.schemaData);
	let listingsBreadcrumb = $derived(data.listingsBreadcrumb);
	let isLoggedIn = $derived(data.isLoggedIn === true);

	const bookmarksPresenter = publicBuildBacklinksBookmarksPresenter;

	$effect(() => {
		if (!browser) return;
		void bookmarksPresenter.hydrate(isLoggedIn);
	});

	const visitsLabel = $derived(formatMonthlyVisitsLabel(siteVm.monthlyVisits));
	const metricsUpdated = $derived(formatMetricsUpdatedLabel(siteVm.metricsUpdatedAt));

	const longDescriptionHtml = $derived(
		siteVm.longDescription?.trim()
			? prepareBlogRichTextForDisplay(siteVm.longDescription)
			: ''
	);

	const sortedOpportunities = $derived(
		[...(siteVm.opportunities ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)
	);

	const openquokBanner = $derived.by(() => {
		const channelSlug = siteVm.openquokChannelSlug?.trim();
		if (!channelSlug) return null;
		const channelVm = getPublicChannelBySlug(channelSlug);
		const channelLabel = channelVm?.heroTitle?.split('\n')[0]?.trim() ?? channelSlug;
		return {
			title: `Publish on ${channelLabel} with OpenQuok`,
			description:
				'Connect the channel in your workspace, then schedule posts or use plugs on opportunities that support automation.',
			ctaText: 'Connect channels guide',
			ctaHref: '/docs/channels/connect'
		};
	});

	const isSiteBookmarked = $derived(bookmarksPresenter.isBookmarked(siteVm.slug));

	async function handleToggleBookmark(params: { siteId: string; siteSlug: string }) {
		return bookmarksPresenter.toggleBookmark({ ...params, title: siteVm.title });
	}
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-14">
	<div class="container mx-auto max-w-3xl px-4">
		<PublicListingsHubBreadcrumb
			kind={listingsBreadcrumb.kind}
			variant={listingsBreadcrumb.variant}
			siteLabel={listingsBreadcrumb.siteLabel ?? siteVm.title}
		/>

		<header class="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start">
			{#if siteVm.logoUrl}
				<img
					src={siteVm.logoUrl}
					alt=""
					width="72"
					height="72"
					class="size-[4.5rem] rounded-xl border border-base-300/60 bg-base-200 object-contain"
				/>
			{/if}
			<div class="min-w-0 flex-1 space-y-2">
				<h1 class="text-3xl font-black tracking-tight text-balance">{siteVm.title}</h1>
				<p>
					<ExternalLink href={siteVm.siteUrl} class="link link-hover font-medium">
						{siteVm.siteUrl}
					</ExternalLink>
				</p>
				<div class="flex flex-wrap items-center gap-2">
					<BuildBacklinksBookmarkButton
						siteId={siteVm.id}
						siteSlug={siteVm.slug}
						isBookmarked={isSiteBookmarked}
						{isLoggedIn}
						onToggle={handleToggleBookmark}
					/>
					{#if siteVm.domainRating != null}
						<span class="badge badge-neutral">DR {siteVm.domainRating}</span>
					{/if}
					{#if siteVm.domainAuthority != null}
						<span class="badge badge-ghost">DA {siteVm.domainAuthority}</span>
					{/if}
					{#if visitsLabel}
						<span class="badge badge-ghost">{visitsLabel}</span>
					{/if}
					{#if siteVm.category?.name}
						<span class="badge badge-outline">{siteVm.category.name}</span>
					{/if}
				</div>
				{#if metricsUpdated}
					<p class="text-xs text-base-content/55">
						Metrics are estimates from your provider. Last updated {metricsUpdated}.
					</p>
				{/if}
			</div>
		</header>

		{#if siteVm.shortDescription?.trim()}
			<p class="mt-6 text-base leading-relaxed text-base-content/80">{siteVm.shortDescription}</p>
		{/if}

		{#if longDescriptionHtml}
			<div class="prose prose-sm mt-6 max-w-none dark:prose-invert">
				{@html longDescriptionHtml}
			</div>
		{/if}

		<section class="mt-10 space-y-3" aria-labelledby="bb-opportunities-heading">
			<h2 id="bb-opportunities-heading" class="text-xl font-bold">Backlink playbook</h2>
			<p class="text-sm text-base-content/60">
				Follow these opportunities in order. Each block is one path on {siteVm.title}, with
				sub-steps and a CTA when OpenQuok can help.
			</p>
			<div class="space-y-4">
				{#each sortedOpportunities as opportunity, index (opportunity.id)}
					<BuildBacklinksOpportunityRow
						{opportunity}
						layout="expanded"
						playbookStep={index + 1}
						playbookTotal={sortedOpportunities.length}
					/>
				{/each}
			</div>
		</section>

		{#if openquokBanner}
			<div class="mt-12">
				<CenteredDarkCtaBanner
					title={openquokBanner.title}
					description={openquokBanner.description}
					ctaText={openquokBanner.ctaText}
					ctaHref={openquokBanner.ctaHref}
				/>
			</div>
		{/if}
	</div>
</SectionOuterContainer>
