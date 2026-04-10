<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import type { SidebarLinkItem } from '$lib/ui/sidebar-expandable/types';
	import type { SettingsNavItem } from '$lib/ui/sidebar-main/types';

	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { setContext } from 'svelte';
	import { icons } from '$data/icon';
	import { SETTINGS_SIDEBAR_KEY } from '$lib/ui/templates/sidebar-secondary-context';
	import { protectedLayoutPagePresenter } from '$lib/area-protected';
	
	import AdminLayout from '$lib/ui/layouts/AdminLayout.svelte';

	type AppSettingsSectionId =
		| 'global'
		| 'workspace'
		| 'profile'
		| 'webhooks'
		| 'templates'
		| 'developers'
		| 'approved-apps';

	type Props = {
		children: Snippet;
		data: LayoutData;
	};

	let { children, data }: Props = $props();

	const currentUser = $derived((data as App.LayoutData)?.currentUser ?? null);
	const companyNameVm = $derived((data as App.LayoutData)?.companyNameVm ?? 'Openquok');

	const mainLinks: SidebarLinkItem[] = [
		{ label: 'Calendar', href: '/calendar', iconName: icons.CalendarClock.name },
		{ label: 'Analytics', href: '/analytics', iconName: icons.ChartBar.name },
		{ label: 'Media', href: '/media', iconName: icons.Image.name },
		{ label: 'Integrations', href: '/integrations', iconName: icons.Link.name }
	];

	const SETTINGS_NAV: SettingsNavItem<AppSettingsSectionId>[] = [
		{ id: 'global', label: 'Global Settings' },
		{ id: 'workspace', label: 'Workspace' },
		{ id: 'profile', label: 'Profile' },
		{ id: 'webhooks', label: 'Webhooks' },
		{ id: 'templates', label: 'Templates' },
		{ id: 'developers', label: 'Developers' },
		{ id: 'approved-apps', label: 'Approved Apps' }
	];

	function setSettingsSidebarContext() {
		const currentSection = $derived((page.url.searchParams.get('section') as AppSettingsSectionId) || 'global');
		const sectionTitle = $derived(
			SETTINGS_NAV.find((item) => item.id === currentSection)?.label ?? 'Global Settings'
		);
		const basePath = $derived(page.url.pathname);

		setContext(SETTINGS_SIDEBAR_KEY, {
			navItems: SETTINGS_NAV,
			getCurrentSection: () => currentSection,
			getSectionTitle: () => sectionTitle,
			getBasePath: () => basePath
		});
	}
	setSettingsSidebarContext();

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
	mainLinks={mainLinks}
	notificationsDockPreview={notificationsDockPreview}
	editorDockNotificationBadge={protectedLayoutPagePresenter.editorDockNotificationUnreadCount}
>
	{@render children?.()}
</AdminLayout>

