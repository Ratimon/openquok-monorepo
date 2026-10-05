<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SettingsNavItem, SettingsSidebarContext } from '$lib/ui/sidebar-main/types';

	import { page } from '$app/state';
	import { setContext } from 'svelte';
	import { LINK_DIRECTORY_MANAGER_SIDEBAR_KEY } from '$lib/ui/templates/sidebar-secondary-context';
	import { url } from '$lib/utils/path';
	import {
		getRootPathSecretAdminLinkDirectoryManager,
		getRootPathSecretAdminLinkDirectoryManagerSites,
		getRootPathSecretAdminLinkDirectoryManagerNewSite,
		getRootPathSecretAdminLinkDirectoryManagerCategories,
		getRootPathSecretAdminLinkDirectoryManagerTags,
		getRootPathSecretAdminLinkDirectoryManagerSubmissions,
		getRootPathSecretAdminLinkDirectoryManagerComments
	} from '$lib/area-admin/constants/getRootPathSecretAdminArea';

	import SidebarSecondary from '$lib/ui/templates/SidebarSecondary.svelte';

	const baseHref = url(getRootPathSecretAdminLinkDirectoryManager());
	const sitesHref = url(getRootPathSecretAdminLinkDirectoryManagerSites());
	const newSiteHref = url(getRootPathSecretAdminLinkDirectoryManagerNewSite());
	const categoriesHref = url(getRootPathSecretAdminLinkDirectoryManagerCategories());
	const tagsHref = url(getRootPathSecretAdminLinkDirectoryManagerTags());
	const submissionsHref = url(getRootPathSecretAdminLinkDirectoryManagerSubmissions());
	const commentsHref = url(getRootPathSecretAdminLinkDirectoryManagerComments());

	type SectionId =
		| 'dashboard'
		| 'sites'
		| 'new_site'
		| 'categories'
		| 'tags'
		| 'submissions'
		| 'comments';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	const navItems: SettingsNavItem<SectionId>[] = [
		{ id: 'dashboard', label: 'Dashboard' },
		{ id: 'sites', label: 'Sites' },
		{ id: 'new_site', label: 'New site' },
		{ id: 'categories', label: 'Categories' },
		{ id: 'tags', label: 'Tags' },
		{ id: 'submissions', label: 'Submissions' },
		{ id: 'comments', label: 'Comments' }
	];

	function getCurrentSectionFromPathname(pathname: string): SectionId {
		if (pathname.includes('/comments')) return 'comments';
		if (pathname.includes('/submissions')) return 'submissions';
		if (pathname.includes('/categories')) return 'categories';
		if (pathname.includes('/tags')) return 'tags';
		if (pathname.includes('/sites/new')) return 'new_site';
		if (pathname.includes('/sites')) return 'sites';
		return 'dashboard';
	}

	const ctx: SettingsSidebarContext<SectionId> = {
		navItems,
		getCurrentSection: () => getCurrentSectionFromPathname(page.url.pathname),
		getSectionTitle: () => {
			const current = getCurrentSectionFromPathname(page.url.pathname);
			return navItems.find((i) => i.id === current)?.label ?? 'Link directory';
		},
		getBasePath: () => baseHref,
		getItemHref: (id) => {
			if (id === 'dashboard') return baseHref;
			if (id === 'sites') return sitesHref;
			if (id === 'new_site') return newSiteHref;
			if (id === 'categories') return categoriesHref;
			if (id === 'tags') return tagsHref;
			if (id === 'submissions') return submissionsHref;
			return commentsHref;
		},
		getHeaderTitle: () => 'Link directory manager'
	};

	setContext(LINK_DIRECTORY_MANAGER_SIDEBAR_KEY, ctx);
</script>

<SidebarSecondary contextKey={LINK_DIRECTORY_MANAGER_SIDEBAR_KEY} centerContent={false}>
	{@render children?.()}
</SidebarSecondary>
