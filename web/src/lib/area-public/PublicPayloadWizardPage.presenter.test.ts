import { describe, expect, it } from 'vitest';

import { PublicPayloadWizardPagePresenter } from '$lib/area-public/PublicPayloadWizardPage.presenter.svelte';
import { PUBLIC_PAYLOAD_WIZARD_GENERIC_CONFIG } from '$lib/posts/constants/publicPayloadWizardChannelConfig';
import {
	buildPayloadWizardChannelHeroTitle,
	buildPayloadWizardChannelMetaTitle,
	buildPayloadWizardGenericHeroTitle
} from '$lib/content/utils/buildProgrammaticSeoTitles';

describe('PublicPayloadWizardPagePresenter', () => {
	it('returns generic Payload Wizard SEO for the public tool page', () => {
		const presenter = new PublicPayloadWizardPagePresenter();
		const vm = presenter.loadPayloadWizardVm();
		expect(vm.metaTitle).toBe(PUBLIC_PAYLOAD_WIZARD_GENERIC_CONFIG.metaTitle);
		expect(vm.heroTitle).toBe(PUBLIC_PAYLOAD_WIZARD_GENERIC_CONFIG.heroTitle);
		expect(vm.heroTitle).toBe(buildPayloadWizardGenericHeroTitle());
		expect(vm.heroTitle).not.toBe(vm.metaTitle);
		expect(vm.composerMode).toBe('global');
		expect(vm.channelSlug).toBeNull();
		expect(vm.formatExamples).toEqual([]);
	});

	it('returns channel SEO and format examples when a platform slug is set', () => {
		const presenter = new PublicPayloadWizardPagePresenter();
		const vm = presenter.loadPayloadWizardVm({ channelSlug: 'linkedin' });
		expect(vm.metaTitle).toBe(buildPayloadWizardChannelMetaTitle('LinkedIn'));
		expect(vm.heroTitle).toBe(buildPayloadWizardChannelHeroTitle('LinkedIn'));
		expect(vm.composerMode).toBe('custom');
		expect(vm.channelSlug).toBe('linkedin');
		expect(vm.channelLabel).toBe('LinkedIn');
		expect(vm.focusedProviderIdentifier).toBe('linkedin');
		expect(vm.formatExamples.length).toBeGreaterThan(0);
	});

	it('falls back to generic SEO when the slug is missing from the catalog', () => {
		const presenter = new PublicPayloadWizardPagePresenter();
		const vm = presenter.loadPayloadWizardVm({ channelSlug: 'not-a-platform' });
		expect(vm.metaTitle).toBe(PUBLIC_PAYLOAD_WIZARD_GENERIC_CONFIG.metaTitle);
		expect(vm.composerMode).toBe('global');
		expect(vm.channelSlug).toBeNull();
	});
});
