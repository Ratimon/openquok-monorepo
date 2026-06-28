import type { SupabaseClient } from "@supabase/supabase-js";
import type {
    PublishedListingsFilterOptions,
    AdminListingsFilterOptions,
    ListingCreator,
    ListingKind,
} from "../data/types/listingTypes";
import type {
    ListingCreateSchemaType,
    ListingUpdateSchemaType,
    ListingTagRefSchemaType,
} from "../data/schemas/listingSchemas";
import type { ListingLike } from "../utils/dtos/ListingDTO";
import { DatabaseError, DatabaseEntityNotFoundError, ValidationError } from "../errors/InfraError";
import { logger } from "../utils/Logger";
import { stringToSlug } from "../utils/blog/slug";

const TABLE_LISTINGS = "listings";
const TABLE_TAG_ASSOC = "listings_listing_tags_association";
const TABLE_BOOKMARKS = "listing_bookmarks";

const RPC_GET_LISTING_CREATORS = "get_listing_creators";

const SELECT_LISTING = `
  id,
  owner_id,
  title,
  slug,
  description,
  excerpt,
  content,
  listing_kind,
  extension_type,
  install_command_skills,
  install_command_mcp,
  is_official,
  source_repo_url,
  likes,
  views,
  clicks,
  bookmark_count,
  average_rating,
  ratings_count,
  is_user_published,
  is_admin_published,
  schema_type,
  schema_json,
  listing_category_id,
  default_image_url,
  listing_image_urls,
  logo_image_url,
  faq,
  listing_tag_slugs,
  created_at,
  updated_at,
  published_at,
  category:listing_categories(id, name, slug, parent_path),
  listings_listing_tags_association(
    listing_tags(id, name, slug)
  ),
  owner:users!owner_id(id, full_name, username, user_profiles(avatar_url, tag_line))
`;

const ALLOWED_PUBLISHED_SORT_KEYS = new Set([
    "likes",
    "views",
    "clicks",
    "average_rating",
    "bookmark_count",
    "created_at",
    "published_at",
    "title",
]);

const ALLOWED_ADMIN_SORT_KEYS = new Set([
    "created_at",
    "updated_at",
    "published_at",
    "title",
    "likes",
    "views",
    "is_admin_published",
    "is_user_published",
]);

function resolveOrderKey(
    candidate: string | null | undefined,
    fallback: string,
    allowlist: Set<string>
): string {
    const key = candidate?.toString().trim();
    if (!key) return fallback;
    return allowlist.has(key) ? key : fallback;
}

export class ListingRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async findListingById(id: string): Promise<{ data: ListingLike }> {
        const { data, error } = await this.supabase
            .from(TABLE_LISTINGS)
            .select(SELECT_LISTING)
            .eq("id", id)
            .single();

