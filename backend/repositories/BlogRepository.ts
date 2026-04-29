import type { SupabaseClient } from "@supabase/supabase-js";
import type {
    PublishedBlogPostsFilterOptions,
    AdminBlogPostsFilterOptions,
    AdminBlogCommentsFilterOptions,
    AdminBlogActivitiesFilterOptions,
    PublishedBlogAuthor,
    BlogTopic,
    ActiveBlogTopic,
    BlogComment,
    AdminBlogComment,
    AdminBlogActivity,
    BlogActivityType,
} from "../data/types/blogTypes";
import type {
    BlogPostCreateSchemaType,
    BlogPostUpdateSchemaType,
    BlogTopicCreateSchemaType,
    BlogTopicUpdateSchemaType,
    BlogCommentCreateSchemaType,
    BlogCommentUpdateSchemaType,
} from "../data/schemas/blogSchemas";
import type { BlogActivityLike, BlogPostLike } from "../utils/dtos/BlogDTO";

import { DatabaseError, DatabaseEntityNotFoundError, ValidationError } from "../errors/InfraError";
import { logger } from "../utils/Logger";
import { stringToSlug } from "../utils/slug";

const RPC_GET_PUBLISHED_BLOG_AUTHORS = "get_published_blog_authors";
const RPC_GET_ACTIVE_BLOG_TOPICS = "get_active_blog_topics";

const TABLE_NAME_BLOG_POSTS = "blog_posts";
const TABLE_NAME_BLOG_TOPICS = "blog_topics";
const TABLE_NAME_BLOG_COMMENTS = "blog_comments";
const TABLE_NAME_BLOG_ACTIVITIES = "blog_activities";
const ALLOWED_PUBLISHED_POST_SORT_KEYS = new Set([
    "published_at",
    "created_at",
    "updated_at",
    "title",
    "view_count",
    "like_count",
]);
const ALLOWED_ADMIN_POST_SORT_KEYS = new Set([
    "created_at",
    "updated_at",
    "published_at",
    "title",
    "view_count",
    "like_count",
    "is_admin_approved",
    "is_user_published",
]);
const ALLOWED_ADMIN_COMMENT_SORT_KEYS = new Set(["created_at", "updated_at", "is_approved"]);
const ALLOWED_ADMIN_ACTIVITY_SORT_KEYS = new Set(["created_at", "activity_type"]);

function resolveOrderKey(
    candidate: string | null | undefined,
    fallback: string,
    allowlist: Set<string>
): string {
    const key = candidate?.toString().trim();
    if (!key) return fallback;
    return allowlist.has(key) ? key : fallback;
}

/** Select for blog topic list: id, name, slug, description, parent_id, and nested parent topic. */
const SELECT_BLOG_TOPIC = `
  id,
  name,
  slug,
  description,
  parent_id,
  parent:blog_topics(id, name, slug)
`;

/** Single select for blog posts: topic optional (no !inner) so list and by-id both work. Author from users + user_profiles (avatar_url, website_url, tag_line). */
const SELECT_BLOG_POST = `
  id,
  user_id,
  title,
  description,
  slug,
  is_sponsored,
  is_featured,
  is_admin_approved,
  is_user_published,
  hero_image_filename,
  reading_time_minutes,
  created_at,
  published_at,
  topic_id,
  content,
  view_count,
  like_count,
  updated_at,
  topic:blog_topics(id, name, slug),
  author:users!user_id(id, full_name, user_profiles(avatar_url, website_url, tag_line))
`;

/** Select for approved post comments: id, content, is_approved, created_at, updated_at, parent_id, user_id, author (users + user_profiles). */
const SELECT_BLOG_COMMENT = `
  id,
  content,
  is_approved,
  created_at,
  updated_at,
  parent_id,
  user_id,
  author:users!user_id(id, full_name, user_profiles(avatar_url))
`;

/** Select for admin comments list: same as SELECT_BLOG_COMMENT plus post_id and post title/slug for admin UI. */
const SELECT_BLOG_COMMENT_ADMIN = `
  id,
  content,
  is_approved,
  created_at,
  updated_at,
  parent_id,
  user_id,
  post_id,
  author:users!user_id(id, full_name, user_profiles(avatar_url)),
  blog_post:post_id(id, title, slug)
`;

