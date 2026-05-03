import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicInformationRepository, publicLayoutPagePresenter } from '$lib/area-public/index';
import { createMetaData } from '$lib/utils/createMetaData';

export const ssr = true;

export async function load({ url, cookies, fetch }) {
	// Security: use cookies only for auth in SSR — never import authenticationRepository in server load
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	let companyInformationPm = null;
	let marketingInformationPm = null;
	try {
		const result = await publicInformationRepository.getAllInformationCombined(fetch);
		companyInformationPm = result.companyInformation;
		marketingInformationPm = result.marketingInformation;
	} catch (error) {
		console.error('[+layout.server] Failed to fetch company/marketing information:', error);
	}

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

	const companyProperties = ['FOUNDING_YEAR', 'NAME'];
	const marketingProperties = [
		'SOCIAL_LINKS_X',
		'SOCIAL_LINKS_FACEBOOK',
		'SOCIAL_LINKS_INSTAGRAM',
		'SOCIAL_LINKS_YOUTUBE'
	];

	let companyNameVm: string | null = null;
	let companyYearVm: string | null = null;
	let marketingInformationVm: Record<string, string> | null = null;

	try {
		const result = await publicInformationRepository.getInformationByPropertiesCombined(
			companyProperties,
			marketingProperties,
			fetch
		);

		const footerInfo = publicLayoutPagePresenter.loadInfoForFooterStateless(
			result.companyInformation,
			result.marketingInformation
		);
		
		companyNameVm = footerInfo.companyNameVm;
		companyYearVm = footerInfo.companyYearVm;
		marketingInformationVm = footerInfo.marketingInformationVm;
	} catch (error) {
		console.error('[+layout.server] Failed to fetch footer information:', error);
	}

	return {
		baseMetaTags,
		companyInformationPm,
		marketingInformationPm,
		isLoggedIn,
		companyNameVm,
		companyYearVm,
		marketingInformationVm
	};
}
