<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { publicLayoutPagePresenter } from '$lib/area-public/index';
	import {
		PUBLIC_NAVBAR_LINKS,
		PUBLIC_NAVBAR_MOBILE_LINKS,
		PUBLIC_FOOTER_LINKS
	} from '$lib/config/constants/config';
	import PublicArea from '$lib/ui/templates/PublicArea.svelte';

	type Props = {
		children: Snippet;
		data: LayoutData;
	} & LayoutData;

	let { children, data }: Props = $props();
	let isLoggedIn = $derived((data as App.LayoutData)?.isLoggedIn ?? false);
	// Use server-rendered data from layout, fallback to presenter for client-side resilience
	let companyNameVm = $derived(
		(data as App.LayoutData)?.companyNameVm ??
			(page.data as App.LayoutData)?.companyNameVm ??
			publicLayoutPagePresenter.companyNameVm ??
			'Content OS'
	);
	let companyYearVm = $derived(
		(data as App.LayoutData)?.companyYearVm ??
			(page.data as App.LayoutData)?.companyYearVm ??
			publicLayoutPagePresenter.companyYearVm ??
			new Date().getFullYear().toString()
	);
	let marketingInformationVm = $derived(
		(data as App.LayoutData)?.marketingInformationVm &&
			Object.keys((data as App.LayoutData).marketingInformationVm ?? {}).length > 0
			? (data as App.LayoutData).marketingInformationVm!
			: (page.data as App.LayoutData)?.marketingInformationVm &&
					Object.keys((page.data as App.LayoutData)?.marketingInformationVm ?? {}).length > 0
				? (page.data as App.LayoutData).marketingInformationVm!
				: publicLayoutPagePresenter.marketingInformationVm
	);
	let navbarDesktopLinks = $derived((page.data as { navbarDesktopLinks?: typeof PUBLIC_NAVBAR_LINKS })?.navbarDesktopLinks ?? PUBLIC_NAVBAR_LINKS);
	let navbarMobileLinks = $derived((page.data as { navbarMobileLinks?: typeof PUBLIC_NAVBAR_MOBILE_LINKS })?.navbarMobileLinks ?? PUBLIC_NAVBAR_MOBILE_LINKS);
	let footerNavigationLinks = $derived((page.data as { footerNavigationLinks?: typeof PUBLIC_FOOTER_LINKS })?.footerNavigationLinks ?? PUBLIC_FOOTER_LINKS);

	// SAFE: Client-side only – load public footer/company info if not already from server (e.g. direct nav to auth page).
	// Only fetches public config (company name, year, social links); no user data or secrets.
	onMount(async () => {
		if (!browser) return;
		const hasServerData =
			(data as App.LayoutData)?.companyNameVm ?? (page.data as App.LayoutData)?.companyNameVm;
		const hasPresenterData =
			Object.keys(publicLayoutPagePresenter.marketingInformationVm).length > 0;
		if (!hasServerData && !hasPresenterData) {
			await publicLayoutPagePresenter.loadInfoForFooter();
		}
	});
</script>

<PublicArea
	{isLoggedIn}
	companyNameVm={companyNameVm}
	companyYearVm={companyYearVm}
	marketingInformationVm={marketingInformationVm}
	{navbarDesktopLinks}
	{navbarMobileLinks}
	{footerNavigationLinks}
>
	<div class="container mx-auto max-w-3xl px-4 py-8">
		{@render children?.()}
	</div>
</PublicArea>
