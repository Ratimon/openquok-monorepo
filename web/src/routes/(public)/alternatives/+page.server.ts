import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicAlternativesPagePresenter } from '$lib/area-public';
import { getRootPathPublicAlternatives } from '$lib/area-public/constants/getRootPathPublicAlternatives';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { buildAlternativesLandingBreadcrumbItems } from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
import { PUBLIC_ALTERNATIVES_HUB_FAQ } from '$lib/content/constants/hubs/alternatives';
import { PUBLIC_PRODUCT_HUB_SOCIAL_VS_DIRECTORY_COMPARE } from '$lib/content/constants/hubs/productHubSocialVsDirectoryCompare';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { createPublicHubCompareSectionSchema } from '$lib/content/utils/createPublicHubCompareSectionSchema';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { createBreadcrumbListSchema } from '$lib/seo/buildPublicLandingBreadcrumbJsonLd';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/seo/jsonLdSchema';

export const ssr = true;

export async function load({ url, cookies, parent }) {
	const isLoggedIn = !!cookies.get('access_token');
	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const hubVm = publicAlternativesPagePresenter.buildHubVm();
	const customTitle = `${hubVm.metaTitle} | ${companyName}`;
	const customDescription = hubVm.metaDescription;

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle,
		customDescription,
		customSlug: getRootPathPublicAlternatives(),
		// Hub SEO keywords from presenter — same pattern as detailVm.keywords on `/alternatives/[slug]`.
		customTags: hubVm.keywords,
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

	const alternativePages = [
		...hubVm.socialSection.entries,
		...hubVm.directorySection.entries
	].map((entry) => ({
		name: entry.title,
		url: new URL(entry.href, url.origin).href
	}));

	const webPageId = `${canonical}#webpage`;
	const hubCompareSchema = createPublicHubCompareSectionSchema({
		canonical,
		webPageId,
		section: PUBLIC_PRODUCT_HUB_SOCIAL_VS_DIRECTORY_COMPARE
	});

	const schemaData = createJsonLdGraph(
		filterNonEmptyJsonLdNodes([
			{
				'@type': 'CollectionPage',
				'@id': webPageId,
				name: hubVm.metaTitle,
				description: hubVm.metaDescription,
				url: canonical,
				mainEntity: {
					'@id': `${canonical}#alternatives`
				},
				hasPart: [hubCompareSchema.webPageHasPartRef],
				isPartOf: {
					'@type': 'WebSite',
					name: companyName,
					url: url.origin
				}
			},
			...hubCompareSchema.nodes,
			{
				'@type': 'ItemList',
				'@id': `${canonical}#alternatives`,
				name: 'Social media and directory submission alternatives',
				url: canonical,
				numberOfItems: alternativePages.length,
				itemListElement: alternativePages.map((page, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					item: {
						'@type': 'WebPage',
						'@id': `${page.url}#webpage`,
						name: page.name,
						url: page.url,
						isPartOf: {
							'@type': 'WebSite',
							name: companyName,
							url: url.origin
						}
					}
				}))
			},
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name: PUBLIC_ALTERNATIVES_HUB_FAQ.faqTitle,
				description: PUBLIC_ALTERNATIVES_HUB_FAQ.faqDescription,
				items: PUBLIC_ALTERNATIVES_HUB_FAQ.faqItems
			}),
			createBreadcrumbListSchema(
				buildAlternativesLandingBreadcrumbItems({ variant: 'hub' }),
				url.origin
			)
		])
	);

	return {
		pageMetaTags,
		isLoggedIn,
		hubVm,
		schemaData
	};
}
