import { describe, expect, it } from 'vitest';

import { resolveSchedulePostComposerBentoId } from './resolveSchedulePostComposerBentoId';

describe('resolveSchedulePostComposerBentoId', () => {
	it('maps catalog channel slugs to post-editor bentos', () => {
		expect(resolveSchedulePostComposerBentoId('facebook')).toBe('facebook-post-editor');
		expect(resolveSchedulePostComposerBentoId('threads')).toBe('threads-post-editor');
		expect(resolveSchedulePostComposerBentoId('x')).toBe('x-post-editor');
	});

	it('maps integration identifiers to the same composer bentos', () => {
		expect(resolveSchedulePostComposerBentoId('instagram-business')).toBe('instagram-post-editor');
		expect(resolveSchedulePostComposerBentoId('instagram-standalone')).toBe('instagram-post-editor');
		expect(resolveSchedulePostComposerBentoId('linkedin-page')).toBe('linkedin-post-editor');
	});

	it('uses bluesky-threads when there is no bluesky-post-editor bento', () => {
		expect(resolveSchedulePostComposerBentoId('bluesky')).toBe('bluesky-threads');
	});

	it('returns undefined for empty or unknown slugs', () => {
		expect(resolveSchedulePostComposerBentoId(null)).toBeUndefined();
		expect(resolveSchedulePostComposerBentoId('')).toBeUndefined();
		expect(resolveSchedulePostComposerBentoId('not-a-channel')).toBeUndefined();
	});
});
