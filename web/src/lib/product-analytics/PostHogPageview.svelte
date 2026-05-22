<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { browser } from '$app/environment';

	import { capturePostHogPageview } from '$lib/product-analytics/posthog.client';
	import { isBillingEnabledForAnalytics } from '$lib/product-analytics/constants/config';

	afterNavigate(({ to }) => {
		if (!browser || !to || !isBillingEnabledForAnalytics()) return;
		capturePostHogPageview(to.url.href);
	});
</script>
