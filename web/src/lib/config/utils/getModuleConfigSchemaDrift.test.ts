import { describe, expect, it } from 'vitest';

import { getModuleConfigSchemaDrift } from '$lib/config/utils/getModuleConfigSchemaDrift';

const miniSchema = {
	FEATURE_1_TITLE: {
		description: 't',
		type: 'string',
		default: 'One',
		inputType: 'input' as const
	},
	FEATURE_8_TITLE: {
		description: 't',
		type: 'string',
		default: 'Eight',
		inputType: 'input' as const
	},
	LANDING_PAGE_CONFIG_REVISION: {
		description: 'rev',
		type: 'string',
		default: '2026-09-09-feature8',
		inputType: 'input' as const
	}
};

describe('getModuleConfigSchemaDrift', () => {
	it('reports in sync when stored config matches schema and revision', () => {
		const drift = getModuleConfigSchemaDrift(
			miniSchema,
			{
				FEATURE_1_TITLE: 'One',
				FEATURE_8_TITLE: 'Eight',
				LANDING_PAGE_CONFIG_REVISION: '2026-09-09-feature8'
			},
			{
				revisionConfigKey: 'LANDING_PAGE_CONFIG_REVISION',
				codeRevision: '2026-09-09-feature8'
			}
		);

		expect(drift.isOutOfSync).toBe(false);
		expect(drift.missingKeys).toEqual([]);
		expect(drift.revisionMismatch).toBe(false);
	});

	it('flags missing schema keys and revision mismatch', () => {
		const drift = getModuleConfigSchemaDrift(
			miniSchema,
			{
				FEATURE_1_TITLE: 'One',
				LANDING_PAGE_CONFIG_REVISION: '2026-01-01'
			},
			{
				revisionConfigKey: 'LANDING_PAGE_CONFIG_REVISION',
				codeRevision: '2026-09-09-feature8'
			}
		);

		expect(drift.missingKeys).toEqual(['FEATURE_8_TITLE']);
		expect(drift.revisionMismatch).toBe(true);
		expect(drift.isOutOfSync).toBe(true);
	});

	it('flags obsolete keys stored outside the schema', () => {
		const drift = getModuleConfigSchemaDrift(
			miniSchema,
			{
				FEATURE_1_TITLE: 'One',
				FEATURE_8_TITLE: 'Eight',
				LANDING_PAGE_CONFIG_REVISION: '2026-09-09-feature8',
				OLD_FEATURE_7_TITLE: 'stale'
			},
			{
				revisionConfigKey: 'LANDING_PAGE_CONFIG_REVISION',
				codeRevision: '2026-09-09-feature8'
			}
		);

		expect(drift.obsoleteKeys).toEqual(['OLD_FEATURE_7_TITLE']);
		expect(drift.isOutOfSync).toBe(true);
	});
});
