<script lang="ts">
	import type { PublicChannelFeatureBentoId } from '$lib/content/constants/publicChannelFeatureBento';

	import BentoFacebookBulkScheduling from '$lib/ui/templates/bento/minor-templates/BentoFacebookBulkScheduling.svelte';
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
{/if}
