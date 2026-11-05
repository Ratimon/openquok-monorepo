import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicAlternativesPagePresenter } from '$lib/area-public';
import { getRootPathPublicAlternatives } from '$lib/area-public/constants/getRootPathPublicAlternatives';
import { parseAlternativesHubFiltersFromUrl } from '$lib/content/constants/hubs/alternativesHubFilters';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { buildAlternativesLandingBreadcrumbItems } from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
import { PUBLIC_ALTERNATIVES_HUB_FAQ } from '$lib/content/constants/hubs/alternatives';
import { PUBLIC_PRODUCT_HUB_SOCIAL_VS_DIRECTORY_COMPARE } from '$lib/content/constants/hubs/productHubSocialVsDirectoryCompare';
import { createAlternativesHubItemListSchema } from '$lib/content/utils/createAlternativesHubItemListSchema';
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

	const filtersVm = parseAlternativesHubFiltersFromUrl(url.searchParams);
	const baseHubVm = publicAlternativesPagePresenter.buildHubVm();
	const hubVm = publicAlternativesPagePresenter.applyHubFilters(baseHubVm, filtersVm);
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

	const hubListEntries = [
		...hubVm.socialSection.entries,
		...hubVm.directorySection.entries
	];
	const { itemList: alternativesItemList, softwareApplications: alternativesProductSchemas } =
		createAlternativesHubItemListSchema({
			canonical,
			origin: url.origin,
			companyName,
			name: 'Social media and directory submission alternatives',
			description: hubVm.metaDescription,
			entries: hubListEntries,
			sort: filtersVm.sort
		});

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
			alternativesItemList,
			...alternativesProductSchemas,
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
		filtersVm,
		hubVm,
		schemaData
	};
}
