import { describe, expect, it } from 'vitest';

import {
	formatEnglishOrdinal,
	formatOpportunityIndexTitle,
	formatSubStepTitle
} from './formatBuildBacklinksGuideDisplayTitle';

describe('formatBuildBacklinksGuideDisplayTitle', () => {
	it('formats English ordinals', () => {
		expect(formatEnglishOrdinal(1)).toBe('1st');
		expect(formatEnglishOrdinal(2)).toBe('2nd');
		expect(formatEnglishOrdinal(3)).toBe('3rd');
		expect(formatEnglishOrdinal(11)).toBe('11th');
		expect(formatEnglishOrdinal(21)).toBe('21st');
	});

	it('formats opportunity and step UI titles', () => {
		expect(formatOpportunityIndexTitle(1)).toBe('1st Backlink Opportunity');
		expect(formatSubStepTitle(2)).toBe('2nd Step');
	});
});
