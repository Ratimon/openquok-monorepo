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
	import { icons } from '$data/icons';
	import AdminLayout from '$lib/ui/layouts/AdminLayout.svelte';

	// /secret-admin
	const rootPathSecretAdminArea = getRootPathSecretAdminArea();
	const secretAdminAreaHref = url(rootPathSecretAdminArea);

	// /secret-admin/feedback-manager
	const rootPathSecretAdminFeedbackManager = getRootPathSecretAdminFeedbackManager();
	const secretAdminFeedbackManagerHref = url(rootPathSecretAdminFeedbackManager);

	// /secret-admin/role-manager
	const rootPathSecretAdminRoleManager = getRootPathSecretAdminRoleManager();
	const secretAdminRoleManagerHref = url(rootPathSecretAdminRoleManager);

	// /secret-admin/permission-manager
	const rootPathSecretAdminPermissionManager = getRootPathSecretAdminPermissionManager();
	const secretAdminPermissionManagerHref = url(rootPathSecretAdminPermissionManager);

	// /secret-admin/email-manager
	const rootPathSecretAdminEmailManager = getRootPathSecretAdminEmailManager();
	const secretAdminEmailManagerHref = url(rootPathSecretAdminEmailManager);

	// /secret-admin/bull-board
	const rootPathSecretAdminBullBoard = getRootPathSecretAdminBullBoard();
	const secretAdminBullBoardHref = url(rootPathSecretAdminBullBoard);

	// /secret-admin/blog-manager
	const rootPathSecretAdminBlogManager = getRootPathSecretAdminBlogManager();
	const secretAdminBlogManagerHref = url(rootPathSecretAdminBlogManager);

	// /secret-admin/config-manager
	const rootPathSecretAdminConfigManager = getRootPathSecretAdminConfigManager();
	const secretAdminConfigManagerHref = url(rootPathSecretAdminConfigManager);

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

	const secretAdminLinks: SidebarLinkItem[] = [
		{ label: 'Admin Dashboard', href: secretAdminAreaHref, iconName: icons.Gauge.name },
		{ label: 'Feedback manager', href: secretAdminFeedbackManagerHref, iconName: icons.MessageCircle.name },
		{ label: 'Role manager', href: secretAdminRoleManagerHref, iconName: icons.UserCheck.name },
		{ label: 'Permission manager', href: secretAdminPermissionManagerHref, iconName: icons.User2.name },
		{ label: 'Email manager', href: secretAdminEmailManagerHref, iconName: icons.Mail.name },
		{ label: 'Queue dashboard', href: secretAdminBullBoardHref, iconName: icons.Activity.name },
		{ label: 'Blog Manager', href: secretAdminBlogManagerHref, iconName: icons.FileText.name },
		{ label: 'Config manager', href: secretAdminConfigManagerHref, iconName: icons.Cog.name },
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
	mainLinks={secretAdminLinks}
	notificationsDockPreview={notificationsDockPreview}
	editorDockNotificationBadge={protectedLayoutPagePresenter.editorDockNotificationUnreadCount}
>
	{@render children?.()}
</AdminLayout>