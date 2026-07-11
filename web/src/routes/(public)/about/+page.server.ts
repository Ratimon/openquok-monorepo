import type { MetaTagsProps } from 'svelte-meta-tags';

import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { createOrganizationSEOSchema, organizationSchemaId } from '$lib/content/utils/createOrganizationSEOSchema';
import { createMetaData } from '$lib/utils/createMetaData';

export const ssr = true;

export async function load({ url, cookies, parent }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm, marketingInformationVm } = await parent();

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

	const organizationId = organizationSchemaId(url.origin);
	const organization = createOrganizationSEOSchema({
		name: companyName,
		url: companyUrl,
		origin: url.origin,
		marketingInformationVm: marketingInformationVm ?? {},
		email: supportEmail,
		logo: new URL('/pwa/favicon.svg', url.origin).href,
		contactPoint: [
			{
				'@type': 'ContactPoint',
				contactType: 'customer support',
				email: supportEmail,
				url: canonical
			}
		]
	});

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
			organization
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

