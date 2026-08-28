<script module lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
	import type { PublicPreviewThreadReplyViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';
	import type { DevtoLaunchProviderSettings } from '$lib/ui/components/posts/providers/provider.types';

	export type DevtoPreviewProps = {
		channel: CreateSocialPostChannelViewModel;
		previewText: string;
		maximumCharacters?: number;
		mediaUrls?: string[];
		threadReplies?: PublicPreviewThreadReplyViewModel[];
		threadFinisher?: { enabled: boolean; message: string } | null;
		previewMetaLabel?: string | null;
		providerSettings?: Record<string, unknown>;
	};
</script>

<script lang="ts">
	import { icons } from '$data/icons';
	import { publicUrlForMediaStorageKey } from '$lib/medias/utils/mediaUrls';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import IntegrationChannelPicture from '$lib/ui/components/posts/IntegrationChannelPicture.svelte';
	import { readDevtoLaunchSettings } from '$lib/ui/components/posts/providers/devto/devto.provider';
	import { renderDevtoPreviewBodyHtml } from '$lib/ui/components/posts/providers/devto/devtoPreviewBody';

	let {
		channel,
		previewText,
		maximumCharacters = 100_000,
		mediaUrls = [],
		previewMetaLabel = null,
		providerSettings = {}
	}: DevtoPreviewProps = $props();

	const settings = $derived(readDevtoLaunchSettings(providerSettings));
	const cropped = $derived(previewText.slice(0, maximumCharacters));
	const overflow = $derived(previewText.slice(maximumCharacters));
	const bodyHtml = $derived(renderDevtoPreviewBodyHtml(cropped));
	const timeLabel = $derived(previewMetaLabel?.trim() || 'Just now');
	const title = $derived(settings.title.trim() || 'Untitled article');
	const series = $derived(settings.series?.trim() || '');
	const coverUrl = $derived(resolveCoverUrl(settings, mediaUrls));
	const tags = $derived(settings.tags.map((t) => t.label).filter(Boolean));

	function resolveCoverUrl(
		next: DevtoLaunchProviderSettings,
		urls: string[]
	): string {
		const path = next.mainImage?.path?.trim();
		if (path) {
			if (path.startsWith('/') || path.startsWith('http://') || path.startsWith('https://')) {
				return path;
			}
			const publicUrl = publicUrlForMediaStorageKey(path);
			if (publicUrl) return publicUrl;
		}
		return urls[0] ?? '';
	}
</script>

<div class="overflow-hidden rounded-xl border border-base-300 bg-[#f5f5f5] text-[#171717]">
	{#if coverUrl}
		<div class="aspect-[1000/420] bg-[#d4d4d4]">
			<img src={coverUrl} alt="" class="h-full w-full object-cover" />
		</div>
	{/if}

	<div class="space-y-3 p-4">
		<div class="flex items-start gap-3">
			<IntegrationChannelPicture
				profilePictureUrl={channel.picture}
				fallbackIcon={icons.DevtoGlyph.name}
				alt={channel.name}
				class="h-10 w-10 shrink-0 rounded-full bg-base-200 object-cover"
			/>
			<div class="min-w-0 flex-1">
				<div class="truncate text-sm font-semibold">{channel.name || 'Dev.to'}</div>
				<div class="text-xs text-[#525252]">{timeLabel}</div>
			</div>
			<span class="shrink-0">
				<AbstractIcon name={icons.DevtoGlyph.name} class="size-5" width="20" height="20" />
			</span>
		</div>

		<h3 class="text-lg font-bold leading-snug">{title}</h3>

		{#if series}
			<p class="text-xs font-medium uppercase tracking-wide text-[#737373]">
				Series · {series}
			</p>
		{/if}

		{#if bodyHtml}
			<div class="devto-preview-prose text-sm leading-6 text-[#262626]">
				{@html bodyHtml}
				{#if overflow.length > 0}
					<p class="mt-2 text-xs text-error">Content exceeds the character limit.</p>
				{/if}
			</div>
		{:else}
			<p class="text-sm text-[#737373]">Markdown body appears here.</p>
		{/if}

		{#if tags.length > 0}
			<div class="flex flex-wrap gap-2">
				{#each tags as tag (tag)}
					<span class="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-[#404040]">#{tag}</span>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.devto-preview-prose :global(h1) {
		margin: 1rem 0 0.5rem;
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1.35;
	}

	.devto-preview-prose :global(h2) {
		margin: 0.875rem 0 0.375rem;
		font-size: 1.125rem;
		font-weight: 700;
		line-height: 1.35;
	}

	.devto-preview-prose :global(h3) {
		margin: 0.75rem 0 0.25rem;
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.35;
	}

	.devto-preview-prose :global(p) {
		margin: 0.5rem 0;
	}

	.devto-preview-prose :global(ul),
	.devto-preview-prose :global(ol) {
		margin: 0.5rem 0;
		padding-left: 1.25rem;
	}

	.devto-preview-prose :global(ul) {
		list-style-type: disc;
	}

	.devto-preview-prose :global(ol) {
		list-style-type: decimal;
	}

	.devto-preview-prose :global(li) {
		margin: 0.125rem 0;
	}

	.devto-preview-prose :global(a) {
		color: #3b49df;
		text-decoration: underline;
	}

	.devto-preview-prose :global(blockquote) {
		margin: 0.75rem 0;
		padding-left: 0.75rem;
		border-left: 3px solid #d4d4d4;
		color: #525252;
	}

	.devto-preview-prose :global(code) {
		border-radius: 0.25rem;
		background: #e5e5e5;
		padding: 0.125rem 0.25rem;
		font-size: 0.8125rem;
	}

	.devto-preview-prose :global(pre) {
		margin: 0.75rem 0;
		overflow-x: auto;
		border-radius: 0.375rem;
		background: #e5e5e5;
		padding: 0.75rem;
	}

	.devto-preview-prose :global(pre code) {
		background: transparent;
		padding: 0;
	}
</style>
