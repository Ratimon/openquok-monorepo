import type {
	ExtensionCategoryOverviewItemViewModel,
	ExtensionTagFilterChip,
	ExtensionTagGroupFilterChip,
	StackCardViewModel
} from '$lib/listings';

import {
	getRootPathPublicPlaybooksCategories,
	getRootPathPublicPlaybooksCategory,
	getRootPathPublicPlaybooksTag,
	getRootPathPublicPlaybooksTags
} from '$lib/area-public/constants/getRootPathPublicPlaybooks';
import { getRootPathPublicCreatorPlaybook } from '$lib/area-public/constants/getRootPathPublicCreators';

type JsonLdNode = Record<string, unknown>;

type DefinedTermInput = {
	slug: string;
	name: string;
	description?: string | null;
	url: string;
	inDefinedTermSet: string;
};

function toDefinedTerm(params: DefinedTermInput): JsonLdNode {
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
	about?: JsonLdNode | JsonLdNode[];
}): JsonLdNode {
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
		}
	};
}

export function createPlaybooksItemListSchema(params: {
	canonical: string;
	origin: string;
	name: string;
	description: string;
	playbooks: StackCardViewModel[];
}): JsonLdNode {
	const { canonical, origin, name, description, playbooks } = params;

	return {
		'@type': 'ItemList',
		'@id': `${canonical}#playbooks-list`,
		name,
		description,
		url: canonical,
		numberOfItems: playbooks.length,
		itemListOrder: 'https://schema.org/ItemListOrderAscending',
		itemListElement: playbooks.map((playbook, index) => {
			const itemUrl = playbook.ownerUsername
				? new URL(getRootPathPublicCreatorPlaybook(playbook.ownerUsername, playbook.slug), origin).href
				: undefined;
			const itemDescription = playbook.excerpt?.trim() || playbook.description?.trim() || undefined;

			return {
				'@type': 'ListItem',
				position: index + 1,
				url: itemUrl,
				item: {
					'@type': 'HowTo',
					name: playbook.title,
					description: itemDescription,
					url: itemUrl,
					keywords: playbook.tags.map((tag) => tag.name).join(', ') || undefined
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
}): JsonLdNode {
	const { canonical, origin, name, description, categories } = params;
	const setUrl = new URL(getRootPathPublicPlaybooksCategories(), origin).href;

	return {
		'@type': 'DefinedTermSet',
		'@id': `${canonical}#categories-set`,
		name,
		description,
		url: canonical,
		about: {
			'@type': 'Thing',
			name: 'Playbook categories'
		},
		hasDefinedTerm: categories.map((category) =>
			toDefinedTerm({
				slug: category.slug,
				name: category.name,
				description:
					category.description?.trim() ||
					`${category.name} playbooks and related agent workflow use cases.`,
				url: new URL(getRootPathPublicPlaybooksCategory(category.slug), origin).href,
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
}): JsonLdNode {
	const { canonical, origin, name, description, tags } = params;
	const setUrl = new URL(getRootPathPublicPlaybooksTags(), origin).href;

	return {
		'@type': 'DefinedTermSet',
		'@id': `${canonical}#tags-set`,
		name,
		description,
		url: canonical,
		about: {
			'@type': 'Thing',
			name: 'Playbook tags'
		},
		hasDefinedTerm: tags.map((tag) =>
			toDefinedTerm({
				slug: tag.slug,
				name: tag.label,
				description: `${tag.label} playbooks and related workflow filters.`,
				url: new URL(getRootPathPublicPlaybooksTag(tag.slug), origin).href,
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
}): JsonLdNode {
	const { canonical, origin, name, description, groups } = params;
	const setUrl = new URL(getRootPathPublicPlaybooksTags(), origin).href;

	return {
		'@type': 'DefinedTermSet',
		'@id': `${canonical}#tag-groups-set`,
		name,
		description,
		url: canonical,
		about: {
			'@type': 'Thing',
			name: 'Playbook tag groups'
		},
		hasDefinedTerm: groups.map((group) =>
			toDefinedTerm({
				slug: group.slug,
				name: group.label,
				description: `${group.label} tag group for playbook filters.`,
				url: new URL(getRootPathPublicPlaybooksTag(group.slug), origin).href,
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
}): JsonLdNode {
	const { origin, slug, name, description } = params;

	return toDefinedTerm({
		slug,
		name,
		description,
		url: new URL(getRootPathPublicPlaybooksCategory(slug), origin).href,
		inDefinedTermSet: new URL(getRootPathPublicPlaybooksCategories(), origin).href
	});
}

export function createTagAboutSchema(params: {
	origin: string;
	slug: string;
	name: string;
	description?: string | null;
}): JsonLdNode {
	const { origin, slug, name, description } = params;

	return toDefinedTerm({
		slug,
		name,
		description,
		url: new URL(getRootPathPublicPlaybooksTag(slug), origin).href,
		inDefinedTermSet: new URL(getRootPathPublicPlaybooksTags(), origin).href
	});
}
