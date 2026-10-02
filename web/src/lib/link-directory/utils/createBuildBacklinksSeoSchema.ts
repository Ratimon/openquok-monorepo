import type { CollectionPage, DefinedTerm, DefinedTermSet, ItemList, WebSite } from 'schema-dts';

import {
	getRootPathPublicBuildBacklinks,
	getRootPathPublicBuildBacklinksCategories,
	getRootPathPublicBuildBacklinksCategory,
	getRootPathPublicBuildBacklinksSite,
	getRootPathPublicBuildBacklinksTag,
	getRootPathPublicBuildBacklinksTags
} from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
import type { LinkDirectorySiteDto } from '$lib/link-directory/link-directory.types';
import type {
	BuildBacklinksCategoryOverviewItem,
	BuildBacklinksTagOverviewItem
} from '$lib/link-directory/utils/buildBuildBacklinksOverviewCounts';

type DefinedTermInput = {
	slug: string;
	name: string;
	description?: string | null;
	url: string;
	inDefinedTermSet: string;
};

function toDefinedTerm(params: DefinedTermInput): DefinedTerm {
	const { slug, name, description, url, inDefinedTermSet } = params;

	return {
		'@type': 'DefinedTerm',
		'@id': `${url}#term`,
		name,
		description: description?.trim() || undefined,
		url,
		termCode: slug,
		inDefinedTermSet
	};
}

export function createBuildBacklinksCollectionPageSchema(params: {
	canonical: string;
	origin: string;
	companyName: string;
	name: string;
	description: string;
	mainEntityId?: string;
	about?: DefinedTerm | DefinedTerm[];
}): CollectionPage {
	const { canonical, origin, companyName, name, description, mainEntityId, about } = params;

	return {
		'@type': 'CollectionPage',
		'@id': `${canonical}#webpage`,
		name,
		description,
		url: canonical,
		mainEntity: mainEntityId ? { '@id': mainEntityId } : undefined,
		about,
		isPartOf: {
			'@type': 'WebSite',
			name: companyName,
			url: origin
		} as WebSite
	};
}

export function createBuildBacklinksItemListSchema(params: {
	canonical: string;
	origin: string;
	name: string;
	description: string;
	sites: LinkDirectorySiteDto[];
	totalCount?: number;
	listOffset?: number;
}): ItemList {
	const { canonical, origin, name, description, sites, totalCount, listOffset = 0 } = params;

	return {
		'@type': 'ItemList',
		'@id': `${canonical}#build-backlinks-list`,
		name,
		description,
		url: canonical,
		numberOfItems: totalCount ?? sites.length,
		itemListOrder: 'https://schema.org/ItemListOrderDescending',
		itemListElement: sites.map((site, index) => ({
			'@type': 'ListItem',
			position: listOffset + index + 1,
			name: site.title,
			url: new URL(getRootPathPublicBuildBacklinksSite(site.slug), origin).href
		}))
	};
}

export function createBuildBacklinksCategoryAboutSchema(params: {
	origin: string;
	slug: string;
	name: string;
	description?: string | null;
}): DefinedTerm {
	const url = new URL(getRootPathPublicBuildBacklinksCategory(params.slug), params.origin).href;
	return toDefinedTerm({
		slug: params.slug,
		name: params.name,
		description: params.description,
		url,
		inDefinedTermSet: new URL(getRootPathPublicBuildBacklinks(), params.origin).href
	});
}

export function createBuildBacklinksTagAboutSchema(params: {
	origin: string;
	slug: string;
	name: string;
	description?: string | null;
}): DefinedTerm {
	const url = new URL(getRootPathPublicBuildBacklinksTag(params.slug), params.origin).href;
	return toDefinedTerm({
		slug: params.slug,
		name: params.name,
		description: params.description,
		url,
		inDefinedTermSet: new URL(getRootPathPublicBuildBacklinksTags(), params.origin).href
	});
}

export function createBuildBacklinksCategoryTermSetSchema(params: {
	canonical: string;
	origin: string;
	name: string;
	description: string;
	categories: BuildBacklinksCategoryOverviewItem[];
}): DefinedTermSet {
	const { canonical, origin, name, description, categories } = params;
	const setUrl = new URL(getRootPathPublicBuildBacklinksCategories(), origin).href;

	return {
		'@type': 'DefinedTermSet',
		'@id': `${canonical}#categories-set`,
		name,
		description,
		url: canonical,
		about: {
			'@type': 'Thing',
			name: 'Backlink directory categories'
		},
		hasDefinedTerm: categories.map((category) =>
			toDefinedTerm({
				slug: category.slug,
				name: category.name,
				description:
					category.description?.trim() ||
					`${category.name} backlink opportunities on platforms and directories.`,
				url: new URL(getRootPathPublicBuildBacklinksCategory(category.slug), origin).href,
				inDefinedTermSet: setUrl
			})
		)
	};
}

export function createBuildBacklinksTagTermSetSchema(params: {
	canonical: string;
	origin: string;
	name: string;
	description: string;
	tags: BuildBacklinksTagOverviewItem[];
}): DefinedTermSet {
	const { canonical, origin, name, description, tags } = params;
	const setUrl = new URL(getRootPathPublicBuildBacklinksTags(), origin).href;

	return {
		'@type': 'DefinedTermSet',
		'@id': `${canonical}#tags-set`,
		name,
		description,
		url: canonical,
		about: {
			'@type': 'Thing',
			name: 'Backlink directory tags'
		},
		hasDefinedTerm: tags.map((tag) =>
			toDefinedTerm({
				slug: tag.slug,
				name: tag.label,
				description: tag.description,
				url: new URL(getRootPathPublicBuildBacklinksTag(tag.slug), origin).href,
				inDefinedTermSet: setUrl
			})
		)
	};
}
