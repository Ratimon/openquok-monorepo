import type { ExtensionConfigDerivationBySlug } from '../../extensionConfigDerivation.js';

export const NICK_LAUNCHES_SITE_KEY = 'nick-launches' as const;

/**
 * Free and paid share the submit form (separate fixtures, different status copy).
 * Maker profile is a different form.
 */
export const NICK_LAUNCHES_EXTENSION_CONFIG_DERIVATIONS = {
	'nick-launches-free-launch': { kind: 'independent' },
	'nick-launches-paid-launch': { kind: 'independent' },
	'nick-launches-maker-profile': { kind: 'independent' },
} satisfies ExtensionConfigDerivationBySlug;

export const NICK_LAUNCHES_INDEPENDENT_FIXTURE_PROVIDER_SLUGS = [
	'nick-launches-free-launch',
	'nick-launches-paid-launch',
	'nick-launches-maker-profile',
] as const satisfies readonly (keyof typeof NICK_LAUNCHES_EXTENSION_CONFIG_DERIVATIONS)[];
