import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicInformationRepository } from '$lib/area-public/index';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { getCompanyNameFromPm, getCompanyUrlFromPm } from '$lib/config/utils/getCompanyDisplayNames';

export const ssr = true;

export async function load({ url, fetch, cookies }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformation: companyInformationPm } =
		await publicInformationRepository.getAllInformationCombined(fetch);

	const companyName = getCompanyNameFromPm(companyInformationPm);
	const companyUrl = getCompanyUrlFromPm(companyInformationPm);
	const companyConfig = companyInformationPm?.config as Record<string, string> | undefined;
	const supportEmail =
		companyConfig?.SUPPORT_EMAIL ?? (CONFIG_SCHEMA_COMPANY.SUPPORT_EMAIL.default as string);
	const responsiblePerson =
		companyConfig?.RESPONSIBLE_PERSON ??
		(CONFIG_SCHEMA_COMPANY.RESPONSIBLE_PERSON.default as string);

	const title = 'About Us';
	const description =
		`Learn about ${companyName}, our mission, and how to contact us.`;

	const pageMetaTags = Object.freeze({
		title,
		titleTemplate: `%s | ${companyName}`,
		description,
		openGraph: {
			title,
			description
		},
		canonical: new URL(url.pathname, url.origin).href
	}) satisfies MetaTagsProps;

	return {
		pageMetaTags,
		isLoggedIn,
		companyInformationPm,
		companyName,
		companyUrl,
		supportEmail,
		responsiblePerson
	};
}
