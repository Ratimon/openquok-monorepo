<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SettingsNavItem, SettingsSidebarContext } from '$lib/ui/sidebar-main/types';

	import { page } from '$app/state';
	import { setContext } from 'svelte';
	import { LISTING_MANAGER_SIDEBAR_KEY } from '$lib/ui/templates/sidebar-secondary-context';
	import { url } from '$lib/utils/path';
	import {
		getRootPathSecretAdminListingManager,
		getRootPathSecretAdminListingManagerListings,
		getRootPathSecretAdminListingManagerNewExtension,
		getRootPathSecretAdminListingManagerStacks,
		getRootPathSecretAdminListingManagerNewStack,
		getRootPathSecretAdminListingManagerCategories,
		getRootPathSecretAdminListingManagerTags,
		getRootPathSecretAdminListingManagerComments,
		getRootPathSecretAdminListingManagerActivities
	} from '$lib/area-admin/constants/getRootPathSecretAdminArea';

	import SidebarSecondary from '$lib/ui/templates/SidebarSecondary.svelte';

	const listingManagerBaseHref = url(getRootPathSecretAdminListingManager());
	const listingsHref = url(getRootPathSecretAdminListingManagerListings());
	const newExtensionHref = url(getRootPathSecretAdminListingManagerNewExtension());
	const stacksHref = url(getRootPathSecretAdminListingManagerStacks());
	const newStackHref = url(getRootPathSecretAdminListingManagerNewStack());
	const categoriesHref = url(getRootPathSecretAdminListingManagerCategories());
	const tagsHref = url(getRootPathSecretAdminListingManagerTags());
	const commentsHref = url(getRootPathSecretAdminListingManagerComments());
	const activitiesHref = url(getRootPathSecretAdminListingManagerActivities());

	type ListingManagerSectionId =
		| 'dashboard'
		| 'extensions'
		| 'new_extension'
		| 'stacks'
		| 'new_stack'
		| 'categories'
		| 'tags'
		| 'comments'
		| 'activities';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	const navItems: SettingsNavItem<ListingManagerSectionId>[] = [
		{ id: 'dashboard', label: 'Listing dashboard' },
		{ id: 'extensions', label: 'Extensions' },
		{ id: 'new_extension', label: 'New extension' },
		{ id: 'stacks', label: 'Stacks' },
		{ id: 'new_stack', label: 'New stack' },
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
		if (pathname.includes('/listings/new')) return 'new_extension';
		if (pathname.includes('/listings')) return 'extensions';
		if (pathname.includes('/stacks/new')) return 'new_stack';
		if (pathname.includes('/stacks')) return 'stacks';
		return 'dashboard';
	}

	const ctx: SettingsSidebarContext<ListingManagerSectionId> = {
		navItems,
		getCurrentSection: () => getCurrentSectionFromPathname(page.url.pathname),
		getSectionTitle: () => {
			const current = getCurrentSectionFromPathname(page.url.pathname);
			return navItems.find((i) => i.id === current)?.label ?? 'Listings';
		},
		getBasePath: () => listingManagerBaseHref,
		getItemHref: (id) => {
			if (id === 'dashboard') return listingManagerBaseHref;
			if (id === 'extensions') return listingsHref;
			if (id === 'new_extension') return newExtensionHref;
			if (id === 'stacks') return stacksHref;
			if (id === 'new_stack') return newStackHref;
			if (id === 'categories') return categoriesHref;
			if (id === 'tags') return tagsHref;
			if (id === 'comments') return commentsHref;
			return activitiesHref;
		},
		getHeaderTitle: () => 'Listing manager'
	};

	setContext(LISTING_MANAGER_SIDEBAR_KEY, ctx);
</script>

<SidebarSecondary contextKey={LISTING_MANAGER_SIDEBAR_KEY} centerContent={false}>
	{@render children?.()}
</SidebarSecondary>
