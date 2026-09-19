<script lang="ts">
	import { page } from '$app/state';

	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';
	import { route } from '$lib/utils/path';

	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		eyebrow: string;
		title: string;
		description: string;
	};

	let { eyebrow, title, description }: Props = $props();

	const pricingHref = $derived(hostedMarketingHref('/pricing', page.url.origin));
	const docsHref = $derived(
		hostedMarketingHref('/docs/getting-started-for-public-api', page.url.origin)
	);
</script>

<section class="py-10 md:py-16">
	<div class="container mx-auto max-w-3xl space-y-5 px-4 text-center">
		<p class="text-xs font-bold tracking-wider text-primary uppercase sm:text-sm">{eyebrow}</p>
		<h1 class="text-3xl font-black tracking-tight text-balance text-base-content sm:text-4xl">
			{title}
		</h1>
		<p class="text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
			{description}
		</p>
		<div class="flex flex-wrap items-center justify-center gap-3 pt-2">
			<Button href={pricingHref} variant="primary" size="lg">Get Started For Free</Button>
			<Button href={docsHref} variant="outline" size="lg">View Docs</Button>
		</div>
	</div>
</section>
