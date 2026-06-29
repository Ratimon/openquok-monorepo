import type { SupabaseClient } from "@supabase/supabase-js";
import type {
    PublishedListingsFilterOptions,
    AdminListingsFilterOptions,
    ListingCreator,
    ListingKind,
    AdminListingCommentsFilterOptions,
    AdminListingActivitiesFilterOptions,
    AdminListingComment,
    AdminListingActivity,
    ListingActivityType,
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
const TABLE_LISTING_COMMENTS = "listing_comments";
const TABLE_LISTING_ACTIVITIES = "listing_activities";

const RPC_GET_LISTING_CREATORS = "get_listing_creators";

const SELECT_LISTING = `
  id,
  owner_id,
  title,
  slug,
  description,
  description_skills,
  description_mcp,
  excerpt,
  click_url,
  click_url_skills,
  click_url_mcp,
  content,
  content_skills,
  content_mcp,
  listing_kind,
  extension_type,
  install_command_skills,
  install_command_mcp,
  is_official,
  source_repo_url,
  skill_source_url,
  skill_name,
  skill_metadata,
  source_synced_at,
  source_content_hash,
  license,
  version,
  mcp_tools,
  mcp_transport,
  mcp_server_config,
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

const ALLOWED_ADMIN_COMMENT_SORT_KEYS = new Set(["created_at", "updated_at", "content"]);
const ALLOWED_ADMIN_ACTIVITY_SORT_KEYS = new Set(["created_at", "activity_type"]);

const SELECT_LISTING_COMMENT_ADMIN = `
  id,
  content,
  is_approved,
  created_at,
  updated_at,
  parent_id,
  user_id,
  listing_id,
  author:users!user_id(id, full_name, user_profiles(avatar_url)),
  listing:listing_id(id, title, slug)
`;

const SELECT_LISTING_ACTIVITY_ADMIN = `
  id,
  activity_type,
  created_at,
  user_id,
  listing_id,
  author:users!user_id(id, full_name, user_profiles(avatar_url)),
  listing:listing_id(id, title, slug)
`;

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

    async updateListingGithubSync(
        listingId: string,
        fields: {
            content: string;
            sourceContentHash: string;
            sourceSyncedAt: string;
            description?: string | null;
            excerpt?: string | null;
            skillMetadata?: Record<string, unknown> | null;
            license?: string | null;
            version?: string | null;
        }
    ): Promise<void> {
        const { error } = await this.supabase
            .from(TABLE_LISTINGS)
            .update({
                content: fields.content,
                source_content_hash: fields.sourceContentHash,
                source_synced_at: fields.sourceSyncedAt,
                ...(fields.description !== undefined ? { description: fields.description } : {}),
                ...(fields.excerpt !== undefined ? { excerpt: fields.excerpt } : {}),
                ...(fields.skillMetadata !== undefined ? { skill_metadata: fields.skillMetadata } : {}),
                ...(fields.license !== undefined ? { license: fields.license } : {}),
                ...(fields.version !== undefined ? { version: fields.version } : {}),
                updated_at: new Date().toISOString(),
            })
            .eq("id", listingId);

        if (error) {
            throw new DatabaseError(`Error syncing listing from GitHub: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "update",
            });
        }
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

    async findAdminListingComments(
        options: AdminListingCommentsFilterOptions
    ): Promise<{ data: AdminListingComment[]; count: number }> {
        const { limit = 10, searchTerm, sortByKey, sortByOrder, range } = options;

        let query = this.supabase
            .from(TABLE_LISTING_COMMENTS)
            .select(SELECT_LISTING_COMMENT_ADMIN, { count: "exact" });

        if (searchTerm) {
            query = query.ilike("content", `%${searchTerm}%`);
        }

        const orderKey = resolveOrderKey(sortByKey ?? undefined, "created_at", ALLOWED_ADMIN_COMMENT_SORT_KEYS);
        query = query.order(orderKey, { ascending: sortByOrder ?? false });

        if (range) {
            query = query.range(range.start, range.end);
        } else {
            query = query.range(0, limit - 1);
        }

        const { data, error, count } = await query;

        if (error) {
            throw new DatabaseError(`Error fetching admin listing comments: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE_LISTING_COMMENTS },
            });
        }

        const rows = (data ?? []) as Array<{
            id: string;
            content: string;
            is_approved: boolean;
            created_at: string;
            updated_at: string | null;
            parent_id: string | null;
            user_id: string;
            listing_id: string;
            author?: Array<{ id: string; full_name: string | null; user_profiles?: { avatar_url?: string | null } | null }> | { id: string; full_name: string | null; user_profiles?: { avatar_url?: string | null } | null } | null;
            listing?: Array<{ id: string; title: string; slug: string }> | { id: string; title: string; slug: string } | null;
        }>;

        const comments: AdminListingComment[] = rows.map((row) => {
            const rawAuthor = Array.isArray(row.author) ? row.author[0] ?? null : row.author ?? null;
            const profile = rawAuthor?.user_profiles;
            const avatar_url =
                profile && typeof profile === "object" && "avatar_url" in profile
                    ? profile.avatar_url
                    : null;
            const rawListing = Array.isArray(row.listing) ? row.listing[0] ?? null : row.listing ?? null;
            return {
                id: row.id,
                content: row.content,
                is_approved: row.is_approved,
                created_at: row.created_at,
                updated_at: row.updated_at ?? null,
                parent_id: row.parent_id ?? null,
                user_id: row.user_id,
                listing_id: row.listing_id,
                author: rawAuthor
                    ? { id: rawAuthor.id, full_name: rawAuthor.full_name ?? null, avatar_url: avatar_url ?? null }
                    : null,
                listing: rawListing
                    ? { id: rawListing.id, title: rawListing.title, slug: rawListing.slug }
                    : null,
            };
        });
        return { data: comments, count: (count ?? 0) as number };
    }

    async findAdminListingActivities(
        options: AdminListingActivitiesFilterOptions
    ): Promise<{ data: AdminListingActivity[]; count: number }> {
        const { limit = 10, sortByKey, sortByOrder, range, listing_id, activity_type } = options;

        let query = this.supabase
            .from(TABLE_LISTING_ACTIVITIES)
            .select(SELECT_LISTING_ACTIVITY_ADMIN, { count: "exact" });

        if (listing_id) {
            query = query.eq("listing_id", listing_id);
        }
        if (activity_type) {
            query = query.eq("activity_type", activity_type);
        }

        const orderKey = resolveOrderKey(sortByKey ?? undefined, "created_at", ALLOWED_ADMIN_ACTIVITY_SORT_KEYS);
        query = query.order(orderKey, { ascending: sortByOrder ?? false });

        if (range) {
            query = query.range(range.start, range.end);
        } else {
            query = query.range(0, limit - 1);
        }

        const { data, error, count } = await query;

        if (error) {
            throw new DatabaseError(`Error fetching admin listing activities: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE_LISTING_ACTIVITIES },
            });
        }

        const rows = (data ?? []) as Array<{
            id: string;
            activity_type: string;
            created_at: string;
            user_id: string | null;
            listing_id: string;
            author?: Array<{ id: string; full_name: string | null; user_profiles?: { avatar_url?: string | null } | null }> | { id: string; full_name: string | null; user_profiles?: { avatar_url?: string | null } | null } | null;
            listing?: Array<{ id: string; title: string; slug: string }> | { id: string; title: string; slug: string } | null;
        }>;

        const activities: AdminListingActivity[] = rows.map((row) => {
            const rawAuthor = Array.isArray(row.author) ? row.author[0] ?? null : row.author ?? null;
            const profile = rawAuthor?.user_profiles;
            const avatar_url =
                profile && typeof profile === "object" && "avatar_url" in profile
                    ? profile.avatar_url
                    : null;
            const rawListing = Array.isArray(row.listing) ? row.listing[0] ?? null : row.listing ?? null;
            return {
                id: row.id,
                activity_type: row.activity_type as ListingActivityType,
                created_at: row.created_at,
                user_id: row.user_id,
                listing_id: row.listing_id,
                author: rawAuthor
                    ? { id: rawAuthor.id, full_name: rawAuthor.full_name ?? null, avatar_url: avatar_url ?? null }
                    : null,
                listing: rawListing
                    ? { id: rawListing.id, title: rawListing.title, slug: rawListing.slug }
                    : null,
            };
        });
        return { data: activities, count: (count ?? 0) as number };
    }

    async approveListingComment(commentId: string): Promise<{ id: string; listing_id: string }> {
        const { data, error } = await this.supabase
            .from(TABLE_LISTING_COMMENTS)
            .update({ is_approved: true, updated_at: new Date().toISOString() })
            .eq("id", commentId)
            .select("id, listing_id")
            .single();

        if (error || !data?.id) {
            throw new DatabaseError("Error approving listing comment", {
                cause: error as unknown as Error,
                operation: "update",
                resource: { type: "table", name: TABLE_LISTING_COMMENTS },
            });
        }
        return { id: data.id as string, listing_id: data.listing_id as string };
    }

    async deleteListingComment(commentId: string): Promise<{ listing_id: string }> {
        const { data, error } = await this.supabase
            .from(TABLE_LISTING_COMMENTS)
            .delete()
            .eq("id", commentId)
            .select("listing_id")
            .single();

        if (error || !data?.listing_id) {
            throw new DatabaseError("Error deleting listing comment", {
                cause: error as unknown as Error,
                operation: "delete",
                resource: { type: "table", name: TABLE_LISTING_COMMENTS },
            });
        }
        return { listing_id: data.listing_id as string };
    }
}
