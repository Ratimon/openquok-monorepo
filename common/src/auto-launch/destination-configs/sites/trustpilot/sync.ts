import type { ExtensionConfigDerivationBySlug } from '../../extensionConfigDerivation.js';

export const TRUSTPILOT_SITE_KEY = 'trustpilot' as const;

export const TRUSTPILOT_EXTENSION_CONFIG_DERIVATIONS = {
	'trustpilot-company-profile': { kind: 'independent' },
} satisfies ExtensionConfigDerivationBySlug;

export const TRUSTPILOT_INDEPENDENT_FIXTURE_PROVIDER_SLUGS = [
	'trustpilot-company-profile',
] as const satisfies readonly (keyof typeof TRUSTPILOT_EXTENSION_CONFIG_DERIVATIONS)[];