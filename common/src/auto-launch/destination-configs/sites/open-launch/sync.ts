import type { ExtensionConfigDerivationBySlug } from '../../extensionConfigDerivation.js';

export const OPEN_LAUNCH_SITE_KEY = 'open-launch' as const;

export const OPEN_LAUNCH_EXTENSION_CONFIG_DERIVATIONS = {
	'open-launch-free-launch': { kind: 'pricing-queue', baseProviderSlug: 'open-launch-premium-launch' },
} satisfies ExtensionConfigDerivationBySlug;