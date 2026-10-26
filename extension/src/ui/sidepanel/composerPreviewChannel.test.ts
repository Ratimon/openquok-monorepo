import { describe, expect, it } from 'vitest';

import type { SocialIntegrationChannel } from '../../social/openquokSocialApi.js';
import {
	composerPreviewLayout,
	composerPreviewMaxCharacters,
	resolveComposerPreviewChannel,
} from './composerPreviewChannel.js';

function channel(partial: Partial<SocialIntegrationChannel> & { id: string }): SocialIntegrationChannel {
	return {
		name: 'Test',
		identifier: 'threads',
		picture: null,
		group: null,
		disabled: false,
		inBetweenSteps: false,
		refreshNeeded: false,
		unschedulableReason: null,
		...partial,
	};
}

describe('composerPreviewChannel', () => {
	it('uses single selected schedulable channel for preview focus', () => {
		const a = channel({ id: 'a', identifier: 'x' });
		const b = channel({ id: 'b', identifier: 'threads' });
		expect(resolveComposerPreviewChannel([a, b], new Set(['a']))).toEqual(a);
		expect(resolveComposerPreviewChannel([a, b], new Set(['a', 'b']))).toBeNull();
	});

	it('picks layout and character cap from focused channel', () => {
		const x = channel({ id: 'a', identifier: 'x' });
		expect(composerPreviewLayout(x, 1)).toBe('x');
		expect(composerPreviewMaxCharacters(x, 1)).toBe(280);
		expect(composerPreviewLayout(x, 2)).toBe('global');
		expect(composerPreviewMaxCharacters(x, 2)).toBe(10_000);
	});
});
