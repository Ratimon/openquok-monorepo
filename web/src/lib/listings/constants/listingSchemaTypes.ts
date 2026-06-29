import type {
	CreativeWork,
	Organization,
	Person,
	SoftwareApplication,
	Thing
} from 'schema-dts';

/** schema.org types used as listing `schema_type` (JSON-LD mainEntity). */
export const LISTING_SCHEMA_TYPES = [
	'SoftwareApplication',
	'CreativeWork',
	'Organization',
	'Person',
	'Thing'
] as const;

export type ListingSchemaType = (typeof LISTING_SCHEMA_TYPES)[number];

export const DEFAULT_LISTING_SCHEMA_TYPE: ListingSchemaType = 'SoftwareApplication';

export const DEFAULT_STACK_SCHEMA_TYPE: ListingSchemaType = 'Thing';

export type ListingSchemaEntityType =
	| Thing
	| SoftwareApplication
	| CreativeWork
	| Organization
	| Person;

/**
 * Default schema.org type per extension hub category slug.
 * Extensions are modeled as installable software; creative tools as CreativeWork.
 */
export const EXTENSION_CATEGORY_SCHEMA_TYPE: Record<string, ListingSchemaType> = {
	'creative-media': 'CreativeWork',
	'analytics-metrics': 'SoftwareApplication',
	'research-trends': 'SoftwareApplication',
	'developer-releases': 'SoftwareApplication',
	'productivity-ops': 'SoftwareApplication',
	'social-publishing': 'SoftwareApplication'
};

export function getSchemaTypeForExtensionCategory(
	categorySlug: string | null | undefined
): ListingSchemaType {
	if (!categorySlug) return DEFAULT_LISTING_SCHEMA_TYPE;
	return EXTENSION_CATEGORY_SCHEMA_TYPE[categorySlug] ?? DEFAULT_LISTING_SCHEMA_TYPE;
}

export function getDefaultSchemaTypeForListingKind(
	listingKind: 'extension' | 'stack'
): ListingSchemaType {
	return listingKind === 'extension' ? DEFAULT_LISTING_SCHEMA_TYPE : DEFAULT_STACK_SCHEMA_TYPE;
}

export const LISTING_SCHEMA_TYPE_LABELS: Record<ListingSchemaType, string> = {
	SoftwareApplication: 'Software application (skills, MCP, CLI tools)',
	CreativeWork: 'Creative work (media, assets, content tools)',
	Organization: 'Organization',
	Person: 'Person',
	Thing: 'Generic thing (fallback)'
};
