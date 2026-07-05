<script lang="ts">
	import type { ExtensionDetailViewModel } from '$lib/listings/index';

	import { browser } from '$app/environment';

	import { resolvePublicBuildingBlockPath } from '$lib/area-public/utils/resolvePublicListingPaths';
	import { resolveListingHeaderSummary } from '$lib/listings/utils/resolveListingHeaderSummary';
	import { copyToClipboard } from '$lib/utils/clipboard';
	import { url } from '$lib/utils/path';
	import { parseGithubRepoFromUrl } from '$lib/utils/github';
	import { toast } from '$lib/ui/sonner';

	import { icons } from '$data/icons';
	import {
		extensionDetailTabTriggerClass,
		extensionDetailTabsListClass
	} from '$lib/ui/templates/extensions/extensionDetailTabClasses';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Tabs from '$lib/ui/tabs';
	import ListingCreatorAttribution from '$lib/ui/templates/extensions/ListingCreatorAttribution.svelte';
	import ExtensionExternalLinkButton from '$lib/ui/templates/extensions/ExtensionExternalLinkButton.svelte';
	import ExtensionBookmarkButton from '$lib/ui/components/extensions/ExtensionBookmarkButton.svelte';
	import ListingDetailTagBadges from '$lib/ui/components/extensions/ListingDetailTagBadges.svelte';
	import ListingDetailTypeBadges from '$lib/ui/components/extensions/ListingDetailTypeBadges.svelte';
	import ListingRating from '$lib/ui/components/extensions/ListingRating.svelte';
	import ExtensionSkillCommandsTable from '$lib/ui/components/extensions/ExtensionSkillCommandsTable.svelte';
	import ExtensionMcpToolsTable from '$lib/ui/components/extensions/ExtensionMcpToolsTable.svelte';
	import ExtensionListingContentTabs from '$lib/ui/templates/extensions/ExtensionListingContentTabs.svelte';
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

	let activeModality = $state<'skills' | 'mcp'>('skills');

	const faqItems = $derived(extensionVm.faq ?? []);
	const githubRepo = $derived(parseGithubRepoFromUrl(extensionVm.sourceRepoUrl));
	const skillMarkdownHref = $derived(url(`/api/v1/listings/published/${extensionVm.slug}/skill-markdown`));

	const skillsDescription = $derived(extensionVm.descriptionSkills ?? extensionVm.description);
	const skillsContent = $derived(extensionVm.contentSkills ?? extensionVm.content);
	const skillsClickUrl = $derived(extensionVm.clickUrlSkills ?? extensionVm.clickUrl);

	const mcpDescription = $derived(extensionVm.descriptionMcp);
	const mcpContent = $derived(extensionVm.contentMcp);
	const mcpClickUrl = $derived(extensionVm.clickUrlMcp);

	const configJson = $derived.by(() => {
		const config = extensionVm.mcpServerConfig;
		if (!config || Object.keys(config).length === 0) return null;
		return JSON.stringify(config, null, 2);
	});
	const headerSummary = $derived(resolveListingHeaderSummary(extensionVm));

	async function copyText(value: string | null | undefined, successMessage: string) {
		if (!value?.trim()) return;
		const ok = await copyToClipboard(value.trim());
		if (ok) toast.success(successMessage);
		else toast.error('Could not copy to clipboard.');
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
		await copyText(shareUrl, 'Link copied to clipboard.');
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
			<h1 class="text-3xl font-black tracking-tight text-base-content sm:text-4xl">
				{extensionVm.title}
			</h1>
			{#if onToggleBookmark}
				<ExtensionBookmarkButton
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
			<p class="text-lg text-base-content/75">
				{headerSummary}
			</p>
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
		<Button variant="outline" size="sm" onclick={openSkillMarkdownDownload}>Download SKILL.md</Button>
		{#if extensionVm.sourceRepoUrl}
			<Button href={extensionVm.sourceRepoUrl} variant="ghost" size="sm" target="_blank" rel="noopener noreferrer nofollow">
				Source repo
			</Button>
		{/if}
	</div>

	<ListingDetailTagBadges tags={extensionVm.tags} />
</header>

<section class="py-8">
	<Tabs.Root bind:value={activeModality} class="w-full space-y-8">
		<Tabs.List class={extensionDetailTabsListClass}>
			<Tabs.Trigger value="skills" class={extensionDetailTabTriggerClass}>Skills</Tabs.Trigger>
			<Tabs.Trigger value="mcp" class={extensionDetailTabTriggerClass}>MCP</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="skills" class="space-y-8">
			{#if skillsClickUrl}
				<ExtensionExternalLinkButton
					href={skillsClickUrl}
					label="Get started with Skills"
					size="default"
					onClick={onExternalClick}
				/>
			{/if}

			<ExtensionListingContentTabs
				description={skillsDescription}
				content={skillsContent}
				faq={faqItems}
				aboutEmptyMessage="No Skills documentation yet."
				readmeEmptyMessage="No SKILL.md content yet."
			/>

			{#if extensionVm.installCommandSkills}
				<div>
					<h2 class="mb-3 text-lg font-semibold">Install</h2>
					<TerminalCommandMock
						code={extensionVm.installCommandSkills}
						ariaLabel={`Skills install for ${extensionVm.title}`}
					/>
					<div class="mt-3">
						<Button
							variant="outline"
							size="sm"
							onclick={() => copyText(extensionVm.installCommandSkills, 'Skills install copied.')}
						>
							Copy command
						</Button>
					</div>
				</div>
			{/if}

			{#if extensionVm.skillCommands.length > 0}
				<div>
					<h2 class="mb-4 text-lg font-semibold">CLI commands</h2>
					<ExtensionSkillCommandsTable commandsVm={extensionVm.skillCommands} />
				</div>
			{/if}
		</Tabs.Content>

		<Tabs.Content value="mcp" class="space-y-8">
			{#if mcpClickUrl}
				<ExtensionExternalLinkButton
					href={mcpClickUrl}
					label="View setup guide"
					size="default"
					onClick={onExternalClick}
				/>
			{/if}

			<ExtensionListingContentTabs
				description={mcpDescription}
				content={mcpContent}
				faq={faqItems}
				aboutEmptyMessage="No MCP about content yet."
				readmeEmptyMessage="No MCP README content yet."
			/>

			{#if extensionVm.mcpTools.length > 0}
				<div>
					<h2 class="mb-4 text-lg font-semibold">MCP tools</h2>
					<ExtensionMcpToolsTable toolsVm={extensionVm.mcpTools} />
				</div>
			{/if}

			<div>
				<h2 class="mb-3 text-lg font-semibold">Install</h2>
				{#if configJson}
					<TerminalCommandMock code={configJson} ariaLabel={`MCP config for ${extensionVm.title}`} />
					<div class="mt-3">
						<Button variant="outline" size="sm" onclick={() => copyText(configJson, 'MCP config copied.')}>
							Copy config
						</Button>
					</div>
				{:else if extensionVm.installCommandMcp}
					<TerminalCommandMock code={extensionVm.installCommandMcp} ariaLabel={`MCP install for ${extensionVm.title}`} />
					<div class="mt-3">
						<Button
							variant="outline"
							size="sm"
							onclick={() => copyText(extensionVm.installCommandMcp, 'MCP install copied.')}
						>
							Copy command
						</Button>
					</div>
				{:else if mcpClickUrl}
					<p class="mb-3 text-base-content/75">
						Follow the official setup guide to connect this MCP server in your client.
					</p>
				{:else}
					<p class="text-base-content/70">Install instructions coming soon.</p>
				{/if}
			</div>
		</Tabs.Content>
	</Tabs.Root>
</section>
