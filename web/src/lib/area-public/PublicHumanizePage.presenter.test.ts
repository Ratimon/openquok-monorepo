import { describe, expect, it } from 'vitest';

import { PublicHumanizePagePresenter } from '$lib/area-public/PublicHumanizePage.presenter.svelte';
import { PUBLIC_HUMANIZE_GENERIC_CONFIG } from '$lib/ai-humanize/constants/publicHumanizeChannelConfig';
import { buildHumanizeChannelMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';

describe('PublicHumanizePagePresenter', () => {
	it('returns generic Humanizer SEO for the public tool page', () => {
		const presenter = new PublicHumanizePagePresenter();
		const vm = presenter.loadHumanizeVm();
		expect(vm.metaTitle).toBe(PUBLIC_HUMANIZE_GENERIC_CONFIG.metaTitle);
		expect(vm.metaDescription).toBe(PUBLIC_HUMANIZE_GENERIC_CONFIG.metaDescription);
		expect(vm.composerMode).toBe('global');
		expect(vm.channelSlug).toBeNull();
		expect(vm.focusedProviderIdentifier).toBeNull();
	});

	it('returns channel SEO when a coming-soon catalog slug is set', () => {
		const presenter = new PublicHumanizePagePresenter();
		const vm = presenter.loadHumanizeVm({ channelSlug: 'facebook' });
		expect(vm.metaTitle).toBe(buildHumanizeChannelMetaTitle('Facebook'));
		expect(vm.metaDescription).toContain('Facebook');
		expect(vm.composerMode).toBe('custom');
		expect(vm.channelSlug).toBe('facebook');
		expect(vm.channelLabel).toBe('Facebook');
		expect(vm.focusedProviderIdentifier).toBe('facebook');
	});

	it('returns channel SEO when a live slug is set', () => {
		const presenter = new PublicHumanizePagePresenter();
		const vm = presenter.loadHumanizeVm({ channelSlug: 'linkedin' });
		expect(vm.metaTitle).toBe(buildHumanizeChannelMetaTitle('LinkedIn'));
		expect(vm.metaDescription).toContain('LinkedIn');
		expect(vm.composerMode).toBe('custom');
		expect(vm.channelSlug).toBe('linkedin');
		expect(vm.channelLabel).toBe('LinkedIn');
		expect(vm.focusedProviderIdentifier).toBe('linkedin');
	});

	it('falls back to generic SEO when the slug is missing from the catalog', () => {
		const presenter = new PublicHumanizePagePresenter();
		const vm = presenter.loadHumanizeVm({ channelSlug: 'not-a-channel' });
		expect(vm.metaTitle).toBe(PUBLIC_HUMANIZE_GENERIC_CONFIG.metaTitle);
		expect(vm.composerMode).toBe('global');
		expect(vm.channelSlug).toBeNull();
		expect(vm.focusedProviderIdentifier).toBeNull();
	});
});
