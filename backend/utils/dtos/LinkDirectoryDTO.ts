import type {
    LinkDirectoryBookmarkRow,
    LinkDirectoryCategoryRow,
    LinkDirectoryOpportunityRow,
    LinkDirectoryOpportunityTypeRow,
    LinkDirectorySiteRow,
    LinkDirectorySubmissionRow,
    LinkDirectoryTagRow,
} from "../../data/types/linkDirectoryTypes";

export type LinkDirectoryCategoryDto = {
    id: string;
    name: string;
    slug: string;
    headline: string | null;
    description: string | null;
    sortOrder: number;
    openquokChannelsHubPath: string;
};

export type LinkDirectoryTagDto = {
    id: string;
    name: string;
    slug: string;
    headline: string | null;
    description: string | null;
    groups: Array<{ id: string; name: string; sortOrder: number }>;
};

export type LinkDirectoryOpportunityTypeDto = {
    id: string;
    slug: string;
    label: string;
    description: string | null;
    sortOrder: number;
};

export type LinkDirectoryOpportunityDto = {
    id: string;
    siteId: string;
    slug: string;
    title: string;
    opportunityTypeId: string;
    opportunityType: LinkDirectoryOpportunityTypeDto | null;
    effort: string;
    approvalMode: string;
    approvalTimeHint: string | null;
    dofollow: string;
    costTier: string;
    costNote: string | null;
    description: string | null;
    steps: LinkDirectoryOpportunityRow["steps"];
    openquokCtaKind: string;
    openquokChannelSlug: string | null;
    openquokPlugName: string | null;
    ctaHref: string | null;
    ctaLabel: string | null;
    sortOrder: number;
    isAdminPublished: boolean;
    publishedAt: string | null;
};

export type LinkDirectorySiteDto = {
    id: string;
    slug: string;
    title: string;
    siteUrl: string;
    logoUrl: string | null;
    shortDescription: string | null;
    longDescription: string | null;
    domainAuthority: number | null;
    domainRating: number | null;
    monthlyVisits: number | null;
    metricsSource: string | null;
    metricsUpdatedAt: string | null;
    categoryId: string | null;
    category: LinkDirectoryCategoryDto | null;
    isOpenquokAuthSupported: boolean;
    openquokChannelSlug: string | null;
    isAdminPublished: boolean;
    sortOrder: number;
    tagSlugs: string[];
    publishedAt: string | null;
    opportunities: LinkDirectoryOpportunityDto[];
};

export type LinkDirectorySubmissionDto = {
    id: string;
    status: string;
    email: string;
    userId: string | null;
    siteUrl: string;
    proposedTitle: string | null;
    notes: string | null;
    payload: Record<string, unknown>;
    reviewedBy: string | null;
    reviewedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export type LinkDirectoryBookmarkDto = {
    id: string;
    siteId: string;
    sortOrder: number;
    createdAt: string;
    site: LinkDirectorySiteDto | null;
};

function mapCategory(row: LinkDirectoryCategoryRow | null | undefined): LinkDirectoryCategoryDto | null {
    if (!row) return null;
    return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        headline: row.headline,
        description: row.description,
        sortOrder: row.sort_order,
        openquokChannelsHubPath: row.openquok_channels_hub_path,
    };
}

function mapOpportunityType(
    row: LinkDirectoryOpportunityTypeRow | null | undefined
): LinkDirectoryOpportunityTypeDto | null {
    if (!row) return null;
    return {
        id: row.id,
        slug: row.slug,
        label: row.label,
        description: row.description,
        sortOrder: row.sort_order,
    };
}

function mapOpportunity(row: LinkDirectoryOpportunityRow): LinkDirectoryOpportunityDto {
    const typeRow = row.opportunity_type ?? null;
    return {
        id: row.id,
        siteId: row.site_id,
        slug: row.slug,
        title: row.title,
        opportunityTypeId: row.opportunity_type_id,
        opportunityType: mapOpportunityType(typeRow),
        effort: row.effort,
        approvalMode: row.approval_mode,
        approvalTimeHint: row.approval_time_hint,
        dofollow: row.dofollow,
        costTier: row.cost_tier,
        costNote: row.cost_note,
        description: row.description,
        steps: row.steps ?? [],
        openquokCtaKind: row.openquok_cta_kind,
        openquokChannelSlug: row.openquok_channel_slug,
        openquokPlugName: row.openquok_plug_name,
        ctaHref: row.cta_href,
        ctaLabel: row.cta_label,
        sortOrder: row.sort_order,
        isAdminPublished: row.is_admin_published,
        publishedAt: row.published_at,
    };
}

