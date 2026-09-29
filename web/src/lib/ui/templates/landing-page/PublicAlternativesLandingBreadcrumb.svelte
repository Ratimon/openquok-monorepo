<script lang="ts">
	import { page } from '$app/state';

	import { getRootPathPublicAlternatives } from '$lib/area-public/constants/getRootPathPublicAlternatives';
	import { PUBLIC_LANDING_BREADCRUMB } from '$lib/content/constants/landing/breadcrumbs';
	import PublicLandingHubBreadcrumb, {
		type PublicLandingHubBreadcrumbItem
	} from '$lib/ui/templates/landing-page/PublicLandingHubBreadcrumb.svelte';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';
	import { route } from '$lib/utils/path';

	type Variant = 'hub' | 'detail';

	type Props = {
		variant: Variant;
		pageLabel?: string | null;
		class?: string;
	};

	let { variant, pageLabel = null, class: className = '' }: Props = $props();

	const homeHref = $derived(hostedMarketingHref('/', page.url.origin));

	const alternativesHubHref = $derived(
		hostedMarketingHref(route(getRootPathPublicAlternatives()), page.url.origin)
	);

	const items = $derived.by((): PublicLandingHubBreadcrumbItem[] => {
		if (variant === 'hub') {
			return [
				{ label: 'Home', href: homeHref },
				{ label: PUBLIC_LANDING_BREADCRUMB.alternativesHub }
			];
		}

		const trimmedPageLabel = pageLabel?.trim() ?? '';

		return [
			{ label: 'Home', href: homeHref },
			{ label: PUBLIC_LANDING_BREADCRUMB.alternativesHub, href: alternativesHubHref },
			{
				label: trimmedPageLabel || PUBLIC_LANDING_BREADCRUMB.alternativesHub
			}
		];
	});
</script>

<PublicLandingHubBreadcrumb {items} class={className} />
