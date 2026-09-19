<script lang="ts">
	import { page } from '$app/state';

	import type { PublicApiCapability } from '$lib/content/constants/apis/types';
	import PublicApiMarketingHubBreadcrumb from '$lib/ui/templates/api-marketing/PublicApiMarketingHubBreadcrumb.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';

	type Props = {
		capability: PublicApiCapability;
		platformLabel?: string | null;
		title: string;
		description: string;
		payloadValidatorHref?: string | null;
	};

	let {
		capability,
		platformLabel = null,
		title,
		description,
		payloadValidatorHref = null
	}: Props = $props();

	const pricingHref = $derived(hostedMarketingHref('/pricing', page.url.origin));
	const docsHref = $derived(
		hostedMarketingHref('/docs/getting-started-for-public-api', page.url.origin)
	);
	const resolvedPayloadValidatorHref = $derived(
		payloadValidatorHref
			? hostedMarketingHref(payloadValidatorHref, page.url.origin)
			: null
	);
</script>

<section class="py-10 md:py-16">
	<div class="container mx-auto max-w-3xl space-y-5 px-4 text-center">
		<div class="flex justify-center">
			<PublicApiMarketingHubBreadcrumb {capability} {platformLabel} />
		</div>
		<h1 class="text-3xl font-black tracking-tight text-balance text-base-content sm:text-4xl">
			{title}
		</h1>
		<p class="text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
			{description}
		</p>
		<div class="flex flex-wrap items-center justify-center gap-3 pt-2">
			<Button href={pricingHref} variant="primary" size="lg">Get Started For Free</Button>
			{#if resolvedPayloadValidatorHref}
				<Button href={resolvedPayloadValidatorHref} variant="secondary" size="lg">
					Try Payload Validator
				</Button>
			{/if}
			<Button href={docsHref} variant="ghost" size="lg">View Docs</Button>

		</div>
	</div>
</section>