export function toLinkDirectorySiteDto(row: LinkDirectorySiteRow): LinkDirectorySiteDto {
    const opportunities = (row.opportunities ?? []).map(mapOpportunity);
    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        siteUrl: row.site_url,
        logoUrl: row.logo_url,
        shortDescription: row.short_description,
        longDescription: row.long_description,
        domainAuthority: row.domain_authority,
        domainRating: row.domain_rating,
        monthlyVisits: row.monthly_visits,
        metricsSource: row.metrics_source,
        metricsUpdatedAt: row.metrics_updated_at,
        categoryId: row.category_id,
        category: mapCategory(row.category ?? null),
        isOpenquokAuthSupported: row.is_openquok_auth_supported,
        openquokChannelSlug: row.openquok_channel_slug,
        isAdminPublished: row.is_admin_published,
        sortOrder: row.sort_order,
        tagSlugs: row.tag_slugs ?? [],
        publishedAt: row.published_at,
        opportunities,
    };
}

export function toLinkDirectorySiteDtoCollection(rows: LinkDirectorySiteRow[]): LinkDirectorySiteDto[] {
    return rows.map(toLinkDirectorySiteDto);
}

export function toLinkDirectoryCategoryDto(row: LinkDirectoryCategoryRow): LinkDirectoryCategoryDto {
    return mapCategory(row)!;
}

export function toLinkDirectoryCategoryDtoCollection(
    rows: LinkDirectoryCategoryRow[]
): LinkDirectoryCategoryDto[] {
    return rows.map(toLinkDirectoryCategoryDto);
}

export function toLinkDirectoryTagDto(row: LinkDirectoryTagRow): LinkDirectoryTagDto {
    const groups =
        row.link_directory_tag_groups?.map((assoc) => {
            const group = assoc.link_directory_tag_groups;
            return group
                ? { id: group.id, name: group.name, sortOrder: group.sort_order }
                : null;
        }).filter((g): g is { id: string; name: string; sortOrder: number } => g !== null) ?? [];

    return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        headline: row.headline,
        description: row.description,
        groups,
    };
}

export function toLinkDirectoryTagDtoCollection(rows: LinkDirectoryTagRow[]): LinkDirectoryTagDto[] {
    return rows.map(toLinkDirectoryTagDto);
}

export function toLinkDirectoryOpportunityTypeDtoCollection(
    rows: LinkDirectoryOpportunityTypeRow[]
): LinkDirectoryOpportunityTypeDto[] {
    return rows.map((row) => mapOpportunityType(row)!);
}

export function toLinkDirectorySubmissionDto(row: LinkDirectorySubmissionRow): LinkDirectorySubmissionDto {
    return {
        id: row.id,
        status: row.status,
        email: row.email,
        userId: row.user_id,
        siteUrl: row.site_url,
        proposedTitle: row.proposed_title,
        notes: row.notes,
        payload: row.payload ?? {},
        reviewedBy: row.reviewed_by,
        reviewedAt: row.reviewed_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function toLinkDirectorySubmissionDtoCollection(
    rows: LinkDirectorySubmissionRow[]
): LinkDirectorySubmissionDto[] {
    return rows.map(toLinkDirectorySubmissionDto);
}

export function toLinkDirectoryBookmarkDto(row: LinkDirectoryBookmarkRow): LinkDirectoryBookmarkDto {
    return {
        id: row.id,
        siteId: row.site_id,
        sortOrder: row.sort_order,
        createdAt: row.created_at,
        site: row.site ? toLinkDirectorySiteDto(row.site) : null,
    };
}

export function toLinkDirectoryBookmarkDtoCollection(
    rows: LinkDirectoryBookmarkRow[]
): LinkDirectoryBookmarkDto[] {
    return rows.map(toLinkDirectoryBookmarkDto);
}
