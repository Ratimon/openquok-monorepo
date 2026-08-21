<script lang="ts">
	import type { PublicChannelFeatureBentoId } from '$lib/content/constants/publicChannelFeatureBentoConfig';

	import { page } from '$app/state';

	import BentoAgentMultiPlatformBulkScheduling from '$lib/ui/templates/bento/minor-templates/agent/BentoAgentMultiPlatformBulkScheduling.svelte';
	import BentoFacebookBulkScheduling from '$lib/ui/templates/bento/minor-templates/facebook/BentoFacebookBulkScheduling.svelte';
	import BentoFacebookInsights from '$lib/ui/templates/bento/minor-templates/facebook/BentoFacebookInsights.svelte';
	import BentoFacebookVideoLinks from '$lib/ui/templates/bento/minor-templates/facebook/BentoFacebookVideoLinks.svelte';
	import BentoInstagramBulkScheduling from '$lib/ui/templates/bento/minor-templates/instagram/BentoInstagramBulkScheduling.svelte';
	import BentoInstagramComposeSettings from '$lib/ui/templates/bento/minor-templates/instagram/BentoInstagramComposeSettings.svelte';
	import BentoInstagramInsights from '$lib/ui/templates/bento/minor-templates/instagram/BentoInstagramInsights.svelte';
	import BentoThreadsBulkScheduling from '$lib/ui/templates/bento/minor-templates/threads/BentoThreadsBulkScheduling.svelte';
	import BentoThreadsInsights from '$lib/ui/templates/bento/minor-templates/threads/BentoThreadsInsights.svelte';
	import BentoThreadsMediaReplies from '$lib/ui/templates/bento/minor-templates/threads/BentoThreadsMediaReplies.svelte';
	import BentoLinkedinBulkScheduling from '$lib/ui/templates/bento/minor-templates/linkedin/BentoLinkedinBulkScheduling.svelte';
	import BentoLinkedinComposeSettings from '$lib/ui/templates/bento/minor-templates/linkedin/BentoLinkedinComposeSettings.svelte';
	import BentoLinkedinInsights from '$lib/ui/templates/bento/minor-templates/linkedin/BentoLinkedinInsights.svelte';
	import BentoTiktokBulkScheduling from '$lib/ui/templates/bento/minor-templates/tiktok/BentoTiktokBulkScheduling.svelte';
	import BentoTiktokComposeSettings from '$lib/ui/templates/bento/minor-templates/tiktok/BentoTiktokComposeSettings.svelte';
	import BentoTiktokInsights from '$lib/ui/templates/bento/minor-templates/tiktok/BentoTiktokInsights.svelte';
	import BentoYoutubeBulkScheduling from '$lib/ui/templates/bento/minor-templates/youtube/BentoYoutubeBulkScheduling.svelte';
	import BentoYoutubeInsights from '$lib/ui/templates/bento/minor-templates/youtube/BentoYoutubeInsights.svelte';
	import BentoYoutubeVideoSettings from '$lib/ui/templates/bento/minor-templates/youtube/BentoYoutubeVideoSettings.svelte';
	import BentoXBulkScheduling from '$lib/ui/templates/bento/minor-templates/x/BentoXBulkScheduling.svelte';
	import BentoXComposeSettings from '$lib/ui/templates/bento/minor-templates/x/BentoXComposeSettings.svelte';
	import BentoXInsights from '$lib/ui/templates/bento/minor-templates/x/BentoXInsights.svelte';
	import BentoDevtoBulkScheduling from '$lib/ui/templates/bento/minor-templates/devto/BentoDevtoBulkScheduling.svelte';
	import BentoDevtoArticleSettings from '$lib/ui/templates/bento/minor-templates/devto/BentoDevtoArticleSettings.svelte';
	import BentoDevtoCanonical from '$lib/ui/templates/bento/minor-templates/devto/BentoDevtoCanonical.svelte';

	type Props = {
		bentoId: PublicChannelFeatureBentoId;
		isLoggedIn?: boolean;
	};

	let { bentoId, isLoggedIn: isLoggedInProp }: Props = $props();

	const isLoggedIn = $derived(
		isLoggedInProp ?? Boolean((page.data as { isLoggedIn?: boolean } | undefined)?.isLoggedIn)
	);
</script>


{#if bentoId === 'agent-multi-platform-bulk-scheduling'}
	<BentoAgentMultiPlatformBulkScheduling />
{:else if bentoId === 'facebook-bulk-scheduling'}
	<BentoFacebookBulkScheduling />
{:else if bentoId === 'facebook-video-links'}
	<BentoFacebookVideoLinks {isLoggedIn} />
{:else if bentoId === 'facebook-insights'}
	<BentoFacebookInsights />
{:else if bentoId === 'threads-bulk-scheduling'}
	<BentoThreadsBulkScheduling />
{:else if bentoId === 'threads-media-replies'}
	<BentoThreadsMediaReplies {isLoggedIn} />
{:else if bentoId === 'threads-insights'}
	<BentoThreadsInsights />
{:else if bentoId === 'instagram-bulk-scheduling'}
	<BentoInstagramBulkScheduling />
{:else if bentoId === 'instagram-compose-settings'}
	<BentoInstagramComposeSettings {isLoggedIn} />
{:else if bentoId === 'instagram-insights'}
	<BentoInstagramInsights />
{:else if bentoId === 'youtube-bulk-scheduling'}
	<BentoYoutubeBulkScheduling />
{:else if bentoId === 'youtube-video-settings'}
	<BentoYoutubeVideoSettings {isLoggedIn} />
{:else if bentoId === 'youtube-insights'}
	<BentoYoutubeInsights />
{:else if bentoId === 'tiktok-bulk-scheduling'}
	<BentoTiktokBulkScheduling />
{:else if bentoId === 'tiktok-compose-settings'}
	<BentoTiktokComposeSettings {isLoggedIn} />
{:else if bentoId === 'tiktok-insights'}
	<BentoTiktokInsights />
{:else if bentoId === 'linkedin-bulk-scheduling'}
	<BentoLinkedinBulkScheduling />
{:else if bentoId === 'linkedin-compose-settings'}
	<BentoLinkedinComposeSettings {isLoggedIn} />
{:else if bentoId === 'linkedin-insights'}
	<BentoLinkedinInsights />
{:else if bentoId === 'x-bulk-scheduling'}
	<BentoXBulkScheduling />
{:else if bentoId === 'x-compose-settings'}
	<BentoXComposeSettings {isLoggedIn} />
{:else if bentoId === 'x-insights'}
	<BentoXInsights />
{:else if bentoId === 'devto-bulk-scheduling'}
	<BentoDevtoBulkScheduling />
{:else if bentoId === 'devto-article-settings'}
	<BentoDevtoArticleSettings {isLoggedIn} />
{:else if bentoId === 'devto-canonical'}
	<BentoDevtoCanonical {isLoggedIn} />
{/if}
