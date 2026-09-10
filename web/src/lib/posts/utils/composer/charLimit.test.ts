import { describe, expect, it } from 'vitest';

import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
import {
	computeSoftCharLimitAcrossSelected,
	maxCharactersForChannel,
	selectedIdsIncludeXChannel,
	validateScheduledCaptionsForChannels
} from '$lib/posts/utils/composer/charLimit';
import {
	X_STANDARD_MAX_CHARACTERS,
	X_VERIFIED_MAX_CHARACTERS
} from '$lib/posts/utils/composer/xWeightedLength';

function channel(
	overrides: Partial<CreateSocialPostChannelViewModel> & Pick<CreateSocialPostChannelViewModel, 'id'>
): CreateSocialPostChannelViewModel {
	return {
		name: overrides.name ?? overrides.id,
		identifier: overrides.identifier ?? 'threads',
		type: 'social',
		additionalSettings: null,
		editor: 'normal',
		...overrides
	} as CreateSocialPostChannelViewModel;
}

describe('maxCharactersForChannel', () => {
	it('returns X standard limit by default', () => {
		expect(maxCharactersForChannel(channel({ id: 'x-1', identifier: 'x' }))).toBe(
			X_STANDARD_MAX_CHARACTERS
		);
	});

	it('returns X verified limit when additional settings mark the account verified', () => {
		expect(
			maxCharactersForChannel(
				channel({
					id: 'x-1',
					identifier: 'x',
					additionalSettings: JSON.stringify([{ title: 'Verified', value: true }])
				})
			)
		).toBe(X_VERIFIED_MAX_CHARACTERS);
	});

	it('returns provider maximumCharacters for non-X channels', () => {
		expect(maxCharactersForChannel(channel({ id: 'li-1', identifier: 'linkedin' }))).toBe(3000);
	});
});

describe('computeSoftCharLimitAcrossSelected', () => {
	const channels = [
		channel({ id: 'x-1', identifier: 'x' }),
		channel({ id: 'li-1', identifier: 'linkedin' }),
		channel({ id: 'th-1', identifier: 'threads' })
	];

	it('returns the minimum limit across selected channels', () => {
		expect(
			computeSoftCharLimitAcrossSelected({
				selectedIds: ['x-1', 'li-1'],
				baseSocialChannelsVm: channels
			})
		).toBe(X_STANDARD_MAX_CHARACTERS);
	});

	it('falls back to the default provider limit when nothing is selected', () => {
		expect(
			computeSoftCharLimitAcrossSelected({
				selectedIds: [],
				baseSocialChannelsVm: channels
			})
		).toBe(500);
	});
});

describe('selectedIdsIncludeXChannel', () => {
	const channels = [
		channel({ id: 'x-1', identifier: 'x' }),
		channel({ id: 'li-1', identifier: 'linkedin' })
	];

	it('is true when an X channel is selected', () => {
		expect(selectedIdsIncludeXChannel(['li-1', 'x-1'], channels)).toBe(true);
	});

	it('is false when X is not selected', () => {
		expect(selectedIdsIncludeXChannel(['li-1'], channels)).toBe(false);
	});
});

describe('validateScheduledCaptionsForChannels', () => {
	const channels = [
		channel({ id: 'th-1', identifier: 'threads', name: 'Threads' }),
		channel({ id: 'li-1', identifier: 'linkedin', name: 'LinkedIn' })
	];

	it('returns null when every custom-mode body is within its channel cap', () => {
		expect(
			validateScheduledCaptionsForChannels({
				mode: 'custom',
				selectedIds: ['th-1', 'li-1'],
				baseSocialChannelsVm: channels,
				globalBody: 'shared',
				bodiesByIntegrationId: {
					'th-1': 'a'.repeat(500),
					'li-1': 'b'.repeat(3000)
				}
			})
		).toBeNull();
	});

	it('rejects a non-focused channel body that exceeds its cap in custom mode', () => {
		const error = validateScheduledCaptionsForChannels({
			mode: 'custom',
			selectedIds: ['th-1', 'li-1'],
			baseSocialChannelsVm: channels,
			globalBody: 'short',
			bodiesByIntegrationId: {
				'th-1': 'ok',
				'li-1': 'b'.repeat(3001)
			}
		});
		expect(error).toBe('LinkedIn caption exceeds 3000 characters (3001/3000).');
	});

	it('falls back to globalBody for channels without a custom override', () => {
		const error = validateScheduledCaptionsForChannels({
			mode: 'custom',
			selectedIds: ['th-1', 'li-1'],
			baseSocialChannelsVm: channels,
			globalBody: 'a'.repeat(501),
			bodiesByIntegrationId: {
				'li-1': 'fine'
			}
		});
		expect(error).toBe('Threads caption exceeds 500 characters (501/500).');
	});

	it('validates global mode against each selected channel limit', () => {
		const error = validateScheduledCaptionsForChannels({
			mode: 'global',
			selectedIds: ['th-1'],
			baseSocialChannelsVm: channels,
			globalBody: 'a'.repeat(501),
			bodiesByIntegrationId: {}
		});
		expect(error).toBe('Threads caption exceeds 500 characters (501/500).');
	});
});
