import type { MetaTagsProps } from '$lib/utils/createMetaData';

import { openGraphForPublicPage } from '$lib/utils/createMetaData';
import { publicInformationRepository } from '$lib/area-public/index';
import { getCompanyNameFromPm } from '$lib/config/utils/getCompanyDisplayNames';

export const ssr = true;

export async function load({ url, cookies, fetch }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformation: companyInformationPm } =
		await publicInformationRepository.getAllInformationCombined(fetch);

	const companyName = getCompanyNameFromPm(companyInformationPm);

	const title = 'Terms & Conditions';
	const description =
		'Read our T&Cs to understand the rules and guidelines for using our website.';

	const canonical = new URL(url.pathname, url.origin).href;
	const pageMetaTags = Object.freeze({
		title,
		titleTemplate: `%s | ${companyName}`,
		description,
		canonical,
		...openGraphForPublicPage(title, description, canonical)
	}) satisfies MetaTagsProps;

	return {
		pageMetaTags,
		isLoggedIn,
		companyInformationPm,
		companyName
	};
}
