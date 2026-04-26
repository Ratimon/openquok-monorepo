<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import type { SidebarLinkItem } from '$lib/ui/sidebar-expandable/types';

	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { url } from '$lib/utils/path';
	import { protectedLayoutPagePresenter } from '$lib/area-protected';
	import {
		getRootPathSecretAdminArea,
		getRootPathSecretAdminFeedbackManager,
		getRootPathSecretAdminRoleManager,
		getRootPathSecretAdminPermissionManager,
		getRootPathSecretAdminBlogManager,
		getRootPathSecretAdminBullBoard,
		getRootPathSecretAdminConfigManager,
		getRootPathSecretAdminEmailManager,
	} from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { getRootPathAccount } from '$lib/area-protected/getRootPathProtectedArea';
	import { icons } from '$data/icon';
	import AdminLayout from '$lib/ui/layouts/AdminLayout.svelte';

	type Props = {
		children: Snippet;
		data: LayoutData;
	};

	let { children, data }: Props = $props();
	const currentUser = $derived((data as App.LayoutData)?.currentUser ?? null);
	const companyNameVm = $derived((data as App.LayoutData)?.companyNameVm ?? 'Openquok');

	const secretAdminLinks: SidebarLinkItem[] = [
		{ label: 'Admin Dashboard', href: url(getRootPathSecretAdminArea()), iconName: icons.Gauge.name },
		{ label: 'Feedback manager', href: url(getRootPathSecretAdminFeedbackManager()), iconName: icons.MessageCircle.name },
		{ label: 'Role manager', href: url(getRootPathSecretAdminRoleManager()), iconName: icons.UserCheck.name },
		{ label: 'Permission manager', href: url(getRootPathSecretAdminPermissionManager()), iconName: icons.User2.name },
		{ label: 'Email manager', href: url(getRootPathSecretAdminEmailManager()), iconName: icons.Mail.name },
		{ label: 'Queue dashboard', href: url(getRootPathSecretAdminBullBoard()), iconName: icons.Activity.name },
		{ label: 'Blog Manager', href: url(getRootPathSecretAdminBlogManager()), iconName: icons.FileText.name },
		{ label: 'Config manager', href: url(getRootPathSecretAdminConfigManager()), iconName: icons.Cog.name },
		{ label: 'Exit admin area', href: url(getRootPathAccount()), iconName: icons.LogOut.name }
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
	mainLinks={secretAdminLinks}
	notificationsDockPreview={notificationsDockPreview}
	editorDockNotificationBadge={protectedLayoutPagePresenter.editorDockNotificationUnreadCount}
>
	{@render children?.()}
</AdminLayout>