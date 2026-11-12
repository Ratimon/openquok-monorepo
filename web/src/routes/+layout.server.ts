import type { MetaTagsProps } from 'svelte-meta-tags';

import { building } from '$app/environment';
import { env } from '$env/dynamic/private';

import { configRepository } from '$lib/config/Config.repository.svelte';
import {
	getCompanyConfigDefaults,
	getMarketingConfigDefaults,
	getPublicFooterLinks
} from '$lib/config/constants/config';
import { publicLayoutPagePresenter } from '$lib/area-public/index';
import { mergeModuleConfigDefaults } from '$lib/config/utils/mergeModuleConfigDefaults';
import { shouldUseStaticAnonymousLayoutConfig } from '$lib/config/utils/shouldUseStaticAnonymousLayoutConfig';
import {
	getStaticCompanyInformationPm,
	getStaticMarketingInformationPm,
	loadStaticMergedPublicLayoutConfig
} from '$lib/config/utils/staticPublicSiteConfig';
import { parseMaintenanceMode } from '$lib/maintenance/maintenanceMode';
import { buildCanonicalUrl } from '$lib/seo/buildCanonicalUrl';
import { createMetaData } from '$lib/seo/createMetaData';

export const ssr = true;

export async function load({ url, cookies, fetch }) {
	// Security: use cookies only for auth in SSR — never import authenticationRepository in server load
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const useStaticLayoutConfig =
		building ||
		shouldUseStaticAnonymousLayoutConfig({
			pathname: url.pathname,
			envEnabled: env.USE_STATIC_ANONYMOUS_LAYOUT_CONFIG,
			isLoggedIn
		});

	let marketingConfig: Record<string, string>;
	let marketingInformationPm: ReturnType<typeof loadStaticMergedPublicLayoutConfig>['marketingInformationPm'];
	let companyInformationPm: ReturnType<typeof loadStaticMergedPublicLayoutConfig>['companyInformationPm'];
	let companyConfig: Record<string, string>;

	if (useStaticLayoutConfig) {
		const staticLayout = loadStaticMergedPublicLayoutConfig();
		marketingConfig = staticLayout.marketingConfig;
		companyConfig = staticLayout.companyConfig;
		marketingInformationPm = staticLayout.marketingInformationPm;
		companyInformationPm = staticLayout.companyInformationPm;
	} else {
		const staticCompanyInformationPm = getStaticCompanyInformationPm();
		const staticMarketingInformationPm = getStaticMarketingInformationPm();
		const [runtimeCompany, runtimeMarketing] = await Promise.all([
			configRepository.getPublicCompanyInformation(fetch),
			configRepository.getPublicModuleConfig('marketing_information', fetch)
		]);
		marketingConfig = mergeModuleConfigDefaults(
			getMarketingConfigDefaults(),
			runtimeMarketing
		);
		marketingInformationPm = {
			module_name: staticMarketingInformationPm.module_name,
			config: marketingConfig,
			updated_at: staticMarketingInformationPm.updated_at
		};
		companyConfig = mergeModuleConfigDefaults(
			getCompanyConfigDefaults(),
			runtimeCompany?.config
		);
		companyInformationPm = {
			module_name: runtimeCompany?.module_name ?? staticCompanyInformationPm.module_name,
			config: companyConfig,
			updated_at: runtimeCompany?.updated_at ?? staticCompanyInformationPm.updated_at
		};
	}

	const companyName =
		typeof companyConfig.NAME === 'string' && companyConfig.NAME.trim()
			? companyConfig.NAME.trim()
			: String(getCompanyConfigDefaults().NAME ?? 'OpenQuok');

	const metaTags = await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: companyName,
		requestUrl: url
	});

	const baseMetaTags = Object.freeze({
		...metaTags,
		// Per-request canonical and og:url alignment (createMetaData also sets canonical from the request URL).
		canonical: buildCanonicalUrl(url)
	}) satisfies MetaTagsProps;

	const footerInfo = publicLayoutPagePresenter.loadInfoForFooterStateless(companyConfig);
	const footerNavigationLinks = await getPublicFooterLinks(marketingConfig);

	return {
		baseMetaTags,
		companyInformationPm,
		marketingInformationPm,
		isLoggedIn,
		companyNameVm: footerInfo.companyNameVm,
		companyLegalNameVm: footerInfo.companyLegalNameVm,
		companyYearVm: footerInfo.companyYearVm,
		companyAddressVm: footerInfo.companyAddressVm,
		supportPhoneVm: footerInfo.supportPhoneVm,
		supportEmailVm: footerInfo.supportEmailVm,
		footerNavigationLinks,
		maintenanceMode: parseMaintenanceMode(env.MAINTENANCE_MODE)
	};
}
