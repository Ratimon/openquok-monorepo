<script lang="ts">
	import type { PageData } from './$types';

	import { page } from '$app/state';

	import { publicLayoutPagePresenter } from '$lib/area-public/index';
	import { getLandingPageConfigDefaults, getPublicFaqConfigDefaults } from '$lib/config/constants/config';

	import PublicArea from '$lib/ui/templates/PublicArea.svelte';
	import LandingPage from '$lib/ui/templates/landing-page/LandingPage.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

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
	let companyAddressVm = $derived(
		data.companyAddressVm ??
			page.data.companyAddressVm ??
			publicLayoutPagePresenter.companyAddressVm ??
			''
	);
	let supportPhoneVm = $derived(
		data.supportPhoneVm ??
			page.data.supportPhoneVm ??
			publicLayoutPagePresenter.supportPhoneVm ??
			''
	);
	let supportEmailVm = $derived(
		data.supportEmailVm ??
			page.data.supportEmailVm ??
			publicLayoutPagePresenter.supportEmailVm ??
			''
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
	let listingsPreviewVm = $derived(data.listingsPreviewVm);
	let schemaData = $derived(data.schemaData);
</script>

<JsonLdHead schemaData={schemaData} />

<PublicArea
	{isLoggedIn}
	{companyNameVm}
	{companyYearVm}
	{companyAddressVm}
	{supportPhoneVm}
	{supportEmailVm}
	{navbarDesktopLinks}
	{navbarMobileLinks}
	{footerNavigationLinks}
>
	<LandingPage
		{landingPageConfigVm}
		{publicFaqConfigVm}
		{publicFaqItemsVm}
		{listingsPreviewVm}
		{isLoggedIn}
	/>
</PublicArea>
