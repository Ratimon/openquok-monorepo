<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { publicLayoutPagePresenter } from '$lib/area-public/index';
	import { CONFIG_SCHEMA_LANDING_PAGE } from '$lib/config/constants/config';
	import PublicArea from '$lib/ui/templates/PublicArea.svelte';
	import LandingPage from '$lib/ui/templates/LandingPage.svelte';

	type Props = {
		data: PageData & App.HomePageData;
	} & App.HomePageData;

	let { data }: Props = $props();

	let isLoggedIn = $derived((data as App.HomePageData)?.isLoggedIn ?? false);
	let currentUser = $derived((data as App.HomePageData)?.currentUser ?? null);
	// let currentUserId = $derived(currentUser?.id ?? undefined);
	let navbarDesktopLinks = $derived(
		(data as App.HomePageData)?.navbarDesktopLinks ?? (page.data as App.HomePageData)?.navbarDesktopLinks ?? []
	);
	let navbarMobileLinks = $derived(
		(data as App.HomePageData)?.navbarMobileLinks ?? (page.data as App.HomePageData)?.navbarMobileLinks ?? []
	);
	let footerNavigationLinks = $derived(
		(data as App.HomePageData)?.footerNavigationLinks ??
			(page.data as App.HomePageData)?.footerNavigationLinks ??
			{}
	);
	let companyNameVm = $derived(
		(data as App.HomePageData)?.companyNameVm ??
			(page.data as App.HomePageData)?.companyNameVm ??
			publicLayoutPagePresenter.companyNameVm
	);
	let companyYearVm = $derived(
		(data as App.HomePageData)?.companyYearVm ??
			(page.data as App.HomePageData)?.companyYearVm ??
			publicLayoutPagePresenter.companyYearVm
	);
	let marketingInformationVm = $derived(
		(() => {
			const d = data as App.HomePageData;
			const p = page.data as App.HomePageData;
			if (d?.marketingInformationVm && Object.keys(d.marketingInformationVm).length > 0)
				return d.marketingInformationVm;
			if (p?.marketingInformationVm && Object.keys(p.marketingInformationVm || {}).length > 0)
				return p.marketingInformationVm;
			return publicLayoutPagePresenter.marketingInformationVm;
		})()
	);

	let landingPageConfigVm = $derived(
		(data as any)?.landingPageConfigVm ??
			(page.data as any)?.landingPageConfigVm ?? {
				HERO_TITLE: String(CONFIG_SCHEMA_LANDING_PAGE.HERO_TITLE.default),
				HERO_SLOGAN: String(CONFIG_SCHEMA_LANDING_PAGE.HERO_SLOGAN.default),
				ACTIVE_TOP_BANNER: String(CONFIG_SCHEMA_LANDING_PAGE.ACTIVE_TOP_BANNER.default)
			}
	);

	onMount(() => {
		const hasServerFooterData =
			(data as App.HomePageData)?.companyNameVm ?? (page.data as App.HomePageData)?.companyNameVm;
		const hasPresenterFooterData =
			Object.keys(publicLayoutPagePresenter.marketingInformationVm).length > 0;
		if (!hasServerFooterData && !hasPresenterFooterData) {
			publicLayoutPagePresenter.loadInfoForFooter();
		}
		
	});
</script>

<PublicArea
	{isLoggedIn}
	{companyNameVm}
	{companyYearVm}
	{marketingInformationVm}
	{navbarDesktopLinks}
	{navbarMobileLinks}
	{footerNavigationLinks}
>
	<LandingPage {landingPageConfigVm} />
</PublicArea>
