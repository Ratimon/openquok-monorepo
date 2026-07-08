import type { MetaTagsProps } from 'svelte-meta-tags';

import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { createMetaData } from '$lib/utils/createMetaData';

export const ssr = true;

export async function load({ url, cookies, parent }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();

	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;
	const companyUrl = companyInformationPm?.config?.URL ?? CONFIG_SCHEMA_COMPANY.URL.default;
	const supportEmail =
		companyInformationPm?.config?.SUPPORT_EMAIL ?? CONFIG_SCHEMA_COMPANY.SUPPORT_EMAIL.default;
	const responsiblePerson =
		companyInformationPm?.config?.RESPONSIBLE_PERSON ??
		CONFIG_SCHEMA_COMPANY.RESPONSIBLE_PERSON.default;

	const customTitle = 'About Us';
	const customDescription =
		'Learn about our engineering and product-focused team and how to contact us.';

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription,
		customSlug: 'about',
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = new URL(url.pathname, url.origin).href;
	const pageMetaTags = Object.freeze({
		canonical,
		...metaTags
	}) satisfies MetaTagsProps;

	const organizationId = `${canonical}#organization`;
	const schemaData = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'AboutPage',
				'@id': `${canonical}#webpage`,
				name: customTitle,
				description: customDescription,
				url: canonical,
				mainEntity: {
					'@id': organizationId
				},
				about: {
					'@id': organizationId
				},
				isPartOf: {
					'@type': 'WebSite',
					name: companyName,
					url: url.origin
				}
			},
			{
				'@type': 'Organization',
				'@id': organizationId,
				name: companyName,
				url: companyUrl,
				email: `mailto:${supportEmail}`,
				contactPoint: [
					{
						'@type': 'ContactPoint',
						contactType: 'customer support',
						email: supportEmail,
						url: canonical
					}
				]
			}
		]
	};

	return {
		pageMetaTags,
		schemaData,
		isLoggedIn,
		companyInformationPm,
		companyName,
		companyUrl,
		supportEmail,
		responsiblePerson
	};
}

