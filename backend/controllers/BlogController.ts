import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/authenticateUser";
import type {
    BlogPostCreateSchemaType,
    BlogPostUpdateSchemaType,
    BlogTopicCreateSchemaType,
    BlogTopicUpdateSchemaType,
    BlogCommentCreateSchemaType,
    BlogCommentUpdateSchemaType,
    BlogTrackActivitySchemaType,
} from "../data/schemas/blogSchemas";
import type {
    ParsedPublishedBlogPostsQuery,
    ParsedAdminBlogPostsQuery,
    ParsedAdminBlogCommentsQuery,
    ParsedAdminBlogActivitiesQuery,
} from "../middlewares/queryParsers";
import { BlogService } from "../services/BlogService";
import { BlogDTOMapper } from "../utils/dtos/BlogDTO";
import { generateBlogRSSFeed } from "../utils/generateBlogRSSFeed";
import { ValidationError, DatabaseEntityNotFoundError } from "../errors/InfraError";

export class BlogController {
    constructor(private readonly blogService: BlogService) {}

    createBlogPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.publicId;
            if (!userId) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }
            // Editor, Admin, or SuperAdmin have access (route); only SuperAdmin can auto-approve (Listing-style)
            const isSuperAdmin = authReq.user?.isSuperAdmin === true;
            const result = await this.blogService.createBlogPost(
                req.body as BlogPostCreateSchemaType,
                userId,
                isSuperAdmin
            );
            res.status(201).json({
                success: true,
                data: { id: result.id },
                message: "Blog post created successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    updateBlogPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            if (!authReq.user?.publicId) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }
            const isSuperAdmin = authReq.user?.isSuperAdmin === true;
            const id = (req.params as { id: string }).id;
            const post = { ...(req.body as BlogPostUpdateSchemaType), id } as BlogPostUpdateSchemaType;
            const result = await this.blogService.updateBlogPost(post, isSuperAdmin);
            res.status(200).json({
                success: true,
                data: { id: result.id },
                message: "Blog post updated successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    createBlogTopic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            if (!authReq.user?.publicId) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }
            const result = await this.blogService.createBlogTopic(
                req.body as BlogTopicCreateSchemaType
            );
            res.status(201).json({
                success: true,
                data: { id: result.id },
                message: "Blog topic created successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    updateBlogTopic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            if (!authReq.user?.publicId) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }
            const id = (req.params as { id: string }).id;
            const topic = { ...(req.body as BlogTopicUpdateSchemaType), id } as BlogTopicUpdateSchemaType;
            const result = await this.blogService.updateBlogTopic(topic);
            res.status(200).json({
                success: true,
                data: { id: result.id },
                message: "Blog topic updated successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    /** Delete a blog post (editor/admin). Ported from template deleteBlogPost. Invalidates BLOG_POSTS_CACHE. */
    deleteBlogPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = (req.params as { id: string }).id;
            await this.blogService.deleteBlogPost(id);
            res.status(200).json({
                success: true,
                message: "Blog post has been deleted successfully.",
            });
        } catch (err) {
            next(err);
        }
    };

    /** Delete a blog topic (editor/admin). Ported from template deleteBlogTopic. Fails if in use. Invalidates BLOG_TOPICS_CACHE. */
    deleteBlogTopic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = (req.params as { id: string }).id;
            await this.blogService.deleteBlogTopic(id);
            res.status(200).json({
                success: true,
                message: "Blog topic has been deleted successfully.",
            });
        } catch (err) {
            next(err);
        }
    };

    createBlogComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.publicId;
            if (!userId) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }
            const result = await this.blogService.createBlogComment(
                req.body as BlogCommentCreateSchemaType,
                userId
            );
            res.status(201).json({
                success: true,
                data: { id: result.id },
                message: "Blog comment created successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    updateBlogComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.publicId;
            if (!userId) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }
            const id = (req.params as { id: string }).id;
            const comment = { ...(req.body as BlogCommentUpdateSchemaType), id } as BlogCommentUpdateSchemaType;
            const result = await this.blogService.updateBlogComment(comment, userId);
            res.status(200).json({
                success: true,
                data: { id: result.id },
                message: "Blog comment updated successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    /** Approve a blog comment (admin only). Ported from template approveComment. */
    approveBlogComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const commentId = (req.params as { id: string }).id;
            const result = await this.blogService.approveBlogComment(commentId);
            res.status(200).json({
                success: true,
                data: { id: result.id },
                message: "Blog comment approved successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    /** Delete a blog comment (editor/admin). Ported from template deleteComment. Invalidates BLOG_COMMENTS_CACHE. */
    deleteBlogComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const commentId = (req.params as { id: string }).id;
            await this.blogService.deleteBlogComment(commentId);
            res.status(200).json({
                success: true,
                message: "Comment has been deleted successfully.",
            });
        } catch (err) {
            next(err);
        }
    };

    /** Public blog overview metadata (from public.module_configs; no auth required). */
    getBlogInformation = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const info = await this.blogService.getBlogInformation();
            res.status(200).json({
                success: true,
                data: info,
                message: "Blog information retrieved successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    getBlogTopics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const topics = await this.blogService.getBlogTopics();
            res.status(200).json({
                success: true,
                data: topics,
                message: "Blog topics retrieved successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    /** Public: active blog topics (with post_count). Ported from template getActiveBlogTopics. */
    getActiveBlogTopics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const topics = await this.blogService.getActiveBlogTopics();
            const dtos = BlogDTOMapper.toActiveBlogTopicDTOCollection(topics);
            res.status(200).json({
                success: true,
                data: dtos,
                message: "Active blog topics retrieved successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    /** Public: approved comments for a post. Cached per postId; invalidated on comment create/update. */
    getPostComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const postId = (req.params as { postId: string }).postId;
            const comments = await this.blogService.getPostComments(postId);
            const dtos = BlogDTOMapper.toCommentDTOCollection(comments);
            res.status(200).json({
                success: true,
                data: dtos,
                message: "Post comments retrieved successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    /**
     * Track blog activity (view, like, share, comment). Auth optional: user_id recorded when authenticated.
     * Ported from template trackBlogActivity; supports UI triggers for like, view, share.
     */
    trackBlogActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            const postId = (req.params as { postId: string }).postId;
            const body = req.body as BlogTrackActivitySchemaType;
            const userId = authReq.user?.publicId ?? null;
            await this.blogService.trackBlogActivity(postId, body.activity_type, userId);
            res.status(200).json({
                success: true,
                data: { success: true },
                message: "Blog activity recorded successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    getBlogPostById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = (req.params as { id: string }).id;
            const post = await this.blogService.getBlogPostById(id);
            const dto = BlogDTOMapper.toDTO(post);
            res.status(200).json({
                success: true,
                data: dto,
                message: "Blog post fetched successfully",
            });
        } catch (err) {
            next(err);
        }
    };


    getPublishedBlogPostBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const identifier = (req.params as { identifier: string }).identifier;
            if (!identifier) {
                throw new ValidationError("Identifier is required");
            }
            const publishedPost = await this.blogService.getPublishedBlogPostBySlug(identifier);
            if (!publishedPost) {
                throw new DatabaseEntityNotFoundError("Blog post not found", { slug: identifier });
            }
            const dto = BlogDTOMapper.toDTO(publishedPost);
            res.status(200).json({
                success: true,
                data: dto,
                message: "Published blog post retrieved successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    /**
     * Public list of authors who have at least one published and approved blog post.
     * Profile fields (avatar_url, website, tag_line) come from user_profiles.
     */
    getPublishedBlogAuthors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authors = await this.blogService.getPublishedBlogAuthors();
            const dtos = BlogDTOMapper.toPublishedBlogAuthorDTOCollection(authors);
            res.status(200).json({
                success: true,
                data: dtos,
                message: "Published blog authors retrieved successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    /**
     * Public published blog posts list with filters (limit, skipId, skip, searchTerm, topicId, sortByKey, sortByOrder, range, authorId).
     * Expects req.parsedQuery (ParsedPublishedBlogPostsQuery) from createPublishedBlogPostsParser middleware.
     */
    getPublishedBlogPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsedQuery = (req as Request & { parsedQuery?: ParsedPublishedBlogPostsQuery }).parsedQuery;
            const opts = parsedQuery ?? {};
            const limit = opts.limit ?? 10;
            const result = await this.blogService.getPublishedBlogPosts({
                limit: Number.isNaN(Number(limit)) ? 10 : Math.min(Math.max(Number(limit), 1), 100),
                skipId: opts.skipId ?? null,
                skip: opts.skip ?? 0,
                searchTerm: opts.searchTerm ?? null,
                topicId: opts.topicId ?? null,
                sortByKey: opts.sortByKey ?? undefined,
                sortByOrder: opts.sortByOrder ?? false,
                range: opts.range ?? null,
                authorId: opts.authorId ?? null,
            });
            if (!result) {
                res.status(404).json({
                    success: false,
                    message: "Published blog posts not found",
                });
                return;
            }
            const { postsResult, countResult } = result;
            const listingDtos = BlogDTOMapper.toDTOCollection(postsResult);
            res.status(200).json({
                success: true,
                data: {
                    postsResult: listingDtos,
                    countResult,
                },
                message: "Published blog posts retrieved successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    /**
     * Admin list of all blog posts (no published/approved filter).
     * Expects req.parsedQuery (ParsedAdminBlogPostsQuery) from createAdminBlogPostsParser middleware.
     * Requires admin or super admin.
     */
    getAdminBlogPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsedQuery = (req as Request & { parsedQuery?: ParsedAdminBlogPostsQuery }).parsedQuery;
            const opts = parsedQuery ?? {};
            const limit = opts.limit ?? 10;
            const result = await this.blogService.getAdminBlogPosts({
                limit: Number.isNaN(Number(limit)) ? 10 : Math.min(Math.max(Number(limit), 1), 100),
                searchTerm: opts.searchTerm ?? null,
                topicId: opts.topicId ?? null,
                sortByKey: opts.sortByKey ?? undefined,
                sortByOrder: opts.sortByOrder ?? false,
                range: opts.range ?? null,
            });
            const { postsResult, countResult } = result;
            const listingDtos = BlogDTOMapper.toDTOCollection(postsResult);
            res.status(200).json({
                success: true,
                data: {
                    postsResult: listingDtos,
                    countResult,
                },
                message: "Admin blog posts retrieved successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    /**
     * Admin list of all blog comments (no approved filter).
     * Expects req.parsedQuery (ParsedAdminBlogCommentsQuery) from createAdminBlogCommentsParser middleware.
     * Ported from template getAdminBlogComments.
     */
    getAdminBlogComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsedQuery = (req as Request & { parsedQuery?: ParsedAdminBlogCommentsQuery }).parsedQuery;
            const opts = parsedQuery ?? {};
            const limit = opts.limit ?? 10;
            const result = await this.blogService.getAdminBlogComments({
                limit: Number.isNaN(Number(limit)) ? 10 : Math.min(Math.max(Number(limit), 1), 100),
                searchTerm: opts.searchTerm ?? null,
                sortByKey: opts.sortByKey ?? undefined,
                sortByOrder: opts.sortByOrder ?? false,
                range: opts.range ?? null,
            });
            const { commentsResult, countResult } = result;
            const dtos = BlogDTOMapper.toAdminBlogCommentDTOCollection(commentsResult);
            res.status(200).json({
                success: true,
                data: {
                    commentsResult: dtos,
                    countResult,
                },
                message: "Admin blog comments retrieved successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    /**
     * GET admin blog activities list. Ported from template getAdminBlogActivities.
     * Requires editor, admin or super admin. Cache tag: BLOG_ACTIVITIES_CACHE.
     */
    getAdminBlogActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsedQuery = (req as Request & { parsedQuery?: ParsedAdminBlogActivitiesQuery }).parsedQuery;
            const opts = parsedQuery ?? {};
            const limit = opts.limit ?? 10;
            const activityType = opts.activity_type ?? null;
            const validType =
                activityType && ["view", "like", "share", "comment"].includes(activityType)
                    ? (activityType as "view" | "like" | "share" | "comment")
                    : null;
            const result = await this.blogService.getAdminBlogActivities({
                limit: Number.isNaN(Number(limit)) ? 10 : Math.min(Math.max(Number(limit), 1), 100),
                sortByKey: opts.sortByKey ?? undefined,
                sortByOrder: opts.sortByOrder ?? false,
                range: opts.range ?? null,
                post_id: opts.post_id ?? null,
                activity_type: validType,
            });
            const { activitiesResult, countResult } = result;
            const dtos = BlogDTOMapper.toAdminBlogActivityDTOCollection(activitiesResult);
            res.status(200).json({
                success: true,
                data: {
                    activitiesResult: dtos,
                    countResult,
                },
                message: "Admin blog activities retrieved successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    /**
     * RSS/Atom/JSON feed. Uses parsed query when available (same filters as getPublishedBlogPosts); default limit 20 for feed.
     */
    getRSSFeed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const format = (req.query.format as string | undefined) ?? "rss";
            const parsedQuery = (req as Request & { parsedQuery?: ParsedPublishedBlogPostsQuery }).parsedQuery;
            const opts = parsedQuery ?? {};
            const limitParam = opts.limit ?? 20;
            const limit = Number.isNaN(Number(limitParam)) ? 20 : Math.min(Math.max(Number(limitParam), 1), 100);

            const result = await this.blogService.getPublishedBlogPosts({
                limit,
                skipId: opts.skipId ?? null,
                skip: opts.skip ?? 0,
                searchTerm: opts.searchTerm ?? null,
                topicId: opts.topicId ?? null,
                sortByKey: opts.sortByKey ?? undefined,
                sortByOrder: opts.sortByOrder ?? false,
                range: opts.range ?? null,
                authorId: opts.authorId ?? null,
            });
            const posts = result?.postsResult ?? [];

            const feed = await generateBlogRSSFeed(posts);

            let contentType = "application/xml";
            let content = feed.rss2;

            switch (format) {
                case "atom":
                    content = feed.atom;
                    break;
                case "json":
                    content = feed.json;
                    contentType = "application/json";
                    break;
                default:
                    content = feed.rss2;
            }

            res.setHeader("Content-Type", contentType);
            res.setHeader("Cache-Control", "public, max-age=86400");
            res.status(200).send(content);
        } catch (err) {
            next(err);
        }
    };
}

