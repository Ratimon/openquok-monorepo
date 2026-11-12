import { describe, expect, it } from 'vitest';

import { getRootPathPublicComparePair } from '$lib/area-public/constants/getRootPathPublicCompare';
import { PublicComparePagePresenter } from '$lib/area-public/PublicComparePage.presenter.svelte';
import { getComparePair } from '$lib/content/constants/competitors';
import { publicFaqHref } from '$lib/content/utils/publicFaqLinks';
import { route, url } from '$lib/utils/path';

describe('PublicComparePagePresenter — directory compare smoke', () => {
	const presenter = new PublicComparePagePresenter();

	it('exposes BoringLaunch in the directory hub section with a compare pair href', () => {
		const vm = presenter.buildHubVm('openquok');
		const directorySlugs = vm.directorySection.pairs.map((pair) => pair.slug);
		const directoryHrefs = vm.directorySection.pairs.map((pair) => pair.href);

		expect(directorySlugs).toContain('boringlaunch');
		expect(directorySlugs).toContain('launchrepo');
		expect(directorySlugs).toContain('submitator');
		expect(vm.socialSection.pairs.map((pair) => pair.slug)).not.toContain('boringlaunch');
		expect(vm.socialSection.title).toBe('OpenQuok vs other social schedulers');
		expect(vm.directorySection.title).toBe('OpenQuok vs other submission services');
		expect(vm.heroHighlightText).toBe('the rest');
		expect(vm.baseProductName).toBe('OpenQuok');

		const expectedPath = route(getRootPathPublicComparePair('openquok', 'boringlaunch'));
		expect(directoryHrefs.some((href) => href === url(expectedPath))).toBe(true);
	});

	it('builds a directory long-form detail VM for OpenQuok vs BoringLaunch', () => {
		const pair = getComparePair('openquok', 'boringlaunch');
		expect(pair).not.toBeNull();

		const vm = presenter.buildDetailVm(pair!);
		expect(vm).not.toBeNull();
		expect(vm!.layout).toBe('directory_long_form');
		expect(vm!.longForm?.competitorSlug).toBe('boringlaunch');
		expect(vm!.longForm?.directorySubmissionToolPath).toContain('directory-submission-tool');
		expect(vm!.channelsSection).not.toBeNull();
		expect(vm!.directoryCoverageSection?.launchPlatforms.map((p) => p.label)).toEqual([
			'PeerPush',
			'Uneed'
		]);
		expect(vm!.directoryCoverageSection?.competitorSummary).toContain('50');
		expect(vm!.faqItems.length).toBeGreaterThan(3);
		expect(vm!.faqItems.some((item) => item.title.includes('Domain Rating'))).toBe(true);
	});

	it('prepends Postiz blog FAQ on OpenQuok vs Postiz compare detail', () => {
		const pair = getComparePair('openquok', 'postiz');
		expect(pair).not.toBeNull();

		const vm = presenter.buildDetailVm(pair!);
		expect(vm!.faqItems[0]?.description).toContain(publicFaqHref.blogOpenquokVsPostiz);
	});

	it('builds expanded social compare FAQs for OpenQuok vs Hootsuite', () => {
		const pair = getComparePair('openquok', 'hootsuite');
		expect(pair).not.toBeNull();

		const vm = presenter.buildDetailVm(pair!);
		expect(vm!.faqItems.length).toBeGreaterThanOrEqual(8);
		expect(vm!.faqItems.some((item) => item.id === 'openquok-social-media-management')).toBe(
			true
		);
	});

	it('does not build a detail VM for cross-category Buffer vs BoringLaunch', () => {
		expect(getComparePair('buffer', 'boringlaunch')).toBeNull();
	});
});
