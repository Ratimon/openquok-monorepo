import { openGraphForPublicPage, type MetaTagsProps } from '$lib/utils/createMetaData';
import { publicInformationRepository } from '$lib/area-public/index';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';

export const ssr = true;

export async function load({ url, cookies, fetch }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformation: companyInformationPm } =
		await publicInformationRepository.getAllInformationCombined(fetch);

	const companyConfig = companyInformationPm?.config as Record<string, string> | undefined;
	const companyName =
		companyConfig?.NAME ?? (CONFIG_SCHEMA_COMPANY.NAME.default as string);
	const companyUrl =
		companyConfig?.URL ?? (CONFIG_SCHEMA_COMPANY.URL.default as string);
	const supportEmail =
		(companyConfig?.SUPPORT_EMAIL as string | undefined) ?? companyUrl;

	const title = 'Privacy Policy';
	const description =
		'How we collect, use, and protect personal information—including account data, connected social channels, and how to request deletion.';

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
		companyName,
		companyUrl,
		supportEmail
	};
}
