import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';
import type { BusinessAudience, ItemList, ListItem, PeopleAudience, Thing } from 'schema-dts';

export type PublicAudienceSectionCopy = {
	sectionTitle?: string;
	sectionSubtitle?: string;
	cards: readonly AudienceCard[];
};

function normalizePageBase(pageUrl: string): string {
	return pageUrl.replace(/#.*$/, '').replace(/\/$/, '') || pageUrl;
}

function slugifyAudienceSegment(title: string): string {
	return (
		title
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '') || 'segment'
	);
}

/** Maps marketing persona titles to Schema.org audience subtypes. */
export function resolveAudienceSchemaType(title: string): 'BusinessAudience' | 'PeopleAudience' {
	const normalized = title.trim().toLowerCase();
	if (
		/\b(startup|saas|founder|founders|team|teams|business|company|agency|b2b|enterprise|scaling)\b/.test(
			normalized
		)
	) {
		return 'BusinessAudience';
	}
	return 'PeopleAudience';
}

export function buildSchemaOrgAudienceFromCards(
	cards: readonly AudienceCard[],
	pageUrl: string
): Array<BusinessAudience | PeopleAudience> {
	const pageBase = normalizePageBase(pageUrl);

	return cards.map((card) => {
		const audienceType = resolveAudienceSchemaType(card.title);
		return {
			'@type': audienceType,
			'@id': `${pageBase}#audience-${slugifyAudienceSegment(card.title)}`,
			name: card.title,
			audienceType: card.title
		} as BusinessAudience | PeopleAudience;
	});
}

/**
 * JSON-LD `ItemList` for visible WhoIsFor sections (`#audience`).
 * @see https://schema.org/Audience
 */
export function createPublicAudienceSectionSEOSchema(
	params: PublicAudienceSectionCopy & { pageUrl: string }
): ItemList | Record<string, never> {
	const { pageUrl, sectionTitle, sectionSubtitle, cards } = params;

	if (cards.length === 0) {
		return {};
	}

	const pageBase = normalizePageBase(pageUrl);
	const normalizedTitle = sectionTitle?.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();

	return {
		'@type': 'ItemList',
		'@id': `${pageBase}#audience`,
		...(normalizedTitle ? { name: normalizedTitle } : {}),
		...(sectionSubtitle?.trim() ? { description: sectionSubtitle.trim() } : {}),
		numberOfItems: cards.length,
		itemListElement: cards.map(
			(card, index) =>
				({
					'@type': 'ListItem',
					position: index + 1,
					name: card.title,
					description: card.description,
					item: {
						'@type': resolveAudienceSchemaType(card.title),
						'@id': `${pageBase}#audience-${slugifyAudienceSegment(card.title)}`,
						name: card.title,
						audienceType: card.title
					}
				}) as ListItem
		)
	};
}

/** Adds Schema.org `audience` to WebPage / SoftwareApplication / CollectionPage nodes. */
export function withSchemaOrgAudience<T extends Thing>(
	node: T,
	copy: PublicAudienceSectionCopy,
	pageUrl: string
): T {
	const audience = buildSchemaOrgAudienceFromCards(copy.cards, pageUrl);
	if (audience.length === 0) {
		return node;
	}

	return {
		...node,
		audience
	};
}
