<script lang="ts">
	import type { ExtensionDetailViewModel, ListingFaqItem } from '$lib/listings/index';

	import { browser } from '$app/environment';

	import { getRootPathPublicExtension } from '$lib/area-public/constants/getRootPathPublicExtensions';
	import { copyToClipboard } from '$lib/utils/clipboard';
	import { url } from '$lib/utils/path';
	import { parseGithubRepoFromUrl } from '$lib/utils/github';

	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Tabs from '$lib/ui/tabs';
	import { toast } from '$lib/ui/sonner';

	import ExtensionExternalLinkButton from '$lib/ui/templates/extensions/ExtensionExternalLinkButton.svelte';
	import ListingMarkdownContent from '$lib/ui/templates/extensions/ListingMarkdownContent.svelte';
	import Stargazers from '$lib/ui/icons/Stargazers.svelte';

	type Props = {
		extension: ExtensionDetailViewModel;
		displayLikes: number;
		onLike: () => void | Promise<void>;
		onExternalClick?: () => void | Promise<void>;
		likeDisabled?: boolean;
	};

	let { extension, displayLikes, onLike, onExternalClick, likeDisabled = false }: Props = $props();

	let activeModality = $state<'skills' | 'mcp'>('skills');

	const faqItems = $derived(Array.isArray(extension.faq) ? (extension.faq as ListingFaqItem[]) : []);
	const githubRepo = $derived(parseGithubRepoFromUrl(extension.sourceRepoUrl));
	const skillMarkdownHref = $derived(url(`/api/v1/listings/published/${extension.slug}/skill-markdown`));

	const skillsDescription = $derived(extension.descriptionSkills ?? extension.description);
	const skillsContent = $derived(extension.contentSkills ?? extension.content);
	const skillsClickUrl = $derived(extension.clickUrlSkills ?? extension.clickUrl);

	const mcpDescription = $derived(extension.descriptionMcp);
	const mcpContent = $derived(extension.contentMcp);
	const mcpClickUrl = $derived(extension.clickUrlMcp);

	const configJson = $derived.by(() => {
		const config = extension.mcpServerConfig;
		if (!config || Object.keys(config).length === 0) return null;
		return JSON.stringify(config, null, 2);
	});

	const tabTriggerClass =
		'h-auto min-h-0 rounded-lg border-0 !border-b-0 bg-transparent px-4 py-2 text-sm font-semibold text-base-content/75 transition-colors hover:bg-base-content/10 hover:text-base-content [&.tab-active]:bg-primary [&.tab-active]:text-primary-content';

	async function copyText(value: string | null | undefined, successMessage: string) {
		if (!value?.trim()) return;
		const ok = await copyToClipboard(value.trim());
		if (ok) toast.success(successMessage);
		else toast.error('Could not copy to clipboard.');
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
		<span class="badge badge-outline">Skills + MCP</span>
		{#if extension.category}
			<span class="badge badge-ghost">{extension.category.name}</span>
		{/if}
		{#if githubRepo}
			<Stargazers owner={githubRepo.owner} name={githubRepo.name} />
		{/if}
	</div>

	<div class="space-y-3">
		<h1 class="text-3xl font-black tracking-tight text-base-content sm:text-4xl">{extension.title}</h1>
		{#if extension.skillName}
			<p class="font-mono text-sm text-base-content/60">{extension.skillName}</p>
		{/if}
		{#if extension.excerpt}
			<p class="text-lg text-base-content/75">{extension.excerpt}</p>
		{/if}
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
		<Button variant="outline" size="sm" onclick={openSkillMarkdownDownload}>Download SKILL.md</Button>
		{#if extension.sourceRepoUrl}
			<Button href={extension.sourceRepoUrl} variant="ghost" size="sm" target="_blank" rel="noopener noreferrer nofollow">
				Source repo
			</Button>
		{/if}
	</div>
</header>

<section class="py-8">
	<Tabs.Root bind:value={activeModality} class="w-full space-y-6">
		<Tabs.List class="inline-flex gap-1 rounded-xl border border-base-content/15 bg-base-200/60 p-1">
			<Tabs.Trigger value="skills" class={tabTriggerClass}>Skills</Tabs.Trigger>
			<Tabs.Trigger value="mcp" class={tabTriggerClass}>MCP</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="skills" class="space-y-8">
			{#if skillsDescription}
				<p class="text-lg text-base-content/75">{skillsDescription}</p>
			{/if}

			{#if skillsClickUrl}
				<ExtensionExternalLinkButton
					href={skillsClickUrl}
					label="Get started with Skills"
					size="default"
					onClick={onExternalClick}
				/>
			{/if}

			{#if extension.installCommandSkills}
				<div>
					<h2 class="mb-3 text-lg font-semibold">Install</h2>
					<TerminalCommandMock
						code={extension.installCommandSkills}
						ariaLabel={`Skills install for ${extension.title}`}
					/>
					<div class="mt-3">
						<Button
							variant="outline"
							size="sm"
							onclick={() => copyText(extension.installCommandSkills, 'Skills install copied.')}
						>
							Copy command
						</Button>
					</div>
				</div>
			{/if}

			<ListingMarkdownContent markdown={skillsContent} emptyMessage="No Skills documentation yet." />
		</Tabs.Content>

		<Tabs.Content value="mcp" class="space-y-8">
			{#if mcpDescription}
				<p class="text-lg text-base-content/75">{mcpDescription}</p>
			{/if}

			<div class="flex flex-wrap items-center gap-2">
				{#if extension.mcpTransport}
					<span class="badge badge-ghost uppercase">{extension.mcpTransport}</span>
				{/if}
			</div>

			{#if mcpClickUrl}
				<ExtensionExternalLinkButton
					href={mcpClickUrl}
					label="View setup guide"
					size="default"
					onClick={onExternalClick}
				/>
			{/if}

			{#if extension.mcpTools.length > 0}
				<div>
					<h2 class="mb-4 text-lg font-semibold">MCP tools</h2>
					<div class="overflow-x-auto rounded-lg border border-base-content/10">
						<table class="table table-zebra">
							<thead>
								<tr>
									<th>Tool</th>
									<th>Description</th>
								</tr>
							</thead>
							<tbody>
								{#each extension.mcpTools as tool (tool.name)}
									<tr>
										<td class="font-mono text-sm">{tool.name}</td>
										<td>{tool.description}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}

			<div>
				<h2 class="mb-3 text-lg font-semibold">Install</h2>
				{#if configJson}
					<TerminalCommandMock code={configJson} ariaLabel={`MCP config for ${extension.title}`} />
					<div class="mt-3">
						<Button variant="outline" size="sm" onclick={() => copyText(configJson, 'MCP config copied.')}>
							Copy config
						</Button>
					</div>
				{:else if extension.installCommandMcp}
					<TerminalCommandMock code={extension.installCommandMcp} ariaLabel={`MCP install for ${extension.title}`} />
					<div class="mt-3">
						<Button
							variant="outline"
							size="sm"
							onclick={() => copyText(extension.installCommandMcp, 'MCP install copied.')}
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

			<ListingMarkdownContent markdown={mcpContent} emptyMessage="No MCP documentation yet." />
		</Tabs.Content>
	</Tabs.Root>
</section>

{#if faqItems.length > 0}
	<section class="border-t border-base-content/10 py-8">
		<h2 class="mb-4 text-lg font-semibold">FAQ</h2>
		<div class="space-y-4">
			{#each faqItems as item, index (index)}
				<div class="rounded-lg border border-base-content/10 p-4">
					<h3 class="font-semibold">{item.question}</h3>
					<p class="mt-2 text-base-content/75">{item.answer}</p>
				</div>
			{/each}
		</div>
	</section>
{/if}
