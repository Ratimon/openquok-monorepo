import { describe, expect, it } from 'vitest';

import { icons } from '$data/icons';

import {
	COMPARE_HUB_BASE_SLUG,
	getCompareProduct,
	isAlternativesTargetSlug,
	listAlternativeProductsFor
} from '$lib/content/constants/competitors';
import {
	PublicAlternativesPagePresenter,
	resolveHubEntryLowestPrice,
	resolveHubEntryPlatformCount,
	sortAlternativesHubEntries,
	type AlternativesHubEntryViewModel
} from '$lib/area-public/PublicAlternativesPage.presenter.svelte';

describe('PublicAlternativesPagePresenter', () => {
	const presenter = new PublicAlternativesPagePresenter();

	it('focuses hub SEO on competitor alternatives, not the free self-host path', () => {
		const vm = presenter.buildHubVm();

		expect(vm.metaTitle).toBe('Social media scheduler and directory submission alternatives');
		expect(vm.metaTitle.toLowerCase()).not.toMatch(/^free\b/);
		expect(vm.metaDescription.toLowerCase()).toContain('compare');
		expect(vm.metaDescription.toLowerCase()).not.toContain('free and open-source');
		expect(vm.keywords).toContain('social media scheduler alternatives');
		expect(vm.keywords).not.toContain('free social media scheduler');
		expect(vm.heroHighlightText).toBe('alternatives');
		expect(vm.socialSection.entries.length).toBeGreaterThan(0);
		expect(vm.directorySection.entries.length).toBeGreaterThan(0);
		expect(vm.description.toLowerCase()).toContain('alternatives');
		expect(vm.description.toLowerCase()).toContain('pricing');
		expect(vm.heroTitlePrefix).toBe('Find the right ');
	});

	it('pins the OpenQuok hub card first in the social section', () => {
		const vm = presenter.buildHubVm();
		const first = vm.socialSection.entries[0];

		expect(first?.slug).toBe(COMPARE_HUB_BASE_SLUG);
		expect(first?.title).toBe('OpenQuok alternatives');
		expect(first?.href).toContain('/alternatives/openquok');
	});

	it('buildOpenQuokHubEntry matches hub card shape', () => {
		const entry = presenter.buildOpenQuokHubEntry();

		expect(entry.slug).toBe(COMPARE_HUB_BASE_SLUG);
		expect(entry.name).toBe('OpenQuok');
		expect(entry.title).toBe('OpenQuok alternatives');
		expect(entry.href).toContain('/alternatives/openquok');
		expect(entry.priceRangeLabel).toMatch(/\$0/);
		expect(entry.platformSupportLabel).toMatch(/platform/);
	});

	it('hub competitor cards include price range and platform support labels', () => {
		const vm = presenter.buildHubVm();
		const bufferEntry = vm.socialSection.entries.find((entry) => entry.slug === 'buffer');
		expect(bufferEntry?.priceRangeLabel.length).toBeGreaterThan(0);
		expect(bufferEntry?.platformSupportLabel).toMatch(/platform/);

		const boringlaunchEntry = vm.directorySection.entries.find(
			(entry) => entry.slug === 'boringlaunch'
		);
		expect(boringlaunchEntry?.priceRangeLabel).toContain('one-time');
		expect(boringlaunchEntry?.platformSupportLabel).toBe('100+ platforms');
	});

	it('applyHubFilters hides directory cards when category is social', () => {
		const hubVm = presenter.buildHubVm();
		const filtered = presenter.applyHubFilters(hubVm, { category: 'social', sort: 'name_asc' });

		expect(filtered.socialSection.entries.length).toBeGreaterThan(0);
		expect(filtered.directorySection.entries).toHaveLength(0);
	});

	it('applyHubFilters hides social cards when category is directory', () => {
		const hubVm = presenter.buildHubVm();
		const filtered = presenter.applyHubFilters(hubVm, { category: 'directory', sort: 'name_asc' });

		expect(filtered.socialSection.entries).toHaveLength(0);
		expect(filtered.directorySection.entries.length).toBeGreaterThan(0);
	});

	it('applyHubFilters narrows entries by search query', () => {
		const hubVm = presenter.buildHubVm();
		const filtered = presenter.applyHubFilters(hubVm, {
			category: 'all',
			sort: 'name_asc',
			search: 'buffer'
		});

		const socialSlugs = filtered.socialSection.entries.map((entry) => entry.slug);
		expect(socialSlugs).toContain('buffer');
		expect(socialSlugs.every((slug) => slug === 'openquok' || slug === 'buffer')).toBe(true);
		expect(filtered.directorySection.entries).toHaveLength(0);
	});

	it('applyHubFilters sorts peers by lowest price and keeps OpenQuok pinned', () => {
		const hubVm = presenter.buildHubVm();
		const filtered = presenter.applyHubFilters(hubVm, {
			category: 'social',
			sort: 'price_asc'
		});

		const slugs = filtered.socialSection.entries.map((entry) => entry.slug);
		expect(slugs[0]).toBe(COMPARE_HUB_BASE_SLUG);
		expect(slugs.length).toBeGreaterThan(1);

		const peerProducts = slugs.slice(1).map((slug) => getCompareProduct(slug)!);
		const peerPrices = peerProducts.map((product) => resolveHubEntryLowestPrice(product));
		for (let index = 1; index < peerPrices.length; index += 1) {
			const previous = peerPrices[index - 1];
			const current = peerPrices[index];
			if (previous === null || current === null) continue;
			expect(previous).toBeLessThanOrEqual(current);
		}
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

		const peerSlugs = vm!.longForm.otherAlternativePeers.map((peer) => peer.slug);
		expect(peerSlugs.length).toBe(new Set(peerSlugs).size);
	});

	it('builds a Later alternatives directory with OpenQuok ranked first', () => {
		const vm = presenter.buildDetailVm('later');
		expect(vm).not.toBeNull();

		expect(vm!.metaTitle).toBe('Best Later Alternatives');
		expect(vm!.targetName).toBe('Later');
		expect(vm!.listings[0]?.isOpenQuok).toBe(true);
		expect(vm!.listings[0]?.compareHref).toContain('/compare/openquok/later');
	});

	it('highlights OpenQuok open-source positioning in the #1 listing description', () => {
		const vm = presenter.buildDetailVm('hootsuite');
		expect(vm).not.toBeNull();

		const openQuokListing = vm!.listings.find((listing) => listing.isOpenQuok);
		expect(openQuokListing?.detailDescription.toLowerCase()).toContain('open source');
		expect(openQuokListing?.detailDescription).toContain('/self-hosting');
	});

	it('builds long-form nav sections for HeroPost alternatives', () => {
		const vm = presenter.buildDetailVm('heropost');
		expect(vm).not.toBeNull();
		expect(vm!.longForm.whyPeopleLook.id).toBe('why-people-look');
		expect(vm!.isDirectoryTarget).toBe(false);
	});

	it('builds directory long-form for GetMoreBacklinks with category-scoped listings', () => {
		const vm = presenter.buildDetailVm('getmorebacklinks');
		expect(vm).not.toBeNull();
		expect(vm!.isDirectoryTarget).toBe(true);
		expect(vm!.longForm.competitorName).toBe('GetMoreBacklinks');
		expect(vm!.compareRows.length).toBeGreaterThan(0);
		expect(vm!.listings.every((listing) => listing.slug === 'openquok' || listing.slug === 'boringlaunch')).toBe(
			true
		);
	});

	it('builds OpenQuok alternatives detail without listing OpenQuok as a peer', () => {
		expect(isAlternativesTargetSlug('openquok')).toBe(true);

		const alternatives = listAlternativeProductsFor('openquok');
		expect(alternatives.every((product) => product.slug !== 'openquok')).toBe(true);
		expect(alternatives.some((product) => product.slug === 'buffer')).toBe(true);
		expect(alternatives.some((product) => product.slug === 'boringlaunch')).toBe(true);

		const vm = presenter.buildDetailVm('openquok');
		expect(vm).not.toBeNull();
		expect(vm!.isOpenQuokTarget).toBe(true);
		expect(vm!.metaTitle).toBe('Best OpenQuok Alternatives');
		expect(vm!.longForm.whyPeopleLook.title).toBe('Why teams look for OpenQuok alternatives');
		expect(vm!.listings.every((listing) => !listing.isOpenQuok)).toBe(true);
		expect(vm!.listings[0]?.compareHref).toMatch(/\/compare\/(?:openquok\/[^/]+|[^/]+\/openquok)$/);
	});

	it('sorts OpenQuok detail listings when sort query is price_asc', () => {
		const vm = presenter.buildDetailVm('openquok', { sort: 'price_asc' });
		expect(vm).not.toBeNull();
		const slugs = vm!.listings.map((listing) => listing.slug);
		expect(slugs.length).toBeGreaterThan(1);
		expect(new Set(slugs).size).toBe(slugs.length);
	});
});

