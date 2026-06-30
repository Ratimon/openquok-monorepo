<script lang="ts">
	import type { ExtensionDetailViewModel } from '$lib/listings/index';

	import { browser } from '$app/environment';

	import { getRootPathPublicExtension } from '$lib/area-public/constants/getRootPathPublicExtensions';
	import { copyToClipboard } from '$lib/utils/clipboard';
	import { url } from '$lib/utils/path';
	import { parseGithubRepoFromUrl } from '$lib/utils/github';

	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { toast } from '$lib/ui/sonner';

	import ExtensionExternalLinkButton from '$lib/ui/templates/extensions/ExtensionExternalLinkButton.svelte';
	import ExtensionMcpToolsTable from '$lib/ui/components/extensions/ExtensionMcpToolsTable.svelte';
	import ExtensionListingContentTabs from '$lib/ui/templates/extensions/ExtensionListingContentTabs.svelte';
	import Stargazers from '$lib/ui/icons/Stargazers.svelte';

	type Props = {
		extension: ExtensionDetailViewModel;
		displayLikes: number;
		onLike: () => void | Promise<void>;
		onExternalClick?: () => void | Promise<void>;
		likeDisabled?: boolean;
	};

	let { extension, displayLikes, onLike, onExternalClick, likeDisabled = false }: Props = $props();

	let configClient = $state<'cursor' | 'claude' | 'vscode'>('cursor');

	const faqItems = $derived(extension.faq ?? []);
	const mcpDescription = $derived(extension.descriptionMcp);
	const mcpContent = $derived(extension.contentMcp);
	const mcpClickUrl = $derived(extension.clickUrlMcp);
	const configJson = $derived.by(() => {
		const config = extension.mcpServerConfig;
		if (!config || Object.keys(config).length === 0) return null;
		return JSON.stringify(config, null, 2);
	});
	const githubRepo = $derived(parseGithubRepoFromUrl(extension.sourceRepoUrl));

	async function handleCopyInstall() {
		const command = extension.installCommandMcp?.trim();
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
		const shareUrl = browser ? window.location.href : url(`/${getRootPathPublicExtension(extension.slug)}`);
		if (browser && navigator.share) {
			try {
				await navigator.share({
					title: extension.title,
					text: extension.excerpt ?? extension.title,
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
		{#if extension.category}
			<span class="badge badge-outline">{extension.category.name}</span>
		{/if}
		{#if extension.mcpTransport}
			<span class="badge badge-ghost uppercase">{extension.mcpTransport}</span>
		{/if}
		{#if githubRepo}
			<Stargazers owner={githubRepo.owner} name={githubRepo.name} />
		{/if}
	</div>

	<div class="space-y-3">
		<h1 class="text-3xl font-black tracking-tight text-base-content sm:text-4xl">{extension.title}</h1>
		{#if extension.excerpt}
			<p class="text-lg text-base-content/75">{extension.excerpt}</p>
		{/if}
		<div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-base-content/60">
			{#if extension.owner?.fullName || extension.owner?.username}
				<span>By {extension.owner.fullName ?? extension.owner.username}</span>
			{/if}
			{#if extension.version}
				<span>v{extension.version}</span>
			{/if}
			{#if extension.license}
				<span>{extension.license}</span>
			{/if}
		</div>
	</div>

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
			<ExtensionExternalLinkButton href={mcpClickUrl} label="Setup guide" onClick={onExternalClick} />
		{/if}
		{#if extension.sourceRepoUrl}
			<Button href={extension.sourceRepoUrl} variant="ghost" size="sm" target="_blank" rel="noopener noreferrer nofollow">
				Source repo
			</Button>
		{/if}
	</div>
</header>

<section class="border-b border-base-content/10 py-8">
	<ExtensionListingContentTabs
		description={mcpDescription}
		content={mcpContent}
		faq={faqItems}
		aboutEmptyMessage="No about content yet."
		readmeEmptyMessage="No README content yet."
	/>
</section>

{#if extension.mcpTools.length > 0}
	<section class="border-b border-base-content/10 py-8">
		<h2 class="mb-4 text-lg font-semibold">
			MCP tools
		</h2>
		<ExtensionMcpToolsTable tools={extension.mcpTools} />
	</section>
{/if}

<section class="py-8">
	<h2 class="mb-3 text-lg font-semibold">Install</h2>
	{#if configJson}
		<div class="mb-4 flex flex-wrap gap-2">
			<button type="button" class:tab-active={configClient === 'cursor'} class="btn btn-sm btn-ghost" onclick={() => (configClient = 'cursor')}>Cursor</button>
			<button type="button" class:tab-active={configClient === 'claude'} class="btn btn-sm btn-ghost" onclick={() => (configClient = 'claude')}>Claude</button>
			<button type="button" class:tab-active={configClient === 'vscode'} class="btn btn-sm btn-ghost" onclick={() => (configClient = 'vscode')}>VS Code</button>
		</div>
		<TerminalCommandMock code={configJson} language="bash" ariaLabel={`MCP config for ${extension.title}`} />
		<div class="mt-3">
			<Button variant="outline" size="sm" onclick={() => void handleCopyConfig()}>Copy config</Button>
		</div>
	{:else if extension.installCommandMcp}
		<TerminalCommandMock code={extension.installCommandMcp} ariaLabel={`Install command for ${extension.title}`} />
		<div class="mt-3">
			<Button variant="outline" size="sm" onclick={() => void handleCopyInstall()}>Copy command</Button>
		</div>
	{:else if mcpClickUrl}
		<p class="mb-3 text-base-content/75">Follow the official setup guide to connect this MCP server in your client.</p>
		<ExtensionExternalLinkButton
			href={mcpClickUrl}
			label="View setup guide"
			size="default"
			onClick={onExternalClick}
		/>
	{:else}
		<p class="text-base-content/70">Install instructions coming soon.</p>
	{/if}
</section>
