<script lang="ts">
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import IntegrationChannelPicture from '$lib/ui/components/posts/IntegrationChannelPicture.svelte';
	import ImageSlider from '$lib/ui/media-files/ImageSlider.svelte';
	import PreviewScheduledSocialReplies from '$lib/ui/components/preview/PreviewScheduledSocialReplies.svelte';
	import { classifyComposerPreviewMediaMode } from '$lib/posts/utils/composer/mediaDrop';
	import { readFacebookLaunchSettings } from '$lib/ui/components/posts/providers/facebook/facebook.provider';

	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
	import type { PublicPreviewThreadReplyViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

	export type FacebookPreviewProps = {
		channel: CreateSocialPostChannelViewModel;
		previewText: string;
		maximumCharacters?: number;
		mediaUrls?: string[];
		mediaStoragePaths?: string[];
		threadReplies?: PublicPreviewThreadReplyViewModel[];
		threadFinisher?: { enabled: boolean; message: string } | null;
		/** When set (e.g. scheduled publish time), replaces the default "Just now" label. */
		previewMetaLabel?: string | null;
		providerSettings?: Record<string, unknown>;
	};

	let {
		channel,
		previewText,
		maximumCharacters = 63_206,
		mediaUrls = [],
		mediaStoragePaths = [],
		threadReplies = [],
		threadFinisher = null,
		previewMetaLabel = null,
		providerSettings = {}
	}: FacebookPreviewProps = $props();

	const settings = $derived(readFacebookLaunchSettings(providerSettings));
	const isStory = $derived(settings.postType === 'story');
	const linkUrl = $derived(isStory ? '' : settings.url?.trim() || '');
	const linkHost = $derived(formatLinkHost(linkUrl));
	const timeLabel = $derived(previewMetaLabel?.trim() || 'Just now');
	const cropped = $derived(previewText.slice(0, maximumCharacters));
	const overflow = $derived(previewText.slice(maximumCharacters));
	const isCarousel = $derived(mediaUrls.length > 1);

	/**
	 * Facebook Page feed / Story layout (composer preview approximation).
	 * Feed: max-w 340px · media 1.91:1 · photos letterbox (dark) · videos cover.
	 * Story: max-w 292px · media 9:16 · photos letterbox (black) · videos cover.
	 */
	const mediaAspectClass = $derived(isStory ? 'aspect-[9/16]' : 'aspect-[1.91/1]');
	const frameMaxWidthClass = $derived(isStory ? 'max-w-[292px]' : 'max-w-[340px]');
	const mediaMode = $derived(classifyComposerPreviewMediaMode(mediaUrls, mediaStoragePaths));
	const isVideo = $derived(mediaMode === 'video');
	const sliderVariant = $derived<'default' | 'instagram-story' | 'letterbox-dark'>(
		isVideo ? 'default' : isStory ? 'instagram-story' : 'letterbox-dark'
	);

	function formatLinkHost(url: string): string {
		if (!url) return '';
		try {
			const parsed = new URL(url);
			return parsed.hostname.replace(/^www\./, '');
		} catch {
			return url.length > 40 ? `${url.slice(0, 37)}…` : url;
		}
	}
</script>

{#if isStory}
	<!-- Layout: story branch — max-w-[292px] · aspect-[9/16] -->
	<div class="mx-auto w-full {frameMaxWidthClass} overflow-hidden rounded-xl border border-base-300 bg-[#242526] text-[#E4E6EB]">
		<div class="flex items-center gap-3 px-4 py-3">
			<IntegrationChannelPicture
				profilePictureUrl={channel.picture}
				fallbackIcon={icons.FacebookGlyph.name}
				alt={channel.name}
				class="h-9 w-9 shrink-0 rounded-full bg-base-200 object-cover"
			/>
			<div class="min-w-0 flex-1">
				<div class="truncate text-sm font-semibold leading-4">{channel.name || 'Page name'}</div>
				<div class="flex flex-wrap items-center gap-2 text-[11px] text-[#B0B3B8]">
					<span>{timeLabel}</span>
					<span
						class="rounded-full bg-[#3A3B3C] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#E4E6EB]"
					>
						Story
					</span>
				</div>
			</div>
		</div>

		{#if mediaUrls.length > 0}
			<div class="overflow-hidden bg-[#18191A]">
				<div class="relative w-full {mediaAspectClass}">
					<ImageSlider
						class="absolute inset-0 h-full w-full"
						urls={mediaUrls}
						storagePaths={mediaStoragePaths}
						showSlideCounter={isCarousel}
						variant={sliderVariant}
					/>
				</div>
			</div>
		{:else}
			<div class="{mediaAspectClass} w-full bg-[#18191A]"></div>
		{/if}

		{#if cropped.length > 0}
			<div class="whitespace-pre-wrap px-4 py-3 text-sm leading-5 text-[#E4E6EB]/90">
				{cropped}{#if overflow.length > 0}<mark class="bg-error/70 text-error-content">{overflow}</mark>{/if}
			</div>
		{/if}
	</div>
{:else}
	<!-- Layout: feed branch — max-w-[340px] · aspect-[1.91/1] -->
	<div class="mx-auto w-full {frameMaxWidthClass} overflow-hidden rounded-xl border border-base-300 bg-[#242526] text-[#E4E6EB]">
		<div class="flex gap-3 p-4">
			<IntegrationChannelPicture
				profilePictureUrl={channel.picture}
				fallbackIcon={icons.FacebookGlyph.name}
				alt={channel.name}
				class="h-10 w-10 shrink-0 rounded-full bg-base-200 object-cover"
			/>
			<div class="min-w-0 flex-1">
				<div class="truncate text-[15px] font-semibold leading-5">{channel.name || 'Page name'}</div>
				<div class="flex items-center gap-1 text-xs text-[#B0B3B8]">
					<span>{timeLabel}</span>
					<span aria-hidden="true">·</span>
					<AbstractIcon name={icons.Globe.name} class="size-3" width="12" height="12" />
				</div>
			</div>
		</div>

		{#if cropped.length > 0}
			<div class="whitespace-pre-wrap px-4 pb-3 text-[15px] leading-5">
				{cropped}{#if overflow.length > 0}<mark class="bg-error/70 text-error-content">{overflow}</mark>{/if}
			</div>
		{/if}

		{#if linkUrl}
			<div class="mx-4 mb-3 flex items-center gap-2 rounded-lg border border-[#3E4042] bg-[#3A3B3C] px-3 py-2 text-sm text-[#E4E6EB]">
				<AbstractIcon name={icons.Link.name} class="size-4 shrink-0 text-[#B0B3B8]" width="16" height="16" />
				<span class="min-w-0 truncate">{linkHost || linkUrl}</span>
			</div>
		{/if}

		{#if mediaUrls.length > 0}
			<div class="overflow-hidden border-y border-[#3E4042] bg-[#18191A]">
				<div class="relative w-full {mediaAspectClass}">
					<ImageSlider
						class="absolute inset-0 h-full w-full"
						urls={mediaUrls}
						storagePaths={mediaStoragePaths}
						showSlideCounter={mediaUrls.length > 1}
						variant={sliderVariant}
					/>
				</div>
			</div>
		{/if}

		<div class="flex items-center justify-between px-4 py-2 text-xs text-[#B0B3B8]">
			<span>You and 12 others</span>
			<span>20 comments</span>
		</div>

		<div class="grid grid-cols-3 gap-1 border-t border-[#3E4042] px-2 py-1 text-sm font-semibold text-[#B0B3B8]">
			<div class="flex items-center justify-center gap-2 rounded-md py-2 hover:bg-[#3A3B3C]">Like</div>
			<div class="flex items-center justify-center gap-2 rounded-md py-2 hover:bg-[#3A3B3C]">Comment</div>
			<div class="flex items-center justify-center gap-2 rounded-md py-2 hover:bg-[#3A3B3C]">Share</div>
		</div>

		<div class="px-4 pb-4">
			<PreviewScheduledSocialReplies replies={threadReplies} {threadFinisher} variant="general" />
		</div>
	</div>
{/if}
