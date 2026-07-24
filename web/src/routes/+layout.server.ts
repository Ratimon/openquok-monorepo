import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicLayoutPagePresenter } from '$lib/area-public/index';
import { configRepository } from '$lib/config/Config.repository.svelte';
import { getCompanyConfigDefaults } from '$lib/config/constants/config';
import { mergeCompanyConfigDefaults } from '$lib/config/utils/mergeCompanyConfigDefaults';
import {
	getStaticCompanyInformationPm,
	getStaticMarketingInformationPm
} from '$lib/config/utils/staticPublicSiteConfig';
import { buildCanonicalUrl } from '$lib/utils/buildCanonicalUrl';
import { createMetaData } from '$lib/utils/createMetaData';

export const ssr = true;

export async function load({ url, cookies, fetch }) {
	// Security: use cookies only for auth in SSR — never import authenticationRepository in server load
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const staticCompanyInformationPm = getStaticCompanyInformationPm();
	const marketingInformationPm = getStaticMarketingInformationPm();

	const runtimeCompany = await configRepository.getPublicCompanyInformation(fetch);
	const companyConfig = mergeCompanyConfigDefaults(
		getCompanyConfigDefaults(),
		runtimeCompany?.config
	);
	const companyInformationPm = {
		module_name: runtimeCompany?.module_name ?? staticCompanyInformationPm.module_name,
		config: companyConfig,
		updated_at: runtimeCompany?.updated_at ?? staticCompanyInformationPm.updated_at
	};

	const metaTags = await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		requestUrl: url
	});

	const baseMetaTags = Object.freeze({
		...metaTags,
		// Per-request canonical and og:url alignment (createMetaData also sets canonical from the request URL).
		canonical: buildCanonicalUrl(url)
	}) satisfies MetaTagsProps;

	const footerInfo = publicLayoutPagePresenter.loadInfoForFooterStateless(companyConfig);

	return {
		baseMetaTags,
		companyInformationPm,
		marketingInformationPm,
		isLoggedIn,
		companyNameVm: footerInfo.companyNameVm,
		companyYearVm: footerInfo.companyYearVm,
		companyAddressVm: footerInfo.companyAddressVm,
		supportPhoneVm: footerInfo.supportPhoneVm,
		supportEmailVm: footerInfo.supportEmailVm
	};
}
