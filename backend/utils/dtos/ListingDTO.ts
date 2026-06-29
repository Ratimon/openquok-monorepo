import type {
    PublishedListingsFilterOptions,
    AdminListingsFilterOptions,
    ListingCreator,
    AdminListingComment,
    AdminListingActivity,
    AdminListingCommentsFilterOptions,
} from "../../data/types/listingTypes";
import type {
    PartialListingCategory,
    FullListingCategory,
} from "../../data/types/listingCategoryTypes";
import type {
    PartialListingTag,
    FullListingTag,
} from "../../data/types/listingTagTypes";

export interface ListingLike {
    id: string;
    owner_id: string | null;
    title: string;
    slug: string;
    description?: string | null;
    description_skills?: string | null;
    description_mcp?: string | null;
    excerpt?: string | null;
    click_url?: string | null;
    click_url_skills?: string | null;
    click_url_mcp?: string | null;
    content?: string | null;
    content_skills?: string | null;
    content_mcp?: string | null;
    listing_kind: string;
    extension_type?: string | null;
    install_command_skills?: string | null;
    install_command_mcp?: string | null;
    is_official?: boolean | null;
    source_repo_url?: string | null;
    skill_source_url?: string | null;
    skill_name?: string | null;
    skill_metadata?: Record<string, unknown> | null;
    source_synced_at?: string | null;
    source_content_hash?: string | null;
    license?: string | null;
    version?: string | null;
    mcp_tools?: Array<{ name: string; description: string }> | null;
    mcp_transport?: string | null;
    mcp_server_config?: Record<string, unknown> | null;
    likes?: number | null;
    views?: number | null;
    clicks?: number | null;
    bookmark_count?: number | null;
    average_rating?: number | null;
    ratings_count?: number | null;
    is_user_published?: boolean | null;
    is_admin_published?: boolean | null;
    schema_type?: string | null;
    schema_json?: Record<string, unknown> | null;
    listing_category_id?: string | null;
    default_image_url?: string | null;
    listing_image_urls?: string[] | null;
    logo_image_url?: string | null;
    faq?: unknown;
    listing_tag_slugs?: string[] | null;
    listings_listing_tags_association?:
        | Array<{ listing_tags?: { id: string; name: string; slug: string } | { id: string; name: string; slug: string }[] | null }>
        | null;
    created_at: string;
    updated_at?: string | null;
    published_at?: string | null;
    category?:
        | { id: string; name: string; slug: string; parent_path?: string }
        | Array<{ id: string; name: string; slug: string; parent_path?: string }>
        | null;
    listing_tags?:
        | Array<{ id: string; name: string; slug: string }>
        | { id: string; name: string; slug: string }
        | null;
    owner?:
        | {
              id: string;
              full_name?: string | null;
              username?: string | null;
              user_profiles?:
                  | Array<{ avatar_url?: string | null; tag_line?: string | null }>
                  | { avatar_url?: string | null; tag_line?: string | null }
                  | null;
          }
        | Array<{
              id: string;
              full_name?: string | null;
              username?: string | null;
              user_profiles?:
                  | Array<{ avatar_url?: string | null; tag_line?: string | null }>
                  | { avatar_url?: string | null; tag_line?: string | null }
                  | null;
          }>
        | null;
}

export interface ListingDTO {
    id: string;
    ownerId: string | null;
    title: string;
    slug: string;
    description: string | null;
    descriptionSkills: string | null;
    descriptionMcp: string | null;
    excerpt: string | null;
    clickUrl: string | null;
    clickUrlSkills: string | null;
    clickUrlMcp: string | null;
    content: string | null;
    contentSkills: string | null;
    contentMcp: string | null;
    listingKind: string;
    extensionType: string | null;
    installCommandSkills: string | null;
    installCommandMcp: string | null;
    isOfficial: boolean;
    sourceRepoUrl: string | null;
    skillSourceUrl: string | null;
    skillName: string | null;
    skillMetadata: Record<string, unknown> | null;
    sourceSyncedAt: string | null;
    sourceContentHash: string | null;
    license: string | null;
    version: string | null;
    mcpTools: Array<{ name: string; description: string }>;
    mcpTransport: string | null;
    mcpServerConfig: Record<string, unknown> | null;
    likes: number;
    views: number;
    clicks: number;
    bookmarkCount: number;
    averageRating: number;
    ratingsCount: number;
    isUserPublished: boolean;
    isAdminPublished: boolean;
    schemaType: string | null;
    schemaJson: Record<string, unknown> | null;
    listingCategoryId: string | null;
    defaultImageUrl: string | null;
    listingImageUrls: string[];
    logoImageUrl: string | null;
    faq: unknown;
    listingTagSlugs: string[];
    createdAt: string;
    updatedAt: string | null;
    publishedAt: string | null;
    category: { id: string; name: string; slug: string; parentPath?: string } | null;
    tags: Array<{ id: string; name: string; slug: string }>;
    owner: {
        id: string;
        fullName: string | null;
        username: string | null;
        avatarUrl: string | null;
        tagLine: string | null;
    } | null;
}

