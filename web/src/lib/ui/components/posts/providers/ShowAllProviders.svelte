<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
	import type { PublicPreviewThreadReplyViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

	import GeneralPreviewComponent from '$lib/ui/components/posts/GeneralPreviewComponent.svelte';
	import InstagramPreview from '$lib/ui/components/posts/providers/instagram/InstagramPreview.svelte';
	import ThreadsPreview from '$lib/ui/components/posts/providers/threads/ThreadsPreview.svelte';

	type Props = {
		channel: CreateSocialPostChannelViewModel | null;
		previewText: string;
		maximumCharacters?: number;
		mediaUrls?: string[];
		threadReplies?: PublicPreviewThreadReplyViewModel[];
		threadFinisher?: { enabled: boolean; message: string } | null;
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
		previewMetaLabel = null
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

