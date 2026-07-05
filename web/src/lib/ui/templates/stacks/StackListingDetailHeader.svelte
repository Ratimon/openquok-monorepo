<script lang="ts">
	import type { StackDetailViewModel } from '$lib/listings/GetListing.presenter.svelte';

	import { browser } from '$app/environment';

	import { resolvePublicPlaybookPath } from '$lib/area-public/utils/resolvePublicListingPaths';
	import { copyToClipboard } from '$lib/utils/clipboard';
	import { parseGithubRepoFromUrl } from '$lib/utils/github';
	import { url } from '$lib/utils/path';

	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { toast } from '$lib/ui/sonner';

	import {
		resolveStackListingHeaderSummary,
		resolveStackLicense,
		resolveStackVersion,
	} from '$lib/listings/utils/resolveStackListingHeaderSummary';
	import ExtensionBookmarkButton from '$lib/ui/components/extensions/ExtensionBookmarkButton.svelte';
	import ListingCreatorAttribution from '$lib/ui/templates/extensions/ListingCreatorAttribution.svelte';
	import ListingRating from '$lib/ui/components/extensions/ListingRating.svelte';
	import ListingDetailTagBadges from '$lib/ui/components/extensions/ListingDetailTagBadges.svelte';
	import ListingDetailTypeBadges from '$lib/ui/components/extensions/ListingDetailTypeBadges.svelte';
	import Stargazers from '$lib/ui/icons/Stargazers.svelte';

	type Props = {
		stackVm: StackDetailViewModel;
		displayLikes: number;
		skillBuilderHref: string;
		onLike: () => void | Promise<void>;
		likeDisabled?: boolean;
		isBookmarked?: boolean;
		isLoggedIn?: boolean;
		bookmarksPaidEnabled?: boolean | null;
		upgradeHref?: string;
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
	};

	let {
		stackVm,
		displayLikes,
		skillBuilderHref,
		onLike,
		likeDisabled = false,
		isBookmarked = false,
		isLoggedIn = false,
		bookmarksPaidEnabled = null,
		upgradeHref,
		onToggleBookmark,
		communityEnabled = true,
		submitRating,
		submittingRating = false,
		onRatingSignInRequired,
		onRatingUpgradeRequired
	}: Props = $props();

	const headerSummary = $derived(resolveStackListingHeaderSummary(stackVm));
	const displayVersion = $derived(resolveStackVersion(stackVm));
	const displayLicense = $derived(resolveStackLicense(stackVm));
	const githubRepo = $derived(parseGithubRepoFromUrl(stackVm.sourceRepoUrl));

	async function handleShare() {
		const canonicalPath = resolvePublicPlaybookPath(stackVm.owner, stackVm.slug);
		const shareUrl = browser
			? window.location.href
			: canonicalPath
				? url(`/${canonicalPath}`)
				: url('/');
		if (browser && navigator.share) {
			try {
				await navigator.share({
					title: stackVm.title,
					text: headerSummary ?? stackVm.title,
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

<header class="space-y-6 border-b border-base-content/10 pb-8">
	<div class="flex flex-wrap items-center gap-2">
		{#if stackVm.category}
			<span class="badge badge-outline">
				{stackVm.category.name}
			</span>
		{/if}
		<ListingDetailTypeBadges listingKind="stack" />
		{#if githubRepo}
			<Stargazers owner={githubRepo.owner} name={githubRepo.name} />
		{/if}
	</div>

	<div class="space-y-3">
		<div class="flex flex-wrap items-center gap-3">
			<h1 class="text-3xl font-black tracking-tight text-base-content sm:text-4xl">{stackVm.title}</h1>
			{#if onToggleBookmark}
				<ExtensionBookmarkButton
					listingId={stackVm.id}
					listingKind="stack"
					{isBookmarked}
					{isLoggedIn}
					{bookmarksPaidEnabled}
					{upgradeHref}
					onToggle={onToggleBookmark}
				/>
			{/if}
		</div>
		{#if stackVm.slug}
			<p class="font-mono text-sm text-base-content/60">{stackVm.slug}</p>
		{/if}
		{#if headerSummary}
			<p class="text-lg text-base-content/75">{headerSummary}</p>
		{/if}
		<div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-base-content/60">
			<ListingCreatorAttribution owner={stackVm.owner} />
			{#if displayVersion}
				<span>v{displayVersion}</span>
			{/if}
			{#if displayLicense}
				<span>{displayLicense}</span>
			{/if}
		</div>
	</div>

	{#if submitRating}
		<ListingRating
			listingId={stackVm.id}
			averageRating={stackVm.averageRating}
			ratingsCount={stackVm.ratingsCount}
			{isLoggedIn}
			{communityEnabled}
			{submitRating}
			submitting={submittingRating}
			onSignInRequired={onRatingSignInRequired}
			onUpgradeRequired={onRatingUpgradeRequired}
		/>
	{/if}

	<div class="flex flex-wrap gap-2">
		<Button variant="outline" size="sm" onclick={() => void onLike()} disabled={likeDisabled}>
			<AbstractIcon name={icons.Star.name} width="16" height="16" aria-hidden="true" />
			Like ({displayLikes})
		</Button>
		<Button variant="outline" size="sm" onclick={() => void handleShare()}>
			<AbstractIcon name={icons.Share2.name} width="16" height="16" aria-hidden="true" />
			Share
		</Button>
		<Button href={skillBuilderHref} variant="primary" size="sm">Customize this playbook</Button>
		{#if stackVm.sourceRepoUrl}
			<Button href={stackVm.sourceRepoUrl} variant="ghost" size="sm" target="_blank" rel="noopener noreferrer nofollow">
				Source repo
			</Button>
		{/if}
	</div>

	<ListingDetailTagBadges tags={stackVm.tags} />
</header>
