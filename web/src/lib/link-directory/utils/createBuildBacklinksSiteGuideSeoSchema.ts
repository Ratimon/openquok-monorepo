import type { ImageObject, Organization, WebPage, WebSite } from 'schema-dts';

export function createBuildBacklinksSiteGuidePlatformOrganizationSchema(params: {
	canonicalUrl: string;
	siteTitle: string;
	siteUrl: string;
	logoUrl?: string | null;
}): Organization {
	const { canonicalUrl, siteTitle, siteUrl, logoUrl } = params;
	const trimmedLogo = logoUrl?.trim();

	return {
		'@type': 'Organization',
		'@id': `${canonicalUrl}#platform`,
		name: siteTitle,
		url: siteUrl,
		...(trimmedLogo
			? {
					logo: {
						'@type': 'ImageObject',
						url: trimmedLogo
					} satisfies ImageObject
				}
			: {})
	};
}

export function createBuildBacklinksSiteGuideWebPageSchema(params: {
	canonical: string;
	origin: string;
	companyName: string;
	name: string;
	description: string;
}): WebPage {
	const { canonical, origin, companyName, name, description } = params;

	return {
		'@type': 'WebPage',
		'@id': `${canonical}#webpage`,
		name,
		description,
		url: canonical,
		mainEntity: { '@id': `${canonical}#howto-site` },
		about: { '@id': `${canonical}#platform` },
		isPartOf: {
			'@type': 'WebSite',
			name: companyName,
			url: origin
		} satisfies WebSite
	};
}
