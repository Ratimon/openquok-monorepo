<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setContext } from 'svelte';
	import { page } from '$app/state';

	import SidebarSecondary from '$lib/ui/templates/SidebarSecondary.svelte';
	import { CONFIG_MANAGER_SIDEBAR_KEY } from '$lib/ui/templates/sidebar-secondary-context';
	import type { SettingsNavItem, SettingsSidebarContext } from '$lib/ui/sidebar-main/types';
	import { url } from '$lib/utils/path';

	import {
		getRootPathSecretAdminConfigManager,
		getRootPathSecretAdminConfigManagerCompanyInformation,
		getRootPathSecretAdminConfigManagerBlogInformation
	} from '$lib/area-admin/constants/getRootPathSecretAdminArea';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	type ConfigManagerSectionId = 'company_information' | 'blog_information';

	const navItems: SettingsNavItem<ConfigManagerSectionId>[] = [
		{ id: 'company_information', label: 'Company Information' },
		{ id: 'blog_information', label: 'Blog Information' }
	];

	function getCurrentSectionFromPathname(pathname: string): ConfigManagerSectionId {
		if (pathname.includes('/blog-information')) return 'blog_information';
		return 'company_information';
	}

	const ctx: SettingsSidebarContext<ConfigManagerSectionId> = {
		navItems,
		getCurrentSection: () => getCurrentSectionFromPathname(page.url.pathname),
		getSectionTitle: () => {
			const current = getCurrentSectionFromPathname(page.url.pathname);
			return navItems.find((i) => i.id === current)?.label ?? 'Company Information';
		},
		getBasePath: () => url(getRootPathSecretAdminConfigManager()),
		getItemHref: (id) => {
			if (id === 'company_information') {
				return url(getRootPathSecretAdminConfigManagerCompanyInformation());
			}
			return url(getRootPathSecretAdminConfigManagerBlogInformation());
		},
		getHeaderTitle: () => 'Config manager'
	};

	setContext(CONFIG_MANAGER_SIDEBAR_KEY, ctx);
</script>

<SidebarSecondary contextKey={CONFIG_MANAGER_SIDEBAR_KEY} centerContent={false}>
	{@render children?.()}
</SidebarSecondary>

