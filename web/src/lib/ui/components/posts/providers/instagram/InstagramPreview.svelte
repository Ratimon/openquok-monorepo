<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
	import type { PublicPreviewThreadReplyViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import IntegrationChannelPicture from '$lib/ui/components/posts/IntegrationChannelPicture.svelte';
	import ImageSlider from '$lib/ui/media-files/ImageSlider.svelte';
	import PreviewScheduledSocialReplies from '$lib/ui/components/preview/PreviewScheduledSocialReplies.svelte';
	import { readInstagramLaunchSettings } from '$lib/ui/components/posts/providers/instagram/instagram.provider';

	type Props = {
		channel: CreateSocialPostChannelViewModel;
		previewText: string;
		maximumCharacters?: number;
		mediaUrls?: string[];
		threadReplies?: PublicPreviewThreadReplyViewModel[];
		threadFinisher?: { enabled: boolean; message: string } | null;
		providerSettings?: Record<string, unknown>;
	};

	let {
		channel,
		previewText,
		maximumCharacters = 2200,
		mediaUrls = [],
		threadReplies = [],
		threadFinisher = null,
		providerSettings = {}
	}: Props = $props();

	const identifier = $derived((channel.identifier ?? '').toLowerCase());
	const isInstagram = $derived(identifier.startsWith('instagram'));
	const settings = $derived(readInstagramLaunchSettings(providerSettings));
	const isStory = $derived(settings.postType === 'story');

	const cropped = $derived(previewText.slice(0, maximumCharacters));
	const overflow = $derived(previewText.slice(maximumCharacters));
	const isCarousel = $derived(mediaUrls.length > 1);
	const mediaAspectClass = $derived(isStory ? 'aspect-[9/16]' : 'aspect-[4/5]');
</script>

<div class="bg-base-100 text-base-content rounded-xl border border-base-300 overflow-hidden">
	<div class="flex items-center gap-3 px-4 py-3">
		{#if channel.picture?.trim()}
			<span class="block h-9 w-9 shrink-0 overflow-hidden rounded-full bg-base-200">
				<IntegrationChannelPicture
					profilePictureUrl={channel.picture}
					fallbackIcon={icons.User1.name}
					alt={channel.name}
					class="h-full w-full object-cover"
				/>
			</span>
		{:else}
			<img
				src="/no-picture.jpg"
				alt={channel.name}
				class="h-9 w-9 shrink-0 rounded-full bg-base-200 object-cover"
			/>
		{/if}
		<div class="min-w-0 flex-1">
			<div class="truncate text-sm font-semibold leading-4">
				{channel.name}</div>
			<div class="flex flex-wrap items-center gap-2 text-[11px] text-base-content/60">
				<span>{isInstagram ? 'Instagram' : channel.identifier}</span>
				{#if isStory}
					<span class="rounded-full bg-base-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-base-content/80">
						Story
					</span>
				{/if}
			</div>
		</div>
	</div>

	{#if mediaUrls.length > 0}
		<div class="overflow-hidden bg-base-200">
			<ImageSlider
				class="{mediaAspectClass} w-full"
				urls={mediaUrls}
				alt=""
				showSlideCounter={isCarousel}
			/>
		</div>
	{:else}
		<div class="{mediaAspectClass} w-full bg-base-200"></div>
	{/if}

	{#if !isStory}
	<div class="px-4 pt-3">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-4">
				<AbstractIcon name={icons.InstagramActionHeart.name} class="size-6" width="24" height="24" />
				<AbstractIcon name={icons.InstagramActionComment.name} class="size-6" width="24" height="24" />
				<AbstractIcon name={icons.InstagramActionShare.name} class="size-6" width="24" height="24" />
			</div>

			<AbstractIcon name={icons.InstagramActionBookmark.name} class="size-6" width="24" height="24" />
		</div>

		<!-- <div class="mt-2 flex items-center gap-4 text-sm font-semibold text-white/90">
			<div class="flex items-center gap-2">
				<span>121</span>
			</div>
			<div class="flex items-center gap-2">
				<span>32</span>
			</div>
		</div> -->
	</div>

	<div class="px-4 py-3 text-sm leading-5">
		{#if previewText.length === 0}
			<p class="text-base-content/60">
				Start writing your post for a preview</p>
		{:else}
			<p class="whitespace-pre-wrap">
				<strong class="font-semibold">{channel.name} </strong>
				<span>{cropped}</span>
				{#if overflow.length}
					<mark class="bg-red-500/25 text-base-content/90" title="This text will be cropped">{overflow}</mark>
				{/if}
			</p>
		{/if}

		<PreviewScheduledSocialReplies replies={threadReplies} {threadFinisher} variant="instagram" />
	</div>
	{:else}
		<div class="px-4 py-3 text-sm leading-5">
			{#if previewText.length > 0}
				<p class="whitespace-pre-wrap text-base-content/80">
					<span>{cropped}</span>
					{#if overflow.length}
						<mark class="bg-red-500/25 text-base-content/90" title="This text will be cropped">{overflow}</mark>
					{/if}
				</p>
			{/if}
		</div>
	{/if}
</div>
