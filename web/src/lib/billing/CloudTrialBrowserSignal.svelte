<script lang="ts">
	import { onMount } from 'svelte';

	import { ensureCloudTrialBrowserSignal } from '$lib/billing/utils/cloudTrialBrowserSignal';

	onMount(() => {
		ensureCloudTrialBrowserSignal();
	});
</script>
