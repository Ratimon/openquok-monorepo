<script module lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
	import type { PublicPreviewThreadReplyViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

	export type LinkedInPreviewProps = {
		channel: CreateSocialPostChannelViewModel;
		previewText: string;
		maximumCharacters?: number;
		mediaUrls?: string[];
		threadReplies?: PublicPreviewThreadReplyViewModel[];
		threadFinisher?: { enabled: boolean; message: string } | null;
		previewMetaLabel?: string | null;
		providerSettings?: Record<string, unknown>;
		crossAccountPlugs?: CrossAccountPlugPreviewItem[];
	};
</script>

<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import IntegrationChannelPicture from '$lib/ui/components/posts/IntegrationChannelPicture.svelte';
	import ImageSlider from '$lib/ui/media-files/ImageSlider.svelte';
	import type { CrossAccountPlugPreviewItem } from '$lib/ui/components/preview/crossAccountPlugPreview';
	import {
		formatLinkedInEngagementSummary,
		summarizeScheduledSocialPreviewEngagement
	} from '$lib/ui/components/preview/crossAccountPlugPreview';
	import PreviewScheduledSocialReplies from '$lib/ui/components/preview/PreviewScheduledSocialReplies.svelte';
	import LinkedInCrossAccountPlugsPreview from '$lib/ui/components/posts/providers/linkedin/LinkedInCrossAccountPlugsPreview.svelte';
	import { readLinkedInLaunchSettings } from '$lib/ui/components/posts/providers/linkedin/linkedin.provider';

	let {
		channel,
		previewText,
		maximumCharacters = 3000,
		mediaUrls = [],
		threadReplies = [],
		threadFinisher = null,
		previewMetaLabel = null,
		providerSettings = {},
		crossAccountPlugs = []
	}: LinkedInPreviewProps = $props();

	const settings = $derived(readLinkedInLaunchSettings(providerSettings));
	const carouselName = $derived(
		settings.postAsImagesCarousel && settings.carouselName?.trim()
			? settings.carouselName.trim()
			: ''
	);

	const timeLabel = $derived(previewMetaLabel?.trim() || '30m');
	const cropped = $derived(previewText.slice(0, maximumCharacters));
	const overflow = $derived(previewText.slice(maximumCharacters));
	const isPage = $derived(channel.identifier === 'linkedin-page');

	const engagementSummary = $derived(
		formatLinkedInEngagementSummary(
			summarizeScheduledSocialPreviewEngagement({
				threadReplyCount: threadReplies.length,
				threadFinisher,
				crossAccountPlugs
			})
		)
	);

	const hasScheduledFollowUps = $derived(
		threadReplies.length > 0 ||
			(threadFinisher?.enabled === true && (threadFinisher.message ?? '').trim().length > 0) ||
			crossAccountPlugs.length > 0
	);
</script>

<div class="overflow-hidden rounded-xl border border-[#383A3D] bg-[#1B1F23] text-[#E9E9E9]">
	<div class="flex gap-3 p-4">
		<IntegrationChannelPicture
			profilePictureUrl={channel.picture}
			fallbackIcon={icons.LinkedInGlyph.name}
			alt={channel.name}
			class="h-12 w-12 min-h-12 min-w-12 max-h-12 max-w-12 shrink-0 rounded-full bg-base-200"
		/>
		<div class="min-w-0 flex-1">
			<div class="truncate text-sm font-semibold leading-5">{channel.name || 'LinkedIn profile'}</div>
			<div class="text-xs text-[#A3A3A3]">
				{isPage ? 'Company Page' : 'Professional profile'}
			</div>
			<div class="mt-0.5 flex items-center gap-1 text-xs text-[#A3A3A3]">
				<span>{timeLabel}</span>
				<span aria-hidden="true">·</span>
				<AbstractIcon name={icons.Globe.name} class="size-3" width="12" height="12" />
			</div>
		</div>
	</div>

	{#if cropped.length > 0}
		<div class="whitespace-pre-wrap px-4 pb-3 text-sm leading-relaxed">
			{cropped}{#if overflow.length > 0}<mark class="bg-error/70 text-error-content">{overflow}</mark>{/if}
		</div>
	{/if}

	{#if carouselName}
		<div class="px-4 pb-2 text-xs font-semibold text-[#A3A3A3]">
			Document · {carouselName}
		</div>
	{/if}

	{#if mediaUrls.length > 0}
		<div class="overflow-hidden border-y border-[#383A3D]">
			<ImageSlider
				class="aspect-[1.91/1] max-h-[280px] w-full"
				urls={mediaUrls}
				showSlideCounter={mediaUrls.length > 1}
			/>
		</div>
	{/if}

	{#if engagementSummary}
		<div class="flex items-center justify-end px-4 py-2 text-xs text-[#A3A3A3]">
			<span>{engagementSummary}</span>
		</div>
	{/if}

	<div
		class="grid grid-cols-4 gap-1 border-t border-[#383A3D] px-4 py-2 text-center text-xs font-semibold text-[#A3A3A3]"
	>
		<div class="rounded-md py-2">Like</div>
		<div class="rounded-md py-2">Comment</div>
		<div class="rounded-md py-2">Repost</div>
		<div class="rounded-md py-2">Send</div>
	</div>

	{#if hasScheduledFollowUps}
		<div class="px-4 pb-4">
			<PreviewScheduledSocialReplies replies={threadReplies} {threadFinisher} variant="general" />
			<LinkedInCrossAccountPlugsPreview items={crossAccountPlugs} />
		</div>
	{/if}
</div>
