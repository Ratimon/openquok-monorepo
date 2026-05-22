<script lang="ts">
	import { onMount } from 'svelte';

	import { loadFacebookPixelScript } from '$lib/product-analytics/trackConversion';

	onMount(() => {
		loadFacebookPixelScript();
	});
</script>
