<script lang="ts">
	import type { PublicChannelFeatureBentoId } from '$lib/content/constants/publicChannelFeatureBentoConfig';

	import { page } from '$app/state';

	import BentoAgentMultiPlatformBulkScheduling from '$lib/ui/templates/bento/minor-templates/agent/BentoAgentMultiPlatformBulkScheduling.svelte';
	import BentoFacebookBulkScheduling from '$lib/ui/templates/bento/minor-templates/facebook/BentoFacebookBulkScheduling.svelte';
	import BentoFacebookInsights from '$lib/ui/templates/bento/minor-templates/facebook/BentoFacebookInsights.svelte';
	import BentoFacebookPostEditor from '$lib/ui/templates/bento/minor-templates/facebook/BentoFacebookPostEditor.svelte';
	import BentoFacebookSettings from '$lib/ui/templates/bento/minor-templates/facebook/BentoFacebookSettings.svelte';
	import BentoInstagramBulkScheduling from '$lib/ui/templates/bento/minor-templates/instagram/BentoInstagramBulkScheduling.svelte';
	import BentoInstagramInsights from '$lib/ui/templates/bento/minor-templates/instagram/BentoInstagramInsights.svelte';
	import BentoInstagramPostEditor from '$lib/ui/templates/bento/minor-templates/instagram/BentoInstagramPostEditor.svelte';
	import BentoInstagramSettings from '$lib/ui/templates/bento/minor-templates/instagram/BentoInstagramSettings.svelte';
	import BentoThreadsBulkScheduling from '$lib/ui/templates/bento/minor-templates/threads/BentoThreadsBulkScheduling.svelte';
	import BentoThreadsInsights from '$lib/ui/templates/bento/minor-templates/threads/BentoThreadsInsights.svelte';
	import BentoThreadsPostEditor from '$lib/ui/templates/bento/minor-templates/threads/BentoThreadsPostEditor.svelte';
	import BentoThreadsSettings from '$lib/ui/templates/bento/minor-templates/threads/BentoThreadsSettings.svelte';
	import BentoLinkedinBulkScheduling from '$lib/ui/templates/bento/minor-templates/linkedin/BentoLinkedinBulkScheduling.svelte';
	import BentoLinkedinInsights from '$lib/ui/templates/bento/minor-templates/linkedin/BentoLinkedinInsights.svelte';
	import BentoLinkedinPostEditor from '$lib/ui/templates/bento/minor-templates/linkedin/BentoLinkedinPostEditor.svelte';
	import BentoLinkedinSettings from '$lib/ui/templates/bento/minor-templates/linkedin/BentoLinkedinSettings.svelte';
	import BentoTiktokBulkScheduling from '$lib/ui/templates/bento/minor-templates/tiktok/BentoTiktokBulkScheduling.svelte';
	import BentoTiktokInsights from '$lib/ui/templates/bento/minor-templates/tiktok/BentoTiktokInsights.svelte';
	import BentoTiktokPostEditor from '$lib/ui/templates/bento/minor-templates/tiktok/BentoTiktokPostEditor.svelte';
	import BentoTiktokSettings from '$lib/ui/templates/bento/minor-templates/tiktok/BentoTiktokSettings.svelte';
	import BentoYoutubeBulkScheduling from '$lib/ui/templates/bento/minor-templates/youtube/BentoYoutubeBulkScheduling.svelte';
	import BentoYoutubeInsights from '$lib/ui/templates/bento/minor-templates/youtube/BentoYoutubeInsights.svelte';
	import BentoYoutubePostEditor from '$lib/ui/templates/bento/minor-templates/youtube/BentoYoutubePostEditor.svelte';
	import BentoYoutubeSettings from '$lib/ui/templates/bento/minor-templates/youtube/BentoYoutubeSettings.svelte';
	import BentoXBulkScheduling from '$lib/ui/templates/bento/minor-templates/x/BentoXBulkScheduling.svelte';
	import BentoXInsights from '$lib/ui/templates/bento/minor-templates/x/BentoXInsights.svelte';
	import BentoXPostEditor from '$lib/ui/templates/bento/minor-templates/x/BentoXPostEditor.svelte';
	import BentoXSettings from '$lib/ui/templates/bento/minor-templates/x/BentoXSettings.svelte';
	import BentoDevtoBulkScheduling from '$lib/ui/templates/bento/minor-templates/devto/BentoDevtoBulkScheduling.svelte';
	import BentoDevtoCanonical from '$lib/ui/templates/bento/minor-templates/devto/BentoDevtoCanonical.svelte';
	import BentoDevtoInsights from '$lib/ui/templates/bento/minor-templates/devto/BentoDevtoInsights.svelte';
	import BentoDevtoPostEditor from '$lib/ui/templates/bento/minor-templates/devto/BentoDevtoPostEditor.svelte';
	import BentoDevtoSettings from '$lib/ui/templates/bento/minor-templates/devto/BentoDevtoSettings.svelte';

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
{:else if bentoId === 'facebook-post-editor'}
	<BentoFacebookPostEditor {isLoggedIn} />
{:else if bentoId === 'facebook-settings'}
	<BentoFacebookSettings {isLoggedIn} />
{:else if bentoId === 'facebook-insights'}
	<BentoFacebookInsights />
{:else if bentoId === 'threads-bulk-scheduling'}
	<BentoThreadsBulkScheduling />
{:else if bentoId === 'threads-post-editor'}
	<BentoThreadsPostEditor {isLoggedIn} />
{:else if bentoId === 'threads-settings'}
	<BentoThreadsSettings {isLoggedIn} />
{:else if bentoId === 'threads-insights'}
	<BentoThreadsInsights />
{:else if bentoId === 'instagram-bulk-scheduling'}
	<BentoInstagramBulkScheduling />
{:else if bentoId === 'instagram-post-editor'}
	<BentoInstagramPostEditor {isLoggedIn} />
{:else if bentoId === 'instagram-settings'}
	<BentoInstagramSettings {isLoggedIn} />
{:else if bentoId === 'instagram-insights'}
	<BentoInstagramInsights />
{:else if bentoId === 'youtube-bulk-scheduling'}
	<BentoYoutubeBulkScheduling />
{:else if bentoId === 'youtube-post-editor'}
	<BentoYoutubePostEditor {isLoggedIn} />
{:else if bentoId === 'youtube-settings'}
	<BentoYoutubeSettings {isLoggedIn} />
{:else if bentoId === 'youtube-insights'}
	<BentoYoutubeInsights />
{:else if bentoId === 'tiktok-bulk-scheduling'}
	<BentoTiktokBulkScheduling />
{:else if bentoId === 'tiktok-post-editor'}
	<BentoTiktokPostEditor {isLoggedIn} />
{:else if bentoId === 'tiktok-settings'}
	<BentoTiktokSettings {isLoggedIn} />
{:else if bentoId === 'tiktok-insights'}
	<BentoTiktokInsights />
{:else if bentoId === 'linkedin-bulk-scheduling'}
	<BentoLinkedinBulkScheduling />
{:else if bentoId === 'linkedin-post-editor'}
	<BentoLinkedinPostEditor {isLoggedIn} />
{:else if bentoId === 'linkedin-settings'}
	<BentoLinkedinSettings {isLoggedIn} />
{:else if bentoId === 'linkedin-insights'}
	<BentoLinkedinInsights />
{:else if bentoId === 'x-bulk-scheduling'}
	<BentoXBulkScheduling />
{:else if bentoId === 'x-post-editor'}
	<BentoXPostEditor {isLoggedIn} />
{:else if bentoId === 'x-settings'}
	<BentoXSettings {isLoggedIn} />
{:else if bentoId === 'x-insights'}
	<BentoXInsights />
{:else if bentoId === 'devto-bulk-scheduling'}
	<BentoDevtoBulkScheduling />
{:else if bentoId === 'devto-post-editor'}
	<BentoDevtoPostEditor {isLoggedIn} />
{:else if bentoId === 'devto-settings'}
	<BentoDevtoSettings {isLoggedIn} />
{:else if bentoId === 'devto-canonical'}
	<BentoDevtoCanonical {isLoggedIn} />
{:else if bentoId === 'devto-insights'}
	<BentoDevtoInsights />
{/if}
