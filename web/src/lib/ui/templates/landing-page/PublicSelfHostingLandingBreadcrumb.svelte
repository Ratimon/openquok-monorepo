<script lang="ts">
	import { page } from '$app/state';

	import { PUBLIC_LANDING_BREADCRUMB } from '$lib/content/constants/publicLandingBreadcrumbConfig';
	import PublicLandingHubBreadcrumb, {
		type PublicLandingHubBreadcrumbItem
	} from '$lib/ui/templates/landing-page/PublicLandingHubBreadcrumb.svelte';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';

	type Props = {
		class?: string;
	};

	let { class: className = '' }: Props = $props();

	const homeHref = $derived(hostedMarketingHref('/', page.url.origin));

	const items = $derived.by((): PublicLandingHubBreadcrumbItem[] => [
		{ label: 'Home', href: homeHref },
		{ label: PUBLIC_LANDING_BREADCRUMB.selfHosting }
	]);
</script>

<PublicLandingHubBreadcrumb {items} class={className} />
