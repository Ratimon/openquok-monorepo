<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import type { SidebarLinkItem } from '$lib/ui/sidebar-expandable/types';

	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { icons } from '$data/icon';
	import { url } from '$lib/utils/path';
	import { getRootPathEditorArea, getRootPathEditorFeedbackManager } from '$lib/area-admin/constants/getRootPathEditorArea';
	import { getRootPathSecretAdminBlogManagerTopics } from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { getRootPathAccount } from '$lib/area-protected/getRootPathProtectedArea';
	import { protectedLayoutPagePresenter } from '$lib/area-protected';
	import AdminLayout from '$lib/ui/layouts/AdminLayout.svelte';

	type Props = {
		children: Snippet;
		data: LayoutData;
	};

	let { children, data }: Props = $props();
	const currentUser = $derived((data as App.LayoutData)?.currentUser ?? null);
	const companyNameVm = $derived((data as App.LayoutData)?.companyNameVm ?? 'Openquok');

	const editorNewTemplateHref = $derived(url(getRootPathSecretAdminBlogManagerTopics()));

	const navLinks: SidebarLinkItem[] = $derived([
		{ label: 'Admin Dashboard', href: url(getRootPathEditorArea()), iconName: icons.Gauge.name },
		{ label: 'Feedback manager', href: url(getRootPathEditorFeedbackManager()), iconName: icons.MessageCircle.name },
		{ label: 'Exit admin area', href: url(getRootPathAccount()), iconName: icons.LogOut.name }
	]);

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
	editorDockNewTemplateHref={editorNewTemplateHref}
>
	{@render children?.()}
</AdminLayout>
