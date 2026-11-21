import type { ExtensionConfigDerivationBySlug } from '../../extensionConfigDerivation.js';

export const FAZIER_SITE_KEY = 'fazier' as const;

/** Company page and product listing tiers share the submit form but use separate destination rows. */
export const FAZIER_EXTENSION_CONFIG_DERIVATIONS = {
	'fazier-page': { kind: 'independent' },
	'fazier-free-product-listing': { kind: 'independent' },
	'fazier-paid-product-listing': { kind: 'independent' },
} satisfies ExtensionConfigDerivationBySlug;

export const FAZIER_INDEPENDENT_FIXTURE_PROVIDER_SLUGS = [
	'fazier-page',
	'fazier-free-product-listing',
	'fazier-paid-product-listing',
] as const satisfies readonly (keyof typeof FAZIER_EXTENSION_CONFIG_DERIVATIONS)[];