import type { BlogRepository } from "../repositories/BlogRepository";
import type { ConfigRepository } from "../repositories/ConfigRepository";
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
import type CacheService from "../connections/cache/CacheService";
import type CacheInvalidationService from "../connections/cache/CacheInvalidationService";
import {
    buildPublishedBlogCacheKey,
    buildAdminBlogCacheKey,
    buildAdminBlogCommentsCacheKey,
    buildAdminBlogActivitiesCacheKey,
    type BlogPostLike,
} from "../utils/dtos/BlogDTO";
import { stringToSlug } from "../utils/slug";
import { isValidUUID } from "../utils/helper";
import { ValidationError } from "../errors/InfraError";
import { logger } from "../utils/Logger";
import { BlogPostId } from "../utils/valueObjects/BlogPostId";

/** Domain-scoped cache key prefixes. */
const CACHE_KEYS = {
    BLOG: "blog",
    BLOG_BYID: "blog:byBlogId",
    BLOG_PUBLISHED: "blog:published:blog",
    BLOG_PUBLISHED_BY_SLUG: "blog:published:bySlug",
    BLOG_PUBLISHED_AUTHORS: "blog:published:authors",
    /** Public metadata shown in the blog overview (from public.module_configs). */
    BLOG_INFORMATION: "config:module:blog:information",
    /** Admin list (all posts); cache key built from options via buildAdminBlogCacheKey; invalidate pattern blog:admin:list:* */
    BLOG_ADMIN_LIST: "blog:admin:list",
    /** Admin list (all comments); cache key built from options via buildAdminBlogCommentsCacheKey; invalidate pattern blog:admin:comments:list:* */
    BLOG_ADMIN_COMMENTS_LIST: "blog:admin:comments:list",
    /** Admin list (all activities); cache key via buildAdminBlogActivitiesCacheKey; tag BLOG_ACTIVITIES_CACHE; invalidate pattern blog:admin:activities:list:* */
    BLOG_ADMIN_ACTIVITIES_LIST: "blog:admin:activities:list",
    /** All blog topics list (id, name, slug); invalidated on topic create/update */
    BLOG_TOPICS_LIST: "blog:topics:list",
    /** Active blog topics (with post_count); same scope as BLOG_POSTS_CACHE — invalidated on post or topic create/update */
    BLOG_ACTIVE_TOPICS: "blog:topics:active",
    /** Comments for a post; key blog:comments:byPostId:${postId}; invalidated on comment create/update for that post */
    BLOG_COMMENTS_POST: "blog:comments:byPostId",
};

const BLOG_CACHE_TTL_SEC = 300;

export class BlogService {
    constructor(
        private readonly blogRepository: BlogRepository,
        private readonly cache?: CacheService,
        private readonly cacheInvalidator?: CacheInvalidationService,
        private readonly configRepository?: ConfigRepository
    ) {}

