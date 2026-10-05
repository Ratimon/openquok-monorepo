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

const TEAM_AND_SOCIAL_MANAGERS_TITLE = 'team & social managers';

function normalizeAudienceTitle(title: string): string {
	return title.trim().toLowerCase();
}

/**
 * Schema.org `audienceType` — richer than the visible card title when the UI bundles roles.
 * @see https://schema.org/audienceType
 */
export function resolveSchemaAudienceTypeLabel(title: string): string {
	const normalized = normalizeAudienceTitle(title);
	if (normalized === TEAM_AND_SOCIAL_MANAGERS_TITLE) {
		return 'In-house marketing teams and social media managers';
	}
	return title.trim();
}

/** Maps marketing persona titles to Schema.org audience subtypes. */
export function resolveAudienceSchemaType(title: string): 'BusinessAudience' | 'PeopleAudience' {
	const normalized = normalizeAudienceTitle(title);
	if (normalized === TEAM_AND_SOCIAL_MANAGERS_TITLE) {
		return 'BusinessAudience';
	}
	if (/\bsocial managers?\b/.test(normalized) && !/\bteam\b/.test(normalized)) {
		return 'PeopleAudience';
	}
	if (
		/\b(startup|saas|founder|founders|team|teams|business|company|agency|agencies|b2b|enterprise|scaling|e-commerce)\b/.test(
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
		const schemaSubtype = resolveAudienceSchemaType(card.title);
		const audienceTypeLabel = resolveSchemaAudienceTypeLabel(card.title);
		return {
			'@type': schemaSubtype,
			'@id': `${pageBase}#audience-${slugifyAudienceSegment(card.title)}`,
			name: card.title,
			audienceType: audienceTypeLabel,
			description: card.description
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
						audienceType: resolveSchemaAudienceTypeLabel(card.title),
						description: card.description
					}
				}) as ListItem
		)
	};
}

type SchemaOrgThingObject = Extract<Thing, object>;

/** WhoIsFor-derived audience list; replaces any existing Schema.org `audience` on the node. */
export type ThingWithSchemaOrgAudience<T extends SchemaOrgThingObject> = Omit<T, 'audience'> & {
	audience?: Array<BusinessAudience | PeopleAudience>;
};

/** Adds Schema.org `audience` to WebPage / SoftwareApplication / CollectionPage nodes. */
export function withSchemaOrgAudience<T extends SchemaOrgThingObject>(
	node: T,
	copy: PublicAudienceSectionCopy,
	pageUrl: string
): ThingWithSchemaOrgAudience<T> {
	const audience = buildSchemaOrgAudienceFromCards(copy.cards, pageUrl);
	if (audience.length === 0) {
		return node as ThingWithSchemaOrgAudience<T>;
	}

	return {
		...node,
		audience
	} as ThingWithSchemaOrgAudience<T>;
}
