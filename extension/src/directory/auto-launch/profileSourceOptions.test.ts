import { describe, expect, it } from 'vitest';

import { buildDirectoryProfileSourceOptions } from './profileSourceOptions.js';

describe('buildDirectoryProfileSourceOptions', () => {
	it('returns main and variant options for a product family', () => {
		const { options, activeId } = buildDirectoryProfileSourceOptions(
			[
				{ id: 'main-1', name: 'OpenQuok', profileKind: 'main' },
				{
					id: 'var-peerpush',
					name: 'OpenQuok (peerpush)',
					profileKind: 'directory_variant',
					parentProfileId: 'main-1',
					directorySiteKey: 'peerpush',
					similarityToMainPercent: 97,
				},
			],
			'var-peerpush'
		);
		expect(options).toHaveLength(2);
		expect(activeId).toBe('var-peerpush');
		expect(options[0]?.kind).toBe('main');
		expect(options[1]?.label).toContain('97% match');
	});

	it('returns empty options when only one profile exists', () => {
		const { options } = buildDirectoryProfileSourceOptions(
			[{ id: 'main-1', name: 'OpenQuok', profileKind: 'main' }],
			'main-1'
		);
		expect(options).toHaveLength(0);
	});
});
