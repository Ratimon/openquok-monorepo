import { Router, type Request, type Response, type NextFunction } from "express";
import { blogController } from "../controllers/index";
import {
    requireFullAuthWithRoles,
    optionalAuthWithRoles,
    requireEditor,
    requireAdmin,
} from "../middlewares/authenticateUser";
import { authorizeResource } from "../middlewares/resourceAuth";
import {
    createPublishedBlogPostsParser,
    createAdminBlogPostsParser,
    createAdminBlogCommentsParser,
    createAdminBlogActivitiesParser,
} from "../middlewares/queryParsers";
import { supabaseAnonClient } from "../connections/index";
import { userRepository, rbacRepository, blogRepository } from "../repositories/index";
import { validateRequest } from "../middlewares/validateRequest";
import {
    blogPostCreateSchema,
    blogPostUpdateSchema,
    blogPostIdParamSchema,
    blogPostIdentifierParamSchema,
    blogPostCommentsParamSchema,
    blogPostActivityParamSchema,
    blogTrackActivitySchema,
    blogTopicCreateSchema,
    blogTopicUpdateSchema,
    blogTopicIdParamSchema,
    blogCommentCreateSchema,
    blogCommentUpdateSchema,
    blogCommentIdParamSchema,
} from "../data/schemas/blogSchemas";
import { isValidUUID } from "../utils/helper";

type BlogRouter = ReturnType<typeof Router>;

const blogRouter: BlogRouter = Router();

const authWithRoles = requireFullAuthWithRoles(
    supabaseAnonClient,
    userRepository,
    rbacRepository
);
const optionalAuth = optionalAuthWithRoles(
    supabaseAnonClient,
    userRepository,
    rbacRepository
);

// const getBlogPostResourceOwner = async (blogPostId: string): Promise<string> => {
//     if (!isValidUUID(blogPostId)) {
//         throw new Error(`Invalid blog post ID format: ${blogPostId}`);
//     }
//     const { data } = await blogRepository.findBlogPostByBlogId(blogPostId);
//     return data?.user_id ?? "";
// };

const parsePublishedBlogPostsQuery = createPublishedBlogPostsParser();
const parseAdminBlogPostsQuery = createAdminBlogPostsParser();
const parseAdminBlogCommentsQuery = createAdminBlogCommentsParser();
const parseAdminBlogActivitiesQuery = createAdminBlogActivitiesParser();

// Public list of authors with published posts (profile from user_profiles)
blogRouter.get("/authors", blogController.getPublishedBlogAuthors);

// Public: active blog topics (with post_count; topics that have at least one published post)
blogRouter.get("/topics/active", blogController.getActiveBlogTopics);

// Public list of all blog topics (id, name, slug) for dropdowns and topic list
blogRouter.get("/topics", blogController.getBlogTopics);

// Public blog overview metadata (title/description/keywords)
blogRouter.get("/information", blogController.getBlogInformation);

// Public published blog posts list (filterable)
blogRouter.get("/posts", parsePublishedBlogPostsQuery, blogController.getPublishedBlogPosts);

// Public: approved comments for a post (must be before GET /posts/:identifier)
blogRouter.get(
    "/posts/:postId/comments",
    validateRequest({ params: blogPostCommentsParamSchema }),
    blogController.getPostComments
);

// Track blog activity (view, like, share, comment). Auth optional; user_id recorded when authenticated.
blogRouter.put(
    "/posts/:postId/activity",
    optionalAuth,
    validateRequest({ params: blogPostActivityParamSchema, body: blogTrackActivitySchema }),
    blogController.trackBlogActivity
);

// Admin list of all blog posts (no published filter; requires editor, admin or super admin)
blogRouter.get(
    "/admin/posts",
    authWithRoles,
    requireEditor,
    parseAdminBlogPostsQuery,
    blogController.getAdminBlogPosts
);

// Admin list of all blog comments (no approved filter; requires editor, admin or super admin)
blogRouter.get(
    "/admin/comments",
    authWithRoles,
    requireEditor,
    parseAdminBlogCommentsQuery,
    blogController.getAdminBlogComments
);

