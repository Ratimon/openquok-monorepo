<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SettingsNavItem, SettingsSidebarContext } from '$lib/ui/sidebar-main/types';

	import { page } from '$app/state';
	import { setContext } from 'svelte';
	import { CATALOG_MANAGER_SIDEBAR_KEY } from '$lib/ui/templates/sidebar-secondary-context';
	import { url } from '$lib/utils/path';
	import {
		getRootPathSecretAdminCatalogManager,
		getRootPathSecretAdminCatalogManagerBuildingBlocks,
		getRootPathSecretAdminCatalogManagerNewBuildingBlock,
		getRootPathSecretAdminCatalogManagerPlaybooks,
		getRootPathSecretAdminCatalogManagerNewPlaybook,
		getRootPathSecretAdminCatalogManagerCategories,
		getRootPathSecretAdminCatalogManagerTags,
		getRootPathSecretAdminCatalogManagerComments,
		getRootPathSecretAdminCatalogManagerActivities
	} from '$lib/area-admin/constants/getRootPathSecretAdminArea';

	import SidebarSecondary from '$lib/ui/templates/SidebarSecondary.svelte';

	const listingManagerBaseHref = url(getRootPathSecretAdminCatalogManager());
	const buildingBlocksHref = url(getRootPathSecretAdminCatalogManagerBuildingBlocks());
	const newBuildingBlockHref = url(getRootPathSecretAdminCatalogManagerNewBuildingBlock());
	const playbooksHref = url(getRootPathSecretAdminCatalogManagerPlaybooks());
	const newPlaybookHref = url(getRootPathSecretAdminCatalogManagerNewPlaybook());
	const categoriesHref = url(getRootPathSecretAdminCatalogManagerCategories());
	const tagsHref = url(getRootPathSecretAdminCatalogManagerTags());
	const commentsHref = url(getRootPathSecretAdminCatalogManagerComments());
	const activitiesHref = url(getRootPathSecretAdminCatalogManagerActivities());

	type ListingManagerSectionId =
		| 'dashboard'
		| 'building_blocks'
		| 'new_building_block'
		| 'playbooks'
		| 'new_playbook'
		| 'categories'
		| 'tags'
		| 'comments'
		| 'activities';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	const navItems: SettingsNavItem<ListingManagerSectionId>[] = [
		{ id: 'dashboard', label: 'Manager home' },
		{ id: 'playbooks', label: 'Playbooks' },
		{ id: 'new_playbook', label: 'New playbook' },
		{ id: 'building_blocks', label: 'Building blocks' },
		{ id: 'new_building_block', label: 'New building block' },
		{ id: 'categories', label: 'Categories' },
		{ id: 'tags', label: 'Tags' },
		{ id: 'comments', label: 'Comments' },
		{ id: 'activities', label: 'Activities' }
	];

	function getCurrentSectionFromPathname(pathname: string): ListingManagerSectionId {
		if (pathname.includes('/comments')) return 'comments';
		if (pathname.includes('/activities')) return 'activities';
		if (pathname.includes('/categories')) return 'categories';
		if (pathname.includes('/tags')) return 'tags';
		if (pathname.includes('/building-blocks/new')) return 'new_building_block';
		if (pathname.includes('/building-blocks')) return 'building_blocks';
		if (pathname.includes('/playbooks/new')) return 'new_playbook';
		if (pathname.includes('/playbooks')) return 'playbooks';
		return 'dashboard';
	}

	const ctx: SettingsSidebarContext<ListingManagerSectionId> = {
		navItems,
		getCurrentSection: () => getCurrentSectionFromPathname(page.url.pathname),
		getSectionTitle: () => {
			const current = getCurrentSectionFromPathname(page.url.pathname);
			return navItems.find((i) => i.id === current)?.label ?? 'Playbooks & building blocks';
		},
		getBasePath: () => listingManagerBaseHref,
		getItemHref: (id) => {
			if (id === 'dashboard') return listingManagerBaseHref;
			if (id === 'building_blocks') return buildingBlocksHref;
			if (id === 'new_building_block') return newBuildingBlockHref;
			if (id === 'playbooks') return playbooksHref;
			if (id === 'new_playbook') return newPlaybookHref;
			if (id === 'categories') return categoriesHref;
			if (id === 'tags') return tagsHref;
			if (id === 'comments') return commentsHref;
			return activitiesHref;
		},
		getHeaderTitle: () => 'Playbooks / building blocks manager'
	};

	setContext(CATALOG_MANAGER_SIDEBAR_KEY, ctx);
</script>

<SidebarSecondary contextKey={CATALOG_MANAGER_SIDEBAR_KEY} centerContent={false}>
	{@render children?.()}
</SidebarSecondary>
