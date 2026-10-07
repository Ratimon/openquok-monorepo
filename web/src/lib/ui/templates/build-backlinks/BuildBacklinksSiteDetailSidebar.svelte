<script lang="ts">
	import type { LinkDirectorySiteDto } from '$lib/link-directory/link-directory.types';

	import { icons } from '$data/icons';

	import { getRootPathPublicBuildBacklinksCategory } from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
	import { route, url } from '$lib/utils/path';
	import {
		formatMetricsUpdatedLabel,
		formatMonthlyVisitsLabel
	} from '$lib/link-directory/utils/formatLinkDirectoryMetrics';
	import { formatOpportunityIndexTitle } from '$lib/link-directory/utils/formatBuildBacklinksGuideDisplayTitle';
	import { buildBuildBacklinksSiteDetailSidebarMetrics } from '$lib/link-directory/utils/buildBuildBacklinksSiteDetailSidebarMetrics';
	import {
		buildBacklinksSiteEffortSidebarMetricLabel,
		formatBuildBacklinksSiteEffortSidebarValue
	} from '$lib/link-directory/utils/formatBuildBacklinksSiteEffortSummary';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import SubjectRating from '$lib/ui/components/community/SubjectRating.svelte';
	import BuildBacklinksBookmarkButton from '$lib/ui/templates/build-backlinks/BuildBacklinksBookmarkButton.svelte';
	import ExternalLink from '$lib/ui/links/ExternalLink.svelte';
	import InternalLink from '$lib/ui/links/InternalLink.svelte';
	import ScrollLink from '$lib/ui/nav-bars/ScrollLink.svelte';

	type MetricRow = { label: string; value: string };
	type OpportunityJumpLink = { anchorId: string; href: string; eyebrow: string; title: string };
	type ToggleBookmarkResult =
		| { ok: true; bookmarked: boolean }
		| { ok: false; error: string };

	type Props = {
		site: LinkDirectorySiteDto;
		displayLikes: number;
		isLoggedIn?: boolean;
		isBookmarked?: boolean;
		onToggleBookmark?: (params: {
			siteId: string;
			siteSlug: string;
		}) => Promise<ToggleBookmarkResult>;
		communityEnabled?: boolean;
		submitRating?: (
			siteId: string,
			rating: number
		) => Promise<{ ok: true } | { ok: false; error: string }>;
		submittingRating?: boolean;
		onRatingSignInRequired?: () => void;
		onRatingUpgradeRequired?: () => void;
		class?: string;
	};

	let {
		site,
		displayLikes,
		isLoggedIn = false,
		isBookmarked = false,
		onToggleBookmark,
		communityEnabled = true,
		submitRating,
		submittingRating = false,
		onRatingSignInRequired,
		onRatingUpgradeRequired,
		class: className = ''
	}: Props = $props();

	const categoryHref = $derived(
		site.category?.slug?.trim()
			? url(route(getRootPathPublicBuildBacklinksCategory(site.category.slug.trim())))
			: null
	);

	const visitsLabel = $derived(formatMonthlyVisitsLabel(site.monthlyVisits));
	const metricsUpdated = $derived(formatMetricsUpdatedLabel(site.metricsUpdatedAt));

	const publishedOpportunityCount = $derived(
		(site.opportunities ?? []).filter((opportunity) => opportunity.isAdminPublished).length
	);

	const effortSidebarValue = $derived(formatBuildBacklinksSiteEffortSidebarValue(site.opportunities));
	const effortSidebarLabel = $derived(buildBacklinksSiteEffortSidebarMetricLabel(site.opportunities));

	const communityMetricRows = $derived(
		buildBuildBacklinksSiteDetailSidebarMetrics(site, displayLikes)
	);

	const metricRows = $derived.by((): MetricRow[] => {
		const rows: MetricRow[] = [];
		if (site.domainRating != null) {
			rows.push({ label: 'Domain rating', value: String(site.domainRating) });
		}
		if (site.domainAuthority != null) {
			rows.push({ label: 'Domain authority', value: String(site.domainAuthority) });
		}
		if (visitsLabel) {
			rows.push({ label: 'Monthly traffic', value: visitsLabel });
		}
		if (effortSidebarValue) {
			rows.push({ label: effortSidebarLabel, value: effortSidebarValue });
		}
		if (publishedOpportunityCount > 0) {
			rows.push({
				label: 'Backlink opportunities',
				value: publishedOpportunityCount.toLocaleString()
			});
		}
		return rows;
	});

	const siteHostname = $derived(
		site.siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
	);

	const opportunityJumpLinks = $derived.by((): OpportunityJumpLink[] => {
		const published = (site.opportunities ?? [])
			.filter((opportunity) => opportunity.isAdminPublished)
			.filter((opportunity) => opportunity.title.trim().length > 0)
			.sort((a, b) => a.sortOrder - b.sortOrder);

		return published.map((opportunity, index) => {
			const anchorId = `howto-${opportunity.slug}`;
			return {
				anchorId,
				href: `#${anchorId}`,
				eyebrow: formatOpportunityIndexTitle(index + 1),
				title: opportunity.title.trim()
			};
		});
	});
