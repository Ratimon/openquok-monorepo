<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import type { SidebarLinkItem } from '$lib/ui/sidebar-expandable/types';
	import type { SettingsNavItem } from '$lib/ui/sidebar-main/types';

	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { setContext } from 'svelte';
	import { icons } from '$data/icons';
	import {
		getRootPathAccount,
		getRootPathCalendar,
		getRootPathTemplates,
		getRootPathPlugs,
		getRootPathAnalytics,
		getRootPathMedia,
		getRootPathIntegrations,
		protectedLayoutPagePresenter
	} from '$lib/area-protected';
	import { route } from '$lib/utils/path';
	import { SETTINGS_SIDEBAR_KEY } from '$lib/ui/templates/sidebar-secondary-context';
	
	import AdminLayout from '$lib/ui/layouts/AdminLayout.svelte';

	type AppSettingsSectionId =
		| 'global'
		| 'workspace'
		| 'profile'
		| 'signature'
		| 'webhooks'
		| 'templates'
		| 'developers'
		| 'approved-apps';

	type AccountLayoutProps = {
		children: Snippet;
		data: LayoutData;
	};

	let { children, data }: AccountLayoutProps = $props();

	const currentUser = $derived((data as App.LayoutData)?.currentUser ?? null);
	const companyNameVm = $derived((data as App.LayoutData)?.companyNameVm ?? 'Openquok');

	// /account 
	const rootPathAccount = getRootPathAccount();
	const accountPath = route(rootPathAccount);

	// /account/calendar
	const rootPathCalendar = getRootPathCalendar();
	const calendarPath = route(`${rootPathAccount}/${rootPathCalendar}`);

	// /account/templates
	const rootPathTemplates = getRootPathTemplates();
	const templatesPath = route(`${rootPathAccount}/${rootPathTemplates}`);

	// /account/plugs
	const rootPathPlugs = getRootPathPlugs();
	const plugsPath = route(`${rootPathAccount}/${rootPathPlugs}`);

	// /account/analytics
	const rootPathAnalytics = getRootPathAnalytics();
	const analyticsPath = route(`${rootPathAccount}/${rootPathAnalytics}`);

	// /account/media
	const rootPathMedia = getRootPathMedia();
	const mediaPath = route(`${rootPathAccount}/${rootPathMedia}`);

	// /account/integrations
	const rootPathIntegrations = getRootPathIntegrations();
	const integrationsPath = route(`${rootPathAccount}/${rootPathIntegrations}`);

	
	const mainLinks: SidebarLinkItem[] = [
		{ label: 'Dashboard', href: accountPath, iconName: icons.Gauge.name },
		{ label: 'Calendar', href: calendarPath, iconName: icons.CalendarClock.name },
		{ label: 'Templates', href: templatesPath, iconName: icons.LayoutTemplate.name },
		{ label: 'Auto Plugs', href: plugsPath, iconName: icons.Sparkles.name },
		{ label: 'Analytics', href: analyticsPath, iconName: icons.ChartBar.name },
		{ label: 'Media', href: mediaPath, iconName: icons.Image.name },
		{ label: 'Integrations', href: integrationsPath, iconName: icons.Link.name },
	];

	const SETTINGS_NAV: SettingsNavItem<AppSettingsSectionId>[] = [
		{ id: 'global', label: 'Global Settings' },
		{ id: 'workspace', label: 'Workspace' },
		{ id: 'profile', label: 'Profile' },
		{ id: 'signature', label: 'Signatures' },
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

