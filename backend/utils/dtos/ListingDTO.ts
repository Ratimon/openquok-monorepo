import type {
    PublishedListingsFilterOptions,
    AdminListingsFilterOptions,
    ListingCreator,
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
    excerpt?: string | null;
    content?: string | null;
    listing_kind: string;
    extension_type?: string | null;
    install_command_skills?: string | null;
    install_command_mcp?: string | null;
    is_official?: boolean | null;
    source_repo_url?: string | null;
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
    excerpt: string | null;
    content: string | null;
    listingKind: string;
    extensionType: string | null;
    installCommandSkills: string | null;
    installCommandMcp: string | null;
    isOfficial: boolean;
    sourceRepoUrl: string | null;
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
            excerpt: listing.excerpt ?? null,
            content: listing.content ?? null,
            listingKind: listing.listing_kind,
            extensionType: listing.extension_type ?? null,
            installCommandSkills: listing.install_command_skills ?? null,
            installCommandMcp: listing.install_command_mcp ?? null,
            isOfficial: listing.is_official === true,
            sourceRepoUrl: listing.source_repo_url ?? null,
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

export type { ListingCreator, PartialListingCategory, FullListingCategory, PartialListingTag, FullListingTag };
