import type { MetaTagsProps } from 'svelte-meta-tags';
import type { ServerLoadEvent } from '@sveltejs/kit';
import type { DefinedTerm } from 'schema-dts';

import { getRootPathPublicPlaybooks } from '$lib/area-public/constants/getRootPathPublicPlaybooks';
import { publicPlaybooksPagePresenter } from '$lib/area-public';
import {
	CONFIG_SCHEMA_COMPANY,
	CONFIG_SCHEMA_MARKETING
} from '$lib/config/constants/config';
import { PUBLIC_PLAYBOOKS_HUB } from '$lib/listings/constants/publicListingsHubConfig';
import type { StacksHubFilters } from '$lib/listings/listing.types';
import { getListingPresenter } from '$lib/listings/index';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import {
	createCategoryAboutSchema,
	createCollectionPageSchema,
	createPlaybooksItemListSchema,
	createTagAboutSchema
} from '$lib/listings/utils/createPlaybooksSeoSchema';
import { createMetaData } from '$lib/utils/createMetaData';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/utils/jsonLdSchema';

export const ssr = true;

type PlaybooksHubLoadOverrides = {
	fixedCategorySlug?: string;
	fixedTagSlug?: string;
	fixedTagGroupSlug?: string;
	heroTitle?: string;
	heroDescription?: string;
	customSlug?: string;
	categoryTermName?: string;
	categoryTermDescription?: string;
	tagTermName?: string;
	tagTermDescription?: string;
};

export async function loadPlaybooksHubPage(
	event: ServerLoadEvent,
	overrides: PlaybooksHubLoadOverrides = {}
) {
	const { url, fetch, cookies, parent } = event;
	const {
		fixedCategorySlug,
		fixedTagSlug,
		fixedTagGroupSlug,
		heroTitle,
		heroDescription,
		customSlug,
		categoryTermName,
		categoryTermDescription,
		tagTermName,
		tagTermDescription
	} = overrides;

	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const filters: StacksHubFilters = {
		...publicPlaybooksPagePresenter.parseFiltersFromUrl(url.searchParams)
	};
	if (fixedCategorySlug) {
		filters.category = fixedCategorySlug;
	}
	if (fixedTagSlug) {
		filters.tags = [fixedTagSlug];
		filters.tagGroup = undefined;
	} else if (fixedTagGroupSlug) {
		filters.tagGroup = fixedTagGroupSlug;
		filters.tags = undefined;
	}

	const hub = await publicPlaybooksPagePresenter.loadPlaybooksHubStateless({ fetch, limit: 50 });
	const tagsCatalog = await getListingPresenter.loadAllTagsVm(fetch);
	const tagFilterVm = getListingPresenter.buildStacksTagFilterVm({
		tagsCatalog,
		stacks: hub.stacks
	});
	const filteredPlaybooks = publicPlaybooksPagePresenter.applyClientFilters(hub.stacks, filters, tagFilterVm);

	const statsVm = getListingPresenter.computeStacksHubStats(hub.stacks, hub.categories);

	const customTitle = heroTitle ?? PUBLIC_PLAYBOOKS_HUB.title;
	const customDescription = heroDescription ?? PUBLIC_PLAYBOOKS_HUB.description;
	const seoKeywords = PUBLIC_PLAYBOOKS_HUB.seoKeywords.filter(
		(keyword) => typeof keyword === 'string' && keyword.trim().length > 0
	);

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription,
		customSlug: customSlug ?? getRootPathPublicPlaybooks(),
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

	const aboutNodes = [
		fixedCategorySlug
			? createCategoryAboutSchema({
					origin: url.origin,
					slug: fixedCategorySlug,
					name: categoryTermName ?? customTitle,
					description: categoryTermDescription ?? customDescription
				})
			: null,
		fixedTagSlug
			? createTagAboutSchema({
					origin: url.origin,
					slug: fixedTagSlug,
					name: tagTermName ?? customTitle,
					description: tagTermDescription ?? customDescription
				})
			: null,
		fixedTagGroupSlug
			? createTagAboutSchema({
					origin: url.origin,
					slug: fixedTagGroupSlug,
					name: tagTermName ?? customTitle,
					description: tagTermDescription ?? customDescription
				})
			: null
	].filter((node): node is DefinedTerm => node !== null);

	const schemaData = createJsonLdGraph(
		filterNonEmptyJsonLdNodes([
			createCollectionPageSchema({
				canonical,
				origin: url.origin,
				companyName,
				name: customTitle,
				description: customDescription,
				mainEntityId: `${canonical}#playbooks-list`,
				about: aboutNodes.length > 0 ? aboutNodes : undefined
			}),
			createPlaybooksItemListSchema({
				canonical,
				origin: url.origin,
				name: customTitle,
				description: customDescription,
				playbooks: filteredPlaybooks
			}),
			...aboutNodes,
			...(fixedCategorySlug || fixedTagSlug || fixedTagGroupSlug
				? []
				: [
						createPublicFaqSEOSchema({
							pageUrl: `${canonical}#faq`,
							name: PUBLIC_PLAYBOOKS_HUB.faqSection.faqTitle,
							description: PUBLIC_PLAYBOOKS_HUB.faqSection.faqDescription,
							items: PUBLIC_PLAYBOOKS_HUB.faqSection.faqItems
						})
					])
		])
	);

	return {
		pageMetaTags,
		isLoggedIn,
		playbooksVm: filteredPlaybooks,
		allPlaybooksVm: hub.stacks,
		categoriesVm: hub.categories,
		statsVm,
		filtersVm: filters,
		tagFilterVm,
		totalCount: hub.totalCount,
		schemaData,
		heroTitle: customTitle,
		heroDescription: customDescription,
		heroSubtitle: PUBLIC_PLAYBOOKS_HUB.subtitle
	};
}
