import type { AutoLaunchExtensionConfig } from '../../browser-extension/pageAssist.js';

/** How a provider slug’s extension fixture relates to another shipped slug. */
export type ExtensionConfigDerivation =
	| { kind: 'pricing-queue'; baseProviderSlug: string; /** Defaults to `pricing`. */ readyUrlHint?: string }
	| { kind: 'independent' };

export type ExtensionConfigDerivationBySlug = Record<string, ExtensionConfigDerivation>;

export function isPricingQueueDerivation(
	entry: ExtensionConfigDerivation
): entry is { kind: 'pricing-queue'; baseProviderSlug: string } {
	return entry.kind === 'pricing-queue';
}

export type PricingQueueVariantMeta = {
	baseProviderSlug: string;
	readyUrlHint: string;
};

export function pricingQueueDerivations(
	derivations: ExtensionConfigDerivationBySlug
): Record<string, PricingQueueVariantMeta> {
	const out: Record<string, PricingQueueVariantMeta> = {};
	for (const [slug, entry] of Object.entries(derivations)) {
		if (isPricingQueueDerivation(entry)) {
			out[slug] = {
				baseProviderSlug: entry.baseProviderSlug,
				readyUrlHint: entry.readyUrlHint ?? 'pricing',
			};
		}
	}
	return out;
}

/** Sync scripts: pricing-queue variants must spread base + derived `readyUrlHint`. */
export function validatePricingQueueExtensionFixtures(
	fixtures: Record<string, AutoLaunchExtensionConfig>,
	pricingDerived: Record<string, PricingQueueVariantMeta>
): void {
	for (const [slug, meta] of Object.entries(pricingDerived)) {
		const variant = fixtures[slug];
		const base = fixtures[meta.baseProviderSlug];
		if (!variant || !base) {
			throw new Error(
				`pricing-queue variant ${slug} missing fixture or base ${meta.baseProviderSlug}`
			);
		}
		if (variant.readyUrlHint !== meta.readyUrlHint) {
			throw new Error(
				`${slug} readyUrlHint must be '${meta.readyUrlHint}' (pricing-queue from ${meta.baseProviderSlug})`
			);
		}
		const coreFixture = (config: AutoLaunchExtensionConfig) => {
			const { readyUrlHint: _ready, readyStatusHint: _status, ...rest } = config;
			return rest;
		};
		if (JSON.stringify(coreFixture(base)) !== JSON.stringify(coreFixture(variant))) {
			throw new Error(
				`${slug} must match ${meta.baseProviderSlug} except readyUrlHint / readyStatusHint`
			);
		}
	}
}

/** Independent slugs ship full fixtures and must not be pricing-queue derivatives. */
export function validateIndependentExtensionFixtureSlugs(
	fixtures: Record<string, AutoLaunchExtensionConfig>,
	independentSlugs: readonly string[],
	derivations: ExtensionConfigDerivationBySlug
): void {
	for (const slug of independentSlugs) {
		if (!fixtures[slug]) {
			throw new Error(`independent provider ${slug} missing DIRECTORY_EXTENSION_CONFIG_FIXTURES entry`);
		}
		const entry = derivations[slug];
		if (entry?.kind === 'pricing-queue') {
			throw new Error(`independent provider ${slug} must not be a pricing-queue derivative`);
		}
	}
}

export function mergeExtensionConfigDerivations(
	...parts: readonly ExtensionConfigDerivationBySlug[]
): ExtensionConfigDerivationBySlug {
	return Object.assign({}, ...parts);
}