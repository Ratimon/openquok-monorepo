import type { MetaTagsProps } from 'svelte-meta-tags';

import { getRootPathPublicSelfHosting } from '$lib/area-public/constants/getRootPathPublicSelfHosting';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { PUBLIC_SELF_HOSTING_LANDING_CONFIG } from '$lib/content/constants/publicSelfHostingLandingConfig';
import { PUBLIC_SELF_HOSTING_WHO_IS_FOR_SECTION } from '$lib/content/constants/publicSelfHostingWhoIsForConfig';
import { createPublicAudienceSectionSEOSchema } from '$lib/content/utils/createPublicAudienceSEOSchema';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { createPublicSelfHostPricingOffer } from '$lib/content/utils/createPublicPricingSEOSchema';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/seo/jsonLdSchema';

export const ssr = true;

export async function load({ url, cookies, parent }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();

	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const {
		metaTitle: customTitle,
		metaDescription: customDescription,
		keywords,
		faqSection
	} = PUBLIC_SELF_HOSTING_LANDING_CONFIG;

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription,
		customSlug: getRootPathPublicSelfHosting(),
		customTags: [...keywords],
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = buildCanonicalUrl(url);
	const pageMetaTags = withCanonicalMetaTags(metaTags, canonical, {
		openGraph: {
			title: customTitle,
			description: customDescription
		},
		twitter: {
			title: customTitle,
			description: customDescription
		}
	});

	const schemaData = createJsonLdGraph(
		filterNonEmptyJsonLdNodes([
			{
				'@type': 'WebPage',
				'@id': `${canonical}#webpage`,
				name: customTitle,
				description: customDescription,
				url: canonical,
				isPartOf: {
					'@type': 'WebSite',
					name: companyName,
					url: url.origin
				},
				offers: createPublicSelfHostPricingOffer({
					pageUrl: canonical,
					origin: url.origin
				})
			},
			createPublicAudienceSectionSEOSchema({
				pageUrl: canonical,
				sectionTitle: PUBLIC_SELF_HOSTING_WHO_IS_FOR_SECTION.audienceTitle,
				sectionSubtitle: PUBLIC_SELF_HOSTING_WHO_IS_FOR_SECTION.audienceSubtitle,
				cards: PUBLIC_SELF_HOSTING_WHO_IS_FOR_SECTION.audienceCards
			}),
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name: faqSection.faqTitle,
				description: faqSection.faqDescription,
				items: faqSection.faqItems
			})
		])
	);

	return {
		pageMetaTags,
		schemaData,
		isLoggedIn
	};
}
