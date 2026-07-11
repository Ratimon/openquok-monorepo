import type { ContactPoint, Organization } from 'schema-dts';

import { resolveSocialSameAsUrls } from '$lib/config/constants/config';

export type CreateOrganizationSEOSchemaParams = {
	/** Organization display name. */
	name: string;
	/** Primary website URL. */
	url: string;
	/** Site origin used for a stable `@id` (`{origin}/#organization`). */
	origin: string;
	/** Optional explicit `sameAs` URLs (defaults to marketing `SOCIAL_LINKS_*`). */
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
 * Prefer emitting this on the homepage and About page — not sitewide on every layout.
 */
export function createOrganizationSEOSchema(
	params: CreateOrganizationSEOSchemaParams
): Organization {
	const {
		name,
		url,
		origin,
		sameAs: sameAsOverride,
		email,
		logo,
		contactPoint
	} = params;

	const sameAs = sameAsOverride ?? resolveSocialSameAsUrls();

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
