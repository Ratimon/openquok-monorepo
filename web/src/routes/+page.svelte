<script lang="ts">
	import type { PageData } from './$types';

	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { browser } from '$app/environment';

	import { publicLayoutPagePresenter } from '$lib/area-public/index';
	import { getLandingPageConfigDefaults, getPublicFaqConfigDefaults } from '$lib/config/constants/config';

	import PublicArea from '$lib/ui/templates/PublicArea.svelte';
	import LandingPage from '$lib/ui/templates/landing-page/LandingPage.svelte';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

	let isLoggedIn = $derived(data.isLoggedIn ?? false);
	let navbarDesktopLinks = $derived(data.navbarDesktopLinks ?? page.data.navbarDesktopLinks ?? []);
	let navbarMobileLinks = $derived(data.navbarMobileLinks ?? page.data.navbarMobileLinks ?? []);
	let footerNavigationLinks = $derived(
		data.footerNavigationLinks ?? page.data.footerNavigationLinks ?? {}
	);
	let companyNameVm = $derived(
		data.companyNameVm ?? page.data.companyNameVm ?? publicLayoutPagePresenter.companyNameVm
	);
	let companyYearVm = $derived(
		data.companyYearVm ?? page.data.companyYearVm ?? publicLayoutPagePresenter.companyYearVm
	);
	let marketingInformationVm = $derived(
		(data.marketingInformationVm && Object.keys(data.marketingInformationVm).length > 0)
			? data.marketingInformationVm
			: page.data.marketingInformationVm &&
				  Object.keys(page.data.marketingInformationVm).length > 0
				? page.data.marketingInformationVm
				: publicLayoutPagePresenter.marketingInformationVm
	);
	let landingPageConfigVm = $derived(
		data.landingPageConfigVm && Object.keys(data.landingPageConfigVm).length > 0
			? data.landingPageConfigVm
			: getLandingPageConfigDefaults()
	);
	let publicFaqConfigVm = $derived(
		data.publicFaqConfigVm && Object.keys(data.publicFaqConfigVm).length > 0
			? data.publicFaqConfigVm
			: getPublicFaqConfigDefaults()
	);
	let publicFaqItemsVm = $derived(data.publicFaqItemsVm ?? []);
	let schemaData = $derived(data.schemaData);

	onMount(() => {
		if (!browser) return;

		const hasServerFooterData = data.companyNameVm ?? page.data.companyNameVm;
		const hasPresenterFooterData =
			Object.keys(publicLayoutPagePresenter.marketingInformationVm).length > 0;
		if (!hasServerFooterData && !hasPresenterFooterData) {
			publicLayoutPagePresenter.loadInfoForFooter();
		}
	});
</script>

<svelte:head>
	{#if schemaData}
		<script type="application/ld+json">{JSON.stringify(schemaData)}</script>
	{/if}
</svelte:head>

<PublicArea
	{isLoggedIn}
	{companyNameVm}
	{companyYearVm}
	{marketingInformationVm}
	{navbarDesktopLinks}
	{navbarMobileLinks}
	{footerNavigationLinks}
>
	<LandingPage
		{landingPageConfigVm}
		{publicFaqConfigVm}
		{publicFaqItemsVm}
		{isLoggedIn}
	/>
</PublicArea>
