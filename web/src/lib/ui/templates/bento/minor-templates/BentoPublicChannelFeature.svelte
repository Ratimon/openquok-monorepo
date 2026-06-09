<script lang="ts">
	import type { PublicChannelFeatureBentoId } from '$lib/content/constants/publicChannelFeatureBento';

	import BentoFacebookBulkScheduling from '$lib/ui/templates/bento/minor-templates/BentoFacebookBulkScheduling.svelte';
	import BentoFacebookInsights from '$lib/ui/templates/bento/minor-templates/BentoFacebookInsights.svelte';
	import BentoFacebookVideoLinks from '$lib/ui/templates/bento/minor-templates/BentoFacebookVideoLinks.svelte';
	import BentoInstagramBulkScheduling from '$lib/ui/templates/bento/minor-templates/BentoInstagramBulkScheduling.svelte';
	import BentoInstagramComposeSettings from '$lib/ui/templates/bento/minor-templates/BentoInstagramComposeSettings.svelte';
	import BentoInstagramInsights from '$lib/ui/templates/bento/minor-templates/BentoInstagramInsights.svelte';
	import BentoThreadsBulkScheduling from '$lib/ui/templates/bento/minor-templates/BentoThreadsBulkScheduling.svelte';
	import BentoThreadsInsights from '$lib/ui/templates/bento/minor-templates/BentoThreadsInsights.svelte';
	import BentoThreadsMediaReplies from '$lib/ui/templates/bento/minor-templates/BentoThreadsMediaReplies.svelte';

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
{/if}