        if (error) {
            throw new DatabaseError(`Error fetching listing by id: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE_LISTINGS },
            });
        }
        return { data: data as unknown as ListingLike };
    }

    async findPublishedListingBySlug(
        slug: string,
        listingKind?: ListingKind
    ): Promise<{ data: ListingLike | null }> {
        let query = this.supabase
            .from(TABLE_LISTINGS)
            .select(SELECT_LISTING)
            .match({
                slug,
                is_user_published: true,
                is_admin_published: true,
            });

        if (listingKind) {
            query = query.eq("listing_kind", listingKind);
        }

        const { data, error } = await query.single();

        if (error) {
            if (error.code === "PGRST116") {
                return { data: null };
            }
            throw new DatabaseError(`Error fetching published listing: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE_LISTINGS },
            });
        }
        return { data: data as unknown as ListingLike };
    }

    async findPublishedListings(
        options: PublishedListingsFilterOptions
    ): Promise<{ data: ListingLike[]; count: number }> {
        const {
            limit = 10,
            skipId,
            skip = 0,
            searchTerm,
            tagSlugs,
            categorySlug,
            extensionType,
            listingKind = "extension",
            sortByKey,
            sortByOrder,
            range,
            ownerId,
        } = options;

        let query = this.supabase
            .from(TABLE_LISTINGS)
            .select(SELECT_LISTING, { count: "exact" })
            .match({
                is_user_published: true,
                is_admin_published: true,
                listing_kind: listingKind,
            });

        if (categorySlug) {
            query = query.eq("category.slug", categorySlug);
        }
        if (extensionType && listingKind === "extension") {
            query = query.eq("extension_type", extensionType);
        }
        if (tagSlugs && tagSlugs.length > 0) {
            query = query.contains("listing_tag_slugs", tagSlugs);
        }
        if (searchTerm) {
            query = query.textSearch("fts", searchTerm.replace(/\s+/g, "+"));
        }
        if (skipId) {
            query = query.not("id", "eq", skipId);
        }
        if (ownerId) {
            query = query.eq("owner_id", ownerId);
        }

        const orderKey = resolveOrderKey(sortByKey ?? undefined, "created_at", ALLOWED_PUBLISHED_SORT_KEYS);
        query = query.order(orderKey, { ascending: sortByOrder ?? false });

        if (range) {
            query = query.range(range.start, range.end);
        } else {
            query = query.range(skip, skip + limit - 1);
        }

        const { data, error, count } = await query;

        if (error) {
            throw new DatabaseError(`Error fetching published listings: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE_LISTINGS },
            });
        }

        return { data: (data ?? []) as unknown as ListingLike[], count: count ?? 0 };
    }

    async findAdminListings(
        options: AdminListingsFilterOptions
    ): Promise<{ data: ListingLike[]; count: number }> {
        const {
            limit = 10,
            searchTerm,
            listingKind,
            sortByKey,
            sortByOrder,
            range,
        } = options;

        let query = this.supabase
            .from(TABLE_LISTINGS)
            .select(SELECT_LISTING, { count: "exact" });

        if (listingKind) {
            query = query.eq("listing_kind", listingKind);
        }
        if (searchTerm) {
            query = query.textSearch("fts", searchTerm.replace(/\s+/g, "+"));
        }

        const orderKey = resolveOrderKey(sortByKey ?? undefined, "created_at", ALLOWED_ADMIN_SORT_KEYS);
        if (orderKey === "is_admin_published") {
            query = query.order("is_admin_published", { ascending: true });
            query = query.order("is_user_published", { ascending: false });
        } else {
            query = query.order(orderKey, { ascending: sortByOrder ?? false });
        }

        if (range) {
            query = query.range(range.start, range.end);
        } else {
            query = query.range(0, limit - 1);
        }

        const { data, error, count } = await query;

        if (error) {
            throw new DatabaseError(`Error fetching admin listings: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE_LISTINGS },
            });
        }

        return { data: (data ?? []) as unknown as ListingLike[], count: count ?? 0 };
    }

    async getListingCreators(): Promise<{ data: ListingCreator[] }> {
        const { data, error } = await this.supabase.rpc(RPC_GET_LISTING_CREATORS);

        if (error) {
            throw new DatabaseError(`Error fetching listing creators: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "rpc",
            });
        }

        return { data: (data ?? []) as ListingCreator[] };
    }

    async findListingsByOwnerUsername(username: string): Promise<{ data: ListingLike[] }> {
        const { data: userRow, error: userError } = await this.supabase
            .from("users")
            .select("id")
            .eq("username", username)
            .single();

        if (userError) {
            if (userError.code === "PGRST116") {
                return { data: [] };
            }
            throw new DatabaseError(`Error resolving creator username: ${userError.message}`, {
                cause: userError as unknown as Error,
                operation: "select",
            });
        }

        return this.findPublishedListings({
            ownerId: userRow.id as string,
            listingKind: "extension",
            limit: 100,
        }).then(({ data }) => ({ data }));
    }

    async incrementStatCounter(
        listingId: string,
        fieldName: "views" | "clicks" | "likes"
    ): Promise<void> {
        const { error } = await this.supabase.rpc("increment_field", {
            p_listing_id: listingId,
            field_name: fieldName,
        });

        if (error) {
            throw new DatabaseError(`Error incrementing ${fieldName}: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "rpc",
            });
        }
    }

    async insertListingActivity(
        listingId: string,
        activityType: string,
        userId: string | null
    ): Promise<void> {
        const { error } = await this.supabase.from("listing_activities").insert({
            listing_id: listingId,
            activity_type: activityType,
            user_id: userId,
        });

        if (error) {
            logger.warn({ msg: "Failed to insert listing activity", error: error.message, listingId, activityType });
        }
    }

    async createListing(
        listing: ListingCreateSchemaType,
        tags: ListingTagRefSchemaType[],
        ownerId: string,
        isAdminPublished: boolean
    ): Promise<{ savedListingId: string; isAdminApproved: boolean; isUserApproved: boolean }> {
        const isUserApproved = listing.is_user_published === true;
        const { id: _id, owner_id: _ownerId, is_admin_published: _admin, ...payload } = listing;

        const { data, error } = await this.supabase
            .from(TABLE_LISTINGS)
            .insert({
                ...payload,
                slug: stringToSlug(listing.title),
                owner_id: ownerId,
                is_admin_published: isAdminPublished,
                listing_tag_slugs: tags.map((t) => t.slug),
            })
            .select("id")
            .single();

        if (error) {
            if (error.message.includes("duplicate key value")) {
                throw new ValidationError("A listing with this slug already exists.");
            }
            throw new DatabaseError(`Error creating listing: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "insert",
            });
        }

        const savedListingId = data.id as string;
        await this.syncListingTags(savedListingId, tags);

        return {
            savedListingId,
            isAdminApproved: isAdminPublished,
            isUserApproved: isUserApproved,
        };
    }

    async updateListing(
        listing: ListingUpdateSchemaType,
        tags: ListingTagRefSchemaType[],
        ownerId: string,
        isAdminPublished: boolean
    ): Promise<{ savedListingId: string; isAdminApproved: boolean; isUserApproved: boolean }> {
        const isUserApproved = listing.is_user_published === true;
        const { id, owner_id: _ownerId, is_admin_published: _admin, ...payload } = listing;

        const { data, error } = await this.supabase
            .from(TABLE_LISTINGS)
            .update({
                ...payload,
                slug: stringToSlug(listing.title),
                owner_id: ownerId,
                is_admin_published: isAdminPublished,
                listing_tag_slugs: tags.map((t) => t.slug),
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select("id")
            .single();

        if (error) {
            throw new DatabaseError(`Error updating listing: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "update",
            });
        }

        if (!data?.id) {
            throw new DatabaseEntityNotFoundError("Listing not found", { id });
        }

        await this.syncListingTags(id, tags);

        return {
            savedListingId: id,
            isAdminApproved: isAdminPublished,
            isUserApproved: isUserApproved,
        };
    }

    async deleteListing(id: string): Promise<void> {
        const { error } = await this.supabase.from(TABLE_LISTINGS).delete().eq("id", id);

        if (error) {
            throw new DatabaseError(`Error deleting listing: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "delete",
            });
        }
    }

    async addBookmark(userId: string, listingId: string): Promise<void> {
        const { error: insertError } = await this.supabase.from(TABLE_BOOKMARKS).insert({
            user_id: userId,
            listing_id: listingId,
        });

        if (insertError) {
            if (insertError.message.includes("duplicate key value")) {
                return;
            }
            throw new DatabaseError(`Error adding bookmark: ${insertError.message}`, {
                cause: insertError as unknown as Error,
                operation: "insert",
                resource: { type: "table", name: TABLE_BOOKMARKS },
            });
        }

        const { error: incrementError } = await this.supabase.rpc("increment_field", {
            p_listing_id: listingId,
            field_name: "bookmark_count",
        });

        if (incrementError) {
            throw new DatabaseError(`Error incrementing bookmark count: ${incrementError.message}`, {
                cause: incrementError as unknown as Error,
                operation: "rpc",
            });
        }
    }

    async removeBookmark(userId: string, listingId: string): Promise<void> {
        const { data: deletedRows, error: deleteError } = await this.supabase
            .from(TABLE_BOOKMARKS)
            .delete()
            .eq("user_id", userId)
            .eq("listing_id", listingId)
            .select("listing_id");

        if (deleteError) {
            throw new DatabaseError(`Error removing bookmark: ${deleteError.message}`, {
                cause: deleteError as unknown as Error,
                operation: "delete",
                resource: { type: "table", name: TABLE_BOOKMARKS },
            });
        }

        if (!deletedRows?.length) {
            return;
        }

        const { data: listingRow, error: fetchError } = await this.supabase
            .from(TABLE_LISTINGS)
            .select("bookmark_count")
            .eq("id", listingId)
            .single();

        if (fetchError) {
            throw new DatabaseError(`Error fetching listing bookmark count: ${fetchError.message}`, {
                cause: fetchError as unknown as Error,
                operation: "select",
            });
        }

        const nextCount = Math.max((listingRow?.bookmark_count as number | null) ?? 1, 1) - 1;
        const { error: updateError } = await this.supabase
            .from(TABLE_LISTINGS)
            .update({ bookmark_count: nextCount })
            .eq("id", listingId);

        if (updateError) {
            throw new DatabaseError(`Error decrementing bookmark count: ${updateError.message}`, {
                cause: updateError as unknown as Error,
                operation: "update",
            });
        }
    }

    async findBookmarkedListingsByUserId(userId: string): Promise<{ data: ListingLike[] }> {
        const { data, error } = await this.supabase
            .from(TABLE_BOOKMARKS)
            .select(`created_at, listings(${SELECT_LISTING})`)
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            throw new DatabaseError(`Error fetching user bookmarks: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE_BOOKMARKS },
            });
        }

        const listings = (data ?? [])
            .map((row) => {
                const listing = (row as { listings?: ListingLike | ListingLike[] | null }).listings;
                return Array.isArray(listing) ? listing[0] : listing;
            })
            .filter((listing): listing is ListingLike => listing != null);

        return { data: listings };
    }

    async getSkillMarkdownContent(slug: string): Promise<string | null> {
        const { data, error } = await this.supabase
            .from(TABLE_LISTINGS)
            .select("content")
            .match({
                slug,
                is_user_published: true,
                is_admin_published: true,
                listing_kind: "extension",
            })
            .single();

        if (error) {
            if (error.code === "PGRST116") return null;
            throw new DatabaseError(`Error fetching skill markdown: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
            });
        }

        return (data?.content as string | null) ?? null;
    }

    private async syncListingTags(
        listingId: string,
        tags: ListingTagRefSchemaType[]
    ): Promise<void> {
        const { error: deleteError } = await this.supabase
            .from(TABLE_TAG_ASSOC)
            .delete()
            .eq("listing_id", listingId);

        if (deleteError) {
            throw new DatabaseError(`Error clearing listing tags: ${deleteError.message}`, {
                cause: deleteError as unknown as Error,
                operation: "delete",
            });
        }

        if (tags.length === 0) return;

        const { error: insertError } = await this.supabase.from(TABLE_TAG_ASSOC).insert(
            tags.map((tag) => ({
                listing_id: listingId,
                listing_tag_id: tag.id,
            }))
        );

        if (insertError) {
            throw new DatabaseError(`Error syncing listing tags: ${insertError.message}`, {
                cause: insertError as unknown as Error,
                operation: "insert",
            });
        }
    }
}