    /**
     * Public blog overview metadata (from public.module_configs where module_name = 'blog').
     * Used for SSR SEO (title/description/keywords).
     */
    async getBlogInformation(): Promise<Record<string, string>> {
        const moduleName = "blog";
        const properties = [
            "BLOG_POST_SEO_META_TITLE",
            "BLOG_POST_SEO_META_DESCRIPTION",
            "BLOG_POST_SEO_META_TAGS"
        ];

        const cacheKey = CACHE_KEYS.BLOG_INFORMATION;
        const factory = async (): Promise<Record<string, string>> => {
            if (!this.configRepository) return {};
            const { result } = await this.configRepository.getConfigByModuleNameAndProperties({
                moduleName,
                properties
            });
            return result;
        };

        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, BLOG_CACHE_TTL_SEC);
        }
        return factory();
    }

    /**
     * Get a single blog post by id. Used for edit/detail (authorized by route).
     * Caller must ensure the user is allowed to read (owner or editor/admin).
     * Uses cache when available; invalidator clears by-id key on create/update (Listing-style).
     */
    async getBlogPostById(id: BlogPostId | string): Promise<BlogPostLike> {
        const idVO =
            id instanceof BlogPostId ? id : BlogPostId.create(id);
        if (!idVO) {
            throw new ValidationError(`Invalid blog post ID: ${id}`);
        }

        const cacheKey = `${CACHE_KEYS.BLOG_BYID}:${idVO.value}`;
        const factory = async (): Promise<BlogPostLike> => {
            logger.debug({ msg: "Getting blog post by ID", blogPostId: idVO.value });
            const { data } = await this.blogRepository.findBlogPostByBlogId(idVO.value);
            return data;
        };

        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, BLOG_CACHE_TTL_SEC);
        }
        return factory();
    }

    /**
     * Get published blog posts with filters (limit, skipId, skip, searchTerm, topicId, sortByKey, sortByOrder, range, authorId).
     */
    async getPublishedBlogPosts(
        options: PublishedBlogPostsFilterOptions
    ): Promise<{ postsResult: BlogPostLike[]; countResult: number }> {
        const normalizedOptions: PublishedBlogPostsFilterOptions = {
            limit: options.limit ?? 10,
            skipId: options.skipId ?? null,
            skip: options.skip ?? 0,
            searchTerm: options.searchTerm ?? null,
            topicId: options.topicId ?? null,
            sortByKey: options.sortByKey ?? "published_at",
            sortByOrder: options.sortByOrder ?? false,
            range: options.range ?? null,
            authorId: options.authorId ?? null,
        };

        const cacheKey = buildPublishedBlogCacheKey(normalizedOptions, CACHE_KEYS.BLOG_PUBLISHED);

        const factory = async (): Promise<{ postsResult: BlogPostLike[]; countResult: number }> => {
            logger.debug({ msg: "Getting published blog posts", options: normalizedOptions });
            const { data: postsResult, count: countResult } =
                await this.blogRepository.findPublishedBlogPosts(normalizedOptions);
            return { postsResult, countResult };
        };

        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, BLOG_CACHE_TTL_SEC);
        }
        return factory();
    }

    /**
     * Get all blog posts for admin listing (no published/approved filter).
     * Cached per options (same TTL as published); invalidated on blog create/update via pattern blog:admin:list:*.
     */
    async getAdminBlogPosts(
        options: AdminBlogPostsFilterOptions
    ): Promise<{ postsResult: BlogPostLike[]; countResult: number }> {
        const normalizedOptions: AdminBlogPostsFilterOptions = {
            limit: options.limit ?? 10,
            searchTerm: options.searchTerm ?? null,
            topicId: options.topicId ?? null,
            sortByKey: options.sortByKey ?? "created_at",
            sortByOrder: options.sortByOrder ?? false,
            range: options.range ?? null,
        };

        const cacheKey = buildAdminBlogCacheKey(normalizedOptions, CACHE_KEYS.BLOG_ADMIN_LIST);

        const factory = async (): Promise<{ postsResult: BlogPostLike[]; countResult: number }> => {
            logger.debug({ msg: "Getting admin blog posts", options: normalizedOptions });
            const { data: postsResult, count: countResult } =
                await this.blogRepository.findAdminBlogPosts(normalizedOptions);
            return { postsResult, countResult };
        };

        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, BLOG_CACHE_TTL_SEC);
        }
        return factory();
    }

    /**
     * Get all blog comments for admin listing (no approved filter).
     * Cached per options; invalidated on comment create/update/approve via pattern blog:admin:comments:list:*.
     */
    async getAdminBlogComments(
        options: AdminBlogCommentsFilterOptions
    ): Promise<{ commentsResult: AdminBlogComment[]; countResult: number }> {
        const normalizedOptions: AdminBlogCommentsFilterOptions = {
            limit: options.limit ?? 10,
            searchTerm: options.searchTerm ?? null,
            sortByKey: options.sortByKey ?? "created_at",
            sortByOrder: options.sortByOrder ?? false,
            range: options.range ?? null,
        };

        const cacheKey = buildAdminBlogCommentsCacheKey(normalizedOptions, CACHE_KEYS.BLOG_ADMIN_COMMENTS_LIST);

        const factory = async (): Promise<{ commentsResult: AdminBlogComment[]; countResult: number }> => {
            logger.debug({ msg: "Getting admin blog comments", options: normalizedOptions });
            const { data: commentsResult, count: countResult } =
                await this.blogRepository.findAdminBlogComments(normalizedOptions);
            return { commentsResult, countResult };
        };

        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, BLOG_CACHE_TTL_SEC);
        }
        return factory();
    }

    /**
     * Get all blog activities for admin listing. Cached per options; tag BLOG_ACTIVITIES_CACHE.
     * Invalidated on any trackBlogActivity (pattern blog:admin:activities:list:*).
     */
    async getAdminBlogActivities(
        options: AdminBlogActivitiesFilterOptions
    ): Promise<{ activitiesResult: AdminBlogActivity[]; countResult: number }> {
        const normalizedOptions: AdminBlogActivitiesFilterOptions = {
            limit: options.limit ?? 10,
            sortByKey: options.sortByKey ?? "created_at",
            sortByOrder: options.sortByOrder ?? false,
            range: options.range ?? null,
            post_id: options.post_id ?? null,
            activity_type: options.activity_type ?? null,
        };

        const cacheKey = buildAdminBlogActivitiesCacheKey(
            normalizedOptions,
            CACHE_KEYS.BLOG_ADMIN_ACTIVITIES_LIST
        );

        const factory = async (): Promise<{
            activitiesResult: AdminBlogActivity[];
            countResult: number;
        }> => {
            logger.debug({ msg: "Getting admin blog activities", options: normalizedOptions });
            const { data: activitiesResult, count: countResult } =
                await this.blogRepository.findAdminBlogActivities(normalizedOptions);
            return { activitiesResult, countResult };
        };

        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, BLOG_CACHE_TTL_SEC);
        }
        return factory();
    }

    /**
     * Record a blog activity (view, like, share, comment). user_id may be null for anonymous.
     * Invalidates BLOG_ACTIVITIES_CACHE (pattern blog:admin:activities:list:*). Ported from template trackBlogActivity.
     */
    async trackBlogActivity(
        postId: string,
        activityType: BlogActivityType,
        userId: string | null
    ): Promise<void> {
        await this.blogRepository.insertBlogActivity(postId, activityType, userId);
        await this._invalidateBlogActivitiesCaches();
    }

    /**
     * Get all users who have at least one published and approved blog post.
     * Uses RPC get_published_blog_authors; profile fields come from user_profiles.
     * Cached; invalidated on blog create/update (Listing-style).
     */
    async getPublishedBlogAuthors(): Promise<PublishedBlogAuthor[]> {
        const cacheKey = CACHE_KEYS.BLOG_PUBLISHED_AUTHORS;
        const factory = async (): Promise<PublishedBlogAuthor[]> => {
            logger.debug({ msg: "Getting published blog authors" });
            const { data } = await this.blogRepository.getPublishedBlogAuthors();
            return data;
        };
        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, BLOG_CACHE_TTL_SEC);
        }
        return factory();
    }

    /**
     * Get a single published blog post by slug (public). Returns null if not found.
     * Cached per slug; slug caches invalidated on any blog create/update (Listing-style).
     */
    async getPublishedBlogPostBySlug(slug: string): Promise<BlogPostLike | null> {
        const cacheKey = `${CACHE_KEYS.BLOG_PUBLISHED_BY_SLUG}:${slug}`;
        const factory = async (): Promise<BlogPostLike | null> => {
            const { data } = await this.blogRepository.findPublishedBlogPostBySlug(slug);
            return data;
        };
        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, BLOG_CACHE_TTL_SEC);
        }
        return factory();
    }

    /**
     * Get all blog topics (id, name, slug) for dropdowns and topic list.
     * Cached; invalidated on topic create/update.
     */
    async getBlogTopics(): Promise<BlogTopic[]> {
        const cacheKey = CACHE_KEYS.BLOG_TOPICS_LIST;
        const factory = async (): Promise<BlogTopic[]> => {
            logger.debug({ msg: "Getting blog topics" });
            const { data } = await this.blogRepository.findBlogTopics();
            return data;
        };
        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, BLOG_CACHE_TTL_SEC);
        }
        return factory();
    }

    /**
     * Get active blog topics (topics that have at least one published post) with post_count.
     * Cached; invalidated on post or topic create/update (same scope as template BLOG_POSTS_CACHE).
     */
    async getActiveBlogTopics(): Promise<ActiveBlogTopic[]> {
        const cacheKey = CACHE_KEYS.BLOG_ACTIVE_TOPICS;
        const factory = async (): Promise<ActiveBlogTopic[]> => {
            logger.debug({ msg: "Getting active blog topics" });
            const { data } = await this.blogRepository.findActiveBlogTopics();
            return data;
        };
        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, BLOG_CACHE_TTL_SEC);
        }
        return factory();
    }

    /**
     * Create a blog post. Requires editor or admin role (enforced by route).
     * Returns id, title, slug and approval flags. Fetches saved post for cache invalidation (Listing-style).
     */
    async createBlogPost(
        post: BlogPostCreateSchemaType,
        userId: string,
        isSuperAdmin: boolean
    ): Promise<{ id: string; title: string; slug: string; isAdminApproved: boolean; isUserApproved: boolean }> {
        const slug = stringToSlug(post.title);
        const isUserApproved = post.is_user_published === true;
        const isAdminApproved = isSuperAdmin && isUserApproved;
        const createPayload: BlogPostCreateSchemaType = {
            ...post,
            is_user_published: isUserApproved,
            is_admin_approved: isAdminApproved,
        };
        const { savedBlogPostId, isAdminApproved: approvedByAdmin, isUserApproved: approvedByUser } =
            await this.blogRepository.createOne(
                createPayload,
                userId,
                slug,
                isAdminApproved
            );

        const { data: savedPost } =
            await this.blogRepository.findBlogPostByBlogId(savedBlogPostId);

        await this._invalidatePostMutationCaches({ postId: savedBlogPostId });
        return {
            id: savedBlogPostId,
            title: savedPost.title,
            slug: savedPost.slug,
            isAdminApproved: approvedByAdmin,
            isUserApproved: approvedByUser,
        };
    }

    /**
     * Update a blog post. Requires editor or admin role (enforced by route).
     * Post must contain id (controller merges from URL or body). No id validation here—same as updateListing; repo/DB surfaces errors.
     */
    async updateBlogPost(
        post: BlogPostUpdateSchemaType,
        isSuperAdmin: boolean
    ): Promise<{ id: string; title: string; slug: string; isAdminApproved: boolean; isUserApproved: boolean }> {
        const isUserApproved = post.is_user_published === true;
        const isAdminApproved = isSuperAdmin && isUserApproved;
        const slug = stringToSlug(post.title);
        const updatePayload: BlogPostUpdateSchemaType = {
            ...post,
            is_user_published: isUserApproved,
            is_admin_approved: isAdminApproved,
        };
        const { savedBlogPostId } = await this.blogRepository.updateOne(
            post.id!,
            updatePayload,
            slug,
            isAdminApproved,
            new Date().toISOString()
        );

        const { data: savedPost } =
            await this.blogRepository.findBlogPostByBlogId(savedBlogPostId);

        await this._invalidatePostMutationCaches({ postId: savedBlogPostId });
        return {
            id: savedBlogPostId,
            title: savedPost.title,
            slug: savedPost.slug,
            isAdminApproved,
            isUserApproved,
        };
    }

    /**
     * Create a blog topic. Requires editor or admin role (enforced by route).
     * Returns id and name. Duplicate name/slug throws ValidationError.
     * Invalidates topic list and post lists (they embed topic name/slug).
     */
    async createBlogTopic(
        payload: BlogTopicCreateSchemaType
    ): Promise<{ id: string; name: string }> {
        const result = await this.blogRepository.createTopic(payload);
        await this._invalidateBlogTopicRelatedCaches();
        return result;
    }

    /**
     * Update a blog topic. Requires editor or admin role (enforced by route).
     * Topic must contain id (controller merges from URL or body). No id validation here—same as updateListing; repo/DB surfaces errors.
     */
    async updateBlogTopic(
        topic: BlogTopicUpdateSchemaType
    ): Promise<{ id: string; name: string }> {
        const result = await this.blogRepository.updateTopic(topic.id!, topic);
        await this._invalidateBlogTopicRelatedCaches();
        return result;
    }

    /**
     * Create a blog comment. Any authenticated user (enforced by route).
     * Payload must contain post_id (schema refine enforces on create). No id validation here—repo/DB surfaces errors.
     * Invalidates the post's by-id cache so post detail (e.g. with comments) stays fresh.
     */
    async createBlogComment(
        payload: BlogCommentCreateSchemaType,
        userId: string
    ): Promise<{ id: string }> {
        const postId = payload.post_id!;
        const result = await this.blogRepository.createComment(
            { post_id: postId, parent_id: payload.parent_id ?? undefined, content: payload.content },
            userId
        );
        await this._invalidatePostCacheForComment({ postId });
        await this._invalidateAdminCommentsListCaches();
        await this.trackBlogActivity(postId, "comment", userId);
        return result;
    }

    /**
     * Update a blog comment. Comment must contain id (controller merges from URL or body). Owner-only (repo filters by user_id).
     * No id validation here—same as updateListing; repo/DB surfaces errors.
     * Invalidates the post's by-id cache so post detail (e.g. with comments) stays fresh.
     */
    async updateBlogComment(
        comment: BlogCommentUpdateSchemaType,
        userId: string
    ): Promise<{ id: string }> {
        const result = await this.blogRepository.updateComment(
            comment.id!,
            userId,
            { content: comment.content }
        );
        if (result.post_id) {
            await this._invalidatePostCacheForComment({ postId: result.post_id });
        }
        await this._invalidateAdminCommentsListCaches();
        return { id: result.id };
    }

    /**
     * Approve a blog comment by id (admin/editor only; route enforces). Invalidates post and comments cache.
     */
    async approveBlogComment(commentId: string): Promise<{ id: string }> {
        const result = await this.blogRepository.approveComment(commentId);
        if (result.post_id) {
            await this._invalidatePostCacheForComment({ postId: result.post_id });
        }
        await this._invalidateAdminCommentsListCaches();
        return { id: result.id };
    }

    /**
     * Delete a blog post by id (editor/admin only; route enforces). Invalidates post, lists, authors, topics, admin comments and activities (BLOG_POSTS_CACHE).
     * Ported from template deleteBlogPost.
     */
    async deleteBlogPost(postId: string): Promise<void> {
        await this.blogRepository.deleteBlogPost(postId);
        await this._invalidatePostMutationCaches({ postId });
        await this._invalidateAdminCommentsListCaches();
        await this._invalidateBlogActivitiesCaches();
    }

    /**
     * Delete a blog topic by id (editor/admin only). Fails if any post uses the topic or topic has children. Invalidates topic-related caches (BLOG_TOPICS_CACHE).
     * Ported from template deleteBlogTopic.
     */
    async deleteBlogTopic(topicId: string): Promise<void> {
        await this.blogRepository.deleteBlogTopic(topicId);
        await this._invalidateBlogTopicRelatedCaches();
    }

    /**
     * Delete a blog comment by id (editor/admin only; route enforces). Invalidates that post's cache and admin comments list (BLOG_COMMENTS_CACHE).
     * Ported from template deleteComment.
     */
    async deleteBlogComment(commentId: string): Promise<void> {
        const { post_id } = await this.blogRepository.deleteComment(commentId);
        await this._invalidatePostCacheForComment({ postId: post_id });
        await this._invalidateAdminCommentsListCaches();
    }

    /**
     * Get approved comments for a post (public). Cached per postId; invalidated when a comment is created or updated for that post.
     */
    async getPostComments(postId: string): Promise<BlogComment[]> {
        const cacheKey = `${CACHE_KEYS.BLOG_COMMENTS_POST}:${postId}`;
        const factory = async (): Promise<BlogComment[]> => {
            logger.debug({ msg: "Getting post comments", postId });
            const { data } = await this.blogRepository.findPostComments(postId);
            return data;
        };
        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, BLOG_CACHE_TTL_SEC);
        }
        return factory();
    }

    /**
     * Invalidate caches when a blog post is created or updated.
     * Covers: post by-id, entity, published lists (and slug), authors, admin list, active topics.
     */
    private async _invalidatePostMutationCaches(params: { postId: string }): Promise<boolean> {
        if (!this.cacheInvalidator) return false;
        const { postId } = params;
        if (!postId) {
            logger.warn({ msg: "No post ID provided for blog cache invalidation", postId });
            return false;
        }
        await this.cacheInvalidator.invalidateKey(`${CACHE_KEYS.BLOG_BYID}:${postId}`);
        await this.cacheInvalidator.invalidateEntity(CACHE_KEYS.BLOG, postId);
        await this._invalidatePublishedAndAdminListCaches();
        await this.cacheInvalidator.invalidateKey(CACHE_KEYS.BLOG_PUBLISHED_AUTHORS);
        await this.cacheInvalidator.invalidateKey(CACHE_KEYS.BLOG_ACTIVE_TOPICS);
        logger.debug({ msg: "Invalidated caches for blog post mutation", postId });
        return true;
    }

    /**
     * Invalidate caches when a comment is created, updated, or approved.
     * Post by-id and that post's comments list, plus admin comments list pattern.
     */
    private async _invalidatePostCacheForComment(params: { postId: string }): Promise<void> {
        if (!this.cacheInvalidator) return;
        const { postId } = params;
        if (!postId) return;
        await this.cacheInvalidator.invalidateKey(`${CACHE_KEYS.BLOG_BYID}:${postId}`);
        await this.cacheInvalidator.invalidateKey(`${CACHE_KEYS.BLOG_COMMENTS_POST}:${postId}`);
        logger.debug({ msg: "Invalidated post and comments cache for comment", postId });
    }

    /**
     * Invalidate admin comments list caches (all keys under blog:admin:comments:list:*).
     * Called when any comment is created, updated, or approved.
     */
    private async _invalidateAdminCommentsListCaches(): Promise<void> {
        if (!this.cacheInvalidator) return;
        await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.BLOG_ADMIN_COMMENTS_LIST}:*`);
        logger.debug({ msg: "Invalidated admin comments list caches" });
    }

    /**
     * Invalidate admin activities list caches (BLOG_ACTIVITIES_CACHE; pattern blog:admin:activities:list:*).
     * Called when any activity is tracked (e.g. comment created, view, like, share).
     */
    private async _invalidateBlogActivitiesCaches(): Promise<void> {
        if (!this.cacheInvalidator) return;
        await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.BLOG_ADMIN_ACTIVITIES_LIST}:*`);
        logger.debug({ msg: "Invalidated admin blog activities list caches" });
    }

    /**
     * Invalidate caches when a topic is created or updated.
     * Topics list, active topics, and all published/admin list patterns (posts embed topic).
     */
    private async _invalidateBlogTopicRelatedCaches(): Promise<void> {
        if (!this.cacheInvalidator) return;
        await this.cacheInvalidator.invalidateKey(CACHE_KEYS.BLOG_TOPICS_LIST);
        await this.cacheInvalidator.invalidateKey(CACHE_KEYS.BLOG_ACTIVE_TOPICS);
        await this._invalidatePublishedAndAdminListCaches();
        logger.debug({ msg: "Invalidated blog topic related caches" });
    }

    /**
     * Shared: invalidate published post list patterns and admin list pattern.
     * Used by post mutation and topic mutation (both affect what appears in lists).
     */
    private async _invalidatePublishedAndAdminListCaches(): Promise<void> {
        if (!this.cacheInvalidator) return;
        await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.BLOG_PUBLISHED}:*`);
        await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.BLOG_PUBLISHED_BY_SLUG}:*`);
        await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.BLOG_ADMIN_LIST}:*`);
    }
}

