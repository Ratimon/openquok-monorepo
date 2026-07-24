<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	import { page } from '$app/state';

	import { publicLayoutPagePresenter } from '$lib/area-public/index';
	import {
		PUBLIC_NAVBAR_LINKS,
		PUBLIC_NAVBAR_MOBILE_LINKS,
		PUBLIC_FOOTER_LINKS
	} from '$lib/config/constants/config';
	import { authenticationRepository, verifyEmailPresenter } from '$lib/user-auth/index';
	import { VerifyEmailStatus } from '$lib/user-auth/VerifyEmail.presenter.svelte';
	import { getRootPathVerifySignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { url } from '$lib/utils/path';

	import PublicArea from '$lib/ui/templates/PublicArea.svelte';

	type Props = {
		children: Snippet;
		data: LayoutData;
	} & LayoutData;

	let { children, data }: Props = $props();
	let isLoggedIn = $derived((data as App.LayoutData)?.isLoggedIn ?? false);
	let currentUser = $derived((data as App.LayoutData)?.currentUser ?? null);
	const verifySignupPath = url(getRootPathVerifySignup());
	const onVerifySignupPage = $derived(page.url.pathname === verifySignupPath);
	/** Header Account link when verified, or after successful verify on this page. */
	let accountNavEnabled = $derived(
		!isLoggedIn ||
			authenticationRepository.currentUser?.isEmailVerified === true ||
			currentUser?.isEmailVerified === true ||
			(onVerifySignupPage && verifyEmailPresenter.status === VerifyEmailStatus.CONFIRMED)
	);
	let accountHardNavigate = $derived(
		onVerifySignupPage && verifyEmailPresenter.status === VerifyEmailStatus.CONFIRMED
	);
	// Use server-rendered data from layout, fallback to presenter for client-side resilience
	let companyNameVm = $derived(
		(data as App.LayoutData)?.companyNameVm ??
			(page.data as App.LayoutData)?.companyNameVm ??
			publicLayoutPagePresenter.companyNameVm ??
			'OPENQUOK'
	);
	let companyYearVm = $derived(
		(data as App.LayoutData)?.companyYearVm ??
			(page.data as App.LayoutData)?.companyYearVm ??
			publicLayoutPagePresenter.companyYearVm ??
			new Date().getFullYear().toString()
	);
	let companyAddressVm = $derived(
		(data as App.LayoutData)?.companyAddressVm ??
			(page.data as App.LayoutData)?.companyAddressVm ??
			publicLayoutPagePresenter.companyAddressVm ??
			''
	);
	let supportPhoneVm = $derived(
		(data as App.LayoutData)?.supportPhoneVm ??
			(page.data as App.LayoutData)?.supportPhoneVm ??
			publicLayoutPagePresenter.supportPhoneVm ??
			''
	);
	let supportEmailVm = $derived(
		(data as App.LayoutData)?.supportEmailVm ??
			(page.data as App.LayoutData)?.supportEmailVm ??
			publicLayoutPagePresenter.supportEmailVm ??
			''
	);
	let navbarDesktopLinks = $derived((page.data as { navbarDesktopLinks?: typeof PUBLIC_NAVBAR_LINKS })?.navbarDesktopLinks ?? PUBLIC_NAVBAR_LINKS);
	let navbarMobileLinks = $derived((page.data as { navbarMobileLinks?: typeof PUBLIC_NAVBAR_MOBILE_LINKS })?.navbarMobileLinks ?? PUBLIC_NAVBAR_MOBILE_LINKS);
	let footerNavigationLinks = $derived((page.data as { footerNavigationLinks?: typeof PUBLIC_FOOTER_LINKS })?.footerNavigationLinks ?? PUBLIC_FOOTER_LINKS);
</script>

<PublicArea
	{isLoggedIn}
	accountNavEnabled={accountNavEnabled}
	accountHardNavigate={accountHardNavigate}
	companyNameVm={companyNameVm}
	companyYearVm={companyYearVm}
	companyAddressVm={companyAddressVm}
	supportPhoneVm={supportPhoneVm}
	supportEmailVm={supportEmailVm}
	{navbarDesktopLinks}
	{navbarMobileLinks}
	{footerNavigationLinks}
>
	<div class="container mx-auto max-w-3xl px-4 py-8">
		{@render children?.()}
	</div>
</PublicArea>
