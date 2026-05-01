<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
	import type { PublicPreviewThreadReplyViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import IntegrationChannelPicture from '$lib/ui/components/posts/IntegrationChannelPicture.svelte';
	import VideoOrImage from '$lib/ui/media-files/VideoOrImage.svelte';
	import PreviewScheduledSocialReplies from '$lib/ui/components/preview/PreviewScheduledSocialReplies.svelte';

	type Props = {
		previewText: string;
		maximumCharacters?: number;
		channel?: CreateSocialPostChannelViewModel | null;
		title?: string;
		showVerified?: boolean;
		mediaUrls?: string[];
		threadReplies?: PublicPreviewThreadReplyViewModel[];
		threadFinisher?: { enabled: boolean; message: string } | null;
	};

	let {
		previewText,
		maximumCharacters = 10000,
		channel = null,
		title = 'Global Edit',
		showVerified = true,
		mediaUrls = [],
		threadReplies = [],
		threadFinisher = null
	}: Props = $props();

	const cropped = $derived(previewText.slice(0, maximumCharacters));
	const overflow = $derived(previewText.slice(maximumCharacters));
	const firstMediaUrl = $derived((mediaUrls?.[0] ?? '').trim());
</script>

<div class="w-full p-4 sm:p-6">
	<div class="w-full h-full relative flex flex-col">
		<div class="flex gap-3 relative pb-3">
			<div class="min-w-10 h-10 min-h-10 w-10 flex flex-col items-center">
				<div class="relative">
					{#if channel?.picture?.trim()}
						<span class="relative z-[2] block h-10 w-10 overflow-hidden rounded-full">
							<IntegrationChannelPicture
								profilePictureUrl={channel.picture}
								fallbackIcon={icons.User1.name}
								alt={channel.name}
								class="h-full w-full object-cover"
							/>
						</span>
					{:else}
						<span class="h-10 w-10 rounded-full relative z-[2] bg-base-200 flex items-center justify-center">
							<AbstractIcon
								name={icons.User1.name}
								class="size-6 text-base-content/60"
								width="24"
								height="24"
							/>
						</span>
					{/if}
				</div>
			</div>

			<div class="flex-1 flex flex-col gap-1">
				<div class="flex items-center gap-2">
					<div class="h-[22px] text-[15px] font-bold text-base-content">
						{channel ? channel.name : title}
					</div>
					{#if showVerified}
						<AbstractIcon
							name={icons.VerifiedBadge.name}
							class="size-5 text-sky-500"
							width="20"
							height="20"
						/>
					{/if}
				</div>

				{#if previewText.length === 0}
					<p class="text-sm text-base-content/50">
						Start writing your post for a preview</p>
				{:else}
					<p class="text-sm whitespace-pre-wrap text-base-content/90">
						<span>{cropped}</span>
						{#if overflow.length}
							<mark class="bg-red-500/25 text-base-content/90" title="This text will be cropped"
								>{overflow}</mark
							>
						{/if}
					</p>
				{/if}
			</div>
		</div>
		{#if mediaUrls.length > 0}
			<div class="mt-3 w-full overflow-hidden rounded-lg border border-base-300/80">
				<div class="aspect-[16/9] w-full bg-base-200">
					<VideoOrImage src={firstMediaUrl} autoplay={true} isContain={true} />
				</div>
			</div>
		{/if}

		<PreviewScheduledSocialReplies replies={threadReplies} {threadFinisher} variant="general" />
	</div>
</div>

