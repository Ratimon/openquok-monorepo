<script module lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
	import type { PublicPreviewThreadReplyViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

	/** Exported for parent components / language-service prop checking. */
	export type ThreadsPreviewProps = {
		channel: CreateSocialPostChannelViewModel;
		previewText: string;
		maximumCharacters?: number;
		mediaUrls?: string[];
		threadReplies?: PublicPreviewThreadReplyViewModel[];
		threadFinisher?: { enabled: boolean; message: string } | null;
		/** Optional subtitle under the name row (e.g. scheduled date). */
		previewMetaLabel?: string | null;
	};
</script>

<script lang="ts">
	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { IntegrationChannelPicture } from '$lib/ui/images';
	import ImageSlider from '$lib/ui/media-files/ImageSlider.svelte';
	import PreviewScheduledSocialReplies from '$lib/ui/components/preview/PreviewScheduledSocialReplies.svelte';
	import ThreadsReplyEngagementMock from './ThreadsReplyEngagementMock.svelte';

	let {
		channel,
		previewText,
		maximumCharacters = 500,
		mediaUrls = [],
		threadReplies = [],
		threadFinisher = null,
		previewMetaLabel = null
	}: ThreadsPreviewProps = $props();

	const cropped = $derived(previewText.slice(0, maximumCharacters));
	const overflow = $derived(previewText.slice(maximumCharacters));

	const handle = $derived((channel.name || '').trim() || 'username');
	const replyCount = $derived(threadReplies.length);
</script>

<div class="rounded-xl border border-base-300 bg-base-100 text-base-content overflow-hidden">
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
				<span class="h-10 w-10 rounded-full bg-base-200 flex items-center justify-center">
					<AbstractIcon name={icons.User1.name} class="size-5 text-base-content/60" width="20" height="20" />
				</span>
			{/if}

			<span class="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-base-100 ring-1 ring-base-300">
				<AbstractIcon name={icons.Threads.name} class="size-3.5 text-base-content" width="14" height="14" />
			</span>
		</div>

		<div class="min-w-0 flex-1">
			<div class="flex items-start justify-between gap-2">
				<div class="min-w-0 flex-1">
					<div class="flex flex-wrap items-center gap-x-2 gap-y-0.5">
						<span class="truncate text-[15px] font-bold leading-5 text-base-content">{channel.name}</span>
						<AbstractIcon
							name={icons.VerifiedBadge.name}
							class="size-[18px] shrink-0 text-sky-500"
							width="18"
							height="18"
						/>
						<span class="truncate text-[15px] text-base-content/50">{handle}</span>
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
					<p class="text-base-content/60">
						Start writing your post for a preview
					</p>
				{:else}
					<p class="whitespace-pre-wrap">
						<span>{cropped}</span>
						{#if overflow.length}
							<mark class="bg-red-500/15 text-base-content/90" title="This text will be cropped">{overflow}</mark>
						{/if}
					</p>
				{/if}
			</div>

			{#if mediaUrls.length > 0}
				<div class="mt-3 overflow-hidden rounded-lg border border-base-300">
					<ImageSlider class="aspect-[4/3] w-full" urls={mediaUrls} alt="" />
				</div>
			{/if}

			<ThreadsReplyEngagementMock class="mt-3" commentCount={replyCount} />
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
