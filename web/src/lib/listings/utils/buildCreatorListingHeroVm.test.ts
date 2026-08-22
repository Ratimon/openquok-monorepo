import { describe, expect, it } from 'vitest';

import {
	buildBuildingBlockCreatorListingHeroVm,
	buildCreatorListingHeroTitleSegments,
	buildPlaybookCreatorListingHeroVm
} from '$lib/listings/utils/buildCreatorListingHeroVm';

describe('buildCreatorListingHeroTitleSegments', () => {
	it('underlines listing title and stickers OpenQuok + approve', () => {
		expect(buildCreatorListingHeroTitleSegments('building-block', 'OpenQuok TikTok Slideshow')).toEqual([
			{ text: 'Use ', style: 'plain' },
			{ text: 'OpenQuok TikTok Slideshow', style: 'underline' },
			{ text: ' with ', style: 'plain' },
			{ text: 'OpenQuok', style: 'sticker' },
			{ text: ' then you ', style: 'plain' },
			{ text: 'approve', style: 'sticker' }
		]);
	});

	it('uses Run verb for playbooks', () => {
		const segments = buildCreatorListingHeroTitleSegments('playbook', 'Viral TikTok Carousel');
		expect(segments[0]).toEqual({ text: 'Run ', style: 'plain' });
		expect(segments[1]).toEqual({ text: 'Viral TikTok Carousel', style: 'underline' });
		expect(segments[3]).toEqual({ text: 'OpenQuok', style: 'sticker' });
	});
});

describe('buildBuildingBlockCreatorListingHeroVm', () => {
	it('uses bridge-only description and primary CTA without secondary docs button', () => {
		const vm = buildBuildingBlockCreatorListingHeroVm({
			title: 'CapCut CLI',
			extensionType: 'skills',
			installCommandSkills: 'npx skills add https://github.com/example/capcut-cli --skill capcut-edit -y'
		});

		expect(vm.eyebrow).toBe('OpenQuok');
		expect(vm.ctaText).toBe('Get Started For Free');
		expect(vm.ctaHref).toBe('/pricing');
		expect(vm.docsCtaText).toBeUndefined();
		expect(vm.docsCtaHref).toBeUndefined();
		expect(vm.installCommand).toContain('capcut-edit');
		expect(vm.description).toBe(
			'Install this building block on your agent, then draft and schedule in OpenQuok — you approve before anything goes live.'
		);
	});
});

describe('buildPlaybookCreatorListingHeroVm', () => {
	it('uses bridge-only description without secondary CTA', () => {
		const vm = buildPlaybookCreatorListingHeroVm({
			title: 'Viral TikTok Carousel'
		});

		expect(vm.eyebrow).toBe('OpenQuok');
		expect(vm.docsCtaText).toBeUndefined();
		expect(vm.docsCtaHref).toBeUndefined();
		expect(vm.installCommand).toBeUndefined();
		expect(vm.description).toBe(
			'Install the building blocks, then draft and schedule in OpenQuok — you approve before anything goes live.'
		);
	});
});
