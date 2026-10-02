<script lang="ts">
	import { page } from '$app/state';

	import {
		buildListingsHubBreadcrumbItems,
		type ListingsHubBreadcrumbKind,
		type ListingsHubBreadcrumbVariant
	} from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
	import PublicLandingHubBreadcrumb, {
		type PublicLandingHubBreadcrumbItem
	} from '$lib/ui/templates/landing-page/PublicLandingHubBreadcrumb.svelte';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';

	type Props = {
		kind: ListingsHubBreadcrumbKind;
		variant: ListingsHubBreadcrumbVariant;
		categoryLabel?: string | null;
		categorySlug?: string | null;
		tagLabel?: string | null;
		siteLabel?: string | null;
		class?: string;
	};

	let {
		kind,
		variant,
		categoryLabel = null,
		categorySlug = null,
		tagLabel = null,
		siteLabel = null,
		class: className = ''
	}: Props = $props();

	const items = $derived.by((): PublicLandingHubBreadcrumbItem[] => {
		const crumbs = buildListingsHubBreadcrumbItems({
			kind,
			variant,
			categoryLabel,
			categorySlug,
			tagLabel,
			siteLabel
		});

		return crumbs.map((crumb) => ({
			label: crumb.label,
			href: crumb.href
				? hostedMarketingHref(crumb.href, page.url.origin)
				: undefined
		}));
	});
</script>

<PublicLandingHubBreadcrumb {items} class={className} />
