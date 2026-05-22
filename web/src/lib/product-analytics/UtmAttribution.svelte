<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	import { ConversionTrackEvent } from '$lib/product-analytics/conversionTrackEvent';
	import { fireProductEvent } from '$lib/product-analytics/fireEvent';
	import { trackConversion } from '$lib/product-analytics/trackConversion';
	import {
		captureLandingAttribution,
		readUtmFromSearchParams,
		storeUtmIfEmpty
	} from '$lib/product-analytics/utm';

	onMount(() => {
		captureLandingAttribution();

		if (page.url.searchParams.get('check')) {
			fireProductEvent('purchase');
			void trackConversion(ConversionTrackEvent.StartTrial);
		}
	});

	$effect(() => {
		const utm = readUtmFromSearchParams(page.url.searchParams);
		if (utm) {
			storeUtmIfEmpty(utm);
		}
	});
</script>
