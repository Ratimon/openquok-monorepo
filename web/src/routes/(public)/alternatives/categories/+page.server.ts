import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicAlternativesPagePresenter } from '$lib/area-public';
import { getRootPathPublicAlternativesCategories } from '$lib/area-public/constants/getRootPathPublicAlternatives';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { PUBLIC_ALTERNATIVES_CATEGORIES_INDEX } from '$lib/content/constants/hubs/alternativesPathCategories';
import { buildAlternativesLandingBreadcrumbItems } from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { createBreadcrumbListSchema } from '$lib/seo/buildPublicLandingBreadcrumbJsonLd';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/seo/jsonLdSchema';

export const ssr = true;

export async function load({ url, cookies, parent }) {
	const isLoggedIn = !!cookies.get('access_token');
	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const customTitle = `${PUBLIC_ALTERNATIVES_CATEGORIES_INDEX.metaTitle} | ${companyName}`;
	const customDescription = PUBLIC_ALTERNATIVES_CATEGORIES_INDEX.metaDescription;
	const customSlug = getRootPathPublicAlternativesCategories();

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle,
		customDescription,
		customTags: [...PUBLIC_ALTERNATIVES_CATEGORIES_INDEX.keywords],
		customSlug,
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

	const categories = publicAlternativesPagePresenter.listPathCategoriesForIndex();

	const schemaData = createJsonLdGraph(
		filterNonEmptyJsonLdNodes([
			{
				'@type': 'CollectionPage',
				'@id': `${canonical}#webpage`,
				name: PUBLIC_ALTERNATIVES_CATEGORIES_INDEX.metaTitle,
				description: customDescription,
				url: canonical,
				isPartOf: {
					'@type': 'WebSite',
					name: companyName,
					url: url.origin
				}
			},
			createBreadcrumbListSchema(
				buildAlternativesLandingBreadcrumbItems({ variant: 'categories-index' }),
				url.origin
			)
		])
	);

	return {
		pageMetaTags,
		isLoggedIn,
		categories,
		schemaData
	};
}
