<script lang="ts">
	import type { ExtensionDetailViewModel } from '$lib/listings/index';

	import { browser } from '$app/environment';

	import { getRootPathPublicBuildingBlock } from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
	import { copyToClipboard } from '$lib/utils/clipboard';
	import { url } from '$lib/utils/path';

	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { toast } from '$lib/ui/sonner';

	import ExtensionExternalLinkButton from '$lib/ui/templates/extensions/ExtensionExternalLinkButton.svelte';
	import ExtensionSkillCommandsTable from '$lib/ui/components/extensions/ExtensionSkillCommandsTable.svelte';
	import ExtensionListingContentTabs from '$lib/ui/templates/extensions/ExtensionListingContentTabs.svelte';
	import Stargazers from '$lib/ui/icons/Stargazers.svelte';
	import { parseGithubRepoFromUrl } from '$lib/utils/github';

	type Props = {
		extensionVm: ExtensionDetailViewModel;
		displayLikes: number;
		onLike: () => void | Promise<void>;
		onExternalClick?: () => void | Promise<void>;
		likeDisabled?: boolean;
	};

	let { extensionVm, displayLikes, onLike, onExternalClick, likeDisabled = false }: Props = $props();

	const faqItems = $derived(extensionVm.faq ?? []);
	const skillMarkdownHref = $derived(url(`/api/v1/listings/published/${extensionVm.slug}/skill-markdown`));
	const githubRepo = $derived(parseGithubRepoFromUrl(extensionVm.sourceRepoUrl));
	const skillsDescription = $derived(extensionVm.descriptionSkills ?? extensionVm.description);
	const skillsContent = $derived(extensionVm.contentSkills ?? extensionVm.content);
	const skillsClickUrl = $derived(extensionVm.clickUrlSkills ?? extensionVm.clickUrl);

	async function handleCopyInstall() {
		const command = extensionVm.installCommandSkills?.trim();
		if (!command) return;
		const ok = await copyToClipboard(command);
		if (ok) toast.success('Install command copied.');
		else toast.error('Could not copy install command.');
	}

	async function handleShare() {
		const shareUrl = browser ? window.location.href : url(`/${getRootPathPublicBuildingBlock(extensionVm.slug)}`);
		if (browser && navigator.share) {
			try {
				await navigator.share({
					title: extensionVm.title,
					text: extensionVm.excerpt ?? extensionVm.title,
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
		{#each extensionVm.tags as tag (tag.id)}
			<span class="badge badge-ghost">{tag.name}</span>
		{/each}
		{#if githubRepo}
			<Stargazers owner={githubRepo.owner} name={githubRepo.name} />
		{/if}
	</div>

	<div class="space-y-3">
		<h1 class="text-3xl font-black tracking-tight text-base-content sm:text-4xl">{extensionVm.title}</h1>
		{#if extensionVm.skillName}
			<p class="font-mono text-sm text-base-content/60">{extensionVm.skillName}</p>
		{/if}
		{#if extensionVm.excerpt}
			<p class="text-lg text-base-content/75">{extensionVm.excerpt}</p>
		{/if}
		<div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-base-content/60">
			{#if extensionVm.owner?.fullName || extensionVm.owner?.username}
				<span>By {extensionVm.owner.fullName ?? extensionVm.owner.username}</span>
			{/if}
			{#if extensionVm.version}
				<span>v{extensionVm.version}</span>
			{/if}
			{#if extensionVm.license}
				<span>{extensionVm.license}</span>
			{/if}
			{#if extensionVm.category}
				<span>{extensionVm.category.name}</span>
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
			<ExtensionExternalLinkButton href={skillsClickUrl} label="Get started" onClick={onExternalClick} />
		{/if}
		<Button variant="outline" size="sm" onclick={openSkillMarkdownDownload}>Download SKILL.md</Button>
		{#if extensionVm.sourceRepoUrl}
			<Button href={extensionVm.sourceRepoUrl} variant="ghost" size="sm" target="_blank" rel="noopener noreferrer nofollow">
				Source repo
			</Button>
		{/if}
	</div>
</header>

{#if extensionVm.installCommandSkills}
	<section class="border-b border-base-content/10 py-8">
		<h2 class="mb-3 text-lg font-semibold">Install</h2>
		<TerminalCommandMock code={extensionVm.installCommandSkills} ariaLabel={`Install command for ${extensionVm.title}`} />
		<div class="mt-3">
			<Button variant="outline" size="sm" onclick={() => void handleCopyInstall()}>Copy command</Button>
		</div>
	</section>
{/if}

{#if extensionVm.skillCommands.length > 0}
	<section class="border-b border-base-content/10 py-8">
		<h2 class="mb-4 text-lg font-semibold">CLI commands</h2>
		<ExtensionSkillCommandsTable commandsVm={extensionVm.skillCommands} />
	</section>
{/if}

<section class="border-b border-base-content/10 py-8">
	<ExtensionListingContentTabs
		description={skillsDescription}
		content={skillsContent}
		faq={faqItems}
		aboutEmptyMessage="No skill documentation yet."
		readmeEmptyMessage="No SKILL.md content yet."
	/>
</section>

<section class="py-8">
	<h2 class="mb-4 text-lg font-semibold">Stats</h2>
	<dl class="grid gap-4 sm:grid-cols-2">
		<div>
			<dt class="text-sm text-base-content/60">Views</dt>
			<dd class="text-2xl font-semibold">{extensionVm.views}</dd>
		</div>
		<div>
			<dt class="text-sm text-base-content/60">Likes</dt>
			<dd class="text-2xl font-semibold">{displayLikes}</dd>
		</div>
		<div>
			<dt class="text-sm text-base-content/60">Bookmarks</dt>
			<dd class="text-2xl font-semibold">{extensionVm.bookmarkCount}</dd>
		</div>
		<div>
			<dt class="text-sm text-base-content/60">Rating</dt>
			<dd class="text-2xl font-semibold">
				{extensionVm.averageRating.toFixed(1)} ({extensionVm.ratingsCount})
			</dd>
		</div>
	</dl>
	{#if extensionVm.sourceSyncedAt}
		<p class="mt-4 text-sm text-base-content/60">
			Last synced from GitHub: {new Date(extensionVm.sourceSyncedAt).toLocaleString()}
		</p>
	{/if}
</section>
