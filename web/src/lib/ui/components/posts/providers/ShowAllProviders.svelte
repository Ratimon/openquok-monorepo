<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
	import type { PublicPreviewThreadReplyViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

	import GeneralPreviewComponent from '$lib/ui/components/posts/GeneralPreviewComponent.svelte';
	import FacebookPreview from '$lib/ui/components/posts/providers/facebook/FacebookPreview.svelte';
	import InstagramPreview from '$lib/ui/components/posts/providers/instagram/InstagramPreview.svelte';
	import LinkedInPreview from '$lib/ui/components/posts/providers/linkedin/LinkedInPreview.svelte';
	import ThreadsPreview from '$lib/ui/components/posts/providers/threads/ThreadsPreview.svelte';
	import TiktokPreview from '$lib/ui/components/posts/providers/tiktok/TiktokPreview.svelte';
	import XPreview from '$lib/ui/components/posts/providers/x/XPreview.svelte';
	import YoutubePreview from '$lib/ui/components/posts/providers/youtube/YoutubePreview.svelte';

	type Props = {
		channel: CreateSocialPostChannelViewModel | null;
		previewText: string;
		maximumCharacters?: number;
		mediaUrls?: string[];
		threadReplies?: PublicPreviewThreadReplyViewModel[];
		threadFinisher?: { enabled: boolean; message: string } | null;
		/** Weighted character count for X preview overflow. */
		weightedCharCount?: number;
		/** Threads only: internal delayed engagement plug preview. */
		delayedEngagementReply?: { message: string; delaySeconds: number } | null;
		/** Shown under the Threads header (e.g. scheduled date). */
		previewMetaLabel?: string | null;
	};

	let {
		channel,
		previewText,
		maximumCharacters,
		mediaUrls = [],
		threadReplies = [],
		threadFinisher = null,
		delayedEngagementReply = null,
		previewMetaLabel = null,
		weightedCharCount
	}: Props = $props();

	const identifier = $derived((channel?.identifier ?? '').toLowerCase());
	/** Ensures children always receive a number (avoids `undefined` vs optional-default edge cases). */
	const maxChars = $derived(maximumCharacters ?? 10_000);
</script>
{#if !channel}
	<GeneralPreviewComponent
		{previewText}
		{mediaUrls}
		maximumCharacters={maxChars}
		title="Global Edit"
		{threadReplies}
		{threadFinisher}
	/>
{:else if identifier.startsWith('instagram')}
	<InstagramPreview
		{channel}
		{previewText}
		{mediaUrls}
		maximumCharacters={maxChars}
		{threadReplies}
		{threadFinisher}
	/>
{:else if identifier === 'threads'}
	<ThreadsPreview
		{channel}
		{previewText}
		{mediaUrls}
		maximumCharacters={maxChars}
		{threadReplies}
		{threadFinisher}
		{delayedEngagementReply}
		{previewMetaLabel}
	/>
{:else if identifier === 'facebook'}
	<FacebookPreview
		{channel}
		{previewText}
		{mediaUrls}
		maximumCharacters={maxChars}
		{threadReplies}
		{threadFinisher}
		{previewMetaLabel}
	/>
{:else if identifier === 'youtube'}
	<YoutubePreview
		{channel}
		{previewText}
		{mediaUrls}
		maximumCharacters={maxChars}
		{threadReplies}
		{threadFinisher}
		{previewMetaLabel}
	/>
{:else if identifier === 'tiktok'}
	<TiktokPreview
		{channel}
		{previewText}
		{mediaUrls}
		maximumCharacters={maxChars}
		{threadReplies}
		{threadFinisher}
		{previewMetaLabel}
	/>
{:else if identifier === 'linkedin' || identifier === 'linkedin-page'}
	<LinkedInPreview
		{channel}
		{previewText}
		{mediaUrls}
		maximumCharacters={maxChars}
		{threadReplies}
		{threadFinisher}
		{previewMetaLabel}
	/>
{:else if identifier === 'x'}
	<XPreview
		{channel}
		{previewText}
		{mediaUrls}
		maximumCharacters={maxChars}
		{weightedCharCount}
		{threadReplies}
		{threadFinisher}
		{previewMetaLabel}
	/>
{:else}
	<GeneralPreviewComponent
		{previewText}
		{mediaUrls}
		maximumCharacters={maxChars}
		{channel}
		showVerified={false}
		{threadReplies}
		{threadFinisher}
	/>
{/if}

