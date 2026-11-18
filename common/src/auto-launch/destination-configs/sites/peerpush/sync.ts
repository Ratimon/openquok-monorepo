import type { ExtensionConfigDerivationBySlug } from '../../extensionConfigDerivation.js';

export const PEERPUSH_SITE_KEY = 'peerpush' as const;

export const PEERPUSH_EXTENSION_CONFIG_DERIVATIONS = {
	'peerpush-free-queue': { kind: 'pricing-queue', baseProviderSlug: 'peerpush-standard-launch' },
} satisfies ExtensionConfigDerivationBySlug;