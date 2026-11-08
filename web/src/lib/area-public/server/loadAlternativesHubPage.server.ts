import type { MetaTagsProps } from 'svelte-meta-tags';
import type { ServerLoadEvent } from '@sveltejs/kit';

import { publicAlternativesPagePresenter } from '$lib/area-public';
import type { AlternativesHubViewModel } from '$lib/area-public/PublicAlternativesPage.presenter.svelte';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { PUBLIC_ALTERNATIVES_HUB_FAQ } from '$lib/content/constants/hubs/alternatives';
import { PUBLIC_PRODUCT_HUB_SOCIAL_VS_DIRECTORY_COMPARE } from '$lib/content/constants/hubs/productHubSocialVsDirectoryCompare';
import type { AlternativesHubFilters } from '$lib/content/constants/hubs/alternativesHubFilters';
import {
	buildAlternativesLandingBreadcrumbItems,
	type AlternativesLandingBreadcrumbVariant
} from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
import { createAlternativesHubItemListSchema } from '$lib/content/utils/createAlternativesHubItemListSchema';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { createPublicHubCompareSectionSchema } from '$lib/content/utils/createPublicHubCompareSectionSchema';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { createBreadcrumbListSchema } from '$lib/seo/buildPublicLandingBreadcrumbJsonLd';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/seo/jsonLdSchema';

export type LoadAlternativesHubPageOptions = {
	customSlug: string;
	filtersVm: AlternativesHubFilters;
	baseHubVm: AlternativesHubViewModel;
	itemListName: string;
	breadcrumbVariant: AlternativesLandingBreadcrumbVariant;
	categoryLabel?: string | null;
	categorySlug?: string | null;
};

export async function loadAlternativesHubPage(
	event: ServerLoadEvent,
	options: LoadAlternativesHubPageOptions
) {
	const isLoggedIn = !!event.cookies.get('access_token');
	const { companyInformationPm, marketingInformationPm } = await event.parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const hubVm = publicAlternativesPagePresenter.applyHubFilters(
		options.baseHubVm,
		options.filtersVm
	);
	const customTitle = `${hubVm.metaTitle} | ${companyName}`;
	const customDescription = hubVm.metaDescription;

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle,
		customDescription,
		customSlug: options.customSlug,
		customTags: hubVm.keywords,
		requestUrl: event.url
	})) satisfies MetaTagsProps;

	const canonical = buildCanonicalUrl(event.url);
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
			origin: event.url.origin,
			companyName,
			name: options.itemListName,
			description: hubVm.metaDescription,
			entries: hubListEntries,
			sort: options.filtersVm.sort
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
					url: event.url.origin
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
				buildAlternativesLandingBreadcrumbItems({
					variant: options.breadcrumbVariant,
					categoryLabel: options.categoryLabel,
					categorySlug: options.categorySlug
				}),
				event.url.origin
			)
		])
	);

	return {
		pageMetaTags,
		isLoggedIn,
		filtersVm: options.filtersVm,
		hubVm,
		schemaData
	};
}
