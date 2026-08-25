import { describe, expect, it } from 'vitest';

import {
	CHANNEL_DELETE_HAS_POSTS_MESSAGE,
	userFacingChannelDeleteError
} from '$lib/integrations/utils/userFacingChannelDeleteError';

describe('userFacingChannelDeleteError', () => {
	it('maps HTTP 409 to delete-or-disable copy', () => {
		expect(userFacingChannelDeleteError('Conflict', 409)).toBe(CHANNEL_DELETE_HAS_POSTS_MESSAGE);
	});

	it('maps the backend has-posts message without a status', () => {
		expect(
			userFacingChannelDeleteError(
				'You have to delete all the posts associated with this channel before deleting it'
			)
		).toBe(CHANNEL_DELETE_HAS_POSTS_MESSAGE);
	});

	it('leaves unrelated errors unchanged', () => {
		expect(userFacingChannelDeleteError('Could not remove this channel.')).toBe(
			'Could not remove this channel.'
		);
		expect(userFacingChannelDeleteError('Could not remove this channel.', 500)).toBe(
			'Could not remove this channel.'
		);
	});
});
