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
    ListingComment,
    ListingStackMember,
    StackMemberRef,
} from "../data/types/listingTypes";
import type {
    ListingCreateSchemaType,
    ListingUpdateSchemaType,
    ListingTagRefSchemaType,
    ListingCommentCreateSchemaType,
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
const TABLE_STACK_MEMBERS = "listing_stack_members";
const TABLE_LISTING_RATINGS = "listing_ratings";

const RPC_GET_LISTING_CREATORS = "get_listing_creators";
const RPC_GET_LISTING_STATISTICS = "get_listing_statistics";

export type ListingStatisticsProgrammerModel = {
    totalListings: number;
    totalLikes: number;
    totalViews: number;
    totalClicks: number;
    totalRatings: number;
    totalBookmarks: number;
};

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
  skill_commands,
  stack_blueprint,
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
  owner:users!owner_id(id, full_name, username, user_profiles(avatar_url, tag_line)),
  listing_stack_members!listing_stack_members_stack_listing_id_fkey(
    id,
    stack_listing_id,
    member_listing_id,
    member_role,
    sort_order,
    member:listings!listing_stack_members_member_listing_id_fkey(
      id,
      title,
      slug,
      extension_type,
      excerpt,
      logo_image_url,
      is_official,
      install_command_skills,
      install_command_mcp,
      click_url_skills,
      click_url_mcp
    )
  )
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

const SELECT_LISTING_COMMENT = `
  id,
  content,
  is_approved,
  created_at,
  updated_at,
  parent_id,
  user_id,
  author:users!user_id(id, full_name, user_profiles(avatar_url))
`;

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

    async findOwnedListings(
        ownerId: string,
        options: { listingKind?: ListingKind; limit?: number } = {}
    ): Promise<{ data: ListingLike[]; count: number }> {
        const { listingKind, limit = 200 } = options;

        let query = this.supabase
            .from(TABLE_LISTINGS)
            .select(SELECT_LISTING, { count: "exact" })
            .eq("owner_id", ownerId);

        if (listingKind) {
            query = query.eq("listing_kind", listingKind);
        }

        query = query.order("updated_at", { ascending: false }).range(0, Math.max(limit - 1, 0));

        const { data, error, count } = await query;

        if (error) {
            throw new DatabaseError(`Error fetching owned listings: ${error.message}`, {
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
        isAdminPublished: boolean,
        stackMembers: StackMemberRef[] = []
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
        if (listing.listing_kind === "stack") {
            await this.syncStackMembers(savedListingId, stackMembers);
        }

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
        isAdminPublished: boolean,
        stackMembers: StackMemberRef[] = []
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
        if (listing.listing_kind === "stack") {
            await this.syncStackMembers(id, stackMembers);
        }

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

    async syncStackMembers(stackListingId: string, members: StackMemberRef[]): Promise<void> {
        const { error: deleteError } = await this.supabase
            .from(TABLE_STACK_MEMBERS)
            .delete()
            .eq("stack_listing_id", stackListingId);

        if (deleteError) {
            throw new DatabaseError(`Error clearing stack members: ${deleteError.message}`, {
                cause: deleteError as unknown as Error,
                operation: "delete",
                resource: { type: "table", name: TABLE_STACK_MEMBERS },
            });
        }

        if (members.length === 0) return;

        const { error: insertError } = await this.supabase.from(TABLE_STACK_MEMBERS).insert(
            members.map((member, index) => ({
                stack_listing_id: stackListingId,
                member_listing_id: member.member_listing_id,
                member_role: member.member_role,
                sort_order: member.sort_order ?? index,
            }))
        );

        if (insertError) {
            throw new DatabaseError(`Error syncing stack members: ${insertError.message}`, {
                cause: insertError as unknown as Error,
                operation: "insert",
                resource: { type: "table", name: TABLE_STACK_MEMBERS },
            });
        }
    }

    async findStackMembers(stackListingId: string): Promise<{ data: ListingStackMember[] }> {
        const { data, error } = await this.supabase
            .from(TABLE_STACK_MEMBERS)
            .select(
                `
                id,
                stack_listing_id,
                member_listing_id,
                member_role,
                sort_order,
                member:member_listing_id(
                  id,
                  title,
                  slug,
                  extension_type,
                  excerpt,
                  logo_image_url,
                  is_official,
                  install_command_skills,
                  install_command_mcp
                )
              `
            )
            .eq("stack_listing_id", stackListingId)
            .order("sort_order", { ascending: true });

        if (error) {
            throw new DatabaseError(`Error fetching stack members: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE_STACK_MEMBERS },
            });
        }

        return { data: this.mapStackMemberRows(data ?? []) };
    }

    async cloneStack(sourceStackId: string, ownerId: string): Promise<{ id: string }> {
        const { data: source } = await this.findListingById(sourceStackId);
        if (source.listing_kind !== "stack") {
            throw new ValidationError("Only stacks can be cloned.");
        }
        if (source.is_user_published !== true || source.is_admin_published !== true) {
            throw new ValidationError("Only published stacks can be cloned.");
        }

        const { data: members } = await this.findStackMembers(sourceStackId);
        const tagRefs: ListingTagRefSchemaType[] = (source.listings_listing_tags_association ?? [])
            .flatMap((row) => {
                const lt = row.listing_tags;
                if (!lt) return [];
                const items = Array.isArray(lt) ? lt : [lt];
                return items.map((t) => ({ id: t.id, slug: t.slug }));
            });

        const cloneTitle = `${source.title} (Copy)`;
        const { savedListingId } = await this.createListing(
            {
                title: cloneTitle,
                excerpt: source.excerpt ?? null,
                click_url: source.click_url ?? null,
                click_url_skills: source.click_url_skills ?? null,
                click_url_mcp: source.click_url_mcp ?? null,
                description: source.description ?? null,
                description_skills: source.description_skills ?? null,
                description_mcp: source.description_mcp ?? null,
                content: source.content ?? null,
                content_skills: source.content_skills ?? null,
                content_mcp: source.content_mcp ?? null,
                listing_kind: "stack",
                extension_type: null,
                install_command_skills: source.install_command_skills ?? null,
                install_command_mcp: source.install_command_mcp ?? null,
                is_official: false,
                source_repo_url: source.source_repo_url ?? null,
                skill_source_url: source.skill_source_url ?? null,
                skill_name: source.skill_name ?? null,
                skill_metadata: (source.skill_metadata as Record<string, unknown> | null) ?? null,
                source_synced_at: source.source_synced_at ?? null,
                source_content_hash: source.source_content_hash ?? null,
                license: source.license ?? null,
                version: source.version ?? null,
                mcp_tools: source.mcp_tools ?? null,
                skill_commands: source.skill_commands ?? null,
                stack_blueprint: source.stack_blueprint as ListingCreateSchemaType["stack_blueprint"],
                mcp_transport: (source.mcp_transport as "stdio" | "sse" | "http" | null) ?? null,
                mcp_server_config: (source.mcp_server_config as Record<string, unknown> | null) ?? null,
                listing_category_id: source.listing_category_id ?? "",
                listing_image_urls: source.listing_image_urls ?? null,
                default_image_url: source.default_image_url ?? null,
                logo_image_url: source.logo_image_url ?? null,
                is_user_published: false,
                is_admin_published: false,
                schema_type: (source.schema_type as ListingCreateSchemaType["schema_type"]) ?? "SoftwareApplication",
                schema_json: (source.schema_json as Record<string, unknown> | null) ?? null,
                faq: Array.isArray(source.faq) ? (source.faq as ListingCreateSchemaType["faq"]) : [],
            },
            tagRefs,
            ownerId,
            false,
            members.map((member, index) => ({
                member_listing_id: member.member_listing_id,
                member_role: member.member_role,
                sort_order: member.sort_order ?? index,
            }))
        );

        const { error: provenanceError } = await this.supabase
            .from(TABLE_LISTINGS)
            .update({ cloned_from_listing_id: sourceStackId })
            .eq("id", savedListingId);

        if (provenanceError) {
            throw new DatabaseError(`Error setting clone provenance: ${provenanceError.message}`, {
                cause: provenanceError as unknown as Error,
                operation: "update",
            });
        }

        return { id: savedListingId };
    }

    async findListingComments(listingId: string): Promise<{ data: ListingComment[] }> {
        const { data, error } = await this.supabase
            .from(TABLE_LISTING_COMMENTS)
            .select(SELECT_LISTING_COMMENT)
            .eq("listing_id", listingId)
            .eq("is_approved", true)
            .order("created_at", { ascending: true });

        if (error) {
            throw new DatabaseError(`Error fetching listing comments: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE_LISTING_COMMENTS },
            });
        }

        return { data: this.mapListingCommentRows(data ?? []) };
    }

    async createListingComment(
        payload: ListingCommentCreateSchemaType,
        userId: string
    ): Promise<{ id: string; listing_id: string }> {
        const { data, error } = await this.supabase
            .from(TABLE_LISTING_COMMENTS)
            .insert({
                listing_id: payload.listing_id,
                parent_id: payload.parent_id ?? null,
                content: payload.content,
                user_id: userId,
                is_approved: false,
            })
            .select("id, listing_id")
            .single();

        if (error || !data?.id) {
            throw new DatabaseError(`Error creating listing comment: ${error?.message ?? "no id returned"}`, {
                cause: error as unknown as Error,
                operation: "insert",
                resource: { type: "table", name: TABLE_LISTING_COMMENTS },
            });
        }

        return { id: data.id as string, listing_id: data.listing_id as string };
    }

    async upsertListingRating(
        listingId: string,
        userId: string,
        rating: number
    ): Promise<{ id: string }> {
        const { data, error } = await this.supabase
            .from(TABLE_LISTING_RATINGS)
            .upsert(
                {
                    listing_id: listingId,
                    user_id: userId,
                    rating,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id,listing_id" }
            )
            .select("id")
            .single();

        if (error || !data?.id) {
            throw new DatabaseError(`Error upserting listing rating: ${error?.message ?? "no id returned"}`, {
                cause: error as unknown as Error,
                operation: "upsert",
                resource: { type: "table", name: TABLE_LISTING_RATINGS },
            });
        }

        return { id: data.id as string };
    }

    private mapStackMemberRows(rows: unknown[]): ListingStackMember[] {
        return rows.map((row) => {
            const r = row as {
                id: string;
                stack_listing_id: string;
                member_listing_id: string;
                member_role: "skills" | "mcp";
                sort_order: number;
                member?:
                    | Array<{
                          id: string;
                          title: string;
                          slug: string;
                          extension_type: string | null;
                          excerpt: string | null;
                          logo_image_url: string | null;
                          is_official: boolean | null;
                          install_command_skills: string | null;
                          install_command_mcp: string | null;
                      }>
                    | {
                          id: string;
                          title: string;
                          slug: string;
                          extension_type: string | null;
                          excerpt: string | null;
                          logo_image_url: string | null;
                          is_official: boolean | null;
                          install_command_skills: string | null;
                          install_command_mcp: string | null;
                      }
                    | null;
            };
            const rawMember = Array.isArray(r.member) ? r.member[0] ?? null : r.member ?? null;
            return {
                id: r.id,
                stack_listing_id: r.stack_listing_id,
                member_listing_id: r.member_listing_id,
                member_role: r.member_role,
                sort_order: r.sort_order,
                member: rawMember
                    ? {
                          id: rawMember.id,
                          title: rawMember.title,
                          slug: rawMember.slug,
                          extension_type: rawMember.extension_type ?? null,
                          excerpt: rawMember.excerpt ?? null,
                          logo_image_url: rawMember.logo_image_url ?? null,
                          is_official: rawMember.is_official ?? null,
                          install_command_skills: rawMember.install_command_skills ?? null,
                          install_command_mcp: rawMember.install_command_mcp ?? null,
                      }
                    : null,
            };
        });
    }

    async findListingStatsByOwnerId(ownerId: string): Promise<ListingStatisticsProgrammerModel> {
        const { data, error } = await this.supabase.rpc(RPC_GET_LISTING_STATISTICS, {
            logged_user_id: ownerId,
        });

        if (error) {
            throw new DatabaseError(`Error fetching listing statistics: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "rpc",
                resource: { type: "function", name: RPC_GET_LISTING_STATISTICS },
            });
        }

        const stats = (data ?? {}) as {
            total_listings?: number;
            total_likes?: number;
            total_views?: number;
            total_clicks?: number;
            total_ratings?: number;
            total_bookmarks?: number;
        };

        return {
            totalListings: stats.total_listings ?? 0,
            totalLikes: stats.total_likes ?? 0,
            totalViews: stats.total_views ?? 0,
            totalClicks: stats.total_clicks ?? 0,
            totalRatings: stats.total_ratings ?? 0,
            totalBookmarks: stats.total_bookmarks ?? 0,
        };
    }

    private mapListingCommentRows(rows: unknown[]): ListingComment[] {
        return rows.map((row) => {
            const r = row as {
                id: string;
                content: string;
                is_approved: boolean;
                created_at: string;
                updated_at: string | null;
                parent_id: string | null;
                user_id: string;
                author?:
                    | Array<{ id: string; full_name: string | null; user_profiles?: { avatar_url?: string | null } | null }>
                    | { id: string; full_name: string | null; user_profiles?: { avatar_url?: string | null } | null }
                    | null;
            };
            const rawAuthor = Array.isArray(r.author) ? r.author[0] ?? null : r.author ?? null;
            const profile = rawAuthor?.user_profiles;
            const avatar_url =
                profile && typeof profile === "object" && "avatar_url" in profile
                    ? profile.avatar_url
                    : null;
            return {
                id: r.id,
                content: r.content,
                is_approved: r.is_approved,
                created_at: r.created_at,
                updated_at: r.updated_at ?? null,
                parent_id: r.parent_id ?? null,
                user_id: r.user_id,
                author: rawAuthor
                    ? { id: rawAuthor.id, full_name: rawAuthor.full_name ?? null, avatar_url: avatar_url ?? null }
                    : null,
            };
        });
    }
}
