import { describe, expect, it } from 'vitest';

import type { SocialIntegrationChannel } from './openquokSocialApi.js';
import {
	integrationIdsForGroup,
	isAllSchedulableSelected,
	listChannelGroups,
	schedulableComposerChannelIds,
} from './socialChannelSelection.js';

function channel(partial: Partial<SocialIntegrationChannel> & Pick<SocialIntegrationChannel, 'id'>): SocialIntegrationChannel {
	return {
		id: partial.id,
		name: partial.name ?? partial.id,
		identifier: partial.identifier ?? 'threads',
		picture: null,
		group: partial.group ?? null,
		disabled: partial.disabled ?? false,
		inBetweenSteps: partial.inBetweenSteps ?? false,
		refreshNeeded: partial.refreshNeeded ?? false,
		unschedulableReason: partial.unschedulableReason ?? null,
	};
}

describe('socialChannelSelection', () => {
	it('lists unique groups and selects schedulable ids', () => {
		const channels = [
			channel({ id: 'a', group: { id: 'g1', name: 'Client A' } }),
			channel({ id: 'b', group: { id: 'g1', name: 'Client A' } }),
			channel({ id: 'c', group: { id: 'g2', name: 'Client B' } }),
			channel({ id: 'd', refreshNeeded: true, unschedulableReason: 'Reconnect' }),
		];
		expect(listChannelGroups(channels).map((g) => g.id)).toEqual(['g1', 'g2']);
		expect(schedulableComposerChannelIds(channels)).toEqual(['a', 'b', 'c']);
		expect(integrationIdsForGroup(channels, 'g1')).toEqual(['a', 'b']);
		expect(isAllSchedulableSelected(channels, new Set(['a', 'b', 'c']))).toBe(true);
		expect(isAllSchedulableSelected(channels, new Set(['a']))).toBe(false);
	});
});
