<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SidebarLinkItem } from '$lib/ui/sidebar-expandable/types';
	import type { LayoutData } from './$types';

	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import AdminLayout from '$lib/ui/layouts/AdminLayout.svelte';
	import { url } from '$lib/utils/path';
	import { protectedLayoutPagePresenter } from '$lib/area-protected';
	import {
		getRootPathAdminArea,
		getRootPathAdminFeedbackManager,
		getRootPathAdminRoleManager
	} from '$lib/area-admin/constants/getRootPathAdminArea';
	import { getRootPathAccount } from '$lib/area-protected/getRootPathProtectedArea';
	import { icons } from '$data/icons';

	// /admin
	const rootPathAdminArea = getRootPathAdminArea();
	const adminAreaHref = url(rootPathAdminArea);

	// /admin/feedback-manager
	const rootPathAdminFeedbackManager = getRootPathAdminFeedbackManager();
	const adminFeedbackManagerHref = url(rootPathAdminFeedbackManager);

	// /admin/role-manager
	const rootPathAdminRoleManager = getRootPathAdminRoleManager();
	const adminRoleManagerHref = url(rootPathAdminRoleManager);

	// /account
	const rootPathAccount = getRootPathAccount();
	const accountHref = url(rootPathAccount);

	type Props = {
		children: Snippet;
		data: LayoutData;
	};

	let { children, data }: Props = $props();
	const currentUser = $derived((data as App.LayoutData)?.currentUser ?? null);
	const companyNameVm = $derived((data as App.LayoutData)?.companyNameVm ?? 'Openquok');

	const navLinks: SidebarLinkItem[] = [
		{ label: 'Admin Dashboard', href: adminAreaHref, iconName: icons.Gauge.name },
		{ label: 'Feedback manager', href: adminFeedbackManagerHref, iconName: icons.MessageCircle.name },
		{ label: 'Role manager', href: adminRoleManagerHref, iconName: icons.UserCheck.name },
		{ label: 'Exit admin area', href: accountHref, iconName: icons.LogOut.name }
	];

	const notificationsDockPreview = $derived({
		items: protectedLayoutPagePresenter.notificationPreviewVm,
		loading: protectedLayoutPagePresenter.notificationPreviewLoading,
		emptyMessage: protectedLayoutPagePresenter.notificationPreviewEmptyMessage,
		onOpen: () => {
			void protectedLayoutPagePresenter.loadNotificationPreview();
		}
	});

	function refreshDockBadge() {
		if (!browser) return;
		void protectedLayoutPagePresenter.refreshEditorDockNotifications();
	}

	onMount(refreshDockBadge);

	afterNavigate(refreshDockBadge);
</script>

<AdminLayout
	{currentUser}
	companyName={companyNameVm}
	mainLinks={navLinks}
	notificationsDockPreview={notificationsDockPreview}
	editorDockNotificationBadge={protectedLayoutPagePresenter.editorDockNotificationUnreadCount}
>
	{@render children?.()}
</AdminLayout>
