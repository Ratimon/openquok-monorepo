<script lang="ts">
	import { page } from '$app/state';

	import { PUBLIC_LANDING_BREADCRUMB } from '$lib/content/constants/landing/breadcrumbs';
	import PublicLandingHubBreadcrumb, {
		type PublicLandingHubBreadcrumbItem
	} from '$lib/ui/templates/landing-page/PublicLandingHubBreadcrumb.svelte';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';

	type Props = {
		class?: string;
		/** Current pricing segment (hub uses default “Pricing”). */
		breadcrumbLabel?: string;
	};

	let {
		class: className = '',
		breadcrumbLabel = PUBLIC_LANDING_BREADCRUMB.pricing
	}: Props = $props();

	const homeHref = $derived(hostedMarketingHref('/', page.url.origin));
	const pricingHubHref = $derived(hostedMarketingHref('/pricing', page.url.origin));
	const isPricingHub = $derived(breadcrumbLabel === PUBLIC_LANDING_BREADCRUMB.pricing);

	const items = $derived.by((): PublicLandingHubBreadcrumbItem[] => {
		if (isPricingHub) {
			return [
				{ label: 'Home', href: homeHref },
				{ label: PUBLIC_LANDING_BREADCRUMB.pricing }
			];
		}
		return [
			{ label: 'Home', href: homeHref },
			{ label: PUBLIC_LANDING_BREADCRUMB.pricing, href: pricingHubHref },
			{ label: breadcrumbLabel }
		];
	});
</script>

<PublicLandingHubBreadcrumb {items} class={className} />
