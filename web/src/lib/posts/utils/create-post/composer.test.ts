import { describe, expect, it } from 'vitest';

import {
	clearPerChannelBodies,
	clearPerChannelMedia,
	resolveComposerMediaForValidation,
	resolvePayloadPreviewValidationIntegrationIds
} from '$lib/posts/utils/create-post/composer';
import {
	buildPostUpsertPayload,
	buildProgrammaticCreatePostPayloadPreview
} from '$lib/posts/utils/create-post/payload';

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

describe('resolvePayloadPreviewValidationIntegrationIds', () => {
	it('validates only the focused channel in custom mode', () => {
		expect(
			resolvePayloadPreviewValidationIntegrationIds({
				mode: 'custom',
				focusedIntegrationId: 'int-facebook',
				selectedIds: ['int-facebook', 'int-tiktok']
			})
		).toEqual(['int-facebook']);
	});

	it('validates all selected channels in global mode', () => {
		expect(
			resolvePayloadPreviewValidationIntegrationIds({
				mode: 'global',
				focusedIntegrationId: null,
				selectedIds: ['int-x', 'int-facebook']
			})
		).toEqual(['int-x', 'int-facebook']);
	});
});

describe('resolveComposerMediaForValidation', () => {
	it('uses live editor media in global mode before persist', () => {
		const resolved = resolveComposerMediaForValidation({
			mode: 'global',
			focusedIntegrationId: null,
			globalMediaItems: [],
			mediaByIntegrationId: {},
			postMediaItems: [{ id: 'm1', path: 'uploads/live.png' }]
		});

		expect(resolved.globalMediaItems).toEqual([{ id: 'm1', path: 'uploads/live.png' }]);
	});

	it('uses live editor media for the focused channel in custom mode before persist', () => {
		const resolved = resolveComposerMediaForValidation({
			mode: 'custom',
			focusedIntegrationId: 'int-a',
			globalMediaItems: [],
			mediaByIntegrationId: {},
			postMediaItems: [{ id: 'm2', path: 'uploads/tiktok.png' }]
		});

		expect(resolved.mediaByIntegrationId).toEqual({
			'int-a': [{ id: 'm2', path: 'uploads/tiktok.png' }]
		});
	});
});

describe('buildProgrammaticCreatePostPayloadPreview media validation', () => {
	const tiktokChannel = {
		id: 'int-tiktok',
		internalId: 'int-tiktok-internal',
		name: 'blue.breath',
		identifier: 'tiktok',
		picture: null,
		type: 'social',
		disabled: false,
		inBetweenSteps: false,
		refreshNeeded: false,
		schedulable: true,
		unschedulableReason: null,
		group: null,
		postingTimes: [{ time: 540 }],
		editor: 'normal' as const
	};

	it('accepts live custom-mode editor media for the focused TikTok channel', () => {
		const result = buildProgrammaticCreatePostPayloadPreview(
			{
				workspaceId: 'org-1',
				mode: 'custom',
				globalBody: '',
				bodiesByIntegrationId: {},
				focusedIntegrationId: 'int-tiktok',
				editorBody: '<p>Caption</p>',
				providerSettingsByIntegrationId: {},
				globalMediaItems: [],
				mediaByIntegrationId: {},
				postMediaItems: [{ id: 'm1', path: 'uploads/photo.png' }],
				selectedIds: ['int-tiktok'],
				scheduledLocal: '2026-08-26T12:00',
				repeatInterval: null,
				selectedTagNames: [],
				status: 'scheduled',
				scheduleValidationIntegrationIds: ['int-tiktok'],
				baseSocialChannelsVm: [tiktokChannel],
				minimumCharacters: 0,
				softCharLimit: 2200
			},
			'scheduled'
		);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.payload.mediaByIntegrationId?.['int-tiktok']).toEqual([
			{ id: 'm1', path: 'uploads/photo.png' }
		]);
	});
});
