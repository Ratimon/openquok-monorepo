<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

	import GeneralPreviewComponent from '$lib/ui/components/posts/GeneralPreviewComponent.svelte';
	import InstagramPreview from '$lib/ui/components/posts/providers/instagram/InstagramPreview.svelte';
	import ThreadsPreview from '$lib/ui/components/posts/providers/threads/ThreadsPreview.svelte';

	type Props = {
		channel: CreateSocialPostChannelViewModel | null;
		previewText: string;
		maximumCharacters?: number;
		mediaUrls?: string[];
	};

	let { channel, previewText, maximumCharacters, mediaUrls = [] }: Props = $props();

	const identifier = $derived((channel?.identifier ?? '').toLowerCase());
	/** Ensures children always receive a number (avoids `undefined` vs optional-default edge cases). */
	const maxChars = $derived(maximumCharacters ?? 10_000);
</script>

{#if !channel}
	<GeneralPreviewComponent {previewText} {mediaUrls} maximumCharacters={maxChars} title="Global Edit" />
{:else if identifier.startsWith('instagram')}
	<InstagramPreview {channel} {previewText} {mediaUrls} maximumCharacters={maxChars} />
{:else if identifier === 'threads'}
	<ThreadsPreview {channel} {previewText} {mediaUrls} maximumCharacters={maxChars} />
{:else}
	<GeneralPreviewComponent {previewText} {mediaUrls} maximumCharacters={maxChars} {channel} showVerified={false} />
{/if}

