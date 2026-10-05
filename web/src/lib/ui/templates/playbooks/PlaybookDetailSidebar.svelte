<script lang="ts">
	import type { StackDetailViewModel } from '$lib/listings/GetListing.presenter.svelte';

	import { browser } from '$app/environment';

	import { getRootPathPublicPlaybooksCategory } from '$lib/area-public/constants/getRootPathPublicPlaybooks';
	import { resolvePublicPlaybookPath } from '$lib/area-public/utils/resolvePublicListingPaths';
	import { buildPlaybookSidebarMetrics } from '$lib/listings/utils/buildCreatorListingDetailSidebarMetrics';
	import { resolveStackListingHeaderSummary } from '$lib/listings/utils/resolveStackListingHeaderSummary';
	import { copyToClipboard } from '$lib/utils/clipboard';
	import { route, url } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';
	import { icons } from '$data/icons';
	import { externalLinkRelForHref } from '$lib/utils/externalLinkRel';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import BuildingBlockBookmarkButton from '$lib/ui/components/building-blocks/BuildingBlockBookmarkButton.svelte';
	import ListingRating from '$lib/ui/components/listings/ListingRating.svelte';
	import PublicCreatorListingDetailSidebarShell from '$lib/ui/templates/listings/PublicCreatorListingDetailSidebarShell.svelte';

	type Props = {
		playbookVm: StackDetailViewModel;
		displayLikes: number;
		skillBuilderHref: string;
		onLike: () => void | Promise<void>;
		likeDisabled?: boolean;
		isBookmarked?: boolean;
		isLoggedIn?: boolean;
		onToggleBookmark?: (
			listingId: string,
			nextBookmarked: boolean
		) => Promise<{ ok: true; bookmarked: boolean } | { ok: false; error: string }>;
		communityEnabled?: boolean;
		submitRating?: (
			listingId: string,
			rating: number
		) => Promise<{ ok: true } | { ok: false; error: string }>;
		submittingRating?: boolean;
		onRatingSignInRequired?: () => void;
		onRatingUpgradeRequired?: () => void;
		class?: string;
	};

	let {
		playbookVm,
		displayLikes,
		skillBuilderHref,
		onLike,
		likeDisabled = false,
		isBookmarked = false,
		isLoggedIn = false,
		onToggleBookmark,
		communityEnabled = true,
		submitRating,
		submittingRating = false,
		onRatingSignInRequired,
		onRatingUpgradeRequired,
		class: className = ''
	}: Props = $props();

	const headerSummary = $derived(resolveStackListingHeaderSummary(playbookVm));

	const categoryHref = $derived(
		playbookVm.category?.slug?.trim()
			? url(route(getRootPathPublicPlaybooksCategory(playbookVm.category.slug.trim())))
			: null
	);

	const metricRows = $derived(buildPlaybookSidebarMetrics(playbookVm, displayLikes));

	async function handleShare() {
		const canonicalPath = resolvePublicPlaybookPath(playbookVm.owner, playbookVm.slug);
		const shareUrl = browser
			? window.location.href
			: canonicalPath
				? url(`/${canonicalPath}`)
				: url('/');
		if (browser && navigator.share) {
			try {
				await navigator.share({
					title: playbookVm.title,
					text: headerSummary ?? playbookVm.title,
					url: shareUrl
				});
				return;
			} catch {
				// fall through
			}
		}
		const ok = await copyToClipboard(shareUrl);
		if (ok) toast.success('Link copied to clipboard.');
		else toast.error('Could not copy link.');
	}
</script>

<PublicCreatorListingDetailSidebarShell
	class={className}
	ariaLabel="Playbook actions and stats"
	categoryName={playbookVm.category?.name}
	{categoryHref}
	{metricRows}
>
	{#snippet topRow()}
		{#if onToggleBookmark}
			<BuildingBlockBookmarkButton
				listingId={playbookVm.id}
				listingKind="stack"
				{isBookmarked}
				{isLoggedIn}
				onToggle={onToggleBookmark}
			/>
		{/if}
	{/snippet}

	{#snippet actions()}
		{#if submitRating}
			<ListingRating
				listingId={playbookVm.id}
				averageRating={playbookVm.averageRating}
				ratingsCount={playbookVm.ratingsCount}
				{isLoggedIn}
				{communityEnabled}
				{submitRating}
				submitting={submittingRating}
				onSignInRequired={onRatingSignInRequired}
				onUpgradeRequired={onRatingUpgradeRequired}
			/>
		{/if}

		<Button
			variant="outline"
			size="sm"
			class="btn-block justify-center gap-2"
			onclick={() => void onLike()}
			disabled={likeDisabled}
		>
			<AbstractIcon name={icons.Star.name} width="16" height="16" aria-hidden="true" />
			Like ({displayLikes})
		</Button>
		<Button
			variant="outline"
			size="sm"
			class="btn-block justify-center gap-2"
			onclick={() => void handleShare()}
		>
			<AbstractIcon name={icons.Share2.name} width="16" height="16" aria-hidden="true" />
			Share
		</Button>
		<Button href={skillBuilderHref} variant="primary" size="sm" class="btn-block">
			Customize this playbook
		</Button>
		{#if playbookVm.sourceRepoUrl}
			<Button
				href={playbookVm.sourceRepoUrl}
				variant="ghost"
				size="sm"
				class="btn-block"
				target="_blank"
				rel={externalLinkRelForHref(playbookVm.sourceRepoUrl)}
			>
				Source repo
			</Button>
		{/if}
	{/snippet}
</PublicCreatorListingDetailSidebarShell>
