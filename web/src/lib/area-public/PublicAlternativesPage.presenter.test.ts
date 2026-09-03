import { describe, expect, it } from 'vitest';

import { PublicAlternativesPagePresenter } from '$lib/area-public/PublicAlternativesPage.presenter.svelte';

describe('PublicAlternativesPagePresenter', () => {
	const presenter = new PublicAlternativesPagePresenter();

	it('focuses hub SEO on competitor alternatives, not the free self-host path', () => {
		const vm = presenter.buildHubVm();

		expect(vm.metaTitle).toBe('Social Media Scheduler Alternatives');
		expect(vm.metaTitle.toLowerCase()).not.toMatch(/^free\b/);
		expect(vm.metaDescription.toLowerCase()).toContain('compare');
		expect(vm.metaDescription.toLowerCase()).not.toContain('free and open-source');
		expect(vm.keywords).toContain('social media scheduler alternatives');
		expect(vm.keywords).not.toContain('free social media scheduler');
		expect(vm.title.toLowerCase()).toContain('alternatives');
		expect(vm.description).toContain('/self-hosting');
	});

	it('includes open-source positioning in detail SEO copy for Hootsuite', () => {
		const vm = presenter.buildDetailVm('hootsuite');
		expect(vm).not.toBeNull();

		expect(vm!.metaTitle).toBe('Best Hootsuite Alternatives');
		expect(vm!.metaDescription.toLowerCase()).toContain('open-source');
		expect(vm!.metaDescription.toLowerCase()).toContain('$0 software fee');
		expect(vm!.keywords).toContain('Hootsuite alternatives');
		expect(vm!.keywords).not.toContain('free Hootsuite alternative');
		expect(vm!.description.toLowerCase()).toContain('alternatives');
	});

	it('highlights OpenQuok open-source positioning in the #1 listing description', () => {
		const vm = presenter.buildDetailVm('hootsuite');
		expect(vm).not.toBeNull();

		const openQuokListing = vm!.listings.find((listing) => listing.isOpenQuok);
		expect(openQuokListing?.detailDescription.toLowerCase()).toContain('open source');
		expect(openQuokListing?.detailDescription).toContain('/self-hosting');
	});
});
