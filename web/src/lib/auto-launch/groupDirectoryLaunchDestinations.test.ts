import { describe, expect, it } from 'vitest';

import type { AutoLaunchDestinationDto } from '$lib/auto-launch/auto-launch.types';

import { buildDirectoryLaunchPickerItems } from './groupDirectoryLaunchDestinations';

function dest(
	partial: Partial<AutoLaunchDestinationDto> & Pick<AutoLaunchDestinationDto, 'providerSlug' | 'name'>
): AutoLaunchDestinationDto {
	return {
		id: partial.id ?? crypto.randomUUID(),
		providerSlug: partial.providerSlug,
		name: partial.name,
		shortDescription: partial.shortDescription ?? null,
		submissionPath: 'extension',
		startUrl: 'https://uneed.best/pricing',
		sortOrder: partial.sortOrder ?? 0,
		opportunityDescription: null,
		opportunityTitle: null,
		opportunityDofollow: partial.opportunityDofollow ?? null,
		opportunityCostTier: partial.opportunityCostTier ?? null,
		opportunityCostNote: partial.opportunityCostNote ?? null,
		pickerGroupKey: partial.pickerGroupKey ?? null,
		pickerGroupTitle: partial.pickerGroupTitle ?? null,
		siteDomainRating: 42,
		siteTitle: 'Uneed',
		extensionConfig: partial.extensionConfig ?? { steps: [] }
	};
}

describe('buildDirectoryLaunchPickerItems', () => {
	it('groups destinations that share pickerGroupKey', () => {
		const items = buildDirectoryLaunchPickerItems([
			dest({
				providerSlug: 'uneed-join-line',
				name: 'Join the line',
				sortOrder: 10,
				pickerGroupKey: 'uneed-product-listing',
				pickerGroupTitle: 'Product listing'
			}),
			dest({
				providerSlug: 'uneed-paid-launch',
				name: 'Paid launch',
				sortOrder: 20,
				pickerGroupKey: 'uneed-product-listing',
				pickerGroupTitle: 'Product listing'
			}),
			dest({ providerSlug: 'uneed-maker-profile', name: 'Maker profile', sortOrder: 30 })
		]);
		const groups = items.filter((i) => i.kind === 'group');
		const singles = items.filter((i) => i.kind === 'single');
		expect(groups).toHaveLength(1);
		expect(groups[0].kind === 'group' && groups[0].group.variants).toHaveLength(2);
		expect(singles).toHaveLength(1);
		expect(singles[0].kind === 'single' && singles[0].destination.providerSlug).toBe(
			'uneed-maker-profile'
		);
	});
});
