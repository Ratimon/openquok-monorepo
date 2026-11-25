import type { ExtensionConfigDerivationBySlug } from '../../extensionConfigDerivation.js';

export const ALTERNATIVETO_SITE_KEY = 'alternativeto' as const;

/** Four independent fixtures (shared manage-item form + user profile). */
export const ALTERNATIVETO_EXTENSION_CONFIG_DERIVATIONS = {
	'alternativeto-free-listing': { kind: 'independent' },
	'alternativeto-priority-review': { kind: 'independent' },
	'alternativeto-finish-listing': { kind: 'independent' },
	'alternativeto-user-profile': { kind: 'independent' },
} satisfies ExtensionConfigDerivationBySlug;

export const ALTERNATIVETO_INDEPENDENT_FIXTURE_PROVIDER_SLUGS = [
	'alternativeto-free-listing',
	'alternativeto-priority-review',
	'alternativeto-finish-listing',
	'alternativeto-user-profile',
] as const satisfies readonly (keyof typeof ALTERNATIVETO_EXTENSION_CONFIG_DERIVATIONS)[];