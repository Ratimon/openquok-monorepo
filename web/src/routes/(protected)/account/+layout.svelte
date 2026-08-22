<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import type { SidebarLinkItem } from '$lib/ui/sidebar-expandable/types';
	import type { SettingsNavItem } from '$lib/ui/sidebar-main/types';

	import type { AccountSidebarTourId } from '$lib/onboarding/accountSidebarTour.types';

	import { browser } from '$app/environment';
	import { afterNavigate, goto } from '$app/navigation';
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
		getRootPathPlaybooksHub,
		protectedLayoutPagePresenter
	} from '$lib/area-protected';
	import { route } from '$lib/utils/path';
	import { scheduleDeferredWork } from '$lib/utils/scheduleDeferredWork';
	import { SETTINGS_SIDEBAR_KEY } from '$lib/ui/templates/sidebar-secondary-context';
	import {
		accountSidebarTourPresenter,
		isOnboardingCompleted,
		persistAccountSidebarTourCompleted,
		productTourResetPresenter,
		readAccountSidebarTourCompleted,
		resolveAccountSidebarTourId
	} from '$lib/onboarding';
	import { workspaceSettingsPresenter } from '$lib/settings';

	import AccountSidebarFeatureTourDialog from '$lib/ui/components/onboarding/AccountSidebarFeatureTourDialog.svelte';
	import ProtectedLayout from '$lib/ui/layouts/ProtectedLayout.svelte';

	type AppSettingsSectionId =
		| 'timezone'
		| 'workspace'
		| 'profile'
		| 'signature'
		| 'templates'
		| 'developers'
		| 'approved-apps';

	type AccountLayoutProps = {
		children: Snippet;
		data: LayoutData;
	};

	let { children, data }: AccountLayoutProps = $props();

	const currentUser = $derived((data as App.LayoutData)?.currentUser ?? null);
	const companyNameVm = $derived((data as App.LayoutData)?.companyNameVm ?? 'OpenQuok');

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

	// /account/playbooks
	const rootPathPlaybooksHub = getRootPathPlaybooksHub();
	const playbooksPath = route(`${rootPathAccount}/${rootPathPlaybooksHub}`);

	const mainLinks: SidebarLinkItem[] = [
		{ label: 'Home', href: accountPath, iconName: icons.House.name },
		{ label: 'Calendar', href: calendarPath, iconName: icons.CalendarClock.name },
		{ label: 'Templates', href: templatesPath, iconName: icons.LayoutTemplate.name },
		{ label: 'Playbooks', href: playbooksPath, iconName: icons.Bookmark.name },
		{ label: 'Auto Plugs', href: plugsPath, iconName: icons.Sparkles.name },
		{ label: 'Analytics', href: analyticsPath, iconName: icons.ChartBar.name },
		{ label: 'Media', href: mediaPath, iconName: icons.Image.name },
	];

	const SETTINGS_NAV: SettingsNavItem<AppSettingsSectionId>[] = [
		{ id: 'timezone', label: 'Timezone' },
		{ id: 'workspace', label: 'Workspace' },
		{ id: 'profile', label: 'Profile' },
		{ id: 'developers', label: 'Developers' },
		{ id: 'approved-apps', label: 'Approved Apps' },
		{ id: 'signature', label: 'Signatures' },
	];

	function setSettingsSidebarContext() {
		const currentSection = $derived((page.url.searchParams.get('section') as AppSettingsSectionId) || 'timezone');
		const sectionTitle = $derived(
			SETTINGS_NAV.find((item) => item.id === currentSection)?.label ?? 'Timezone'
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
		scheduleDeferredWork(() => {
			void protectedLayoutPagePresenter.refreshEditorDockNotifications();
		});
	}

	afterNavigate(refreshDockBadge);

	let sidebarTourOpen = $state(false);
	let activeSidebarTourId = $state<AccountSidebarTourId | null>(null);
	let sidebarTourPending = $state(false);

	function queueSidebarFeatureTour(): void {
		if (!browser) return;
		if (accountSidebarTourPresenter.onboardingBlocksTours) return;
		if (productTourResetPresenter.shouldOpenWizard) return;
		if (!isOnboardingCompleted()) return;

		const workspaceId = workspaceSettingsPresenter.currentWorkspaceId;
		if (!workspaceId) return;

		const tourId = resolveAccountSidebarTourId(page.url.pathname);
		if (!tourId) {
			sidebarTourOpen = false;
			activeSidebarTourId = null;
			return;
		}

		void productTourResetPresenter.revision;

		if (readAccountSidebarTourCompleted(workspaceId, tourId)) {
			if (activeSidebarTourId === tourId && sidebarTourOpen) {
				sidebarTourOpen = false;
				activeSidebarTourId = null;
			}
			return;
		}

		if (sidebarTourOpen && activeSidebarTourId === tourId) return;

		activeSidebarTourId = tourId;
		sidebarTourOpen = true;
	}

	function scheduleSidebarFeatureTourCheck(): void {
		if (!browser) return;
		if (sidebarTourPending) return;
		sidebarTourPending = true;
		scheduleDeferredWork(() => {
			sidebarTourPending = false;
			queueSidebarFeatureTour();
		});
	}

	function onSidebarTourFinished(tourId: AccountSidebarTourId): void {
		const workspaceId = workspaceSettingsPresenter.currentWorkspaceId;
		if (workspaceId) persistAccountSidebarTourCompleted(workspaceId, tourId);
		sidebarTourOpen = false;
		activeSidebarTourId = null;
		productTourResetPresenter.bumpRevision();
	}

	afterNavigate(() => {
		scheduleSidebarFeatureTourCheck();
	});

	$effect(() => {
		if (!browser) return;
		void page.url.pathname;
		void workspaceSettingsPresenter.currentWorkspaceId;
		void productTourResetPresenter.revision;
		void accountSidebarTourPresenter.onboardingBlocksTours;
		scheduleSidebarFeatureTourCheck();
	});

	$effect(() => {
		if (!browser) return;
		if (!productTourResetPresenter.shouldOpenWizard) return;
		const homePath = accountPath;
		const currentPath = route(page.url.pathname);
		sidebarTourOpen = false;
		activeSidebarTourId = null;
		if (currentPath !== homePath && currentPath !== `${homePath}/`) {
			void goto(homePath);
		}
	});
</script>

<ProtectedLayout
	{currentUser}
	companyName={companyNameVm}
	mainLinks={mainLinks}
	notificationsDockPreview={notificationsDockPreview}
	editorDockNotificationBadge={protectedLayoutPagePresenter.editorDockNotificationUnreadCount}
>
	{@render children?.()}
</ProtectedLayout>

<AccountSidebarFeatureTourDialog
	bind:open={sidebarTourOpen}
	tourId={activeSidebarTourId}
	onFinished={onSidebarTourFinished}
/>

