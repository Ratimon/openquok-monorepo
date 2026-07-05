<script lang="ts">
	import type { ExtensionDetailViewModel } from '$lib/listings/index';

	import { browser } from '$app/environment';

	import { resolvePublicBuildingBlockPath } from '$lib/area-public/utils/resolvePublicListingPaths';
	import { resolveListingHeaderSummary } from '$lib/listings/utils/resolveListingHeaderSummary';
	import { copyToClipboard } from '$lib/utils/clipboard';
	import { url } from '$lib/utils/path';
	import { parseGithubRepoFromUrl } from '$lib/utils/github';

	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { toast } from '$lib/ui/sonner';

	import ListingCreatorAttribution from '$lib/ui/templates/listings/ListingCreatorAttribution.svelte';
	import BuildingBlockExternalLinkButton from '$lib/ui/templates/building-blocks/BuildingBlockExternalLinkButton.svelte';
	import BuildingBlockBookmarkButton from '$lib/ui/components/building-blocks/BuildingBlockBookmarkButton.svelte';
	import ListingDetailTagBadges from '$lib/ui/components/listings/ListingDetailTagBadges.svelte';
	import ListingDetailTypeBadges from '$lib/ui/components/listings/ListingDetailTypeBadges.svelte';
	import ListingRating from '$lib/ui/components/listings/ListingRating.svelte';
	import BuildingBlockMcpToolsTable from '$lib/ui/components/building-blocks/BuildingBlockMcpToolsTable.svelte';
	import BuildingBlockContentTabs from '$lib/ui/templates/building-blocks/BuildingBlockContentTabs.svelte';
	import Stargazers from '$lib/ui/icons/Stargazers.svelte';

	type Props = {
		extensionVm: ExtensionDetailViewModel;
		displayLikes: number;
		onLike: () => void | Promise<void>;
		onExternalClick?: () => void | Promise<void>;
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
		extensionVm,
		displayLikes,
		onLike,
		onExternalClick,
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

	const faqItems = $derived(extensionVm.faq ?? []);
	const mcpDescription = $derived(extensionVm.descriptionMcp);
	const mcpContent = $derived(extensionVm.contentMcp);
	const mcpClickUrl = $derived(extensionVm.clickUrlMcp);
	const configJson = $derived.by(() => {
		const config = extensionVm.mcpServerConfig;
		if (!config || Object.keys(config).length === 0) return null;
		return JSON.stringify(config, null, 2);
	});
	const githubRepo = $derived(parseGithubRepoFromUrl(extensionVm.sourceRepoUrl));
	const headerSummary = $derived(resolveListingHeaderSummary(extensionVm));

	async function handleCopyInstall() {
		const command = extensionVm.installCommandMcp?.trim();
		if (!command) return;
		const ok = await copyToClipboard(command);
		if (ok) toast.success('Install command copied.');
		else toast.error('Could not copy install command.');
	}

	async function handleCopyConfig() {
		if (!configJson) return;
		const ok = await copyToClipboard(configJson);
		if (ok) toast.success('MCP config copied.');
		else toast.error('Could not copy MCP config.');
	}

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
</script>

<header class="space-y-6 border-b border-base-content/10 pb-8">
	<div class="flex flex-wrap items-center gap-2">
		{#if extensionVm.category}
			<span class="badge badge-outline">{extensionVm.category.name}</span>
		{/if}
		<ListingDetailTypeBadges extensionType={extensionVm.extensionType} />
		{#if githubRepo}
			<Stargazers owner={githubRepo.owner} name={githubRepo.name} />
		{/if}
	</div>

	<div class="space-y-3">
		<div class="flex flex-wrap items-center gap-3">
			<h1 class="text-3xl font-black tracking-tight text-base-content sm:text-4xl">{extensionVm.title}</h1>
			{#if onToggleBookmark}
				<BuildingBlockBookmarkButton
					listingId={extensionVm.id}
					{isBookmarked}
					{isLoggedIn}
					{bookmarksPaidEnabled}
					{upgradeHref}
					onToggle={onToggleBookmark}
				/>
			{/if}
		</div>
		{#if extensionVm.slug}
			<p class="font-mono text-sm text-base-content/60">{extensionVm.slug}</p>
		{/if}
		{#if headerSummary}
			<p class="text-lg text-base-content/75">{headerSummary}</p>
		{/if}
		<div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-base-content/60">
			<ListingCreatorAttribution owner={extensionVm.owner} />
			{#if extensionVm.version}
				<span>v{extensionVm.version}</span>
			{/if}
			{#if extensionVm.license}
				<span>{extensionVm.license}</span>
			{/if}
		</div>
	</div>

	{#if submitRating}
		<ListingRating
			listingId={extensionVm.id}
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

	<div class="flex flex-wrap gap-2">
		<Button variant="outline" size="sm" onclick={() => void onLike()} disabled={likeDisabled}>
			<AbstractIcon name={icons.Star.name} width="16" height="16" aria-hidden="true" />
			Like ({displayLikes})
		</Button>
		<Button variant="outline" size="sm" onclick={() => void handleShare()}>
			<AbstractIcon name={icons.Share2.name} width="16" height="16" aria-hidden="true" />
			Share
		</Button>
		{#if mcpClickUrl}
			<BuildingBlockExternalLinkButton href={mcpClickUrl} label="Setup guide" onClick={onExternalClick} />
		{/if}
		{#if extensionVm.sourceRepoUrl}
			<Button href={extensionVm.sourceRepoUrl} variant="ghost" size="sm" target="_blank" rel="noopener noreferrer nofollow">
				Source repo
			</Button>
		{/if}
	</div>

	<ListingDetailTagBadges tags={extensionVm.tags} />
</header>

<section class="border-b border-base-content/10 py-8">
	<BuildingBlockContentTabs
		description={mcpDescription}
		content={mcpContent}
		faq={faqItems}
		aboutEmptyMessage="No about content yet."
		readmeEmptyMessage="No README content yet."
	/>
</section>

{#if extensionVm.mcpTools.length > 0}
	<section class="border-b border-base-content/10 py-8">
		<h2 class="mb-4 text-lg font-semibold">
			MCP tools
		</h2>
		<BuildingBlockMcpToolsTable toolsVm={extensionVm.mcpTools} />
	</section>
{/if}

<section class="py-8">
	<h2 class="mb-3 text-lg font-semibold">Install</h2>
	{#if extensionVm.installCommandMcp}
		<TerminalCommandMock code={extensionVm.installCommandMcp} ariaLabel={`Install command for ${extensionVm.title}`} />
		<div class="mt-3">
			<Button variant="outline" size="sm" onclick={() => void handleCopyInstall()}>Copy command</Button>
		</div>
	{:else}
		{#if mcpClickUrl}
			<p class="mb-3 text-base-content/75">
				Follow the official setup guide for your MCP client — steps differ for Cursor, Claude, ChatGPT, VS
				Code, and other hosts.
			</p>
			<BuildingBlockExternalLinkButton
				href={mcpClickUrl}
				label="View setup guide"
				size="default"
				onClick={onExternalClick}
			/>
		{/if}
		{#if configJson}
			<div class:mt-6={Boolean(mcpClickUrl)}>
				<p class="mb-2 text-sm font-medium text-base-content/70">Remote MCP connector</p>
				<p class="mb-3 text-sm text-base-content/60">
					Same HTTP endpoint for every client; paste into your host’s remote MCP settings or use the setup
					guide for OAuth and client-specific UI.
				</p>
				<TerminalCommandMock code={configJson} language="bash" ariaLabel={`MCP config for ${extensionVm.title}`} />
				<div class="mt-3">
					<Button variant="outline" size="sm" onclick={() => void handleCopyConfig()}>Copy config</Button>
				</div>
			</div>
		{:else if !mcpClickUrl}
			<p class="text-base-content/70">Install instructions coming soon.</p>
		{/if}
	{/if}
</section>
