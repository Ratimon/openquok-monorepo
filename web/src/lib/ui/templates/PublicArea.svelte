<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Link } from '$lib/ui/nav-bars/Link';

	import {
		PUBLIC_NAVBAR_LINKS,
		PUBLIC_NAVBAR_MOBILE_LINKS,
		PUBLIC_FOOTER_LINKS
	} from '$lib/config/constants/config';

	import HeaderPublic from '$lib/ui/templates/HeaderPublic.svelte';
	import Footer from '$lib/ui/templates/Footer.svelte';

	interface Props {
		children: Snippet;
		isLoggedIn: boolean;
		/** When false and user is logged in, header Account control is disabled until email is verified. */
		accountNavEnabled?: boolean;
		/** Full page load for header Account link (e.g. after verify-signup). */
		accountHardNavigate?: boolean;
		navbarDesktopLinks?: Link[];
		navbarMobileLinks?: Link[];
		footerNavigationLinks?: Record<string, { label: string; href: string }[]>;
		companyNameVm: string;
		companyYearVm: string;
		companyAddressVm?: string;
		supportPhoneVm?: string;
		supportEmailVm?: string;
	}

	let {
		children,
		isLoggedIn,
		accountNavEnabled = true,
		accountHardNavigate = false,
		navbarDesktopLinks: propNavbarDesktopLinks,
		navbarMobileLinks: propNavbarMobileLinks,
		footerNavigationLinks: propFooterNavigationLinks,
		companyNameVm,
		companyYearVm,
		companyAddressVm = '',
		supportPhoneVm = '',
		supportEmailVm = ''
	}: Props = $props();

	let navbarDesktopLinks = $derived(propNavbarDesktopLinks ?? PUBLIC_NAVBAR_LINKS);
	let navbarMobileLinks = $derived(propNavbarMobileLinks ?? PUBLIC_NAVBAR_MOBILE_LINKS);
	let footerNavigationLinks = $derived(propFooterNavigationLinks ?? PUBLIC_FOOTER_LINKS);
</script>

<section class="min-h-screen flex flex-col">
	<HeaderPublic
		{navbarDesktopLinks}
		{navbarMobileLinks}
		{companyNameVm}
		{isLoggedIn}
		{accountNavEnabled}
		{accountHardNavigate}
	/>
	<main class="flex-1">
		{@render children?.()}
	</main>
	<Footer
		{footerNavigationLinks}
		{companyNameVm}
		{companyYearVm}
		{companyAddressVm}
		{supportPhoneVm}
		{supportEmailVm}
	/>
</section>
