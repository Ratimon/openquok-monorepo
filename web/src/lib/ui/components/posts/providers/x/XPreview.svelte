<script module lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
	import type { PublicPreviewThreadReplyViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

	export type XPreviewProps = {
		channel: CreateSocialPostChannelViewModel;
		previewText: string;
		maximumCharacters?: number;
		weightedCharCount?: number;
		mediaUrls?: string[];
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
	import { xWeightedLength } from '$lib/posts/utils/composer/xWeightedLength';
	import { readXLaunchSettings } from '$lib/ui/components/posts/providers/x/xLaunchSettings';

	let {
		channel,
		previewText,
		maximumCharacters = 280,
		weightedCharCount,
		mediaUrls = [],
		threadReplies = [],
		threadFinisher = null,
		previewMetaLabel = null,
		providerSettings = {}
	}: XPreviewProps = $props();

	const settings = $derived(readXLaunchSettings(providerSettings));
	const effectiveWeighted = $derived(weightedCharCount ?? xWeightedLength(previewText));
	const overLimit = $derived(effectiveWeighted > maximumCharacters);
	const handle = $derived((channel.name || '').trim() || 'username');
	const showSettingsLabels = $derived(
		settings.paidPartnership === true ||
			settings.madeWithAi === true ||
			Boolean(settings.communityUrl?.trim())
	);
	const communityLabel = $derived(formatCommunityLabel(settings.communityUrl));

	function formatCommunityLabel(url: string | undefined): string {
		const trimmed = url?.trim();
		if (!trimmed) return '';
		try {
			const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
			return parsed.hostname.replace(/^www\./, '');
		} catch {
			return trimmed.length > 32 ? `${trimmed.slice(0, 29)}…` : trimmed;
		}
	}
</script>

<div class="overflow-hidden rounded-xl border border-base-300 bg-base-100 text-base-content">
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
				<span class="flex h-10 w-10 items-center justify-center rounded-full bg-base-200">
					<AbstractIcon name={icons.User1.name} class="size-5 text-base-content/60" width="20" height="20" />
				</span>
			{/if}
		</div>

		<div class="min-w-0 flex-1">
			<div class="flex items-start justify-between gap-2">
				<div class="min-w-0 flex-1">
					<div class="flex flex-wrap items-center gap-x-2 gap-y-0.5">
						<span class="truncate text-[15px] font-bold leading-5">{channel.name}</span>
						<span class="truncate text-[15px] text-base-content/50">@{handle.replace(/^@/, '')}</span>
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
					<p class="text-base-content/60">Start writing your post for a preview</p>
				{:else}
					<p class="whitespace-pre-wrap {overLimit ? 'text-error' : ''}">{previewText}</p>
					{#if overLimit}
						<p class="mt-1 text-xs text-error">
							{effectiveWeighted}/{maximumCharacters} weighted characters
						</p>
					{/if}
				{/if}
			</div>

			{#if mediaUrls.length > 0}
				<div class="mt-3 overflow-hidden rounded-2xl border border-base-300">
					<ImageSlider class="aspect-[16/9] w-full" urls={mediaUrls} alt="" />
				</div>
			{/if}

			{#if showSettingsLabels}
				<div class="mt-3 flex flex-wrap gap-2">
					{#if settings.paidPartnership}
						<span class="rounded-full border border-base-300 px-2 py-0.5 text-[11px] font-medium text-base-content/70">
							Paid partnership
						</span>
					{/if}
					{#if settings.madeWithAi}
						<span class="rounded-full border border-base-300 px-2 py-0.5 text-[11px] font-medium text-base-content/70">
							Made with AI
						</span>
					{/if}
					{#if communityLabel}
						<span class="rounded-full border border-base-300 px-2 py-0.5 text-[11px] font-medium text-base-content/70">
							Community · {communityLabel}
						</span>
					{/if}
				</div>
			{/if}
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
