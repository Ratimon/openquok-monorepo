<script lang="ts">
	import type { ExtensionDetailViewModel } from '$lib/listings/index';

	import { browser } from '$app/environment';

	import { getRootPathPublicBuildingBlocksCategory } from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
	import { resolvePublicBuildingBlockPath } from '$lib/area-public/utils/resolvePublicListingPaths';
	import { buildExtensionSidebarMetrics } from '$lib/listings/utils/buildCreatorListingDetailSidebarMetrics';
	import { resolveListingHeaderSummary } from '$lib/listings/utils/resolveListingHeaderSummary';
	import { copyToClipboard } from '$lib/utils/clipboard';
	import { route, url } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';
	import { icons } from '$data/icons';
	import { externalLinkRelForHref } from '$lib/utils/externalLinkRel';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import BuildingBlockBookmarkButton from '$lib/ui/components/building-blocks/BuildingBlockBookmarkButton.svelte';
	import SubjectRating from '$lib/ui/components/community/SubjectRating.svelte';
	import BuildingBlockExternalLinkButton from '$lib/ui/templates/building-blocks/BuildingBlockExternalLinkButton.svelte';
	import PublicCreatorListingDetailSidebarShell from '$lib/ui/templates/listings/PublicCreatorListingDetailSidebarShell.svelte';

	type Props = {
		extensionVm: ExtensionDetailViewModel;
		displayLikes: number;
		onLike: () => void | Promise<void>;
		onExternalClick?: () => void | Promise<void>;
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
		extensionVm,
		displayLikes,
		onLike,
		onExternalClick,
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

	const headerSummary = $derived(resolveListingHeaderSummary(extensionVm));
	const skillMarkdownHref = $derived(
		url(`/api/v1/listings/published/${extensionVm.slug}/skill-markdown`)
	);
	const skillsClickUrl = $derived(extensionVm.clickUrlSkills ?? extensionVm.clickUrl);
	const mcpClickUrl = $derived(extensionVm.clickUrlMcp);

	const categoryHref = $derived(
		extensionVm.category?.slug?.trim()
			? url(route(getRootPathPublicBuildingBlocksCategory(extensionVm.category.slug.trim())))
			: null
	);

	const metricRows = $derived(buildExtensionSidebarMetrics(extensionVm, displayLikes));

	const sourceSyncedFootnote = $derived(
		extensionVm.sourceSyncedAt
			? `Last synced from GitHub: ${new Date(extensionVm.sourceSyncedAt).toLocaleString()}`
			: null
	);

	async function handleShare() {
		const canonicalPath = resolvePublicBuildingBlockPath(extensionVm.owner, extensionVm.slug);
		const shareUrl = browser
			? window.location.href
			: canonicalPath
				? url(`/${canonicalPath}`)
				: url('/');
		if (browser && navigator.share) {
			try {
				await navigator.share({
					title: extensionVm.title,
					text: headerSummary ?? extensionVm.title,
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

	function openSkillMarkdownDownload() {
		if (typeof document === 'undefined') return;
		const anchor = document.createElement('a');
		anchor.href = skillMarkdownHref;
		anchor.target = '_blank';
		anchor.rel = 'noopener noreferrer';
		document.body.appendChild(anchor);
		anchor.click();
		anchor.remove();
	}
</script>

<PublicCreatorListingDetailSidebarShell
	class={className}
	ariaLabel="Building block actions and stats"
	categoryName={extensionVm.category?.name}
	{categoryHref}
	{metricRows}
	footnote={sourceSyncedFootnote}
>
	{#snippet topRow()}
		{#if onToggleBookmark}
			<BuildingBlockBookmarkButton
				listingId={extensionVm.id}
				{isBookmarked}
				{isLoggedIn}
				onToggle={onToggleBookmark}
			/>
		{/if}
	{/snippet}

	{#snippet actions()}
		{#if submitRating}
			<SubjectRating
				subjectId={extensionVm.id}
				averageRating={extensionVm.averageRating}
				ratingsCount={extensionVm.ratingsCount}
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

		{#if extensionVm.extensionType === 'skills' || extensionVm.extensionType === 'both'}
			{#if skillsClickUrl}
				<BuildingBlockExternalLinkButton
					href={skillsClickUrl}
					label={extensionVm.extensionType === 'both' ? 'Get started with Skills' : 'Get started'}
					class="btn-block"
					onClick={onExternalClick}
				/>
			{/if}
			<Button variant="outline" size="sm" class="btn-block" onclick={openSkillMarkdownDownload}>
				Download SKILL.md
			</Button>
		{/if}

		{#if (extensionVm.extensionType === 'mcp' || extensionVm.extensionType === 'both') && mcpClickUrl}
			<BuildingBlockExternalLinkButton
				href={mcpClickUrl}
				label={extensionVm.extensionType === 'both' ? 'MCP setup guide' : 'Setup guide'}
				class="btn-block"
				onClick={onExternalClick}
			/>
		{/if}

		{#if extensionVm.sourceRepoUrl}
			<Button
				href={extensionVm.sourceRepoUrl}
				variant="ghost"
				size="sm"
				class="btn-block"
				target="_blank"
				rel={externalLinkRelForHref(extensionVm.sourceRepoUrl)}
			>
				Source repo
			</Button>
		{/if}
	{/snippet}
</PublicCreatorListingDetailSidebarShell>
