<script lang="ts">
	import { page } from '$app/state';

	import { getRootPathPublicCompare } from '$lib/area-public/constants/getRootPathPublicCompare';
	import { PUBLIC_LANDING_BREADCRUMB } from '$lib/content/constants/landing/breadcrumbs';
	import PublicLandingHubBreadcrumb, {
		type PublicLandingHubBreadcrumbItem
	} from '$lib/ui/templates/landing-page/PublicLandingHubBreadcrumb.svelte';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';
	import { route } from '$lib/utils/path';

	type Variant = 'hub' | 'detail';

	type Props = {
		variant: Variant;
		leftProductName?: string;
		rightProductName?: string;
		class?: string;
	};

	let {
		variant,
		leftProductName = '',
		rightProductName = '',
		class: className = ''
	}: Props = $props();

	const homeHref = $derived(hostedMarketingHref('/', page.url.origin));

	const compareHubHref = $derived(
		hostedMarketingHref(route(getRootPathPublicCompare()), page.url.origin)
	);

	const items = $derived.by((): PublicLandingHubBreadcrumbItem[] => {
		if (variant === 'hub') {
			return [
				{ label: 'Home', href: homeHref },
				{ label: PUBLIC_LANDING_BREADCRUMB.compareHub }
			];
		}

		const leftName = leftProductName.trim();
		const rightName = rightProductName.trim();
		const comparisonLabel =
			leftName && rightName ? `${leftName} vs ${rightName}` : leftName || rightName || 'Comparison';

		return [
			{ label: 'Home', href: homeHref },
			{ label: PUBLIC_LANDING_BREADCRUMB.compareHub, href: compareHubHref },
			{ label: comparisonLabel }
		];
	});
</script>

<PublicLandingHubBreadcrumb {items} class={className} />
