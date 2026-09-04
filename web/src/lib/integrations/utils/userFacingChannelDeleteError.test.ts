import { describe, expect, it } from 'vitest';

import { userFacingChannelDeleteError } from '$lib/integrations/utils/userFacingChannelDeleteError';

describe('userFacingChannelDeleteError', () => {
	it('returns the backend message unchanged', () => {
		expect(userFacingChannelDeleteError('Could not remove this channel.')).toBe(
			'Could not remove this channel.'
		);
		expect(userFacingChannelDeleteError('Could not remove this channel.', 500)).toBe(
			'Could not remove this channel.'
		);
		expect(userFacingChannelDeleteError('Conflict', 409)).toBe('Conflict');
	});
});
