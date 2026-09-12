<script module lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
	import type { PublicPreviewThreadReplyViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

	export type YoutubePreviewProps = {
		channel: CreateSocialPostChannelViewModel;
		previewText: string;
		maximumCharacters?: number;
		mediaUrls?: string[];
		mediaStoragePaths?: string[];
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
	import VideoOrImage from '$lib/ui/media-files/VideoOrImage.svelte';
	import PreviewScheduledSocialReplies from '$lib/ui/components/preview/PreviewScheduledSocialReplies.svelte';
	import { readYoutubeLaunchSettings } from '$lib/ui/components/posts/providers/youtube/youtube.provider';

	let {
		channel,
		previewText,
		maximumCharacters = 5000,
		mediaUrls = [],
		mediaStoragePaths = [],
		threadReplies = [],
		threadFinisher = null,
		previewMetaLabel = null,
		providerSettings = {}
	}: YoutubePreviewProps = $props();

	const settings = $derived(readYoutubeLaunchSettings(providerSettings));
	const cropped = $derived(previewText.slice(0, maximumCharacters));
	const overflow = $derived(previewText.slice(maximumCharacters));
	const timeLabel = $derived(previewMetaLabel?.trim() || 'Just now');
	const primaryVideo = $derived(mediaUrls[0] ?? '');
	const primaryStoragePath = $derived(mediaStoragePaths[0] ?? '');
	const title = $derived(settings.title.trim() || 'Video title');
	const posterUrl = $derived(resolveThumbnailUrl(settings.thumbnail?.path));

	/** YouTube watch layout: max-w 340px · player 16:9 contain · title + channel row below. */

	function resolveThumbnailUrl(path: string | undefined): string {
		const trimmed = path?.trim();
		if (!trimmed) return '';
		if (trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
			return trimmed;
		}
		return publicUrlForMediaStorageKey(trimmed) ?? '';
	}
</script>

<!-- Layout: max-w-[340px] · aspect-video player — see layout comment above -->
<div class="mx-auto w-full max-w-[340px] overflow-hidden rounded-xl border border-base-300 bg-[#0f0f0f] text-[#f1f1f1]">
	<div class="relative aspect-video bg-black">
		{#if primaryVideo}
			<div class="absolute inset-0 flex items-center justify-center">
				<VideoOrImage
					src={primaryVideo}
					storagePath={primaryStoragePath}
					autoplay={true}
					fit="contain"
					videoClass="max-h-full max-w-full"
					imageClass="max-h-full max-w-full"
				/>
			</div>
		{:else if posterUrl}
			<img src={posterUrl} alt="" class="h-full w-full object-contain" />
		{:else}
			<div class="flex h-full w-full items-center justify-center text-sm text-[#aaaaaa]">
				Attach an MP4 video to preview
			</div>
		{/if}
	</div>

	<div class="space-y-3 p-4">
		<h3 class="text-base font-semibold leading-snug">{title}</h3>

		<div class="flex items-start gap-3">
			<IntegrationChannelPicture
				profilePictureUrl={channel.picture}
				fallbackIcon={icons.YouTube.name}
				alt={channel.name}
				class="h-10 w-10 shrink-0 rounded-full bg-base-200 object-cover"
			/>
			<div class="min-w-0 flex-1">
				<div class="truncate text-sm font-semibold">{channel.name || 'Channel name'}</div>
				<div class="text-xs text-[#aaaaaa]">{timeLabel}</div>
			</div>
			<span class="shrink-0">
				<AbstractIcon name={icons.YouTube.name} class="size-5 text-[#ff0000]" width="20" height="20" />
			</span>
		</div>

		{#if cropped.length > 0}
			<div class="whitespace-pre-wrap text-sm leading-5 text-[#f1f1f1]">
				{cropped}{#if overflow.length > 0}<mark class="bg-error/70 text-error-content">{overflow}</mark>{/if}
			</div>
		{:else}
			<p class="text-sm text-[#aaaaaa]">Description appears here.</p>
		{/if}
	</div>

	<div class="px-4 pb-4">
		<PreviewScheduledSocialReplies replies={threadReplies} {threadFinisher} variant="general" />
	</div>
</div>
