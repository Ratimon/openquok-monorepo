<script module lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
	import type { PublicPreviewThreadReplyViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

	export type TiktokPreviewProps = {
		channel: CreateSocialPostChannelViewModel;
		previewText: string;
		maximumCharacters?: number;
		mediaUrls?: string[];
		/** Storage paths for composer items (used when preview URLs are extension-less `blob:`). */
		mediaStoragePaths?: string[];
		threadReplies?: PublicPreviewThreadReplyViewModel[];
		threadFinisher?: { enabled: boolean; message: string } | null;
		previewMetaLabel?: string | null;
		providerSettings?: Record<string, unknown>;
	};
</script>

<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import IntegrationChannelPicture from '$lib/ui/components/posts/IntegrationChannelPicture.svelte';
	import ImageSlider from '$lib/ui/media-files/ImageSlider.svelte';
	import PreviewScheduledSocialReplies from '$lib/ui/components/preview/PreviewScheduledSocialReplies.svelte';
	import {
		classifyTiktokPreviewMediaMode,
		readTiktokLaunchSettings
	} from '$lib/ui/components/posts/providers/tiktok/tiktok.provider';

	let {
		channel,
		previewText,
		maximumCharacters = 2000,
		mediaUrls = [],
		mediaStoragePaths = [],
		threadReplies = [],
		threadFinisher = null,
		previewMetaLabel = null,
		providerSettings = {}
	}: TiktokPreviewProps = $props();

	const settings = $derived(readTiktokLaunchSettings(providerSettings));
	const cropped = $derived(previewText.slice(0, maximumCharacters));
	const overflow = $derived(previewText.slice(maximumCharacters));
	const handle = $derived((channel.name || '').trim() || '@username');
	const isCarousel = $derived(mediaUrls.length > 1);
	const timeLabel = $derived(previewMetaLabel?.trim() || 'Just now');

	/**
	 * TikTok For You layout (composer preview approximation).
	 * max-w 292px phone frame · media 9:16 · photo carousels letterbox (black) · videos cover.
	 */
	const mediaMode = $derived(classifyTiktokPreviewMediaMode(mediaUrls, mediaStoragePaths));
	const isPhotoPost = $derived(mediaMode === 'photo');
	const photoTitle = $derived(isPhotoPost ? settings.title.trim() : '');
	const sliderVariant = $derived<'default' | 'tiktok'>(isPhotoPost ? 'tiktok' : 'default');
</script>

<!-- Layout: max-w-[292px] · aspect-[9/16] — see mediaMode comment above -->
<div class="mx-auto w-full max-w-[292px] text-white">
	<div class="overflow-hidden rounded-2xl border border-base-300 bg-black shadow-lg">
		<div class="relative aspect-[9/16] w-full bg-black">
			{#if mediaUrls.length > 0}
				<ImageSlider
					class="h-full w-full"
					urls={mediaUrls}
					storagePaths={mediaStoragePaths}
					alt=""
					showSlideCounter={isCarousel}
					variant={sliderVariant}
				/>
			{:else}
				<div class="flex h-full w-full items-center justify-center px-6 text-center text-sm text-white/50">
					Attach a video or images to preview
				</div>
			{/if}

			<div
				class="pointer-events-none absolute inset-x-0 top-0 z-[3] bg-gradient-to-b from-black/70 via-black/25 to-transparent px-4 pt-2.5 pb-10"
				aria-hidden="true"
			>
				<div class="flex items-center justify-center gap-5 text-[11px] font-semibold tracking-wide">
					<span class="text-white/55">Following</span>
					<span class="border-b border-white pb-0.5 text-white">For You</span>
				</div>
			</div>

			{#if isPhotoPost}
				<div
					class="pointer-events-none absolute bottom-[7.25rem] left-3 z-[3] flex items-center gap-1.5 rounded-md bg-black/45 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm"
					aria-hidden="true"
				>
					<AbstractIcon name={icons.Images.name} class="size-3.5" width="14" height="14" />
					Photo
				</div>
			{/if}

			<div
				class="pointer-events-none absolute right-2 bottom-24 z-[3] flex flex-col items-center gap-4 text-white/95"
				aria-hidden="true"
			>
				<IntegrationChannelPicture
					profilePictureUrl={channel.picture}
					fallbackIcon={icons.User1.name}
					alt={channel.name}
					class="h-10 w-10 rounded-full border border-white/25 bg-base-200 object-cover"
				/>
				<span class="flex flex-col items-center gap-0.5">
					<AbstractIcon name={icons.InstagramActionHeart.name} class="size-6" width="24" height="24" />
					<span class="text-[10px] font-medium">0</span>
				</span>
				<span class="flex flex-col items-center gap-0.5">
					<AbstractIcon name={icons.InstagramActionComment.name} class="size-6" width="24" height="24" />
					<span class="text-[10px] font-medium">0</span>
				</span>
				<span class="flex flex-col items-center gap-0.5">
					<AbstractIcon name={icons.Share2.name} class="size-6" width="24" height="24" />
					<span class="text-[10px] font-medium">Share</span>
				</span>
			</div>

			<div
				class="pointer-events-none absolute inset-x-0 bottom-0 z-[3] bg-gradient-to-t from-black/90 via-black/55 to-transparent px-3 pr-16 pb-3 pt-20"
			>
				<div class="min-w-0 space-y-1">
					<div class="truncate text-sm font-semibold">{handle}</div>
					<div class="text-[11px] text-white/55">{timeLabel}</div>
					{#if photoTitle}
						<p class="line-clamp-2 text-sm font-semibold leading-5 text-white">{photoTitle}</p>
					{/if}
					{#if cropped.length > 0}
						<p class="line-clamp-3 whitespace-pre-wrap text-sm leading-5 text-white/90">
							{cropped}{#if overflow.length > 0}<mark class="bg-error/70 text-error-content">{overflow}</mark>{/if}
						</p>
					{:else}
						<p class="text-sm text-white/50">Caption appears here.</p>
					{/if}
				</div>
			</div>

			{#if !isCarousel}
				<span class="pointer-events-none absolute top-3 right-3 z-[3]" aria-hidden="true">
					<AbstractIcon name={icons.TikTok.name} class="size-5 text-white" width="20" height="20" />
				</span>
			{/if}
		</div>
	</div>

	{#if threadReplies.length > 0 || (threadFinisher?.enabled && (threadFinisher.message ?? '').trim())}
		<div class="mt-4 rounded-xl border border-base-300 bg-base-100 px-4 py-4 text-base-content">
			<PreviewScheduledSocialReplies replies={threadReplies} {threadFinisher} variant="general" />
		</div>
	{/if}
</div>