function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
    if (value == null) return null;
    return Array.isArray(value) ? (value[0] ?? null) : value;
}

export class ListingDTOMapper {
    static toDTO(listing: ListingLike): ListingDTO {
        const category = unwrapOne(listing.category);
        const owner = unwrapOne(listing.owner);
        const profiles = unwrapOne(owner?.user_profiles ?? null);
        const tagsRaw = listing.listing_tags;
        const fromAssoc = (listing.listings_listing_tags_association ?? [])
            .flatMap((row) => {
                const lt = row.listing_tags;
                if (!lt) return [];
                return Array.isArray(lt) ? lt : [lt];
            });
        const tags = fromAssoc.length > 0
            ? fromAssoc
            : Array.isArray(tagsRaw)
              ? tagsRaw
              : tagsRaw
                ? [tagsRaw]
                : [];

        return {
            id: listing.id,
            ownerId: listing.owner_id ?? null,
            title: listing.title,
            slug: listing.slug,
            description: listing.description ?? null,
            descriptionSkills: listing.description_skills ?? null,
            descriptionMcp: listing.description_mcp ?? null,
            excerpt: listing.excerpt ?? null,
            clickUrl: listing.click_url ?? null,
            clickUrlSkills: listing.click_url_skills ?? null,
            clickUrlMcp: listing.click_url_mcp ?? null,
            content: listing.content ?? null,
            contentSkills: listing.content_skills ?? null,
            contentMcp: listing.content_mcp ?? null,
            listingKind: listing.listing_kind,
            extensionType: listing.extension_type ?? null,
            installCommandSkills: listing.install_command_skills ?? null,
            installCommandMcp: listing.install_command_mcp ?? null,
            isOfficial: listing.is_official === true,
            sourceRepoUrl: listing.source_repo_url ?? null,
            skillSourceUrl: listing.skill_source_url ?? null,
            skillName: listing.skill_name ?? null,
            skillMetadata: (listing.skill_metadata as Record<string, unknown> | null) ?? null,
            sourceSyncedAt: listing.source_synced_at ?? null,
            sourceContentHash: listing.source_content_hash ?? null,
            license: listing.license ?? null,
            version: listing.version ?? null,
            mcpTools: listing.mcp_tools ?? [],
            mcpTransport: listing.mcp_transport ?? null,
            mcpServerConfig: (listing.mcp_server_config as Record<string, unknown> | null) ?? null,
            likes: listing.likes ?? 0,
            views: listing.views ?? 0,
            clicks: listing.clicks ?? 0,
            bookmarkCount: listing.bookmark_count ?? 0,
            averageRating: listing.average_rating ?? 0,
            ratingsCount: listing.ratings_count ?? 0,
            isUserPublished: listing.is_user_published === true,
            isAdminPublished: listing.is_admin_published === true,
            schemaType: listing.schema_type ?? null,
            schemaJson: (listing.schema_json as Record<string, unknown> | null) ?? null,
            listingCategoryId: listing.listing_category_id ?? null,
            defaultImageUrl: listing.default_image_url ?? null,
            listingImageUrls: listing.listing_image_urls ?? [],
            logoImageUrl: listing.logo_image_url ?? null,
            faq: listing.faq ?? null,
            listingTagSlugs: listing.listing_tag_slugs ?? [],
            createdAt: listing.created_at,
            updatedAt: listing.updated_at ?? null,
            publishedAt: listing.published_at ?? null,
            category: category
                ? {
                      id: category.id,
                      name: category.name,
                      slug: category.slug,
                      parentPath: category.parent_path,
                  }
                : null,
            tags: tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
            owner: owner
                ? {
                      id: owner.id,
                      fullName: owner.full_name ?? null,
                      username: owner.username ?? null,
                      avatarUrl: profiles?.avatar_url ?? null,
                      tagLine: profiles?.tag_line ?? null,
                  }
                : null,
        };
    }

    static toDTOCollection(listings: ListingLike[]): ListingDTO[] {
        return listings.map((l) => ListingDTOMapper.toDTO(l));
    }
}

