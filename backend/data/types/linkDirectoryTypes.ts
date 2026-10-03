export type LinkDirectoryEffort = "easy" | "medium" | "hard";
export type LinkDirectoryApprovalMode = "instant" | "manual_review";
export type LinkDirectoryDofollow = "dofollow" | "nofollow" | "unknown";
export type LinkDirectoryCostTier = "free" | "freemium" | "paid";
export type LinkDirectoryCtaKind =
    | "none"
    | "connect_channel"
    | "schedule_post"
    | "use_plug"
    | "external_doc";
export type LinkDirectorySubmissionStatus = "pending" | "approved" | "rejected";

export type LinkDirectoryOpportunityStep = {
    order: number;
    title: string;
    body: string;
};

export interface LinkDirectoryCategoryRow {
    id: string;
    name: string;
    slug: string;
    headline: string | null;
    description: string | null;
    sort_order: number;
    openquok_channels_hub_path: string;
    created_at?: string;
    updated_at?: string;
}

export interface LinkDirectoryTagGroupRow {
    id: string;
    name: string;
    sort_order: number;
    created_at?: string;
    updated_at?: string;
}

export interface LinkDirectoryTagRow {
    id: string;
    name: string;
    slug: string;
    headline: string | null;
    description: string | null;
    link_directory_tag_groups?: Array<{
        link_directory_tag_groups: LinkDirectoryTagGroupRow | null;
    }>;
}

export interface LinkDirectoryOpportunityTypeRow {
    id: string;
    slug: string;
    label: string;
    description: string | null;
    sort_order: number;
}

export interface LinkDirectoryOpportunityRow {
    id: string;
    site_id: string;
    slug: string;
    title: string;
    opportunity_type_id: string;
    effort: LinkDirectoryEffort;
    approval_mode: LinkDirectoryApprovalMode;
    approval_time_hint: string | null;
    dofollow: LinkDirectoryDofollow;
    cost_tier: LinkDirectoryCostTier;
    cost_note: string | null;
    description: string | null;
    steps: LinkDirectoryOpportunityStep[];
    openquok_cta_kind: LinkDirectoryCtaKind;
    openquok_channel_slug: string | null;
    openquok_plug_name: string | null;
    cta_href: string | null;
    cta_label: string | null;
    sort_order: number;
    is_admin_published: boolean;
    published_at: string | null;
    created_at?: string;
    updated_at?: string;
    opportunity_type?: LinkDirectoryOpportunityTypeRow | null;
}

export interface LinkDirectorySiteRow {
    id: string;
    slug: string;
    title: string;
    site_url: string;
    logo_url: string | null;
    short_description: string | null;
    long_description: string | null;
    domain_authority: number | null;
    domain_rating: number | null;
    monthly_visits: number | null;
    metrics_source: string | null;
    metrics_updated_at: string | null;
    category_id: string | null;
    is_openquok_auth_supported: boolean;
    openquok_channel_slug: string | null;
    is_admin_published: boolean;
    sort_order: number;
    tag_slugs: string[] | null;
    published_at: string | null;
    created_at?: string;
    updated_at?: string;
    category?: LinkDirectoryCategoryRow | null;
    opportunities?: LinkDirectoryOpportunityRow[];
    link_directory_site_tags_association?: Array<{
        link_directory_tags: { id: string; slug: string; name: string } | null;
    }>;
}

export interface PublishedLinkDirectorySitesFilterOptions {
    limit?: number;
    skip?: number;
    searchTerm?: string | null;
    tagSlugs?: string[] | null;
    categorySlug?: string | null;
    costTiers?: LinkDirectoryCostTier[] | null;
    dofollow?: LinkDirectoryDofollow[] | null;
    effort?: LinkDirectoryEffort[] | null;
    approvalMode?: LinkDirectoryApprovalMode[] | null;
    opportunityTypeSlugs?: string[] | null;
    sortByKey?: string | null;
    sortByOrder?: boolean | null;
    range?: { start: number; end: number } | null;
}

export interface AdminLinkDirectorySitesFilterOptions {
    limit?: number;
    searchTerm?: string | null;
    sortByKey?: string | null;
    sortByOrder?: boolean | null;
    range?: { start: number; end: number } | null;
}

export interface LinkDirectorySubmissionRow {
    id: string;
    status: LinkDirectorySubmissionStatus;
    email: string;
    user_id: string | null;
    site_url: string;
    proposed_title: string | null;
    notes: string | null;
    payload: Record<string, unknown>;
    reviewed_by: string | null;
    reviewed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface LinkDirectorySavedSiteRow {
    id: string;
    user_id: string;
    site_id: string;
    sort_order: number;
    created_at: string;
    outreach_completed_at: string | null;
    site?: LinkDirectorySiteRow | null;
}
