import type { ContactPoint, Organization, WithContext } from 'schema-dts';

import { resolveSocialSameAsUrls } from '$lib/ui/social/socialLinks';

export type CreateOrganizationSEOSchemaParams = {
	/** Organization display name. */
	name: string;
	/** Primary website URL. */
	url: string;
	/** Site origin used for a stable `@id` (`{origin}/#organization`). */
	origin: string;
	/** Marketing config map used to resolve social profile URLs for `sameAs`. */
	marketingInformationVm?: Record<string, string>;
	/** Optional explicit `sameAs` URLs (skips marketing resolution when provided). */
	sameAs?: string[];
	/** Support / contact email (plain address, not mailto). */
	email?: string;
	/** Logo image URL. */
	logo?: string;
	/** Optional customer-support contact point. */
	contactPoint?: ContactPoint[];
};

/** Stable Organization `@id` for cross-page entity linking. */
export function organizationSchemaId(origin: string): string {
	return `${origin.replace(/\/$/, '')}/#organization`;
}

/**
 * JSON-LD `Organization` with social profiles via `sameAs` (Knowledge Panel / brand entity).
 * @see https://schema.org/Organization
 * @see https://schema.org/sameAs
 */
export function createOrganizationSEOSchema(
	params: CreateOrganizationSEOSchemaParams
): Organization {
	const {
		name,
		url,
		origin,
		marketingInformationVm = {},
		sameAs: sameAsOverride,
		email,
		logo,
		contactPoint
	} = params;

	const sameAs = sameAsOverride ?? resolveSocialSameAsUrls(marketingInformationVm);

	const organization = {
		'@type': 'Organization' as const,
		'@id': organizationSchemaId(origin),
		name,
		url,
		...(sameAs.length > 0 ? { sameAs } : {}),
		...(email ? { email } : {}),
		...(logo ? { logo } : {}),
		...(contactPoint && contactPoint.length > 0 ? { contactPoint } : {})
	};

	return organization as Organization;
}

/**
 * Full JSON-LD document for sitewide Organization markup (e.g. root layout).
 */
export function createOrganizationSchemaData(
	params: CreateOrganizationSEOSchemaParams
): WithContext<Organization> {
	return {
		'@context': 'https://schema.org',
		...(createOrganizationSEOSchema(params) as object)
	} as WithContext<Organization>;
}
