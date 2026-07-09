import { describe, expect, it } from 'vitest';

import {
	migrateIntegrationProviderSettingsOnLoad,
	migrateProviderSettingsByIntegrationIdOnLoad,
	THREADS_CROSS_ACCOUNT_COMMENT_PLUG_NAME
} from '$lib/posts/utils/createSocialPostProviderSettings';

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
					delayMs: 0,
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
					delayMs: 0,
					integrationIds: ['b-id'],
					fields: { comment: '' }
				}
			]
		});
		expect(result['b-id']).toEqual({ threads: { replies: [] } });
	});
});
