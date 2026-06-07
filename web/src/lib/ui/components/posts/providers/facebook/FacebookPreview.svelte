<script module lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
	import type { PublicPreviewThreadReplyViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

	export type FacebookPreviewProps = {
		channel: CreateSocialPostChannelViewModel;
		previewText: string;
		maximumCharacters?: number;
		mediaUrls?: string[];
		threadReplies?: PublicPreviewThreadReplyViewModel[];
		threadFinisher?: { enabled: boolean; message: string } | null;
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
		maximumCharacters = 63_206,
		mediaUrls = [],
		threadReplies = [],
		threadFinisher = null
	}: FacebookPreviewProps = $props();

	const cropped = $derived(previewText.slice(0, maximumCharacters));
	const overflow = $derived(previewText.slice(maximumCharacters));
</script>

<div class="overflow-hidden rounded-xl border border-base-300 bg-[#242526] text-[#E4E6EB]">
	<div class="flex gap-3 p-4">
		<IntegrationChannelPicture
			profilePictureUrl={channel.picture}
			fallbackIcon={icons.Facebook.name}
			alt={channel.name}
			class="h-10 w-10 shrink-0 rounded-full bg-base-200 object-cover"
		/>
		<div class="min-w-0 flex-1">
			<div class="truncate text-[15px] font-semibold leading-5">{channel.name || 'Page name'}</div>
			<div class="flex items-center gap-1 text-xs text-[#B0B3B8]">
				<span>Just now</span>
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

	{#if mediaUrls.length > 0}
		<div class="aspect-[1.91/1] border-y border-[#3E4042]">
			<ImageSlider class="h-full w-full" urls={mediaUrls} showSlideCounter={mediaUrls.length > 1} />
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
