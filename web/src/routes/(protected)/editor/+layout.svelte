<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import type { SidebarLinkItem } from '$lib/ui/sidebar-expandable/types';

	import { icons } from '$data/icon';
	import { url } from '$lib/utils/path';
	import { getRootPathEditorArea, getRootPathEditorFeedbackManager } from '$lib/area-admin/constants/getRootPathEditorArea';
	import { getRootPathAccount } from '$lib/area-protected/getRootPathProtectedArea';
	import AdminLayout from '$lib/ui/layouts/AdminLayout.svelte';

	type Props = {
		children: Snippet;
		data: LayoutData;
	};

	let { children, data }: Props = $props();
	const currentUser = $derived((data as App.LayoutData)?.currentUser ?? null);
	const companyNameVm = $derived((data as App.LayoutData)?.companyNameVm ?? 'Content OS');

	const navLinks: SidebarLinkItem[] = [
		{ label: 'Admin Dashboard', href: url(getRootPathEditorArea()), iconName: icons.Gauge.name },
		{ label: 'Feedback manager', href: url(getRootPathEditorFeedbackManager()), iconName: icons.MessageCircle.name },
		{ label: 'Exit admin area', href: url(getRootPathAccount()), iconName: icons.LogOut.name }
	];
</script>

<AdminLayout {currentUser} companyName={companyNameVm} mainLinks={navLinks}>
	{@render children?.()}
</AdminLayout>

