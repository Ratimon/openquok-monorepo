import type {
	LinkDirectoryEffort,
	LinkDirectoryOpportunityDto
} from '$lib/link-directory/link-directory.types';

const EFFORT_RANK: Record<LinkDirectoryEffort, number> = { easy: 0, medium: 1, hard: 2 };

export function formatLinkDirectoryEffortLabel(effort: LinkDirectoryEffort): string {
	return effort.charAt(0).toUpperCase() + effort.slice(1);
}

function publishedEfforts(opportunities: LinkDirectoryOpportunityDto[] | undefined): LinkDirectoryEffort[] {
	return (opportunities ?? []).filter((opportunity) => opportunity.isAdminPublished).map((o) => o.effort);
}

/** Lowest effort among published playbooks (FAQ “quickest path”). */
export function summarizeEasiestPublishedEffort(
	opportunities: LinkDirectoryOpportunityDto[] | undefined
): LinkDirectoryEffort | null {
	const efforts = publishedEfforts(opportunities);
	if (efforts.length === 0) return null;
	return efforts.reduce((best, effort) =>
		EFFORT_RANK[effort] < EFFORT_RANK[best] ? effort : best
	);
}

/** Site guide sidebar: single tier or “Easy – Hard” when playbooks differ. */
export function formatBuildBacklinksSiteEffortSidebarValue(
	opportunities: LinkDirectoryOpportunityDto[] | undefined
): string | null {
	const efforts = publishedEfforts(opportunities);
	if (efforts.length === 0) return null;

	const min = efforts.reduce((best, effort) =>
		EFFORT_RANK[effort] < EFFORT_RANK[best] ? effort : best
	);
	const max = efforts.reduce((best, effort) =>
		EFFORT_RANK[effort] > EFFORT_RANK[best] ? effort : best
	);

	if (min === max) return formatLinkDirectoryEffortLabel(min);
	return `${formatLinkDirectoryEffortLabel(min)} – ${formatLinkDirectoryEffortLabel(max)}`;
}

export function buildBacklinksSiteEffortSidebarMetricLabel(
	opportunities: LinkDirectoryOpportunityDto[] | undefined
): string {
	const efforts = publishedEfforts(opportunities);
	if (efforts.length <= 1) return 'Effort';
	const min = efforts.reduce((best, effort) =>
		EFFORT_RANK[effort] < EFFORT_RANK[best] ? effort : best
	);
	const max = efforts.reduce((best, effort) =>
		EFFORT_RANK[effort] > EFFORT_RANK[best] ? effort : best
	);
	return min === max ? 'Effort' : 'Effort range';
}
