import { describe, expect, it } from 'vitest';

import { PublicAlternativesPagePresenter } from '$lib/area-public/PublicAlternativesPage.presenter.svelte';

describe('PublicAlternativesPagePresenter', () => {
	const presenter = new PublicAlternativesPagePresenter();

	it('includes free and open-source terms in hub SEO copy', () => {
		const vm = presenter.buildHubVm();

		expect(vm.metaTitle.toLowerCase()).toContain('free');
		expect(vm.metaTitle.toLowerCase()).toContain('open-source');
		expect(vm.metaDescription.toLowerCase()).toContain('open source');
		expect(vm.metaDescription.toLowerCase()).toContain('self-host');
		expect(vm.keywords).toContain('free social media scheduler');
		expect(vm.keywords).toContain('open source social media scheduler');
	});

	it('includes free and open-source terms in detail SEO copy for Hootsuite', () => {
		const vm = presenter.buildDetailVm('hootsuite');
		expect(vm).not.toBeNull();

		expect(vm!.metaTitle).toBe('Best Free & Open-Source Hootsuite Alternatives');
		expect(vm!.metaDescription.toLowerCase()).toContain('free and open-source');
		expect(vm!.metaDescription.toLowerCase()).toContain('self-host');
		expect(vm!.keywords).toContain('free Hootsuite alternative');
		expect(vm!.keywords).toContain('open source Hootsuite alternative');
		expect(vm!.description.toLowerCase()).toContain('free and open-source');
	});

	it('highlights OpenQuok open-source positioning in the #1 listing description', () => {
		const vm = presenter.buildDetailVm('hootsuite');
		expect(vm).not.toBeNull();

		const openQuokListing = vm!.listings.find((listing) => listing.isOpenQuok);
		expect(openQuokListing?.detailDescription.toLowerCase()).toContain('open source');
		expect(openQuokListing?.detailDescription.toLowerCase()).toContain('self-host');
	});
});
