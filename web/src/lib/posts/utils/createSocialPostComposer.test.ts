import { describe, expect, it } from 'vitest';

import { clearPerChannelBodies, clearPerChannelMedia } from '$lib/posts/utils/createSocialPostComposer';
import { buildPostUpsertPayload } from '$lib/posts/utils/createSocialPostPayload';

const basePayloadInput = {
	workspaceId: 'org-1',
	globalBody: 'Shared caption',
	bodiesByIntegrationId: { 'int-a': 'Custom A', 'int-b': 'Custom B' },
	focusedIntegrationId: 'int-a',
	editorBody: 'Custom A',
	providerSettingsByIntegrationId: {},
	globalMediaItems: [{ id: 'm1', path: 'uploads/shared.jpg' }],
	mediaByIntegrationId: {
		'int-a': [{ id: 'm2', path: 'uploads/a.jpg' }],
		'int-b': [{ id: 'm3', path: 'uploads/b.jpg' }]
	},
	postMediaItems: [{ id: 'm2', path: 'uploads/a.jpg' }],
	selectedIds: ['int-a', 'int-b'],
	scheduledLocal: '2026-08-26T12:00',
	repeatInterval: null,
	selectedTagNames: [],
	status: 'draft' as const
};

describe('clearPerChannelBodies', () => {
	it('returns an empty map so re-entering custom mode does not reload stale overrides', () => {
		expect(clearPerChannelBodies()).toEqual({});
	});
});

describe('clearPerChannelMedia', () => {
	it('returns an empty map so re-entering custom mode does not reload stale overrides', () => {
		expect(clearPerChannelMedia()).toEqual({});
	});
});

describe('back to global caption semantics', () => {
	it('clears in-memory overrides after back to global', () => {
		const staleOverrides = { 'int-a': 'Custom A', 'int-b': 'Custom B' };
		const bodiesAfterBackToGlobal = clearPerChannelBodies();

		expect(staleOverrides).toEqual({ 'int-a': 'Custom A', 'int-b': 'Custom B' });
		expect(bodiesAfterBackToGlobal).toEqual({});
		expect(Object.keys(bodiesAfterBackToGlobal)).toHaveLength(0);
	});

	it('global save payload excludes bodiesByIntegrationId even when overrides remain in memory', () => {
		const payload = buildPostUpsertPayload({
			...basePayloadInput,
			mode: 'global'
		});

		expect(payload.body).toBe('Shared caption');
		expect(payload.isGlobal).toBe(true);
		expect(payload).not.toHaveProperty('bodiesByIntegrationId');
	});
});

describe('back to global media semantics', () => {
	it('clears in-memory media overrides after back to global', () => {
		const staleOverrides = {
			'int-a': [{ id: 'm2', path: 'uploads/a.jpg' }]
		};
		const mediaAfterBackToGlobal = clearPerChannelMedia();

		expect(staleOverrides).toEqual({ 'int-a': [{ id: 'm2', path: 'uploads/a.jpg' }] });
		expect(mediaAfterBackToGlobal).toEqual({});
	});

	it('global save payload excludes mediaByIntegrationId even when overrides remain in memory', () => {
		const payload = buildPostUpsertPayload({
			...basePayloadInput,
			mode: 'global'
		});

		expect(payload.media).toEqual([{ id: 'm1', path: 'uploads/shared.jpg' }]);
		expect(payload.isGlobal).toBe(true);
		expect(payload).not.toHaveProperty('mediaByIntegrationId');
	});

	it('custom save payload includes mediaByIntegrationId and shared global media', () => {
		const payload = buildPostUpsertPayload({
			...basePayloadInput,
			mode: 'custom'
		});

		expect(payload.media).toEqual([{ id: 'm1', path: 'uploads/shared.jpg' }]);
		expect(payload.mediaByIntegrationId).toEqual({
			'int-a': [{ id: 'm2', path: 'uploads/a.jpg' }],
			'int-b': [{ id: 'm3', path: 'uploads/b.jpg' }]
		});
		expect(payload.isGlobal).toBe(false);
	});
});
