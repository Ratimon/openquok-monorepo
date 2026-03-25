<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { publicLayoutPagePresenter } from '$lib/area-public/index';
	import PublicArea from '$lib/ui/templates/PublicArea.svelte';

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
	<div class="container mx-auto px-4 py-12">
		<h1 class="text-3xl font-bold text-primary">
			Welcome to Openquok</h1>
		<p class="mt-4 text-lg text-base-content/80">
			This is the public area. You can replace this with your landing page or home content.
		</p>
		{#if isLoggedIn && currentUser}
			<div class="mt-6 rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
				<h2 class="text-lg font-semibold text-base-content">
					Signed-in user</h2>
				<dl class="mt-3 space-y-2 text-sm">
					<div>
						<dt class="inline font-medium text-base-content/70">Id:</dt>
						<dd class="inline">{currentUser.id ?? '—'}</dd>
					</div>
					<div>
						<dt class="inline font-medium text-base-content/70">Email:</dt>
						<dd class="inline">{currentUser.email}</dd>
					</div>
					<div>
						<dt class="inline font-medium text-base-content/70">Full name:</dt>
						<dd class="inline">{currentUser.fullName}</dd>
					</div>
					<div>
						<dt class="inline font-medium text-base-content/70">Username:</dt>
						<dd class="inline">{currentUser.username ?? '—'}</dd>
					</div>
					<div>
						<dt class="inline font-medium text-base-content/70">Email verified:</dt>
						<dd class="inline">{currentUser.isEmailVerified === true ? 'Yes' : 'No'}</dd>
					</div>
					{#if currentUser.roles && currentUser.roles.length > 0}
						<div>
							<dt class="inline font-medium text-base-content/70">Roles:</dt>
							<dd class="inline">{currentUser.roles.join(', ')}</dd>
						</div>
					{/if}
				</dl>
			</div>
		{:else}
			<p class="mt-4 text-sm text-base-content/70">
				You are not signed in.</p>
		{/if}
	</div>
</PublicArea>
