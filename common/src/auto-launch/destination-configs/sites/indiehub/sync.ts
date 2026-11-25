import type { ExtensionConfigDerivationBySlug } from '../../extensionConfigDerivation.js';

export const INDIEHUB_SITE_KEY = 'indiehub' as const;

/** Basic and Pro share the Details form; fixtures differ only in status copy (plan on step 2). */
export const INDIEHUB_EXTENSION_CONFIG_DERIVATIONS = {
	'indiehub-basic-launch': { kind: 'independent' },
	'indiehub-pro-launch': { kind: 'independent' },
} satisfies ExtensionConfigDerivationBySlug;

export const INDIEHUB_INDEPENDENT_FIXTURE_PROVIDER_SLUGS = [
	'indiehub-basic-launch',
	'indiehub-pro-launch',
] as const satisfies readonly (keyof typeof INDIEHUB_EXTENSION_CONFIG_DERIVATIONS)[];