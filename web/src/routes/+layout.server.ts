import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicLayoutPagePresenter } from '$lib/area-public/index';
import { getCompanyConfigDefaults } from '$lib/config/constants/config';
import {
	getStaticCompanyInformationPm,
	getStaticMarketingInformationPm
} from '$lib/config/utils/staticPublicSiteConfig';
import { createMetaData } from '$lib/utils/createMetaData';

export const ssr = true;

export async function load({ url, cookies }) {
	// Security: use cookies only for auth in SSR — never import authenticationRepository in server load
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const companyInformationPm = getStaticCompanyInformationPm();
	const marketingInformationPm = getStaticMarketingInformationPm();

	const metaTags = await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		requestUrl: url
	});

	const baseMetaTags = Object.freeze({
		...metaTags,
		// Per-request canonical and og:url alignment (createMetaData also sets canonical from the request URL).
		canonical: new URL(url.pathname, url.origin).href
	}) satisfies MetaTagsProps;

	const footerInfo = publicLayoutPagePresenter.loadInfoForFooterStateless(
		getCompanyConfigDefaults()
	);

	return {
		baseMetaTags,
		companyInformationPm,
		marketingInformationPm,
		isLoggedIn,
		companyNameVm: footerInfo.companyNameVm,
		companyYearVm: footerInfo.companyYearVm
	};
}
