import type { ExtensionConfigDerivationBySlug } from '../../extensionConfigDerivation.js';

export const STARTUPINSPIRE_SITE_KEY = 'startupinspire' as const;

export const STARTUPINSPIRE_EXTENSION_CONFIG_DERIVATIONS = {
	'startupinspire-free-listing': {
		kind: 'pricing-queue',
		baseProviderSlug: 'startupinspire-paid-listing',
		startUrlPathSuffix: '/dashboard',
	},
} satisfies ExtensionConfigDerivationBySlug;