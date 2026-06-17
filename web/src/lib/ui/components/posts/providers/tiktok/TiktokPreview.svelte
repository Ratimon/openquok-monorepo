<script module lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
	import type { PublicPreviewThreadReplyViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

	export type TiktokPreviewProps = {
		channel: CreateSocialPostChannelViewModel;
		previewText: string;
		maximumCharacters?: number;
		mediaUrls?: string[];
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

	let {
		channel,
		previewText,
		maximumCharacters = 2000,
		mediaUrls = [],
		threadReplies = [],
		threadFinisher = null,
		previewMetaLabel = null
	}: TiktokPreviewProps = $props();

	const cropped = $derived(previewText.slice(0, maximumCharacters));
	const overflow = $derived(previewText.slice(maximumCharacters));
	const handle = $derived((channel.name || '').trim() || '@username');
	const isCarousel = $derived(mediaUrls.length > 1);
	const timeLabel = $derived(previewMetaLabel?.trim() || 'Just now');
</script>

<div class="overflow-hidden rounded-xl border border-base-300 bg-black text-white">
	<div class="relative aspect-[9/16] w-full bg-[#111]">
		{#if mediaUrls.length > 0}
			<ImageSlider class="h-full w-full" urls={mediaUrls} alt="" showSlideCounter={isCarousel} />
		{:else}
			<div class="flex h-full w-full items-center justify-center px-6 text-center text-sm text-white/50">
				Attach a video or images to preview
			</div>
		{/if}

		<div
			class="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-3 pb-3 pt-16"
		>
			<div class="flex items-end gap-3">
				<div class="min-w-0 flex-1 space-y-1">
					<div class="truncate text-sm font-semibold">{handle}</div>
					<div class="text-[11px] text-white/55">{timeLabel}</div>
					{#if cropped.length > 0}
						<p class="line-clamp-3 whitespace-pre-wrap text-sm leading-5 text-white/90">
							{cropped}{#if overflow.length > 0}<mark class="bg-error/70 text-error-content">{overflow}</mark>{/if}
						</p>
					{:else}
						<p class="text-sm text-white/50">Caption appears here.</p>
					{/if}
				</div>

				<div class="flex shrink-0 flex-col items-center gap-4 pb-1 text-white/90" aria-hidden="true">
					<IntegrationChannelPicture
						profilePictureUrl={channel.picture}
						fallbackIcon={icons.User1.name}
						alt={channel.name}
						class="h-10 w-10 rounded-full border border-white/20 bg-base-200 object-cover"
					/>
					<span class="flex flex-col items-center gap-1">
						<AbstractIcon name={icons.InstagramActionHeart.name} class="size-6" width="24" height="24" />
						<span class="text-[10px]">0</span>
					</span>
					<span class="flex flex-col items-center gap-1">
						<AbstractIcon name={icons.InstagramActionComment.name} class="size-6" width="24" height="24" />
						<span class="text-[10px]">0</span>
					</span>
					<span class="flex flex-col items-center gap-1">
						<AbstractIcon name={icons.Share2.name} class="size-6" width="24" height="24" />
						<span class="text-[10px]">Share</span>
					</span>
				</div>
			</div>
		</div>

		<span class="pointer-events-none absolute top-3 right-3">
			<AbstractIcon name={icons.TikTok.name} class="size-5 text-white" width="20" height="20" />
		</span>
	</div>

	{#if threadReplies.length > 0 || (threadFinisher?.enabled && (threadFinisher.message ?? '').trim())}
		<div class="bg-base-100 px-4 py-4 text-base-content">
			<PreviewScheduledSocialReplies replies={threadReplies} {threadFinisher} variant="general" />
		</div>
	{/if}
</div>