/** Select for admin blog activities list: id, activity_type, created_at, user_id, post_id, author, blog_post. */
const SELECT_BLOG_ACTIVITY = `
  id,
  activity_type,
  created_at,
  user_id,
  post_id,
  author:users!user_id(id, full_name, user_profiles(avatar_url)),
  blog_post:post_id(id, title, slug)
`;

export class BlogRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    /**
     * Returns published and approved blog posts with optional filters (topicId, searchTerm, authorId, sort, range/skip/limit).
     */
    async findPublishedBlogPosts(
        options: PublishedBlogPostsFilterOptions
    ): Promise<{ data: BlogPostLike[]; count: number }> {
        const {
            limit = 10,
            skipId,
            skip = 0,
            searchTerm,
            topicId,
            sortByKey,
            sortByOrder,
            range,
            authorId,
        } = options;

        let query = this.supabase
            .from(TABLE_NAME_BLOG_POSTS)
            .select(SELECT_BLOG_POST, { count: "exact" })
            .match({
                is_user_published: true,
                is_admin_approved: true,
            });

        if (topicId && topicId !== "all") {
            query = query.eq("topic_id", topicId);
        }
        if (searchTerm) {
            query = query.textSearch("fts", searchTerm.replace(/\s+/g, "+"));
        }
        if (skipId) {
            query = query.not("id", "eq", skipId);
        }
        if (authorId) {
            query = query.eq("user_id", authorId);
        }

        const orderKey = resolveOrderKey(sortByKey ?? undefined, "published_at", ALLOWED_PUBLISHED_POST_SORT_KEYS);
        query = query.order(orderKey, { ascending: sortByOrder ?? false });

        if (range) {
            query = query.range(range.start, range.end);
        } else {
            query = query.range(skip, skip + limit - 1);
        }

        const { data, error, count } = await query;

        if (error) {
            const cause = error as unknown as Error;
            const detail = cause?.message ? `: ${cause.message}` : "";
            throw new DatabaseError(`Error fetching published blog posts${detail}`, {
                cause,
                operation: "select",
                resource: { type: "table", name: TABLE_NAME_BLOG_POSTS },
            });
        }

        return { data: (data ?? []) as BlogPostLike[], count: (count ?? 0) as number };
    }

    /**
     * Returns all blog posts for admin listing (no published/approved filter).
     * Supports topicId, searchTerm, limit, range, sortByKey (default created_at), sortByOrder.
     */
    async findAdminBlogPosts(
        options: AdminBlogPostsFilterOptions
    ): Promise<{ data: BlogPostLike[]; count: number }> {
        const {
            limit = 10,
            searchTerm,
            topicId,
            sortByKey,
            sortByOrder,
            range,
        } = options;

        let query = this.supabase
            .from(TABLE_NAME_BLOG_POSTS)
            .select(SELECT_BLOG_POST, { count: "exact" });

        if (topicId && topicId !== "all") {
            query = query.eq("topic_id", topicId);
        }
        if (searchTerm) {
            query = query.textSearch("fts", searchTerm.replace(/\s+/g, "+"));
        }

        const orderKey = resolveOrderKey(sortByKey ?? undefined, "created_at", ALLOWED_ADMIN_POST_SORT_KEYS);
        query = query.order(orderKey, { ascending: sortByOrder ?? false });

        if (range) {
            query = query.range(range.start, range.end);
        } else {
            query = query.range(0, limit - 1);
        }

        const { data, error, count } = await query;

        if (error) {
            const cause = error as unknown as Error;
            const detail = cause?.message ? `: ${cause.message}` : "";
            throw new DatabaseError(`Error fetching admin blog posts${detail}`, {
                cause,
                operation: "select",
                resource: { type: "table", name: TABLE_NAME_BLOG_POSTS },
            });
        }

        return { data: (data ?? []) as BlogPostLike[], count: (count ?? 0) as number };
    }

    /**
     * Returns all users who have at least one published and approved blog post.
     * Uses RPC get_published_blog_authors (profile fields from user_profiles).
     */
    async getPublishedBlogAuthors(): Promise<{ data: PublishedBlogAuthor[] }> {
        const { data, error } = await this.supabase.rpc(RPC_GET_PUBLISHED_BLOG_AUTHORS);

        if (error) {
            logger.error({
                msg: "Database error during get_published_blog_authors",
                error: error.message,
            });
            throw new DatabaseError("Error getting published blog authors", {
                cause: error as unknown as Error,
                operation: "rpc",
                resource: { type: "rpc", name: RPC_GET_PUBLISHED_BLOG_AUTHORS },
            });
        }
        return { data: (data ?? []) as PublishedBlogAuthor[] };
    }

    /**
     * Returns a single published and approved blog post by slug, or null if not found.
     * Used by public GET /posts/:identifier (slug). Treats PGRST116 (no rows) as null.
     * Uses SELECT_BLOG_POST (author id, full_name only) so it works in test DBs without optional user columns.
     */
    async findPublishedBlogPostBySlug(slug: string): Promise<{ data: BlogPostLike | null }> {
        const { data, error } = await this.supabase
            .from(TABLE_NAME_BLOG_POSTS)
            .select(SELECT_BLOG_POST)
            .match({
                slug,
                is_user_published: true,
                is_admin_approved: true,
            })
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return { data: null };
            }
            logger.error({
                msg: "Database error during getting published blog post by slug",
                error: error.message,
            });
            throw new DatabaseError("Error getting published blog post by slug", {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE_NAME_BLOG_POSTS },
            });
        }
        return { data: data as unknown as BlogPostLike | null };
    }

    async findBlogPostByBlogId(id: string): Promise<{ data: BlogPostLike }> {
        const { data, error } = await this.supabase
            .from(TABLE_NAME_BLOG_POSTS)
            .select(SELECT_BLOG_POST)
            .match({ id })
            .single();

        if (error) {
            if ((error as { code?: string }).code === "PGRST116") {
                throw new DatabaseEntityNotFoundError("blog_posts", { id });
            }
            logger.error({
                msg: "Database error during getting blog post by id",
                error: error.message,
            });
            throw new DatabaseError("Error getting blog post by id", {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE_NAME_BLOG_POSTS },
            });
        }
        return { data: data as unknown as BlogPostLike };
    }

    async createOne(
        post: BlogPostCreateSchemaType,
        userId: string,
        slug: string,
        isAdminApproved: boolean
    ): Promise<{
        savedBlogPostId: string;
        title: string;
        slug: string;
        isAdminApproved: boolean;
        isUserApproved: boolean;
    }> {
        const isUserApproved = post.is_user_published === true;
        const row = {
            title: post.title,
            description: post.description,
            content: post.content,
            topic_id: post.topic_id,
            hero_image_filename: post.hero_image_filename,
            is_sponsored: post.is_sponsored ?? false,
            is_featured: post.is_featured ?? false,
            is_user_published: post.is_user_published ?? false,
            is_admin_approved: isAdminApproved,
            user_id: userId,
            slug,
        };
        const { data, error } = await this.supabase
            .from(TABLE_NAME_BLOG_POSTS)
            .insert(row)
            .select("id, title, slug")
            .single();

        if (error || !data?.id) {
            const isDuplicateKey =
                error?.message?.includes("duplicate key") ?? false;
            if (isDuplicateKey) {
                throw new ValidationError(
                    "A blog post with this title already exists. Please choose a different title."
                );
            }
            const causeMsg = error?.message ?? (error as Error)?.message;
            const detail = causeMsg ? `: ${causeMsg}` : ": no id returned";
            throw new DatabaseError(`Error creating blog post${detail}`, {
                cause: error as unknown as Error,
                operation: "insert",
                resource: { type: "table", name: TABLE_NAME_BLOG_POSTS },
            });
        }
        return {
            savedBlogPostId: data.id as string,
            title: data.title as string,
            slug: data.slug as string,
            isAdminApproved,
            isUserApproved,
        };
    }

    /**
     * Update an existing blog post by id (Listing-style). Takes form data plus slug, isAdminApproved, updatedAt.
     * Returns savedBlogPostId, title, slug, isAdminApproved, isUserApproved.
     */
    async updateOne(
        id: string,
        post: BlogPostUpdateSchemaType,
        slug: string,
        isAdminApproved: boolean,
        updatedAt: string
    ): Promise<{
        savedBlogPostId: string;
        title: string;
        slug: string;
        isAdminApproved: boolean;
        isUserApproved: boolean;
    }> {
        const isUserApproved = post.is_user_published === true;
        const row = {
            title: post.title,
            description: post.description,
            content: post.content,
            topic_id: post.topic_id,
            hero_image_filename: post.hero_image_filename,
            is_sponsored: post.is_sponsored ?? false,
            is_featured: post.is_featured ?? false,
            is_user_published: post.is_user_published ?? false,
            is_admin_approved: isAdminApproved,
            slug,
            updated_at: updatedAt,
        };
        const { data, error } = await this.supabase
            .from(TABLE_NAME_BLOG_POSTS)
            .update(row)
            .eq("id", id)
            .select("id, title, slug")
            .single();

        if (error) {
            throw new DatabaseError("Error updating blog post", {
                cause: error as unknown as Error,
                operation: "update",
                resource: { type: "table", name: TABLE_NAME_BLOG_POSTS },
            });
        }
        if (!data?.id) {
            throw new DatabaseError("Error updating blog post: no row returned", {
                operation: "update",
                resource: { type: "table", name: TABLE_NAME_BLOG_POSTS },
            });
        }
        return {
            savedBlogPostId: data.id as string,
            title: data.title as string,
            slug: data.slug as string,
            isAdminApproved,
            isUserApproved,
        };
    }

    /**
     * Delete a blog post by id. Ported from template deleteBlogPost. Caller must enforce editor/admin.
     */
    async deleteBlogPost(id: string): Promise<void> {
        const { error } = await this.supabase
            .from(TABLE_NAME_BLOG_POSTS)
            .delete()
            .eq("id", id);

        if (error) {
            logger.error({
                msg: "Database error during delete blog post",
                error: error.message,
            });
            throw new DatabaseError("Error deleting blog post. Contact Support.", {
                cause: error as unknown as Error,
                operation: "delete",
                resource: { type: "table", name: TABLE_NAME_BLOG_POSTS },
            });
        }
    }

    /**
     * Create a blog topic. Slug is derived from name.
     * Returns { id, name }. Throws ValidationError on duplicate name/slug, DatabaseError otherwise.
     */
    async createTopic(
        payload: BlogTopicCreateSchemaType
    ): Promise<{ id: string; name: string }> {
        const slug = stringToSlug(payload.name);
        const row = {
            name: payload.name,
            description: payload.description,
            parent_id: payload.parent_id ?? null,
            slug,
        };
        const { data, error } = await this.supabase
            .from(TABLE_NAME_BLOG_TOPICS)
            .insert(row)
            .select("id, name")
            .single();

        if (error || !data?.id) {
            const isDuplicateKey = error?.message?.includes("duplicate key") ?? false;
            if (isDuplicateKey) {
                throw new ValidationError(
                    "A blog topic with this name already exists. Please choose a different name."
                );
            }
            const causeMsg = error?.message ?? (error as Error)?.message;
            const detail = causeMsg ? `: ${causeMsg}` : ": no id returned";
            throw new DatabaseError(`Error creating blog topic${detail}`, {
                cause: error as unknown as Error,
                operation: "insert",
                resource: { type: "table", name: TABLE_NAME_BLOG_TOPICS },
            });
        }
        return { id: data.id as string, name: data.name as string };
    }

    /**
     * Delete a blog topic by id. Fails if any post uses this topic or if topic has child topics.
     * Ported from template deleteBlogTopic.
     */
    async deleteBlogTopic(id: string): Promise<void> {
        const { data: postsWithTopic, error: postsError } = await this.supabase
            .from(TABLE_NAME_BLOG_POSTS)
            .select("id")
            .eq("topic_id", id)
            .limit(1);

        if (postsError) {
            logger.error({
                msg: "Database error checking for blog posts with topic",
                error: postsError.message,
            });
            throw new DatabaseError("Error checking for blog posts with topic. Contact Support.", {
                cause: postsError as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE_NAME_BLOG_POSTS },
            });
        }
        if (postsWithTopic && postsWithTopic.length > 0) {
            throw new ValidationError(
                "Cannot delete topic that is being used by blog posts. Please remove or reassign the blog posts first."
            );
        }

        const { data: childTopics, error: childError } = await this.supabase
            .from(TABLE_NAME_BLOG_TOPICS)
            .select("id")
            .eq("parent_id", id)
            .limit(1);

        if (childError) {
            logger.error({
                msg: "Database error checking for child topics",
                error: childError.message,
            });
            throw new DatabaseError("Error checking for child topics. Contact Support.", {
                cause: childError as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE_NAME_BLOG_TOPICS },
            });
        }
        if (childTopics && childTopics.length > 0) {
            throw new ValidationError(
                "Cannot delete topic that has child topics. Please remove or reassign the child topics first."
            );
        }

        const { error: deleteError } = await this.supabase
            .from(TABLE_NAME_BLOG_TOPICS)
            .delete()
            .eq("id", id);

        if (deleteError) {
            logger.error({
                msg: "Database error during delete blog topic",
                error: deleteError.message,
            });
            throw new DatabaseError("Error deleting blog topic. Contact Support.", {
                cause: deleteError as unknown as Error,
                operation: "delete",
                resource: { type: "table", name: TABLE_NAME_BLOG_TOPICS },
            });
        }
    }

    /**
     * Update a blog topic by id. Slug is derived from name.
     * Throws DatabaseError on failure.
     */
    async updateTopic(
        id: string,
        payload: BlogTopicUpdateSchemaType
    ): Promise<{ id: string; name: string }> {
        const slug = stringToSlug(payload.name);
        const row = {
            name: payload.name,
            description: payload.description,
            parent_id: payload.parent_id ?? null,
            slug,
            updated_at: new Date().toISOString(),
        };
        const { data, error } = await this.supabase
            .from(TABLE_NAME_BLOG_TOPICS)
            .update(row)
            .eq("id", id)
            .select("id, name")
            .single();

        if (error) {
            logger.error({
                msg: "Database error during update blog topic",
                error: error.message,
            });
            throw new DatabaseError("Error updating blog topic. Contact Support.", {
                cause: error as unknown as Error,
                operation: "update",
                resource: { type: "table", name: TABLE_NAME_BLOG_TOPICS },
            });
        }
        if (!data?.id) {
            throw new DatabaseError("Error updating blog topic: no row returned", {
                operation: "update",
                resource: { type: "table", name: TABLE_NAME_BLOG_TOPICS },
            });
        }
        return { id: data.id as string, name: data.name as string };
    }

    /**
     * Returns all blog topics (id, name, slug, description, parent_id, parent) ordered by name.
     * Used for dropdowns and topic list. Ported from template SELECT_BLOG_TOPIC.
     */
    async findBlogTopics(): Promise<{ data: BlogTopic[] }> {
        const { data, error } = await this.supabase
            .from(TABLE_NAME_BLOG_TOPICS)
            .select(SELECT_BLOG_TOPIC)
            .order("name", { ascending: true });

        if (error) {
            logger.error({
                msg: "Database error during find blog topics",
                error: error.message,
            });
            throw new DatabaseError("Error fetching blog topics", {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE_NAME_BLOG_TOPICS },
            });
        }
        const rows = (data ?? []) as Array<{
            id: string;
            name: string;
            slug: string;
            description?: string | null;
            parent_id?: string | null;
            parent?: Array<{ id: string; name: string; slug: string }> | { id: string; name: string; slug: string } | null;
        }>;
        const topics: BlogTopic[] = rows.map((row) => ({
            id: row.id,
            name: row.name,
            slug: row.slug,
            description: row.description ?? null,
            parent_id: row.parent_id ?? null,
            parent: Array.isArray(row.parent) ? row.parent[0] ?? null : row.parent ?? null,
        }));
        return { data: topics };
    }

    /**
     * Returns active blog topics (topics that have at least one published post) with post_count.
     * Ported from template getActiveBlogTopics; uses RPC get_active_blog_topics.
     */
    async findActiveBlogTopics(): Promise<{ data: ActiveBlogTopic[] }> {
        const { data, error } = await this.supabase.rpc(RPC_GET_ACTIVE_BLOG_TOPICS);

        if (error) {
            logger.error({
                msg: "Database error during find active blog topics",
                error: error.message,
            });
            throw new DatabaseError("Error fetching active blog topics", {
                cause: error as unknown as Error,
                operation: "rpc",
                resource: { type: "rpc", name: RPC_GET_ACTIVE_BLOG_TOPICS },
            });
        }
        const rows = (data ?? []) as Array<{
            id: string;
            name: string;
            slug: string;
            description: string | null;
            parent_id: string | null;
            post_count: number;
        }>;
        const topics: ActiveBlogTopic[] = rows.map((row) => ({
            id: row.id,
            name: row.name,
            slug: row.slug,
            description: row.description ?? null,
            parent_id: row.parent_id ?? null,
            post_count: Number(row.post_count) ?? 0,
        }));
        return { data: topics };
    }

    /**
     * Returns approved comments for a post, ordered by created_at ascending.
     * Author from users + user_profiles (avatar_url). Ported from template getPostComments.
     */
    async findPostComments(postId: string): Promise<{ data: BlogComment[] }> {
        const { data, error } = await this.supabase
            .from(TABLE_NAME_BLOG_COMMENTS)
            .select(SELECT_BLOG_COMMENT)
            .eq("post_id", postId)
            .eq("is_approved", true)
            .order("created_at", { ascending: true });

        if (error) {
            logger.error({
                msg: "Database error during find post comments",
                error: error.message,
            });
            throw new DatabaseError("Error fetching post comments", {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE_NAME_BLOG_COMMENTS },
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
            author?: Array<{ id: string; full_name: string | null; user_profiles?: { avatar_url?: string | null } | null }> | { id: string; full_name: string | null; user_profiles?: { avatar_url?: string | null } | null } | null;
        }>;

        const comments: BlogComment[] = rows.map((row) => {
            const rawAuthor = Array.isArray(row.author) ? row.author[0] ?? null : row.author ?? null;
            const profile = rawAuthor?.user_profiles;
            const avatar_url = profile && typeof profile === "object" && "avatar_url" in profile ? profile.avatar_url : (rawAuthor as { avatar_url?: string | null })?.avatar_url ?? null;
            return {
                id: row.id,
                content: row.content,
                is_approved: row.is_approved,
                created_at: row.created_at,
                updated_at: row.updated_at ?? null,
                parent_id: row.parent_id ?? null,
                user_id: row.user_id,
                author: rawAuthor ? { id: rawAuthor.id, full_name: rawAuthor.full_name ?? null, avatar_url: avatar_url ?? null } : null,
            };
        });
        return { data: comments };
    }

    /**
     * Returns all blog comments for admin listing (no approved filter).
     * Ported from template getAdminBlogComments. Supports searchTerm, limit, range, sortByKey (default created_at), sortByOrder.
     */
    async findAdminBlogComments(
        options: AdminBlogCommentsFilterOptions
    ): Promise<{ data: AdminBlogComment[]; count: number }> {
        const {
            limit = 10,
            searchTerm,
            sortByKey,
            sortByOrder,
            range,
        } = options;

        let query = this.supabase
            .from(TABLE_NAME_BLOG_COMMENTS)
            .select(SELECT_BLOG_COMMENT_ADMIN, { count: "exact" });

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
            logger.error({
                msg: "Database error during find admin blog comments",
                error: error.message,
            });
            throw new DatabaseError("Error fetching admin blog comments", {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE_NAME_BLOG_COMMENTS },
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
            post_id: string;
            blog_post?: Array<{ id: string; title: string; slug: string }> | { id: string; title: string; slug: string } | null;
            author?: Array<{ id: string; full_name: string | null; user_profiles?: { avatar_url?: string | null } | null }> | { id: string; full_name: string | null; user_profiles?: { avatar_url?: string | null } | null } | null;
        }>;

        const comments: AdminBlogComment[] = rows.map((row) => {
            const rawAuthor = Array.isArray(row.author) ? row.author[0] ?? null : row.author ?? null;
            const profile = rawAuthor?.user_profiles;
            const avatar_url = profile && typeof profile === "object" && "avatar_url" in profile ? profile.avatar_url : (rawAuthor as { avatar_url?: string | null })?.avatar_url ?? null;
            const rawPost = Array.isArray(row.blog_post) ? row.blog_post[0] ?? null : row.blog_post ?? null;
            return {
                id: row.id,
                content: row.content,
                is_approved: row.is_approved,
                created_at: row.created_at,
                updated_at: row.updated_at ?? null,
                parent_id: row.parent_id ?? null,
                user_id: row.user_id,
                post_id: row.post_id,
                author: rawAuthor ? { id: rawAuthor.id, full_name: rawAuthor.full_name ?? null, avatar_url: avatar_url ?? null } : null,
                blog_post: rawPost ? { id: rawPost.id, title: rawPost.title, slug: rawPost.slug } : null,
            };
        });
        return { data: comments, count: (count ?? 0) as number };
    }

    /**
     * Create a blog comment. Only content, post_id, parent_id (optional) and user_id.
     * New comments start with is_approved: false.
     */
    async createComment(
        payload: BlogCommentCreateSchemaType,
        userId: string
    ): Promise<{ id: string }> {
        const row = {
            content: payload.content,
            post_id: payload.post_id,
            parent_id: payload.parent_id ?? null,
            user_id: userId,
            is_approved: false,
        };
        const { data, error } = await this.supabase
            .from(TABLE_NAME_BLOG_COMMENTS)
            .insert(row)
            .select("id")
            .single();

        if (error || !data?.id) {
            const causeMsg = error?.message ?? (error as Error)?.message;
            const detail = causeMsg ? `: ${causeMsg}` : ": no id returned";
            throw new DatabaseError(`Error creating blog comment${detail}`, {
                cause: error as unknown as Error,
                operation: "insert",
                resource: { type: "table", name: TABLE_NAME_BLOG_COMMENTS },
            });
        }
        return { id: data.id as string };
    }

    /**
     * Update a blog comment by id. Only the comment owner (user_id) can update.
     * Updates content and updated_at. Returns id and post_id for cache invalidation.
     */
    async updateComment(
        id: string,
        userId: string,
        payload: BlogCommentUpdateSchemaType
    ): Promise<{ id: string; post_id: string }> {
        const row = {
            content: payload.content,
            updated_at: new Date().toISOString(),
        };
        const { data, error } = await this.supabase
            .from(TABLE_NAME_BLOG_COMMENTS)
            .update(row)
            .eq("id", id)
            .eq("user_id", userId)
            .select("id, post_id")
            .single();

        if (error) {
            logger.error({
                msg: "Database error during update blog comment",
                error: error.message,
            });
            throw new DatabaseError("Error updating blog comment. Contact Support.", {
                cause: error as unknown as Error,
                operation: "update",
                resource: { type: "table", name: TABLE_NAME_BLOG_COMMENTS },
            });
        }
        if (!data?.id) {
            throw new DatabaseError("Comment not found or you are not the owner", {
                operation: "update",
                resource: { type: "table", name: TABLE_NAME_BLOG_COMMENTS },
            });
        }
        return { id: data.id as string, post_id: data.post_id as string };
    }

    /**
     * Approve a blog comment by id (admin/editor action; no user_id filter).
     * Sets is_approved: true and updated_at. Returns id and post_id for cache invalidation.
     */
    async approveComment(commentId: string): Promise<{ id: string; post_id: string }> {
        const row = {
            is_approved: true,
            updated_at: new Date().toISOString(),
        };
        const { data, error } = await this.supabase
            .from(TABLE_NAME_BLOG_COMMENTS)
            .update(row)
            .eq("id", commentId)
            .select("id, post_id")
            .single();

        if (error) {
            logger.error({
                msg: "Database error during approve blog comment",
                error: error.message,
            });
            throw new DatabaseError("Error approving blog comment. Contact Support.", {
                cause: error as unknown as Error,
                operation: "update",
                resource: { type: "table", name: TABLE_NAME_BLOG_COMMENTS },
            });
        }
        if (!data?.id) {
            throw new DatabaseError("Comment not found", {
                operation: "update",
                resource: { type: "table", name: TABLE_NAME_BLOG_COMMENTS },
            });
        }
        return { id: data.id as string, post_id: data.post_id as string };
    }

    /**
     * Delete a blog comment by id. Admin/editor action; no user_id filter. Returns post_id for cache invalidation.
     * Ported from template deleteComment.
     */
    async deleteComment(commentId: string): Promise<{ post_id: string }> {
        const { data, error } = await this.supabase
            .from(TABLE_NAME_BLOG_COMMENTS)
            .delete()
            .eq("id", commentId)
            .select("post_id")
            .single();

        if (error) {
            logger.error({
                msg: "Database error during delete blog comment",
                error: error.message,
            });
            throw new DatabaseError("Error deleting comment. Contact Support.", {
                cause: error as unknown as Error,
                operation: "delete",
                resource: { type: "table", name: TABLE_NAME_BLOG_COMMENTS },
            });
        }
        if (!data?.post_id) {
            throw new DatabaseError("Comment not found", {
                operation: "delete",
                resource: { type: "table", name: TABLE_NAME_BLOG_COMMENTS },
            });
        }
        return { post_id: data.post_id as string };
    }

    /**
     * Insert a blog activity row (view, like, share, comment). user_id may be null for anonymous.
     * Ported from template trackBlogActivity.
     */
    async insertBlogActivity(
        postId: string,
        activityType: BlogActivityType,
        userId: string | null
    ): Promise<void> {
        const row = {
            post_id: postId,
            activity_type: activityType,
            user_id: userId ?? null,
        };
        const { error } = await this.supabase
            .from(TABLE_NAME_BLOG_ACTIVITIES)
            .insert(row);

        if (error) {
            logger.error({
                msg: "Database error during insert blog activity",
                error: error.message,
            });
            throw new DatabaseError("Error tracking blog activity. Contact Support.", {
                cause: error as unknown as Error,
                operation: "insert",
                resource: { type: "table", name: TABLE_NAME_BLOG_ACTIVITIES },
            });
        }
    }

    /**
     * Returns all blog activities for admin listing. Supports post_id, activity_type, limit, range, sortByKey (default created_at), sortByOrder.
     * Ported from template getAdminBlogActivities. Cache tag: BLOG_ACTIVITIES_CACHE (invalidate pattern blog:admin:activities:list:*).
     */
    async findAdminBlogActivities(
        options: AdminBlogActivitiesFilterOptions
    ): Promise<{ data: AdminBlogActivity[]; count: number }> {
        const {
            limit = 10,
            sortByKey,
            sortByOrder,
            range,
            post_id,
            activity_type,
        } = options;

        let query = this.supabase
            .from(TABLE_NAME_BLOG_ACTIVITIES)
            .select(SELECT_BLOG_ACTIVITY, { count: "exact" });

        if (post_id) {
            query = query.eq("post_id", post_id);
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
            logger.error({
                msg: "Database error during find admin blog activities",
                error: error.message,
            });
            throw new DatabaseError("Error fetching admin blog activities", {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE_NAME_BLOG_ACTIVITIES },
            });
        }

        const rows = (data ?? []) as BlogActivityLike[];
        const activities: AdminBlogActivity[] = rows.map((row) => {
            const rawAuthor = Array.isArray(row.author) ? row.author[0] ?? null : row.author ?? null;
            const profile = rawAuthor?.user_profiles;
            const avatar_url = profile && typeof profile === "object" && "avatar_url" in profile ? profile.avatar_url : (rawAuthor as { avatar_url?: string | null })?.avatar_url ?? null;
            const rawPost = Array.isArray(row.blog_post) ? row.blog_post[0] ?? null : row.blog_post ?? null;
            return {
                id: row.id,
                activity_type: row.activity_type as BlogActivityType,
                created_at: row.created_at,
                user_id: row.user_id,
                post_id: row.post_id,
                author: rawAuthor ? { id: rawAuthor.id, full_name: rawAuthor.full_name ?? null, avatar_url: avatar_url ?? null } : null,
                blog_post: rawPost ? { id: rawPost.id, title: rawPost.title, slug: rawPost.slug } : null,
            };
        });
        return { data: activities, count: (count ?? 0) as number };
    }
}

