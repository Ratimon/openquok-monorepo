import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicStacksPagePresenter } from '$lib/area-public';
import { getRootPathPublicPlaybooks } from '$lib/area-public/constants/getRootPathPublicPlaybooks';
import {
	CONFIG_SCHEMA_COMPANY,
	CONFIG_SCHEMA_MARKETING
} from '$lib/config/constants/config';
import { PUBLIC_PLAYBOOKS_HUB } from '$lib/listings/constants/publicListingsHubConfig';
import { getListingPresenter } from '$lib/listings/index';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { createMetaData } from '$lib/utils/createMetaData';

export const ssr = true;

export async function load({ url, cookies, fetch, parent }) {
	const isLoggedIn = !!cookies.get('access_token');
	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const filters = publicStacksPagePresenter.parseFiltersFromUrl(url.searchParams);
	const hub = await publicStacksPagePresenter.loadStacksHubStateless({ fetch, limit: 50 });
	const tagsCatalog = await getListingPresenter.loadAllTagsVm(fetch);
	const tagFilterVm = getListingPresenter.buildStacksTagFilterVm({
		tagsCatalog,
		stacks: hub.stacks
	});
	const filteredStacks = publicStacksPagePresenter.applyClientFilters(hub.stacks, filters, tagFilterVm);
	const statsVm = getListingPresenter.computeStacksHubStats(hub.stacks, hub.categories);

	const customTitle = PUBLIC_PLAYBOOKS_HUB.title;
	const customDescription = PUBLIC_PLAYBOOKS_HUB.description;
	const seoKeywords = PUBLIC_PLAYBOOKS_HUB.seoKeywords.filter(
		(keyword) => typeof keyword === 'string' && keyword.trim().length > 0
	);

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription,
		customSlug: getRootPathPublicPlaybooks(),
		customTags: seoKeywords,
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = new URL(url.pathname, url.origin).href;
	const pageMetaTags = Object.freeze({
		canonical,
		openGraph: {
			title: String(CONFIG_SCHEMA_MARKETING.META_TITLE.default),
			description: String(CONFIG_SCHEMA_MARKETING.META_DESCRIPTION.default)
		},
		...metaTags
	}) satisfies MetaTagsProps;

	const schemaData = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'CollectionPage',
				'@id': `${canonical}#webpage`,
				name: customTitle,
				description: customDescription,
				url: canonical,
				isPartOf: {
					'@type': 'WebSite',
					name: companyName,
					url: url.origin
				}
			},
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name: PUBLIC_PLAYBOOKS_HUB.faqSection.faqTitle,
				description: PUBLIC_PLAYBOOKS_HUB.faqSection.faqDescription,
				items: PUBLIC_PLAYBOOKS_HUB.faqSection.faqItems
			})
		].filter((node) => Object.keys(node).length > 0)
	};

	return {
		pageMetaTags,
		isLoggedIn,
		stacksVm: filteredStacks,
		allStacksVm: hub.stacks,
		categoriesVm: hub.categories,
		statsVm,
		filtersVm: filters,
		tagFilterVm,
		totalCount: hub.totalCount,
		schemaData
	};
}
