import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicComparePagePresenter } from '$lib/area-public';
import { getRootPathPublicCompare } from '$lib/area-public/constants/getRootPathPublicCompare';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { PUBLIC_COMPARE_HUB_FAQ } from '$lib/content/constants/hubs/compare';
import { PUBLIC_PRODUCT_HUB_SOCIAL_VS_DIRECTORY_COMPARE } from '$lib/content/constants/hubs/productHubSocialVsDirectoryCompare';
import { buildCompareLandingBreadcrumbItems } from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
import { createPublicHubCompareSectionSchema } from '$lib/content/utils/createPublicHubCompareSectionSchema';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { createBreadcrumbListSchema } from '$lib/seo/buildPublicLandingBreadcrumbJsonLd';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/seo/jsonLdSchema';

export const ssr = true;

export async function load({ url, cookies, parent }) {
	const isLoggedIn = !!cookies.get('access_token');
	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const hubVm = publicComparePagePresenter.buildHubVm();
	const customTitle = `${hubVm.metaTitle} | ${companyName}`;
	const customDescription = hubVm.metaDescription;

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle,
		customDescription,
		customTags: [...hubVm.keywords],
		customSlug: getRootPathPublicCompare(),
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

	function buildComparisonListItems(
		section: typeof hubVm.socialSection,
		listId: string,
		listName: string
	) {
		const comparisonPages = section.pairs.map((pair) => ({
			name: `${section.baseProductName} vs ${pair.name} comparison`,
			url: new URL(pair.href, url.origin).href
		}));

		if (comparisonPages.length === 0) {
			return null;
		}

		return {
			'@type': 'ItemList' as const,
			'@id': listId,
			name: listName,
			url: canonical,
			numberOfItems: comparisonPages.length,
			itemListElement: comparisonPages.map((page, index) => ({
				'@type': 'ListItem' as const,
				position: index + 1,
				item: {
					'@type': 'WebPage' as const,
					'@id': `${page.url}#webpage`,
					name: page.name,
					url: page.url,
					isPartOf: {
						'@type': 'WebSite' as const,
						name: companyName,
						url: url.origin
					}
				}
			}))
		};
	}

	const socialComparisonsList = buildComparisonListItems(
		hubVm.socialSection,
		`${canonical}#comparisons-social`,
		'Social media scheduler comparisons'
	);
	const directoryComparisonsList = buildComparisonListItems(
		hubVm.directorySection,
		`${canonical}#comparisons-directory`,
		'Directory submission service comparisons'
	);

	const mainEntityIds = [
		socialComparisonsList ? socialComparisonsList['@id'] : null,
		directoryComparisonsList ? directoryComparisonsList['@id'] : null
	].filter(Boolean);

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
				...(mainEntityIds.length > 0
					? {
							mainEntity:
								mainEntityIds.length === 1
									? { '@id': mainEntityIds[0]! }
									: mainEntityIds.map((id) => ({ '@id': id! }))
						}
					: {}),
				hasPart: [hubCompareSchema.webPageHasPartRef],
				isPartOf: {
					'@type': 'WebSite',
					name: companyName,
					url: url.origin
				}
			},
			...hubCompareSchema.nodes,
			...(socialComparisonsList ? [socialComparisonsList] : []),
			...(directoryComparisonsList ? [directoryComparisonsList] : []),
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name: PUBLIC_COMPARE_HUB_FAQ.faqTitle,
				description: PUBLIC_COMPARE_HUB_FAQ.faqDescription,
				items: PUBLIC_COMPARE_HUB_FAQ.faqItems
			}),
			createBreadcrumbListSchema(
				buildCompareLandingBreadcrumbItems({ variant: 'hub' }),
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
