<script lang="ts">
	import type { ExtensionCardViewModel, ExtensionDetailViewModel } from '$lib/listings/index';

	import { browser } from '$app/environment';

	import { getRootPathPublicExtension } from '$lib/area-public/constants/getRootPathPublicExtensions';
	import { publicExtensionBySlugPagePresenter } from '$lib/area-public/index';
	import { markdownToHtml } from '$lib/listings/index';
	import { copyToClipboard } from '$lib/utils/clipboard';
	import { url } from '$lib/utils/path';

	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import { toast } from '$lib/ui/sonner';

	import ExtensionCard from '$lib/ui/templates/extensions/ExtensionCard.svelte';

	type Props = {
		extension: ExtensionDetailViewModel;
		relatedExtensions: ExtensionCardViewModel[];
	};

	let { extension, relatedExtensions }: Props = $props();

	const pagePresenter = publicExtensionBySlugPagePresenter;

	let extraLikes = $state(0);
	let displayLikes = $derived(extension.likes + extraLikes);
	let expandedRelatedId = $state<string | null>(null);

	const contentHtml = $derived(markdownToHtml(extension.content ?? ''));

	const installCommand = $derived.by(() => {
		if (extension.extensionType === 'mcp') return extension.installCommandMcp;
		if (extension.extensionType === 'skills') return extension.installCommandSkills;
		return extension.installCommandSkills ?? extension.installCommandMcp;
	});

	const typeLabel = $derived.by(() => {
		if (extension.isOfficial) return 'Official';
		switch (extension.extensionType) {
			case 'skills':
				return 'Skills';
			case 'mcp':
				return 'MCP';
			case 'both':
				return 'Skills + MCP';
			default:
				return 'Extension';
		}
	});

	function relatedDetailHref(slug: string): string {
		return url(`/${getRootPathPublicExtension(slug)}`);
	}

	async function handleLike() {
		const result = await pagePresenter.trackExtensionLike(extension.id);
		if (result.ok) {
			extraLikes += 1;
			toast.success('Thanks for the like!');
			return;
		}
		toast.error(result.error);
	}

	async function handleCopyInstall() {
		if (!installCommand) return;
		const ok = await copyToClipboard(installCommand.trim());
		if (ok) toast.success('Install command copied.');
		else toast.error('Could not copy install command.');
	}

	async function handleShare() {
		const shareUrl = browser ? window.location.href : url(`/${getRootPathPublicExtension(extension.slug)}`);
		if (browser && navigator.share) {
			try {
				await navigator.share({ title: extension.title, text: extension.excerpt ?? extension.title, url: shareUrl });
				return;
			} catch {
				// fall through to clipboard
			}
		}
		const ok = await copyToClipboard(shareUrl);
		if (ok) toast.success('Link copied to clipboard.');
		else toast.error('Could not copy link.');
	}

	function toggleRelatedExpanded(id: string) {
		expandedRelatedId = expandedRelatedId === id ? null : id;
	}
</script>

<SectionOuterContainer class="py-10 md:py-14">
	<article class="container mx-auto max-w-4xl px-4">
		<header class="space-y-6 border-b border-base-content/10 pb-8">
			<div class="flex flex-col gap-6 sm:flex-row sm:items-start">
				{#if extension.logoImageUrl}
					<img
						src={extension.logoImageUrl}
						alt=""
						width="96"
						height="96"
						class="size-24 rounded-2xl border border-base-content/10 object-cover"
					/>
				{/if}
				<div class="min-w-0 flex-1 space-y-3">
					<div class="flex flex-wrap items-center gap-2">
						<span class="badge badge-outline">{typeLabel}</span>
						{#if extension.category}
							<span class="badge badge-ghost">{extension.category.name}</span>
						{/if}
					</div>
					<h1 class="text-3xl font-black tracking-tight text-base-content sm:text-4xl">
						{extension.title}
					</h1>
					{#if extension.excerpt}
						<p class="text-lg text-base-content/75">{extension.excerpt}</p>
					{/if}
					<div class="flex flex-wrap gap-4 text-sm text-base-content/60">
						<span>{displayLikes} likes</span>
						<span>{extension.views} views</span>
						{#if extension.owner?.fullName || extension.owner?.username}
							<span>
								By {extension.owner.fullName ?? extension.owner.username}
							</span>
						{/if}
					</div>
				</div>
			</div>

			<div class="flex flex-wrap gap-2">
				<Button variant="outline" size="sm" onclick={() => void handleLike()} disabled={pagePresenter.submittingLike}>
					<AbstractIcon name={icons.Star.name} width="16" height="16" aria-hidden="true" />
					Like ({displayLikes})
				</Button>
				{#if installCommand}
					<Button variant="outline" size="sm" onclick={() => void handleCopyInstall()}>
						Copy install
					</Button>
				{/if}
				<Button variant="outline" size="sm" onclick={() => void handleShare()}>
					<AbstractIcon name={icons.Share2.name} width="16" height="16" aria-hidden="true" />
					Share
				</Button>
				{#if extension.sourceRepoUrl}
					<Button href={extension.sourceRepoUrl} variant="ghost" size="sm" target="_blank" rel="noopener noreferrer nofollow">
						Source repo
					</Button>
				{/if}
			</div>
		</header>

		{#if installCommand}
			<section class="py-8">
				<h2 class="mb-3 text-lg font-semibold">Install</h2>
				<TerminalCommandMock code={installCommand} ariaLabel={`Install command for ${extension.title}`} />
			</section>
		{/if}

		{#if contentHtml}
			<section class="prose prose-neutral dark:prose-invert max-w-none py-8">
				<!-- eslint-disable svelte/no-at-html-tags -->
				{@html contentHtml}
			</section>
		{/if}

		{#if relatedExtensions.length > 0}
			<section class="border-t border-base-content/10 py-10">
				<h2 class="mb-4 text-xl font-bold">Related extensions</h2>
				<ul class="space-y-4">
					{#each relatedExtensions as related (related.id)}
						<li>
							<ExtensionCard
								extension={related}
								expanded={expandedRelatedId === related.id}
								onToggle={toggleRelatedExpanded}
							/>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<section class="border-t border-base-content/10 py-10">
			<h2 class="mb-2 text-xl font-bold">Comments</h2>
			<p class="text-base-content/70">Comments are coming soon.</p>
		</section>
	</article>
</SectionOuterContainer>
