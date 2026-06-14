<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SettingsNavItem, SettingsSidebarContext } from '$lib/ui/sidebar-main/types';
	
	import { setContext } from 'svelte';
	import { page } from '$app/state';

	import SidebarSecondary from '$lib/ui/templates/SidebarSecondary.svelte';
	import { CONFIG_MANAGER_SIDEBAR_KEY } from '$lib/ui/templates/sidebar-secondary-context';
	import { url } from '$lib/utils/path';

	import {
		getRootPathSecretAdminConfigManager,
		getRootPathSecretAdminConfigManagerPublicFaq,
		getRootPathSecretAdminConfigManagerBlogInformation
	} from '$lib/area-admin/constants/getRootPathSecretAdminArea';

	// /secret-admin/config-manager
	const rootPathSecretAdminConfigManager = getRootPathSecretAdminConfigManager();
	const configManagerBaseHref = url(rootPathSecretAdminConfigManager);

	// /secret-admin/config-manager/public-faq
	const rootPathPublicFaq = getRootPathSecretAdminConfigManagerPublicFaq();
	const publicFaqHref = url(rootPathPublicFaq);

	// /secret-admin/config-manager/blog-information
	const rootPathBlogInformation = getRootPathSecretAdminConfigManagerBlogInformation();
	const blogInformationHref = url(rootPathBlogInformation);

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	type ConfigManagerSectionId = 'public_faq' | 'blog_information';

	const navItems: SettingsNavItem<ConfigManagerSectionId>[] = [
		{ id: 'public_faq', label: 'Public FAQ' },
		{ id: 'blog_information', label: 'Blog Information' }
	];

	const sectionHrefById: Record<ConfigManagerSectionId, string> = {
		public_faq: publicFaqHref,
		blog_information: blogInformationHref
	};

	function getCurrentSectionFromPathname(pathname: string): ConfigManagerSectionId {
		if (pathname.includes('/blog-information')) return 'blog_information';
		return 'public_faq';
	}

	const ctx: SettingsSidebarContext<ConfigManagerSectionId> = {
		navItems,
		getCurrentSection: () => getCurrentSectionFromPathname(page.url.pathname),
		getSectionTitle: () => {
			const current = getCurrentSectionFromPathname(page.url.pathname);
			return navItems.find((i) => i.id === current)?.label ?? 'Public FAQ';
		},
		getBasePath: () => configManagerBaseHref,
		getItemHref: (id) => sectionHrefById[id as ConfigManagerSectionId],
		getHeaderTitle: () => 'Config manager'
	};

	setContext(CONFIG_MANAGER_SIDEBAR_KEY, ctx);
</script>

<SidebarSecondary contextKey={CONFIG_MANAGER_SIDEBAR_KEY} centerContent={false}>
	{@render children?.()}
</SidebarSecondary>
