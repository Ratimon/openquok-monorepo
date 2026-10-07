import { describe, expect, it } from 'vitest';

import type { LinkDirectoryOpportunityDto } from '$lib/link-directory/link-directory.types';
import {
	buildBacklinksSiteEffortSidebarMetricLabel,
	formatBuildBacklinksSiteEffortSidebarValue,
	summarizeEasiestPublishedEffort
} from '$lib/link-directory/utils/formatBuildBacklinksSiteEffortSummary';

function opp(effort: LinkDirectoryOpportunityDto['effort']): LinkDirectoryOpportunityDto {
	return {
		id: '1',
		siteId: 's',
		slug: 'x',
		title: 'T',
		effort,
		isAdminPublished: true,
		sortOrder: 10
	} as LinkDirectoryOpportunityDto;
}

describe('formatBuildBacklinksSiteEffortSidebarValue', () => {
	it('returns null when no published opportunities', () => {
		expect(formatBuildBacklinksSiteEffortSidebarValue([])).toBeNull();
	});

	it('returns single label when all efforts match', () => {
		expect(formatBuildBacklinksSiteEffortSidebarValue([opp('hard'), opp('hard')])).toBe('Hard');
	});

	it('returns range when efforts differ (Reddit-style mix)', () => {
		expect(
			formatBuildBacklinksSiteEffortSidebarValue([opp('hard'), opp('easy'), opp('hard')])
		).toBe('Easy – Hard');
	});
});

describe('buildBuildBacklinksSiteEffortSidebarMetricLabel', () => {
	it('uses Effort range when tiers differ', () => {
		expect(buildBacklinksSiteEffortSidebarMetricLabel([opp('easy'), opp('hard')])).toBe(
			'Effort range'
		);
	});

	it('uses Effort when uniform', () => {
		expect(buildBacklinksSiteEffortSidebarMetricLabel([opp('medium')])).toBe('Effort');
	});
});

describe('summarizeEasiestPublishedEffort', () => {
	it('picks easy for FAQ quickest path', () => {
		expect(summarizeEasiestPublishedEffort([opp('hard'), opp('easy')])).toBe('easy');
	});
});
