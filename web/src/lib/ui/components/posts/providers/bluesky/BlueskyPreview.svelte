<script module lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
	import type { PublicPreviewThreadReplyViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

	export type BlueskyPreviewProps = {
		channel: CreateSocialPostChannelViewModel;
		previewText: string;
		maximumCharacters?: number;
		mediaUrls?: string[];
		mediaStoragePaths?: string[];
		threadReplies?: PublicPreviewThreadReplyViewModel[];
		threadFinisher?: { enabled: boolean; message: string } | null;
		previewMetaLabel?: string | null;
	};
</script>

<script lang="ts">
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import IntegrationChannelPicture from '$lib/ui/components/posts/IntegrationChannelPicture.svelte';
	import ImageSlider from '$lib/ui/media-files/ImageSlider.svelte';
	import PreviewScheduledSocialReplies from '$lib/ui/components/preview/PreviewScheduledSocialReplies.svelte';
	import { classifyBlueskyPreviewMediaMode } from '$lib/ui/components/posts/providers/bluesky/bluesky.provider';

	let {
		channel,
		previewText,
		maximumCharacters = 300,
		mediaUrls = [],
		mediaStoragePaths = [],
		threadReplies = [],
		threadFinisher = null,
		previewMetaLabel = null
	}: BlueskyPreviewProps = $props();

	const handle = $derived((channel.name || '').trim() || 'handle.bsky.social');
	const overLimit = $derived(previewText.length > maximumCharacters);

	/**
	 * Bluesky post layout (composer preview approximation).
	 * max-w 340px card · media 16:9 · photos letterbox (light bg) · videos cover.
	 */
	const mediaMode = $derived(classifyBlueskyPreviewMediaMode(mediaUrls, mediaStoragePaths));
	const isVideo = $derived(mediaMode === 'video');
	const sliderVariant = $derived<'default' | 'instagram'>(isVideo ? 'default' : 'instagram');
</script>

<!-- Layout: max-w-[340px] · aspect-video media — see layout comment above -->
<div class="mx-auto w-full max-w-[340px] overflow-hidden rounded-xl border border-base-300 bg-base-100 text-base-content">
	<div class="flex gap-3 p-4">
		<div class="relative h-10 w-10 shrink-0">
			{#if channel.picture?.trim()}
				<IntegrationChannelPicture
					profilePictureUrl={channel.picture}
					fallbackIcon={icons.User1.name}
					alt={channel.name}
					class="h-10 w-10 rounded-full bg-base-200 object-cover"
				/>
			{:else}
				<span class="flex h-10 w-10 items-center justify-center rounded-full bg-base-200">
					<AbstractIcon name={icons.User1.name} class="size-5 text-base-content/60" width="20" height="20" />
				</span>
			{/if}

			<span
				class="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-base-100 ring-1 ring-base-300"
			>
				<AbstractIcon name={icons.Bluesky.name} class="size-3.5" width="14" height="14" />
			</span>
		</div>

		<div class="min-w-0 flex-1">
			<div class="flex items-start justify-between gap-2">
				<div class="min-w-0 flex-1">
					<div class="flex flex-wrap items-center gap-x-2 gap-y-0.5">
						<span class="truncate text-[15px] font-bold leading-5">{channel.name}</span>
						<span class="truncate text-[15px] text-base-content/50">@{handle.replace(/^@/, '')}</span>
					</div>
					{#if previewMetaLabel?.trim()}
						<div class="mt-0.5 text-[13px] leading-4 text-base-content/45">
							{previewMetaLabel.trim()}
						</div>
					{/if}
				</div>
				<span class="inline-flex shrink-0 text-base-content/45" aria-hidden="true">
					<AbstractIcon name={icons.MoreHorizontal.name} class="size-5" width="20" height="20" />
				</span>
			</div>

			<div class="mt-1 text-[15px] leading-6">
				{#if previewText.length === 0}
					<p class="text-base-content/60">Start writing your post for a preview</p>
				{:else}
					<p class="whitespace-pre-wrap {overLimit ? 'text-error' : ''}">{previewText}</p>
					{#if overLimit}
						<p class="mt-1 text-xs text-error">
							{previewText.length}/{maximumCharacters} characters
						</p>
					{/if}
				{/if}
			</div>

			{#if mediaUrls.length > 0}
				<div class="mt-3 overflow-hidden rounded-2xl border border-base-300 bg-base-200">
					<div class="relative aspect-video w-full">
						<ImageSlider
							class="absolute inset-0 h-full w-full"
							urls={mediaUrls}
							storagePaths={mediaStoragePaths}
							alt=""
							variant={sliderVariant}
						/>
					</div>
				</div>
			{/if}
		</div>
	</div>

	{#if threadReplies.length > 0 || (threadFinisher?.enabled && (threadFinisher.message ?? '').trim())}
		<div class="px-4 pb-4">
			<PreviewScheduledSocialReplies
				replies={threadReplies}
				{threadFinisher}
				variant="threads"
				replyActor={{ displayName: channel.name, picture: channel.picture }}
				threadContinuesFromRoot={true}
			/>
		</div>
	{/if}
</div>