export function buildPublishedListingCacheKey(
    options: PublishedListingsFilterOptions,
    prefix: string
): string {
    const tagSlugs = options.tagSlugs?.slice().sort().join(",") ?? "none";
    const range = options.range ? `start:${options.range.start}:end:${options.range.end}` : "none";
    return [
        prefix,
        `kind:${options.listingKind ?? "extension"}`,
        `limit:${options.limit ?? 10}`,
        `skipId:${options.skipId ?? "none"}`,
        `skip:${options.skip ?? 0}`,
        `search:${options.searchTerm ?? "none"}`,
        `tags:${tagSlugs}`,
        `category:${options.categorySlug ?? "none"}`,
        `extType:${options.extensionType ?? "none"}`,
        `sort:${options.sortByKey ?? "created_at"}`,
        `order:${options.sortByOrder ? "asc" : "desc"}`,
        `range:${range}`,
        `owner:${options.ownerId ?? "none"}`,
    ].join(":");
}

export function buildAdminListingCacheKey(
    options: AdminListingsFilterOptions,
    prefix: string
): string {
    const range = options.range ? `start:${options.range.start}:end:${options.range.end}` : "none";
    return [
        prefix,
        `limit:${options.limit ?? 10}`,
        `search:${options.searchTerm ?? "none"}`,
        `kind:${options.listingKind ?? "all"}`,
        `sort:${options.sortByKey ?? "created_at"}`,
        `order:${options.sortByOrder ? "asc" : "desc"}`,
        `range:${range}`,
    ].join(":");
}

export interface ListingCommentDTO {
    id: string;
    content: string;
    isApproved: boolean;
    createdAt: string;
    updatedAt: string | null;
    parentId: string | null;
    userId: string;
    author: {
        id: string;
        fullName: string | null;
        avatarUrl: string | null;
    } | null;
}

export interface AdminListingCommentDTO extends ListingCommentDTO {
    listingId: string;
    listing: { id: string; title: string; slug: string } | null;
}

export interface AdminListingActivityDTO {
    id: string;
    activityType: string;
    createdAt: string;
    userId: string | null;
    listingId: string;
    author: {
        id: string;
        fullName: string | null;
        avatarUrl: string | null;
    } | null;
    listing: { id: string; title: string; slug: string } | null;
}

export function buildAdminListingCommentsCacheKey(
    options: AdminListingCommentsFilterOptions,
    prefix: string
): string {
    const range = options.range ? `start:${options.range.start}:end:${options.range.end}` : "none";
    return [
        prefix,
        `limit:${options.limit ?? 10}`,
        `search:${options.searchTerm ?? "none"}`,
        `sort:${options.sortByKey ?? "created_at"}`,
        `order:${options.sortByOrder ? "asc" : "desc"}`,
        `range:${range}`,
    ].join(":");
}

export const ListingAdminDTOMapper = {
    toCommentDTO(row: AdminListingComment): ListingCommentDTO {
        return {
            id: row.id,
            content: row.content,
            isApproved: row.is_approved,
            createdAt: row.created_at,
            updatedAt: row.updated_at ?? null,
            parentId: row.parent_id ?? null,
            userId: row.user_id,
            author: row.author
                ? {
                      id: row.author.id,
                      fullName: row.author.full_name ?? null,
                      avatarUrl: row.author.avatar_url ?? null,
                  }
                : null,
        };
    },

    toAdminCommentDTO(row: AdminListingComment): AdminListingCommentDTO {
        return {
            ...ListingAdminDTOMapper.toCommentDTO(row),
            listingId: row.listing_id,
            listing: row.listing
                ? { id: row.listing.id, title: row.listing.title, slug: row.listing.slug }
                : null,
        };
    },

    toAdminCommentDTOCollection(rows: AdminListingComment[]): AdminListingCommentDTO[] {
        if (!Array.isArray(rows)) return [];
        return rows.map((r) => ListingAdminDTOMapper.toAdminCommentDTO(r));
    },

    toAdminActivityDTO(row: AdminListingActivity): AdminListingActivityDTO {
        return {
            id: row.id,
            activityType: row.activity_type,
            createdAt: row.created_at,
            userId: row.user_id ?? null,
            listingId: row.listing_id,
            author: row.author
                ? {
                      id: row.author.id,
                      fullName: row.author.full_name ?? null,
                      avatarUrl: row.author.avatar_url ?? null,
                  }
                : null,
            listing: row.listing
                ? { id: row.listing.id, title: row.listing.title, slug: row.listing.slug }
                : null,
        };
    },

    toAdminActivityDTOCollection(rows: AdminListingActivity[]): AdminListingActivityDTO[] {
        if (!Array.isArray(rows)) return [];
        return rows.map((r) => ListingAdminDTOMapper.toAdminActivityDTO(r));
    },
};

export type { ListingCreator, PartialListingCategory, FullListingCategory, PartialListingTag, FullListingTag };
