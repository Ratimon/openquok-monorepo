<script lang="ts">
	import type { PublicChannelFeatureBentoId } from '$lib/content/constants/publicChannelFeatureBento';

	import BentoFacebookBulkScheduling from '$lib/ui/templates/bento/minor-templates/BentoFacebookBulkScheduling.svelte';
	import BentoFacebookInsights from '$lib/ui/templates/bento/minor-templates/BentoFacebookInsights.svelte';
	import BentoFacebookVideoLinks from '$lib/ui/templates/bento/minor-templates/BentoFacebookVideoLinks.svelte';

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
{/if}
