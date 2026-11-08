<script lang="ts">
	import { page } from '$app/state';

	import {
		buildAlternativesLandingBreadcrumbItems,
		type AlternativesLandingBreadcrumbVariant
	} from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
	import PublicLandingHubBreadcrumb, {
		type PublicLandingHubBreadcrumbItem
	} from '$lib/ui/templates/landing-page/PublicLandingHubBreadcrumb.svelte';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';

	type Props = {
		variant: AlternativesLandingBreadcrumbVariant;
		pageLabel?: string | null;
		categoryLabel?: string | null;
		class?: string;
	};

	let { variant, pageLabel = null, categoryLabel = null, class: className = '' }: Props = $props();

	const homeHref = $derived(hostedMarketingHref('/', page.url.origin));

	const items = $derived.by((): PublicLandingHubBreadcrumbItem[] => {
		const crumbs = buildAlternativesLandingBreadcrumbItems({
			variant,
			pageLabel,
			categoryLabel
		});

		return crumbs.map((crumb) => ({
			label: crumb.label,
			href: crumb.href ? hostedMarketingHref(crumb.href, page.url.origin) : undefined
		}));
	});
</script>

<PublicLandingHubBreadcrumb {items} class={className} />