// Admin list of all blog activities (BLOG_ACTIVITIES_CACHE; requires editor, admin or super admin)
blogRouter.get(
    "/admin/activities",
    authWithRoles,
    requireEditor,
    parseAdminBlogActivitiesQuery,
    blogController.getAdminBlogActivities
);

// Public RSS endpoint for blog posts (supports same query params: limit, topicId, etc.)
blogRouter.get("/rss", parsePublishedBlogPostsQuery, blogController.getRSSFeed);

// Get a single blog post: by id (auth) or by slug (public). RESTful: one resource path /posts/:identifier.
const whenIdentifierIsId = (req: Request, _res: Response, next: NextFunction): void => {
    const identifier = (req.params as { identifier?: string }).identifier;
    if (identifier && isValidUUID(identifier)) {
        (req.params as { id?: string }).id = identifier;
        next();
    } else {
        next("route");
    }
};

// Branch 1: identifier is UUID → require auth and return post by id
blogRouter.get(
    "/posts/:identifier",
    whenIdentifierIsId,
    authWithRoles,
    requireEditor,
    authorizeResource({
        resourceType: "blog_posts",
        paramName: "id",
        action: "read",
        // getResourceOwner: getBlogPostResourceOwner,
    }),
    validateRequest({ params: blogPostIdParamSchema }),
    blogController.getBlogPostById
);

// Branch 2: identifier is slug → public, return published post by slug
blogRouter.get(
    "/posts/:identifier",
    validateRequest({ params: blogPostIdentifierParamSchema }),
    blogController.getPublishedBlogPostBySlug
);

// Create a blog post (editor or admin)
blogRouter.post(
    "/posts",
    authWithRoles,
    requireEditor,
    validateRequest({ body: blogPostCreateSchema }),
    blogController.createBlogPost
);

// Update a blog post (editor or admin)
blogRouter.put(
    "/posts/:id",
    authWithRoles,
    requireEditor,
    validateRequest({ params: blogPostIdParamSchema, body: blogPostUpdateSchema }),
    blogController.updateBlogPost
);

// Delete a blog post (editor or admin); ported from template deleteBlogPost
blogRouter.delete(
    "/posts/:id",
    authWithRoles,
    requireEditor,
    validateRequest({ params: blogPostIdParamSchema }),
    blogController.deleteBlogPost
);

// Create a blog topic (editor or admin)
blogRouter.post(
    "/topics",
    authWithRoles,
    requireEditor,
    validateRequest({ body: blogTopicCreateSchema }),
    blogController.createBlogTopic
);

// Update a blog topic (editor or admin)
blogRouter.put(
    "/topics/:id",
    authWithRoles,
    requireEditor,
    validateRequest({ params: blogTopicIdParamSchema, body: blogTopicUpdateSchema }),
    blogController.updateBlogTopic
);

// Delete a blog topic (editor or admin); ported from template deleteBlogTopic
blogRouter.delete(
    "/topics/:id",
    authWithRoles,
    requireEditor,
    validateRequest({ params: blogTopicIdParamSchema }),
    blogController.deleteBlogTopic
);

// Create a blog comment (any authenticated user)
blogRouter.post(
    "/comments",
    authWithRoles,
    validateRequest({ body: blogCommentCreateSchema }),
    blogController.createBlogComment
);

// Update a blog comment (comment owner only; repo enforces user_id)
blogRouter.put(
    "/comments/:id",
    authWithRoles,
    validateRequest({ params: blogCommentIdParamSchema, body: blogCommentUpdateSchema }),
    blogController.updateBlogComment
);

// Approve a blog comment (editor or admin; ported from template approveComment)
blogRouter.patch(
    "/comments/:id/approve",
    authWithRoles,
    requireEditor,
    validateRequest({ params: blogCommentIdParamSchema }),
    blogController.approveBlogComment
);

// Delete a blog comment (editor or admin); ported from template deleteComment
blogRouter.delete(
    "/comments/:id",
    authWithRoles,
    requireEditor,
    validateRequest({ params: blogCommentIdParamSchema }),
    blogController.deleteBlogComment
);

export { blogRouter };

