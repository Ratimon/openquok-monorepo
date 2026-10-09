<script module lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
	import type { PublicPreviewThreadReplyViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

	export type SkoolPreviewProps = {
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
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import IntegrationChannelPicture from '$lib/ui/components/posts/IntegrationChannelPicture.svelte';
	import ImageSlider from '$lib/ui/media-files/ImageSlider.svelte';
	import PreviewScheduledSocialReplies from '$lib/ui/components/preview/PreviewScheduledSocialReplies.svelte';
	import { classifyComposerPreviewMediaMode } from '$lib/posts/utils/composer/mediaDrop';
	import { readSkoolLaunchSettings } from '$lib/ui/components/posts/providers/skool/skool.provider';

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
	}: SkoolPreviewProps = $props();

	const settings = $derived(readSkoolLaunchSettings(providerSettings));
	const cropped = $derived(previewText.slice(0, maximumCharacters));
	const overflow = $derived(previewText.slice(maximumCharacters));
	const timeLabel = $derived(previewMetaLabel?.trim() || 'Just now');
	const title = $derived(settings.title.trim() || 'Untitled post');
	const groupName = $derived(settings.groupLabel?.trim() || (settings.group ? 'Selected group' : ''));
	const labelName = $derived(settings.labelLabel?.trim() || '');
	const mediaMode = $derived(classifyComposerPreviewMediaMode(mediaUrls, mediaStoragePaths));
	const isVideo = $derived(mediaMode === 'video');
	const sliderVariant = $derived<'default' | 'letterbox-dark'>(isVideo ? 'default' : 'letterbox-dark');
</script>

<!-- Skool community post: max-w-[340px] · feed-style card -->
<div
	class="mx-auto w-full max-w-[340px] overflow-hidden rounded-xl border border-base-300 bg-[#FAFAFA] text-[#171717]"
>
	<div class="flex items-start gap-3 p-4">
		<IntegrationChannelPicture
			profilePictureUrl={channel.picture}
			fallbackIcon={icons.Users.name}
			alt={channel.name}
			class="h-10 w-10 shrink-0 rounded-full bg-base-200 object-cover"
		/>
		<div class="min-w-0 flex-1">
			<div class="truncate text-sm font-semibold">{channel.name || 'Skool'}</div>
			<div class="text-xs text-[#737373]">{timeLabel}</div>
		</div>
		<span class="shrink-0 rounded-md bg-[#F4D06F] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#5c4a1a]">
			Skool
		</span>
	</div>

	<div class="space-y-2 px-4 pb-3">
		<h3 class="text-base font-bold leading-snug">{title}</h3>
		{#if groupName}
			<p class="text-xs font-medium text-[#525252]">
				<AbstractIcon name={icons.Users.name} class="mr-1 inline size-3.5" width="14" height="14" />
				{groupName}{#if labelName}
					<span class="text-[#737373]"> · {labelName}</span>
				{/if}
			</p>
		{/if}
		{#if cropped.length > 0}
			<div class="whitespace-pre-wrap text-sm leading-6 text-[#262626]">
				{cropped}{#if overflow.length > 0}<mark class="bg-error/70 text-error-content">{overflow}</mark>{/if}
			</div>
		{:else}
			<p class="text-sm text-[#737373]">Post body appears here.</p>
		{/if}
	</div>

	{#if mediaUrls.length > 0}
		<div class="overflow-hidden border-y border-[#E5E5E5] bg-[#18191A]">
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

	<div class="px-4 py-3">
		<PreviewScheduledSocialReplies replies={threadReplies} {threadFinisher} variant="general" />
	</div>
</div>
