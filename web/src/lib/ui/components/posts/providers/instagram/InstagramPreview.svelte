<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
	import type { PublicPreviewThreadReplyViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import IntegrationChannelPicture from '$lib/ui/components/posts/IntegrationChannelPicture.svelte';
	import VideoOrImage from '$lib/ui/media-files/VideoOrImage.svelte';
	import PreviewScheduledSocialReplies from '$lib/ui/components/preview/PreviewScheduledSocialReplies.svelte';

	type Props = {
		channel: CreateSocialPostChannelViewModel;
		previewText: string;
		maximumCharacters?: number;
		mediaUrls?: string[];
		threadReplies?: PublicPreviewThreadReplyViewModel[];
		threadFinisher?: { enabled: boolean; message: string } | null;
	};

	let {
		channel,
		previewText,
		maximumCharacters = 2200,
		mediaUrls = [],
		threadReplies = [],
		threadFinisher = null
	}: Props = $props();

	const identifier = $derived((channel.identifier ?? '').toLowerCase());
	const isInstagram = $derived(identifier.startsWith('instagram'));

	const cropped = $derived(previewText.slice(0, maximumCharacters));
	const overflow = $derived(previewText.slice(maximumCharacters));
	const firstMediaUrl = $derived((mediaUrls?.[0] ?? '').trim());
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
		<div class="min-w-0">
			<div class="truncate text-sm font-semibold leading-4">{channel.name}</div>
			<div class="text-[11px] text-base-content/60">{isInstagram ? 'Instagram' : channel.identifier}</div>
		</div>
	</div>

	{#if mediaUrls.length > 0}
		<div class="w-full aspect-[16/9] overflow-hidden bg-base-200">
			<VideoOrImage src={firstMediaUrl} autoplay={true} isContain={true} />
		</div>
	{:else}
		<div class="aspect-[16/9] w-full bg-base-200"></div>
	{/if}

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
			<p class="text-base-content/60">Start writing your post for a preview</p>
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
</div>
