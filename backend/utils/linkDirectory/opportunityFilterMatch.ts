import type {
    LinkDirectoryApprovalMode,
    LinkDirectoryCostTier,
    LinkDirectoryDofollow,
    LinkDirectoryEffort,
    LinkDirectoryOpportunityRow,
} from "../../data/types/linkDirectoryTypes";

export type OpportunityFilterCriteria = {
    costTiers?: LinkDirectoryCostTier[] | null;
    dofollow?: LinkDirectoryDofollow[] | null;
    effort?: LinkDirectoryEffort[] | null;
    approvalMode?: LinkDirectoryApprovalMode[] | null;
    opportunityTypeSlugs?: string[] | null;
};

export function opportunityMatchesFilters(
    opportunity: LinkDirectoryOpportunityRow,
    filters: OpportunityFilterCriteria,
    publishedOnly = true
): boolean {
    if (publishedOnly && !opportunity.is_admin_published) {
        return false;
    }
    if (filters.costTiers?.length && !filters.costTiers.includes(opportunity.cost_tier)) {
        return false;
    }
    if (filters.dofollow?.length && !filters.dofollow.includes(opportunity.dofollow)) {
        return false;
    }
    if (filters.effort?.length && !filters.effort.includes(opportunity.effort)) {
        return false;
    }
    if (filters.approvalMode?.length && !filters.approvalMode.includes(opportunity.approval_mode)) {
        return false;
    }
    if (filters.opportunityTypeSlugs?.length) {
        const typeSlug = opportunity.opportunity_type?.slug;
        if (!typeSlug || !filters.opportunityTypeSlugs.includes(typeSlug)) {
            return false;
        }
    }
    return true;
}

export function siteHasMatchingOpportunity(
    opportunities: LinkDirectoryOpportunityRow[] | undefined,
    filters: OpportunityFilterCriteria,
    publishedOnly = true
): boolean {
    if (
        !filters.costTiers?.length &&
        !filters.dofollow?.length &&
        !filters.effort?.length &&
        !filters.approvalMode?.length &&
        !filters.opportunityTypeSlugs?.length
    ) {
        return true;
    }
    const list = opportunities ?? [];
    return list.some((opp) => opportunityMatchesFilters(opp, filters, publishedOnly));
}

export function hasOpportunityLevelFilters(filters: OpportunityFilterCriteria): boolean {
    return Boolean(
        filters.costTiers?.length ||
            filters.dofollow?.length ||
            filters.effort?.length ||
            filters.approvalMode?.length ||
            filters.opportunityTypeSlugs?.length
    );
}
