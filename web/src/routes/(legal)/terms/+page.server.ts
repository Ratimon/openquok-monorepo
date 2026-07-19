import { openGraphForPublicPage, type MetaTagsProps } from '$lib/utils/createMetaData';
import { buildCanonicalUrl } from '$lib/utils/buildCanonicalUrl';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';

export const ssr = true;

export async function load({ url, cookies, parent }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm } = await parent();

	const companyConfig = companyInformationPm?.config as Record<string, string> | undefined;
	const companyName =
		companyConfig?.NAME ?? (CONFIG_SCHEMA_COMPANY.NAME.default as string);
	const companyUrl =
		companyConfig?.URL ?? (CONFIG_SCHEMA_COMPANY.URL.default as string);
	const legalName =
		companyConfig?.LEGAL_NAME ?? (CONFIG_SCHEMA_COMPANY.LEGAL_NAME.default as string);
	const companyAddress =
		companyConfig?.COMPANY_ADDRESS ?? (CONFIG_SCHEMA_COMPANY.COMPANY_ADDRESS.default as string);
	const supportEmail =
		(companyConfig?.SUPPORT_EMAIL as string | undefined) ??
		(CONFIG_SCHEMA_COMPANY.SUPPORT_EMAIL.default as string);

	const title = 'Terms & Conditions';
	const description =
		'Terms governing use of our social scheduling platform, connected channels, workspaces, billing, and integrations—including YouTube API Services.';

	const canonical = buildCanonicalUrl(url);
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
		legalName,
		companyAddress,
		supportEmail
	};
}
