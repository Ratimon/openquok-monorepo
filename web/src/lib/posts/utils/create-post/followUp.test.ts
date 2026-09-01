import { describe, expect, it } from 'vitest';

import {
	integrationSupportsFollowUpComments,
	listThreadFollowUpSupportedIntegrationIds
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
