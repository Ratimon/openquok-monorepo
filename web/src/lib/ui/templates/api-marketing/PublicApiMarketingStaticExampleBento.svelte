<script lang="ts">
	import type { PublicApiHubStaticExample } from '$lib/content/constants/apis/types';

	import PublicApiJsonPayloadBlock from '$lib/ui/templates/api-marketing/PublicApiJsonPayloadBlock.svelte';
	import PublicLandingSectionHeading from '$lib/ui/templates/landing-page/PublicLandingSectionHeading.svelte';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	type Props = {
		staticExample: PublicApiHubStaticExample;
	};

	let { staticExample }: Props = $props();
</script>

<section class="py-10 md:py-14">
	<div class="container mx-auto px-4">
		<div class="mx-auto max-w-3xl space-y-4 text-center">
			<PublicLandingSectionHeading
				title="One request, structured response"
				heroTheme={landingHeroTheme}
				commaSeparated
			/>
			<p class="text-base font-medium leading-relaxed text-base-content/70">
				{staticExample.endpoint} accepts one JSON payload and returns post group rows you can track
				with the public API.
			</p>
		</div>

		<div class="mx-auto mt-10 grid max-w-6xl gap-6 lg:grid-cols-2">
			<div class="space-y-4 rounded-2xl border border-base-content/10 bg-base-200/30 p-5">
				<h3 class="text-sm font-bold tracking-wide text-base-content uppercase">Request</h3>
				<PublicApiJsonPayloadBlock shell={staticExample.curl} label="cURL" />
				<PublicApiJsonPayloadBlock json={staticExample.requestJson} label="JSON body" />
			</div>

			<div class="space-y-4 rounded-2xl border border-base-content/10 bg-base-200/30 p-5">
				<h3 class="text-sm font-bold tracking-wide text-base-content uppercase">Response</h3>
				<PublicApiJsonPayloadBlock json={staticExample.responseJson} label="JSON body" />
			</div>
		</div>
	</div>
</section>
