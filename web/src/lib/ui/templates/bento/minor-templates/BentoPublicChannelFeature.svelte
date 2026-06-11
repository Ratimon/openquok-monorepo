<script lang="ts">
	import type { PublicChannelFeatureBentoId } from '$lib/content/constants/publicChannelFeatureBento';

	import BentoFacebookBulkScheduling from '$lib/ui/templates/bento/minor-templates/facebook/BentoFacebookBulkScheduling.svelte';
	import BentoFacebookInsights from '$lib/ui/templates/bento/minor-templates/facebook/BentoFacebookInsights.svelte';
	import BentoFacebookVideoLinks from '$lib/ui/templates/bento/minor-templates/facebook/BentoFacebookVideoLinks.svelte';
	import BentoInstagramBulkScheduling from '$lib/ui/templates/bento/minor-templates/instagram/BentoInstagramBulkScheduling.svelte';
	import BentoInstagramComposeSettings from '$lib/ui/templates/bento/minor-templates/instagram/BentoInstagramComposeSettings.svelte';
	import BentoInstagramInsights from '$lib/ui/templates/bento/minor-templates/instagram/BentoInstagramInsights.svelte';
	import BentoThreadsBulkScheduling from '$lib/ui/templates/bento/minor-templates/threads/BentoThreadsBulkScheduling.svelte';
	import BentoThreadsInsights from '$lib/ui/templates/bento/minor-templates/threads/BentoThreadsInsights.svelte';
	import BentoThreadsMediaReplies from '$lib/ui/templates/bento/minor-templates/threads/BentoThreadsMediaReplies.svelte';
	import BentoYoutubeBulkScheduling from '$lib/ui/templates/bento/minor-templates/youtube/BentoYoutubeBulkScheduling.svelte';
	import BentoYoutubeInsights from '$lib/ui/templates/bento/minor-templates/youtube/BentoYoutubeInsights.svelte';
	import BentoYoutubeVideoSettings from '$lib/ui/templates/bento/minor-templates/youtube/BentoYoutubeVideoSettings.svelte';

	type Props = {
		bentoId: PublicChannelFeatureBentoId;
	};

	let { bentoId }: Props = $props();
</script>


{#if bentoId === 'facebook-bulk-scheduling'}
	<BentoFacebookBulkScheduling />
{:else if bentoId === 'facebook-video-links'}
	<BentoFacebookVideoLinks />
{:else if bentoId === 'facebook-insights'}
	<BentoFacebookInsights />
{:else if bentoId === 'threads-bulk-scheduling'}
	<BentoThreadsBulkScheduling />
{:else if bentoId === 'threads-media-replies'}
	<BentoThreadsMediaReplies />
{:else if bentoId === 'threads-insights'}
	<BentoThreadsInsights />
{:else if bentoId === 'instagram-bulk-scheduling'}
	<BentoInstagramBulkScheduling />
{:else if bentoId === 'instagram-compose-settings'}
	<BentoInstagramComposeSettings />
{:else if bentoId === 'instagram-insights'}
	<BentoInstagramInsights />
{:else if bentoId === 'youtube-bulk-scheduling'}
	<BentoYoutubeBulkScheduling />
{:else if bentoId === 'youtube-video-settings'}
	<BentoYoutubeVideoSettings />
{:else if bentoId === 'youtube-insights'}
	<BentoYoutubeInsights />
{/if}
