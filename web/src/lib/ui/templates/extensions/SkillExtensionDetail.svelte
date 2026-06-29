<script lang="ts">
	import type { ExtensionDetailViewModel } from '$lib/listings/index';

	import { browser } from '$app/environment';

	import { getRootPathPublicExtension } from '$lib/area-public/constants/getRootPathPublicExtensions';
	import ListingMarkdownContent from '$lib/ui/templates/extensions/ListingMarkdownContent.svelte';
	import { copyToClipboard } from '$lib/utils/clipboard';
	import { url } from '$lib/utils/path';

	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Tabs from '$lib/ui/tabs';
	import { toast } from '$lib/ui/sonner';

	import ExtensionExternalLinkButton from '$lib/ui/templates/extensions/ExtensionExternalLinkButton.svelte';
	import Stargazers from '$lib/ui/icons/Stargazers.svelte';
	import { parseGithubRepoFromUrl } from '$lib/utils/github';

	type Props = {
		extension: ExtensionDetailViewModel;
		displayLikes: number;
		onLike: () => void | Promise<void>;
		onExternalClick?: () => void | Promise<void>;
		likeDisabled?: boolean;
	};

	let { extension, displayLikes, onLike, onExternalClick, likeDisabled = false }: Props = $props();

	let activeTab = $state<'skill' | 'stats'>('skill');

	const skillMarkdownHref = $derived(url(`/api/v1/listings/published/${extension.slug}/skill-markdown`));
	const githubRepo = $derived(parseGithubRepoFromUrl(extension.sourceRepoUrl));
	const skillsDescription = $derived(extension.descriptionSkills ?? extension.description);
	const skillsContent = $derived(extension.contentSkills ?? extension.content);
	const skillsClickUrl = $derived(extension.clickUrlSkills ?? extension.clickUrl);

	const tabTriggerClass =
		'h-auto min-h-0 rounded-lg border-0 !border-b-0 bg-transparent px-4 py-2 text-sm font-semibold text-base-content/75 transition-colors hover:bg-base-content/10 hover:text-base-content [&.tab-active]:bg-primary [&.tab-active]:text-primary-content';

	async function handleCopyInstall() {
		const command = extension.installCommandSkills?.trim();
		if (!command) return;
		const ok = await copyToClipboard(command);
		if (ok) toast.success('Install command copied.');
		else toast.error('Could not copy install command.');
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
	<div class="flex flex-wrap gap-2">
		{#each extension.tags as tag (tag.id)}
			<span class="badge badge-ghost">{tag.name}</span>
		{/each}
		{#if githubRepo}
			<Stargazers owner={githubRepo.owner} name={githubRepo.name} />
		{/if}
	</div>

	<div class="space-y-3">
		<h1 class="text-3xl font-black tracking-tight text-base-content sm:text-4xl">{extension.title}</h1>
		{#if extension.skillName}
			<p class="font-mono text-sm text-base-content/60">{extension.skillName}</p>
		{/if}
		{#if skillsDescription}
			<p class="text-lg text-base-content/75">{skillsDescription}</p>
		{:else if extension.excerpt}
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
			{#if extension.category}
				<span>{extension.category.name}</span>
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
		{#if skillsClickUrl}
			<ExtensionExternalLinkButton
				href={skillsClickUrl}
				label="Get started"
				onClick={onExternalClick}
			/>
		{/if}
		<Button variant="outline" size="sm" onclick={openSkillMarkdownDownload}>
			Download SKILL.md
		</Button>
		{#if extension.sourceRepoUrl}
			<Button href={extension.sourceRepoUrl} variant="ghost" size="sm" target="_blank" rel="noopener noreferrer nofollow">
				Source repo
			</Button>
		{/if}
	</div>
</header>

{#if extension.installCommandSkills}
	<section class="py-8">
		<h2 class="mb-3 text-lg font-semibold">Install</h2>
		<TerminalCommandMock code={extension.installCommandSkills} ariaLabel={`Install command for ${extension.title}`} />
		<div class="mt-3">
			<Button variant="outline" size="sm" onclick={() => void handleCopyInstall()}>Copy command</Button>
		</div>
	</section>
{/if}

<section class="border-t border-base-content/10 py-8">
	<Tabs.Root bind:value={activeTab} class="w-full space-y-4">
		<Tabs.List class="inline-flex gap-1 rounded-xl border border-base-content/15 bg-base-200/60 p-1">
			<Tabs.Trigger value="skill" class={tabTriggerClass}>SKILL.md</Tabs.Trigger>
			<Tabs.Trigger value="stats" class={tabTriggerClass}>Stats</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="skill">
			<ListingMarkdownContent markdown={skillsContent} emptyMessage="No skill documentation yet." />
		</Tabs.Content>

		<Tabs.Content value="stats">
			<dl class="grid gap-4 sm:grid-cols-2">
				<div>
					<dt class="text-sm text-base-content/60">Views</dt>
					<dd class="text-2xl font-semibold">{extension.views}</dd>
				</div>
				<div>
					<dt class="text-sm text-base-content/60">Likes</dt>
					<dd class="text-2xl font-semibold">{displayLikes}</dd>
				</div>
				<div>
					<dt class="text-sm text-base-content/60">Bookmarks</dt>
					<dd class="text-2xl font-semibold">{extension.bookmarkCount}</dd>
				</div>
				<div>
					<dt class="text-sm text-base-content/60">Rating</dt>
					<dd class="text-2xl font-semibold">
						{extension.averageRating.toFixed(1)} ({extension.ratingsCount})
					</dd>
				</div>
			</dl>
			{#if extension.sourceSyncedAt}
				<p class="mt-4 text-sm text-base-content/60">
					Last synced from GitHub: {new Date(extension.sourceSyncedAt).toLocaleString()}
				</p>
			{/if}
		</Tabs.Content>
	</Tabs.Root>
</section>