</script>

<aside class={className} aria-label="Site metrics and link">
	<div
		class="space-y-5 rounded-xl border border-primary/25 bg-primary/5 p-4 shadow-sm shadow-primary/5 sm:p-5"
	>
		{#if onToggleBookmark || site.category?.name}
			<div class="flex flex-wrap items-center gap-2">
				{#if onToggleBookmark}
					<BuildBacklinksBookmarkButton
						siteId={site.id}
						siteSlug={site.slug}
						{isBookmarked}
						{isLoggedIn}
						onToggle={onToggleBookmark}
					/>
				{/if}
				{#if site.category?.name}
					{#if categoryHref}
						<InternalLink
							href={categoryHref}
							class="badge badge-outline no-underline hover:border-primary hover:bg-base-content/5"
						>
							{site.category.name}
						</InternalLink>
					{:else}
						<span class="badge badge-outline">{site.category.name}</span>
					{/if}
				{/if}
			</div>
		{/if}

		{#if metricRows.length > 0}
			<div>
				<h2 class="text-xs font-semibold tracking-wide text-primary/90 uppercase">SEO metrics</h2>
				<dl class="mt-3 space-y-3">
					{#each metricRows as row (row.label)}
						<div class="flex items-baseline justify-between gap-3">
							<dt class="text-sm text-base-content/65">{row.label}</dt>
							<dd class="text-sm font-semibold text-base-content tabular-nums">{row.value}</dd>
						</div>
					{/each}
				</dl>
			</div>
		{/if}

		{#if metricsUpdated}
			<p class="text-xs leading-relaxed text-base-content/50">
				Metrics are estimates from your provider. Last updated {metricsUpdated}.
			</p>
		{/if}

		<div>
			<h2 class="text-xs font-semibold tracking-wide text-primary/90 uppercase">Community</h2>
			<dl class="mt-3 space-y-3">
				{#each communityMetricRows as row (row.label)}
					<div class="flex items-baseline justify-between gap-3">
						<dt class="text-sm text-base-content/65">{row.label}</dt>
						<dd class="text-sm font-semibold text-base-content tabular-nums">{row.value}</dd>
					</div>
				{/each}
			</dl>
			{#if submitRating}
				<div class="mt-4 border-t border-base-content/10 pt-4">
					<SubjectRating
						subjectId={site.id}
						averageRating={site.averageRating}
						ratingsCount={site.ratingsCount}
						{isLoggedIn}
						communityEnabled={communityEnabled}
						{submitRating}
						submitting={submittingRating}
						onSignInRequired={onRatingSignInRequired}
						onUpgradeRequired={onRatingUpgradeRequired}
					/>
				</div>
			{/if}
		</div>

		{#if opportunityJumpLinks.length > 0}
			<nav aria-label="Jump to backlink opportunities">
				<h2 class="text-xs font-semibold tracking-wide text-primary/90 uppercase">
					On this guide
				</h2>
				<ul class="mt-3 space-y-2">
					{#each opportunityJumpLinks as link (link.anchorId)}
						<li>
							<ScrollLink
								href={link.href}
								class="btn btn-outline btn-block h-auto min-h-11 flex-col items-start gap-0.5 rounded-xl border-base-content/15 bg-base-100/80 px-3 py-2.5 text-left font-normal hover:border-primary/35 hover:bg-base-100"
							>
								<span class="text-[0.65rem] font-semibold tracking-wide text-primary uppercase">
									{link.eyebrow}
								</span>
								<span class="line-clamp-2 text-sm font-semibold text-base-content">
									{link.title}
								</span>
							</ScrollLink>
						</li>
					{/each}
				</ul>
			</nav>
		{/if}

		<p class="truncate text-center text-sm font-medium text-base-content/70" title={site.siteUrl}>
			{siteHostname}
		</p>

		<ExternalLink
			href={site.siteUrl}
			class="btn btn-primary btn-block gap-2 rounded-xl font-semibold"
			ariaLabel={`Go to ${site.title} (${siteHostname})`}
		>
			Go to site
			<AbstractIcon name={icons.ArrowRight.name} class="size-4" width="16" height="16" />
		</ExternalLink>
	</div>
</aside>
