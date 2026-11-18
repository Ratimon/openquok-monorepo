import type { ExtensionConfigDerivationBySlug } from '../../extensionConfigDerivation.js';

export const TINYLAUNCH_SITE_KEY = 'tinylaunch' as const;

export const TINYLAUNCH_EXTENSION_CONFIG_DERIVATIONS = {
	'tinylaunch-standard-launch': { kind: 'pricing-queue', baseProviderSlug: 'tinylaunch-premium-launch' },
} satisfies ExtensionConfigDerivationBySlug;