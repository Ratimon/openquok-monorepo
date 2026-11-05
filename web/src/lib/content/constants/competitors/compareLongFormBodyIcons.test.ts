import { describe, expect, it } from 'vitest';

import { icons } from '$data/icons';

import { resolveCompareLongFormBodyIcon } from '$lib/content/constants/competitors/compareLongFormBodyIcons';

describe('resolveCompareLongFormBodyIcon', () => {
	it('maps why-people-look paragraphs to distinct icons', () => {
		expect(resolveCompareLongFormBodyIcon('why-people-look', 0)).toBe(icons.Target.name);
		expect(resolveCompareLongFormBodyIcon('why-people-look', 1)).toBe(icons.Sparkles.name);
		expect(resolveCompareLongFormBodyIcon('why-people-look', 2)).toBe(icons.ListOrdered.name);
	});

	it('maps your-options and when-they-win rows', () => {
		expect(resolveCompareLongFormBodyIcon('your-options', 0)).toBe(icons.Columns2.name);
		expect(resolveCompareLongFormBodyIcon('your-options', 1)).toBe(icons.DollarSign.name);
		expect(resolveCompareLongFormBodyIcon('when-they-win', 0)).toBe(icons.Users.name);
		expect(resolveCompareLongFormBodyIcon('when-they-win', 2)).toBe(icons.HourGlass.name);
	});

	it('clamps extra paragraphs to the last icon in the set', () => {
		expect(resolveCompareLongFormBodyIcon('why-people-look', 9)).toBe(icons.ListOrdered.name);
	});

	it('falls back for unknown section ids', () => {
		expect(resolveCompareLongFormBodyIcon('unknown-section', 0)).toBe(icons.CircleCheck.name);
	});
});
