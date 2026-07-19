import type {
	CollectionPage,
	DefinedTerm,
	DefinedTermSet,
	ItemList,
	WebSite
} from 'schema-dts';

import type {
	ExtensionCardViewModel,
	ExtensionCategoryOverviewItemViewModel,
	ExtensionTagFilterChip,
	ExtensionTagGroupFilterChip
} from '$lib/listings';

import {
	getRootPathPublicBuildingBlocksCategories,
	getRootPathPublicBuildingBlocksCategory,
	getRootPathPublicBuildingBlocksTag,
	getRootPathPublicBuildingBlocksTags
} from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
import { getRootPathPublicCreatorBuildingBlock } from '$lib/area-public/constants/getRootPathPublicCreators';

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

export function createCollectionPageSchema(params: {
	canonical: string;
	origin: string;
	companyName: string;
	name: string;
	description: string;
	mainEntityId?: string | string[];
	about?: DefinedTerm | DefinedTerm[];
}): CollectionPage {
	const { canonical, origin, companyName, name, description, mainEntityId, about } = params;

	return {
		'@type': 'CollectionPage',
		'@id': `${canonical}#webpage`,
		name,
		description,
		url: canonical,
		mainEntity: Array.isArray(mainEntityId)
			? mainEntityId.map((id) => ({ '@id': id }))
			: mainEntityId
				? { '@id': mainEntityId }
				: undefined,
		about,
		isPartOf: {
			'@type': 'WebSite',
			name: companyName,
			url: origin
		} as WebSite
	};
}

export function createBuildingBlocksItemListSchema(params: {
	canonical: string;
	origin: string;
	name: string;
	description: string;
	buildingBlocks: ExtensionCardViewModel[];
	totalCount?: number;
	listOffset?: number;
}): ItemList {
	const { canonical, origin, name, description, buildingBlocks, totalCount, listOffset = 0 } = params;

	return {
		'@type': 'ItemList',
		'@id': `${canonical}#building-blocks-list`,
		name,
		description,
		url: canonical,
		numberOfItems: totalCount ?? buildingBlocks.length,
		itemListOrder: 'https://schema.org/ItemListOrderAscending',
		itemListElement: buildingBlocks.map((buildingBlock, index) => {
			const itemUrl = buildingBlock.ownerUsername
				? new URL(
						getRootPathPublicCreatorBuildingBlock(buildingBlock.ownerUsername, buildingBlock.slug),
						origin
					).href
				: undefined;
			const itemDescription = buildingBlock.excerpt?.trim() || buildingBlock.description?.trim() || undefined;

			return {
				'@type': 'ListItem',
				position: listOffset + index + 1,
				url: itemUrl,
				item: {
					'@type': 'Thing',
					name: buildingBlock.title,
					description: itemDescription,
					url: itemUrl,
					keywords: buildingBlock.tags.map((tag) => tag.name).join(', ') || undefined
				}
			};
		})
	};
}

export function createCategoryTermSetSchema(params: {
	canonical: string;
	origin: string;
	name: string;
	description: string;
	categories: ExtensionCategoryOverviewItemViewModel[];
}): DefinedTermSet {
	const { canonical, origin, name, description, categories } = params;
	const setUrl = new URL(getRootPathPublicBuildingBlocksCategories(), origin).href;

	return {
		'@type': 'DefinedTermSet',
		'@id': `${canonical}#categories-set`,
		name,
		description,
		url: canonical,
		about: {
			'@type': 'Thing',
			name: 'Building block categories'
		},
		hasDefinedTerm: categories.map((category) =>
			toDefinedTerm({
				slug: category.slug,
				name: category.name,
				description:
					category.description?.trim() ||
					`${category.name} building blocks and related skills or MCP servers.`,
				url: new URL(getRootPathPublicBuildingBlocksCategory(category.slug), origin).href,
				inDefinedTermSet: setUrl
			})
		)
	};
}

export function createTagTermSetSchema(params: {
	canonical: string;
	origin: string;
	name: string;
	description: string;
	tags: ExtensionTagFilterChip[];
}): DefinedTermSet {
	const { canonical, origin, name, description, tags } = params;
	const setUrl = new URL(getRootPathPublicBuildingBlocksTags(), origin).href;

	return {
		'@type': 'DefinedTermSet',
		'@id': `${canonical}#tags-set`,
		name,
		description,
		url: canonical,
		about: {
			'@type': 'Thing',
			name: 'Building block tags'
		},
		hasDefinedTerm: tags.map((tag) =>
			toDefinedTerm({
				slug: tag.slug,
				name: tag.label,
				description: `${tag.label} building blocks and related catalog filters.`,
				url: new URL(getRootPathPublicBuildingBlocksTag(tag.slug), origin).href,
				inDefinedTermSet: setUrl
			})
		)
	};
}

export function createTagGroupTermSetSchema(params: {
	canonical: string;
	origin: string;
	name: string;
	description: string;
	groups: ExtensionTagGroupFilterChip[];
}): DefinedTermSet {
	const { canonical, origin, name, description, groups } = params;
	const setUrl = new URL(getRootPathPublicBuildingBlocksTags(), origin).href;

	return {
		'@type': 'DefinedTermSet',
		'@id': `${canonical}#tag-groups-set`,
		name,
		description,
		url: canonical,
		about: {
			'@type': 'Thing',
			name: 'Building block tag groups'
		},
		hasDefinedTerm: groups.map((group) =>
			toDefinedTerm({
				slug: group.slug,
				name: group.label,
				description: `${group.label} tag group for building block filters.`,
				url: new URL(getRootPathPublicBuildingBlocksTag(group.slug), origin).href,
				inDefinedTermSet: setUrl
			})
		)
	};
}

export function createCategoryAboutSchema(params: {
	origin: string;
	slug: string;
	name: string;
	description?: string | null;
}): DefinedTerm {
	const { origin, slug, name, description } = params;

	return toDefinedTerm({
		slug,
		name,
		description,
		url: new URL(getRootPathPublicBuildingBlocksCategory(slug), origin).href,
		inDefinedTermSet: new URL(getRootPathPublicBuildingBlocksCategories(), origin).href
	});
}

export function createTagAboutSchema(params: {
	origin: string;
	slug: string;
	name: string;
	description?: string | null;
}): DefinedTerm {
	const { origin, slug, name, description } = params;

	return toDefinedTerm({
		slug,
		name,
		description,
		url: new URL(getRootPathPublicBuildingBlocksTag(slug), origin).href,
		inDefinedTermSet: new URL(getRootPathPublicBuildingBlocksTags(), origin).href
	});
}
