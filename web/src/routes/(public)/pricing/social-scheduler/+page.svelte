<script lang="ts">
	import type { PageData } from './$types';

	import PublicPricingPage from '$lib/ui/components/pricing/PublicPricingPage.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let isLoggedIn = $derived(data.isLoggedIn ?? false);
	let schemaData = $derived(data.schemaData);
</script>

<JsonLdHead schemaData={schemaData} />

<PublicPricingPage
	{isLoggedIn}
	productLine={data.productLine}
	pricingHero={data.pricingHero}
	pricingBreadcrumbLabel={data.pricingBreadcrumbLabel}
	defaultPeriod={data.defaultPeriod}
	publicFaqConfigPm={data.publicFaqConfigPm}
	publicFaqItemsVm={data.publicFaqItemsVm}
/>
