import type { ExtensionConfigDerivationBySlug } from '../../extensionConfigDerivation.js';

export const UNEED_SITE_KEY = 'uneed' as const;

/** Uneed listing uses your-tools for free and paid; maker profile is a separate form — full fixtures in config. */
export const UNEED_EXTENSION_CONFIG_DERIVATIONS = {
	'uneed-join-line': { kind: 'independent' },
	'uneed-paid-launch': { kind: 'independent' },
	'uneed-maker-profile': { kind: 'independent' },
} satisfies ExtensionConfigDerivationBySlug;

export const UNEED_INDEPENDENT_FIXTURE_PROVIDER_SLUGS = [
	'uneed-join-line',
	'uneed-paid-launch',
	'uneed-maker-profile',
] as const satisfies readonly (keyof typeof UNEED_EXTENSION_CONFIG_DERIVATIONS)[];