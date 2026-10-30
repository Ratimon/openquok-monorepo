<script module lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';

	export type RedditPreviewProps = {
		channel: CreateSocialPostChannelViewModel;
		previewText: string;
		maximumCharacters?: number;
		mediaUrls?: string[];
		mediaStoragePaths?: string[];
		previewMetaLabel?: string | null;
		providerSettings?: Record<string, unknown>;
	};
</script>

<script lang="ts">
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import IntegrationChannelPicture from '$lib/ui/components/posts/IntegrationChannelPicture.svelte';
	import ImageSlider from '$lib/ui/media-files/ImageSlider.svelte';
	import { classifyComposerPreviewMediaMode } from '$lib/posts/utils/composer/mediaDrop';
	import { readRedditLaunchSettings } from '$lib/ui/components/posts/providers/reddit/reddit.provider';
	import { formatRedditCommunityInput } from '$lib/utils/normalizeSubredditInput';

	let {
		channel,
		previewText,
		maximumCharacters = 10000,
		mediaUrls = [],
		mediaStoragePaths = [],
		previewMetaLabel = null,
		providerSettings = {}
	}: RedditPreviewProps = $props();

	const settings = $derived(readRedditLaunchSettings(providerSettings));
	const cropped = $derived(previewText.slice(0, maximumCharacters));
	const overflow = $derived(previewText.slice(maximumCharacters));
	const timeLabel = $derived(previewMetaLabel?.trim() || 'Just now');
	const title = $derived(settings.title.trim() || 'Untitled post');
	const subredditLabel = $derived(
		formatRedditCommunityInput(settings.subreddit) || 'r/subreddit'
	);
	const mediaMode = $derived(classifyComposerPreviewMediaMode(mediaUrls, mediaStoragePaths));
	const isVideo = $derived(mediaMode === 'video');
	const sliderVariant = $derived<'default' | 'letterbox-dark'>(isVideo ? 'default' : 'letterbox-dark');
</script>

<!-- Reddit submit preview: light card readable on dark composer chrome -->
<div
	class="mx-auto w-full max-w-[340px] overflow-hidden rounded-md border border-[#343536] bg-[#1A1A1B] text-[#D7DADC]"
>
	<div class="flex items-center gap-2 border-b border-[#343536] px-3 py-2 text-xs text-[#818384]">
		<span class="font-semibold text-[#D7DADC]">Create post</span>
		<span class="text-[#818384]">in {subredditLabel}</span>
	</div>

	<div class="flex items-start gap-3 p-3">
		<IntegrationChannelPicture
			profilePictureUrl={channel.picture}
			fallbackIcon={icons.Reddit.name}
			alt={channel.name}
			class="h-8 w-8 shrink-0 rounded-full bg-[#272729] object-cover"
		/>
		<div class="min-w-0 flex-1 space-y-2">
			<div class="flex items-center gap-2 text-xs text-[#818384]">
				<span class="font-medium text-[#D7DADC]">{channel.name || 'Reddit'}</span>
				<span>· {timeLabel}</span>
			</div>

			<h3 class="text-base font-medium leading-snug text-[#D7DADC]">{title}</h3>

			{#if cropped.length > 0}
				<div class="whitespace-pre-wrap text-sm leading-6 text-[#D7DADC]">
					{cropped}{#if overflow.length > 0}<mark class="bg-error/70 text-error-content">{overflow}</mark>{/if}
				</div>
			{:else}
				<p class="text-sm text-[#818384]">Post body appears here.</p>
			{/if}
		</div>
	</div>

	{#if mediaUrls.length > 0}
		<div class="overflow-hidden border-t border-[#343536] bg-black">
			<div class="relative aspect-[4/3] w-full">
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

	<div class="border-t border-[#343536] px-3 py-2">
		<p class="text-[10px] leading-snug text-[#818384]">
			<AbstractIcon name={icons.Reddit.name} class="mr-1 inline size-3" width="12" height="12" />
			At publish time you complete the submit form on reddit.com — OpenQuok autofills; you click Post.
		</p>
	</div>
</div>
