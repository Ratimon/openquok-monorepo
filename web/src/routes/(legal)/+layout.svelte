<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { publicLayoutPagePresenter } from '$lib/area-public/index';
	import PublicArea from '$lib/ui/templates/PublicArea.svelte';

	type Props = {
		children: Snippet;
		data: LayoutData;
	} & LayoutData;

	let { children, data }: Props = $props();

	let isLoggedIn = $derived(page.data?.isLoggedIn ?? data?.isLoggedIn ?? false);
	let navbarDesktopLinks = $derived(data?.navbarDesktopLinks ?? page.data?.navbarDesktopLinks ?? []);
	let navbarMobileLinks = $derived(data?.navbarMobileLinks ?? page.data?.navbarMobileLinks ?? []);
	let footerNavigationLinks = $derived(data?.footerNavigationLinks ?? page.data?.footerNavigationLinks ?? {});

	let companyNameVm = $derived(
		data?.companyNameVm ?? page.data?.companyNameVm ?? publicLayoutPagePresenter.companyNameVm ?? 'Openquok'
	);
	let companyYearVm = $derived(
		data?.companyYearVm ?? page.data?.companyYearVm ?? publicLayoutPagePresenter.companyYearVm ?? new Date().getFullYear().toString()
	);
	let marketingInformationVm = $derived(
		(data?.marketingInformationVm && Object.keys(data.marketingInformationVm ?? {}).length > 0)
			? data.marketingInformationVm
			: (page.data?.marketingInformationVm && Object.keys(page.data?.marketingInformationVm ?? {}).length > 0)
				? page.data.marketingInformationVm
				: publicLayoutPagePresenter.marketingInformationVm
	);

	onMount(async () => {
		if (!browser) return;
		const hasServerData = data?.companyNameVm ?? page.data?.companyNameVm;
		const hasPresenterData = Object.keys(publicLayoutPagePresenter.marketingInformationVm).length > 0;
		if (!hasServerData && !hasPresenterData) {
			await publicLayoutPagePresenter.loadInfoForFooter();
		}
	});
</script>

<PublicArea
	{isLoggedIn}
	{navbarDesktopLinks}
	{navbarMobileLinks}
	{footerNavigationLinks}
	companyNameVm={companyNameVm}
	companyYearVm={companyYearVm}
	marketingInformationVm={marketingInformationVm}
>
	<div class="min-h-full bg-base-200/50 py-8 md:py-10">
		{@render children?.()}
	</div>
</PublicArea>
