<script lang="ts">
	import type { CreateSocialPostChannel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

	import GeneralPreviewComponent from '$lib/ui/components/posts/GeneralPreviewComponent.svelte';
	import InstagramPreview from '$lib/ui/components/posts/providers/instagram/InstagramPreview.svelte';
	import ThreadsPreview from '$lib/ui/components/posts/providers/threads/ThreadsPreview.svelte';

	type Props = {
		channel: CreateSocialPostChannel | null;
		previewText: string;
		maximumCharacters?: number;
	};

	let { channel, previewText, maximumCharacters }: Props = $props();

	const identifier = $derived((channel?.identifier ?? '').toLowerCase());
</script>

{#if !channel}
	<GeneralPreviewComponent {previewText} maximumCharacters={maximumCharacters} title="Global Edit" />
{:else if identifier.startsWith('instagram')}
	<InstagramPreview {channel} {previewText} maximumCharacters={maximumCharacters} />
{:else if identifier === 'threads'}
	<ThreadsPreview {channel} {previewText} maximumCharacters={maximumCharacters} />
{:else}
	<GeneralPreviewComponent {previewText} maximumCharacters={maximumCharacters} {channel} showVerified={false} />
{/if}