describe('sortAlternativesHubEntries', () => {
	it('orders by name A–Z', () => {
		const entries: AlternativesHubEntryViewModel[] = [
			{
				slug: 'later',
				name: 'Later',
				icon: icons.Later.name,
				href: '/alternatives/later',
				title: 'Later alternatives',
				description: '',
				priceRangeLabel: '$0/mo',
				platformSupportLabel: '1 platform'
			},
			{
				slug: 'buffer',
				name: 'Buffer',
				icon: icons.Buffer.name,
				href: '/alternatives/buffer',
				title: 'Buffer alternatives',
				description: '',
				priceRangeLabel: '$0/mo',
				platformSupportLabel: '1 platform'
			}
		];

		const sorted = sortAlternativesHubEntries(entries, 'name_asc');
		expect(sorted.map((entry) => entry.slug)).toEqual(['buffer', 'later']);
	});

	it('orders by platform count descending, then name', () => {
		const buffer = getCompareProduct('buffer')!;
		const boringlaunch = getCompareProduct('boringlaunch')!;

		expect(resolveHubEntryPlatformCount(buffer)).toBeGreaterThan(
			resolveHubEntryPlatformCount(boringlaunch)
		);

		const entries: AlternativesHubEntryViewModel[] = [
			{
				slug: 'boringlaunch',
				name: boringlaunch.name,
				icon: boringlaunch.icon,
				href: '/alternatives/boringlaunch',
				title: 'BoringLaunch alternatives',
				description: '',
				priceRangeLabel: '$149 one-time',
				platformSupportLabel: '100+ platforms'
			},
			{
				slug: 'buffer',
				name: buffer.name,
				icon: buffer.icon,
				href: '/alternatives/buffer',
				title: 'Buffer alternatives',
				description: '',
				priceRangeLabel: '$0/mo',
				platformSupportLabel: '1 platform'
			}
		];

		const sorted = sortAlternativesHubEntries(entries, 'platforms_desc');
		expect(sorted.map((entry) => entry.slug)).toEqual(['buffer', 'boringlaunch']);
	});
});
