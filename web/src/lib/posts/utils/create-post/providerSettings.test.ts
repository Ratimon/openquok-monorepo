import { describe, expect, it } from 'vitest';

import {
	activeCrossAccountPlugs,
	buildCrossAccountPlugsProviderPatch,
	migrateIntegrationProviderSettingsOnLoad,
	migrateProviderSettingsByIntegrationIdOnLoad,
	THREADS_CROSS_ACCOUNT_COMMENT_PLUG_NAME,
	type CrossAccountPlugState
} from '$lib/posts/utils/create-post/providerSettings';

describe('buildCrossAccountPlugsProviderPatch', () => {
	it('persists enabled plugs with acting channels', () => {
		const plugs: CrossAccountPlugState[] = [
			{
				plugName: 'linkedin-add-comment',
				enabled: true,
				delayMs: 0,
				integrationIds: ['page-id'],
				fields: { comment: 'Huge milestone for us.' }
			},
			{
				plugName: 'linkedin-repost-post-users',
				enabled: false,
				delayMs: 0,
				integrationIds: ['page-id'],
				fields: {}
			}
		];

		expect(buildCrossAccountPlugsProviderPatch('linkedin', plugs)).toEqual({
			linkedin: {
				crossAccountPlugs: [plugs[0]]
			}
		});
		expect(activeCrossAccountPlugs(plugs)).toEqual([plugs[0]]);
	});

	it('returns an empty linkedin bucket when no plugs are active', () => {
		expect(buildCrossAccountPlugsProviderPatch('linkedin', [])).toEqual({ linkedin: {} });
	});
});

describe('migrateIntegrationProviderSettingsOnLoad', () => {
	it('converts enabled legacy multiAccountEngagementPlug with integration ids', () => {
		const result = migrateIntegrationProviderSettingsOnLoad({
			threads: {
				multiAccountEngagementPlug: {
					enabled: true,
					integrationIds: ['b-id', 'c-id']
				},
				internalEngagementPlug: { enabled: true, message: 'wrap' }
			}
		});

		expect(result.threads).toEqual({
			internalEngagementPlug: { enabled: true, message: 'wrap' },
			crossAccountPlugs: [
				{
					plugName: THREADS_CROSS_ACCOUNT_COMMENT_PLUG_NAME,
					enabled: true,
					delayMs: 120000,
					integrationIds: ['b-id', 'c-id'],
					fields: { comment: '' }
				}
			]
		});
		expect((result.threads as Record<string, unknown>).multiAccountEngagementPlug).toBeUndefined();
	});

	it('drops legacy key when disabled or missing integration ids', () => {
		expect(
			migrateIntegrationProviderSettingsOnLoad({
				threads: { multiAccountEngagementPlug: { enabled: false, integrationIds: ['b-id'] } }
			}).threads
		).toEqual({});

		expect(
			migrateIntegrationProviderSettingsOnLoad({
				threads: { multiAccountEngagementPlug: { enabled: true, integrationIds: [] } }
			}).threads
		).toEqual({});
	});

	it('does not duplicate when crossAccountPlugs already has the plug', () => {
		const existing = {
			plugName: THREADS_CROSS_ACCOUNT_COMMENT_PLUG_NAME,
			enabled: true,
			delayMs: 3600000,
			integrationIds: ['b-id'],
			fields: { comment: 'Hi' }
		};
		const result = migrateIntegrationProviderSettingsOnLoad({
			threads: {
				multiAccountEngagementPlug: { enabled: true, integrationIds: ['c-id'] },
				crossAccountPlugs: [existing]
			}
		});

		expect(result.threads).toEqual({ crossAccountPlugs: [existing] });
	});

	it('normalizes zero delay on existing threads cross-account plugs', () => {
		const result = migrateIntegrationProviderSettingsOnLoad({
			threads: {
				crossAccountPlugs: [
					{
						plugName: THREADS_CROSS_ACCOUNT_COMMENT_PLUG_NAME,
						enabled: true,
						delayMs: 0,
						integrationIds: ['b-id'],
						fields: { comment: 'Hi' }
					}
				]
			}
		});

		expect(
			(result.threads as { crossAccountPlugs: Array<{ delayMs: number }> }).crossAccountPlugs[0]
				?.delayMs
		).toBe(120000);
	});

	it('leaves unrelated provider buckets unchanged', () => {
		const result = migrateIntegrationProviderSettingsOnLoad({
			linkedin: { crossAccountPlugs: [] },
			x: { enabled: true }
		});
		expect(result).toEqual({
			linkedin: { crossAccountPlugs: [] },
			x: { enabled: true }
		});
	});
});

describe('migrateProviderSettingsByIntegrationIdOnLoad', () => {
	it('migrates every integration entry', () => {
		const result = migrateProviderSettingsByIntegrationIdOnLoad({
			'a-id': {
				threads: {
					multiAccountEngagementPlug: { enabled: true, integrationIds: ['b-id'] }
				}
			},
			'b-id': { threads: { replies: [] } }
		});

		expect(result['a-id']?.threads).toEqual({
			crossAccountPlugs: [
				{
					plugName: THREADS_CROSS_ACCOUNT_COMMENT_PLUG_NAME,
					enabled: true,
					delayMs: 120000,
					integrationIds: ['b-id'],
					fields: { comment: '' }
				}
			]
		});
		expect(result['b-id']).toEqual({ threads: { replies: [] } });
	});
});
