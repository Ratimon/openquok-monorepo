<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

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
</script>

<PublicArea
	{isLoggedIn}
	{navbarDesktopLinks}
	{navbarMobileLinks}
	{footerNavigationLinks}
	companyNameVm={companyNameVm}
	companyYearVm={companyYearVm}
>
	{@render children?.()}
</PublicArea>
