<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SidebarLinkItem } from '$lib/ui/sidebar-expandable/types';
	import type { LayoutData } from './$types';
	import AdminLayout from '$lib/ui/layouts/AdminLayout.svelte';
	import { url } from '$lib/utils/path';
	import {
		getRootPathAdminArea,
		getRootPathAdminFeedbackManager,
		getRootPathAdminRoleManager
	} from '$lib/area-admin/constants/getRootPathAdminArea';
	import { getRootPathAccount } from '$lib/area-protected/getRootPathProtectedArea';
	import { icons } from '$data/icon';

	type Props = {
		children: Snippet;
		data: LayoutData;
	};

	let { children, data }: Props = $props();
	const currentUser = $derived((data as App.LayoutData)?.currentUser ?? null);
	const companyNameVm = $derived((data as App.LayoutData)?.companyNameVm ?? 'Openquok');

	const navLinks: SidebarLinkItem[] = [
		{ label: 'Admin Dashboard', href: url(getRootPathAdminArea()), iconName: icons.Gauge.name },
		{ label: 'Feedback manager', href: url(getRootPathAdminFeedbackManager()), iconName: icons.MessageCircle.name },
		{ label: 'Role manager', href: url(getRootPathAdminRoleManager()), iconName: icons.UserCheck.name },
		{ label: 'Exit admin area', href: url(getRootPathAccount()), iconName: icons.LogOut.name }
	];
</script>

<AdminLayout {currentUser} companyName={companyNameVm} mainLinks={navLinks}>
	{@render children?.()}
</AdminLayout>
