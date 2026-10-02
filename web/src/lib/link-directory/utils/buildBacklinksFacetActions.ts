import type {
	BuildBacklinksHubFilters,
	LinkDirectoryApprovalMode,
	LinkDirectoryCostTier,
	LinkDirectoryDofollow,
	LinkDirectoryEffort
} from '$lib/link-directory/link-directory.types';

export type BuildBacklinksFacetClick =
	| { kind: 'category'; slug: string }
	| { kind: 'siteTag'; slug: string }
	| { kind: 'costTier'; value: LinkDirectoryCostTier }
	| { kind: 'dofollow'; value: LinkDirectoryDofollow }
	| { kind: 'effort'; value: LinkDirectoryEffort }
	| { kind: 'approvalMode'; value: LinkDirectoryApprovalMode }
	| { kind: 'opportunityType'; slug: string }
	| { kind: 'sortTrafficDesc' };

function toggleArrayValue<T extends string>(
	current: T[] | undefined,
	value: T
): T[] | undefined {
	const list = current ?? [];
	const next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
	return next.length > 0 ? next : undefined;
}

export function applyBuildBacklinksFacetClick(
	filters: BuildBacklinksHubFilters,
	facet: BuildBacklinksFacetClick
): Partial<BuildBacklinksHubFilters> {
	switch (facet.kind) {
		case 'category':
			return { category: facet.slug, tags: undefined };
		case 'siteTag':
			return { tags: [facet.slug], category: undefined };
		case 'costTier':
			return { costTiers: toggleArrayValue(filters.costTiers, facet.value) };
		case 'dofollow':
			return { dofollow: toggleArrayValue(filters.dofollow, facet.value) };
		case 'effort':
			return { effort: toggleArrayValue(filters.effort, facet.value) };
		case 'approvalMode':
			return { approvalMode: toggleArrayValue(filters.approvalMode, facet.value) };
		case 'opportunityType':
			return {
				opportunityTypeSlugs: toggleArrayValue(filters.opportunityTypeSlugs, facet.slug)
			};
		case 'sortTrafficDesc':
			return { sort: 'visits_desc' };
		default:
			return {};
	}
}

export function toggleBuildBacklinksArrayFilter<T extends string>(
	filters: BuildBacklinksHubFilters,
	key: 'costTiers' | 'dofollow' | 'effort' | 'approvalMode',
	value: T
): Partial<BuildBacklinksHubFilters> {
	const current = filters[key] as T[] | undefined;
	return { [key]: toggleArrayValue(current, value) };
}
