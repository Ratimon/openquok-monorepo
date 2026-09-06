import { describe, expect, it } from 'vitest';

import {
	integrationSupportsFollowUpComments,
	listThreadFollowUpSupportedIntegrationIds,
	syncThreadFollowUpRepliesAcrossSelectedChannels
} from '$lib/posts/utils/create-post/followUp';

describe('integrationSupportsFollowUpComments', () => {
	it('allows Facebook feed posts', () => {
		expect(
			integrationSupportsFollowUpComments('facebook', {
				facebook: { postType: 'post' }
			})
		).toBe(true);
	});

	it('disallows Facebook Stories', () => {
		expect(
			integrationSupportsFollowUpComments('facebook', {
				facebook: { postType: 'story' }
			})
		).toBe(false);
		expect(integrationSupportsFollowUpComments('facebook', { post_type: 'story' })).toBe(false);
	});
});

describe('listThreadFollowUpSupportedIntegrationIds', () => {
	const channels = [
		{ id: 'fb-1', identifier: 'facebook', name: 'Page', picture: null }
	];

	it('excludes Facebook when post type is story', () => {
		expect(
			listThreadFollowUpSupportedIntegrationIds({
				mode: 'global',
				contentSetAuthoringActive: false,
				focusedIntegrationId: null,
				selectedIds: ['fb-1'],
				baseSocialChannelsVm: channels,
				providerSettingsByIntegrationId: {
					'fb-1': { facebook: { postType: 'story' } }
				}
			})
		).toEqual([]);
	});

	it('includes Facebook when post type is feed', () => {
		expect(
			listThreadFollowUpSupportedIntegrationIds({
				mode: 'global',
				contentSetAuthoringActive: false,
				focusedIntegrationId: null,
				selectedIds: ['fb-1'],
				baseSocialChannelsVm: channels,
				providerSettingsByIntegrationId: {
					'fb-1': { facebook: { postType: 'post' } }
				}
			})
		).toEqual(['fb-1']);
	});
});

describe('syncThreadFollowUpRepliesAcrossSelectedChannels', () => {
	const channels = [
		{ id: 'fb-1', identifier: 'facebook', name: 'Page', picture: null },
		{ id: 'ig-1', identifier: 'instagram-business', name: 'IG', picture: null }
	];
	const replies = [{ id: 'r1', message: 'Follow-up comment', delaySeconds: 0 }];

	it('copies Facebook replies to Instagram when IG is added later', () => {
		const providerSettings = {
			'fb-1': { facebook: { postType: 'post', replies } },
			'ig-1': { instagram: {} }
		};
		const synced = syncThreadFollowUpRepliesAcrossSelectedChannels({
			mode: 'global',
			contentSetAuthoringActive: false,
			selectedIds: ['fb-1', 'ig-1'],
			baseSocialChannelsVm: channels,
			providerSettingsByIntegrationId: providerSettings
		});
		expect(synced['ig-1']?.instagram).toEqual({ replies });
	});

	it('no-ops in custom mode', () => {
		const providerSettings = {
			'fb-1': { facebook: { postType: 'post', replies } },
			'ig-1': { instagram: {} }
		};
		const synced = syncThreadFollowUpRepliesAcrossSelectedChannels({
			mode: 'custom',
			contentSetAuthoringActive: false,
			selectedIds: ['fb-1', 'ig-1'],
			baseSocialChannelsVm: channels,
			providerSettingsByIntegrationId: providerSettings
		});
		expect(synced).toEqual(providerSettings);
	});
});
