<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SettingsNavItem, SettingsSidebarContext } from '$lib/ui/sidebar-main/types';

	import { setContext } from 'svelte';
	import { page } from '$app/state';

	import {
		getRootPathSecretAdminConfigManager,
		getRootPathSecretAdminConfigManagerBlogInformation,
		getRootPathSecretAdminConfigManagerCompanyInformation,
		getRootPathSecretAdminConfigManagerLandingPage,
		getRootPathSecretAdminConfigManagerMarketingInformation,
		getRootPathSecretAdminConfigManagerPublicFaq
	} from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { CONFIG_MANAGER_SIDEBAR_KEY } from '$lib/ui/templates/sidebar-secondary-context';
	import { url } from '$lib/utils/path';

	import SidebarSecondary from '$lib/ui/templates/SidebarSecondary.svelte';

	// /secret-admin/config-manager
	const rootPathSecretAdminConfigManager = getRootPathSecretAdminConfigManager();
	const configManagerBaseHref = url(rootPathSecretAdminConfigManager);

	// /secret-admin/config-manager/company-information
	const rootPathCompanyInformation = getRootPathSecretAdminConfigManagerCompanyInformation();
	const companyInformationHref = url(rootPathCompanyInformation);

	// /secret-admin/config-manager/marketing-information
	const rootPathMarketingInformation = getRootPathSecretAdminConfigManagerMarketingInformation();
	const marketingInformationHref = url(rootPathMarketingInformation);

	// /secret-admin/config-manager/landing-page
	const rootPathLandingPage = getRootPathSecretAdminConfigManagerLandingPage();
	const landingPageHref = url(rootPathLandingPage);

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

	type ConfigManagerSectionId =
		| 'overview'
		| 'company_information'
		| 'marketing_information'
		| 'landing_page'
		| 'public_faq'
		| 'blog_information';

	const navItems: SettingsNavItem<ConfigManagerSectionId>[] = [
		{ id: 'company_information', label: 'Company Information' },
		{ id: 'marketing_information', label: 'Marketing Information' },
		{ id: 'landing_page', label: 'Landing Page' },
		{ id: 'public_faq', label: 'Public FAQ' },
		{ id: 'blog_information', label: 'Blog Information' }
	];

	const sectionHrefById: Record<Exclude<ConfigManagerSectionId, 'overview'>, string> = {
		company_information: companyInformationHref,
		marketing_information: marketingInformationHref,
		landing_page: landingPageHref,
		public_faq: publicFaqHref,
		blog_information: blogInformationHref
	};

	function getCurrentSectionFromPathname(pathname: string): ConfigManagerSectionId {
		if (pathname.includes('/blog-information')) return 'blog_information';
		if (pathname.includes('/public-faq')) return 'public_faq';
		if (pathname.includes('/marketing-information')) return 'marketing_information';
		if (pathname.includes('/landing-page')) return 'landing_page';
		if (pathname.includes('/company-information')) return 'company_information';
		return 'overview';
	}

	const ctx: SettingsSidebarContext<ConfigManagerSectionId> = {
		navItems,
		getCurrentSection: () => getCurrentSectionFromPathname(page.url.pathname),
		getSectionTitle: () => {
			const current = getCurrentSectionFromPathname(page.url.pathname);
			if (current === 'overview') return 'Config manager';
			return navItems.find((i) => i.id === current)?.label ?? 'Config manager';
		},
		getBasePath: () => configManagerBaseHref,
		getItemHref: (id) =>
			sectionHrefById[id as Exclude<ConfigManagerSectionId, 'overview'>] ?? configManagerBaseHref,
		getHeaderTitle: () => 'Config manager'
	};

	setContext(CONFIG_MANAGER_SIDEBAR_KEY, ctx);
</script>

<SidebarSecondary contextKey={CONFIG_MANAGER_SIDEBAR_KEY} centerContent={false}>
	{@render children?.()}
</SidebarSecondary>
