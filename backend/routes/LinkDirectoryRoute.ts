import { Router, type Request, type Response, type NextFunction } from "express";
import { linkDirectoryController } from "../controllers/index";
import {
    requireFullAuthWithRoles,
    optionalAuthWithRoles,
    requireEditor,
} from "../guards";
import { supabaseAnonClient } from "../connections/index";
import { userRepository, rbacRepository } from "../repositories/index";
import { validateRequest } from "../middlewares/validateRequest";
import {
    createPublishedLinkDirectoryParser,
    createAdminLinkDirectoryParser,
    createAdminLinkDirectorySiteCommentsParser,
} from "../middlewares/queryParsers";
import { isValidUUID } from "../utils/validation/uuid";
import {
    linkDirectorySiteSlugParamSchema,
    linkDirectorySiteIdParamSchema,
    linkDirectoryOpportunityIdParamSchema,
    linkDirectoryCategoryIdParamSchema,
    linkDirectoryTagIdParamSchema,
    linkDirectoryTagGroupIdParamSchema,
    linkDirectorySubmissionIdParamSchema,
    linkDirectorySiteBodySchema,
    linkDirectorySiteUpdateBodySchema,
    linkDirectoryOpportunityCreateSchema,
    linkDirectoryOpportunityUpdateSchema,
    linkDirectoryCategoryCreateSchema,
    linkDirectoryCategoryUpdateSchema,
    linkDirectoryTagCreateSchema,
    linkDirectoryTagUpdateSchema,
    linkDirectoryTagGroupCreateSchema,
    linkDirectorySubmissionCreateSchema,
    linkDirectorySubmissionReviewSchema,
    linkDirectorySavedSitesPutSchema,
    linkDirectorySavedSitesOrderSchema,
    linkDirectorySavedSiteOutreachCompletionSchema,
    linkDirectorySiteCommentCreateSchema,
    linkDirectorySiteCommentIdParamSchema,
    linkDirectorySiteRatingBodySchema,
} from "../data/schemas/linkDirectorySchemas";
import { z } from "zod";

type LinkDirectoryRouter = ReturnType<typeof Router>;

const linkDirectoryRouter: LinkDirectoryRouter = Router();

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

const parsePublishedQuery = createPublishedLinkDirectoryParser();
const parseAdminQuery = createAdminLinkDirectoryParser();
const parseAdminSiteCommentsQuery = createAdminLinkDirectorySiteCommentsParser();

const tagBodySchema = z.object({
    tagData: linkDirectoryTagCreateSchema,
    tagGroupIds: z.array(z.string().uuid()).optional(),
});

const tagUpdateBodySchema = z.object({
    tagData: linkDirectoryTagUpdateSchema,
    tagGroupIds: z.array(z.string().uuid()).optional(),
});

const whenParamIsId = (req: Request, _res: Response, next: NextFunction): void => {
    const id = (req.params as { siteId?: string }).siteId;
    if (id && isValidUUID(id)) {
        next();
    } else {
        next("route");
    }
};

// --- Public catalog ---
linkDirectoryRouter.get("/categories/active", linkDirectoryController.getActiveCategories);
linkDirectoryRouter.get("/tags/active", linkDirectoryController.getActiveTags);
linkDirectoryRouter.get("/opportunity-types", linkDirectoryController.getOpportunityTypes);

linkDirectoryRouter.get("/published", parsePublishedQuery, linkDirectoryController.getPublishedSites);
linkDirectoryRouter.get("/published/stats", linkDirectoryController.getPublishedHubStats);
linkDirectoryRouter.get(
    "/published/:siteSlug",
    validateRequest({ params: linkDirectorySiteSlugParamSchema }),
    linkDirectoryController.getPublishedSiteBySlug
);

linkDirectoryRouter.post(
    "/submissions",
    optionalAuth,
    validateRequest({ body: linkDirectorySubmissionCreateSchema }),
    linkDirectoryController.createSubmission
);

linkDirectoryRouter.post(
    "/sites/:siteId/views",
    optionalAuth,
    validateRequest({ params: linkDirectorySiteIdParamSchema }),
    linkDirectoryController.incrementSiteViews
);
linkDirectoryRouter.post(
    "/sites/:siteId/likes",
    optionalAuth,
    validateRequest({ params: linkDirectorySiteIdParamSchema }),
    linkDirectoryController.incrementSiteLikes
);
linkDirectoryRouter.get(
    "/sites/:siteId/comments",
    validateRequest({ params: linkDirectorySiteIdParamSchema }),
    linkDirectoryController.getSiteComments
);
linkDirectoryRouter.post(
    "/sites/:siteId/comments",
    authWithRoles,
    validateRequest({
        params: linkDirectorySiteIdParamSchema,
        body: linkDirectorySiteCommentCreateSchema,
    }),
    linkDirectoryController.createSiteComment
);
linkDirectoryRouter.put(
    "/sites/:siteId/ratings",
    authWithRoles,
    validateRequest({
        params: linkDirectorySiteIdParamSchema,
        body: linkDirectorySiteRatingBodySchema,
    }),
    linkDirectoryController.upsertSiteRating
);

// --- Authenticated saved sites ---
linkDirectoryRouter.get("/me/saved-sites", authWithRoles, linkDirectoryController.getUserSavedSites);
linkDirectoryRouter.put(
    "/me/saved-sites",
    authWithRoles,
    validateRequest({ body: linkDirectorySavedSitesPutSchema }),
    linkDirectoryController.putUserSavedSites
);
linkDirectoryRouter.put(
    "/me/saved-sites/order",
    authWithRoles,
    validateRequest({ body: linkDirectorySavedSitesOrderSchema }),
    linkDirectoryController.putUserSavedSitesOrder
);
linkDirectoryRouter.patch(
    "/me/saved-sites/:siteId/outreach-completion",
    authWithRoles,
    validateRequest({
        params: linkDirectorySiteIdParamSchema,
        body: linkDirectorySavedSiteOutreachCompletionSchema,
    }),
    linkDirectoryController.patchUserSavedSiteOutreachCompletion
);

// --- Editor: taxonomy ---
linkDirectoryRouter.get(
    "/categories/all-full",
    authWithRoles,
    requireEditor,
    linkDirectoryController.getAllCategories
);
linkDirectoryRouter.post(
    "/categories",
    authWithRoles,
    requireEditor,
    validateRequest({ body: linkDirectoryCategoryCreateSchema }),
    linkDirectoryController.createCategory
);
linkDirectoryRouter.put(
    "/categories/:categoryId",
    authWithRoles,
    requireEditor,
    validateRequest({ params: linkDirectoryCategoryIdParamSchema, body: linkDirectoryCategoryUpdateSchema }),
    linkDirectoryController.updateCategory
);
linkDirectoryRouter.delete(
    "/categories/:categoryId",
    authWithRoles,
    requireEditor,
    validateRequest({ params: linkDirectoryCategoryIdParamSchema }),
    linkDirectoryController.deleteCategory
);

linkDirectoryRouter.get("/tags/all-full", authWithRoles, requireEditor, linkDirectoryController.getAllTags);
linkDirectoryRouter.get(
    "/tags/groups",
    authWithRoles,
    requireEditor,
    linkDirectoryController.getAllTagGroups
);
linkDirectoryRouter.post(
    "/tags/groups",
    authWithRoles,
    requireEditor,
    validateRequest({ body: linkDirectoryTagGroupCreateSchema }),
    linkDirectoryController.createTagGroup
);
linkDirectoryRouter.put(
    "/tags/groups/:tagGroupId",
    authWithRoles,
    requireEditor,
    validateRequest({ params: linkDirectoryTagGroupIdParamSchema, body: linkDirectoryTagGroupCreateSchema }),
    linkDirectoryController.updateTagGroup
);
linkDirectoryRouter.delete(
    "/tags/groups/:tagGroupId",
    authWithRoles,
    requireEditor,
    validateRequest({ params: linkDirectoryTagGroupIdParamSchema }),
    linkDirectoryController.deleteTagGroup
);
linkDirectoryRouter.post(
    "/tags",
    authWithRoles,
    requireEditor,
    validateRequest({ body: tagBodySchema }),
    linkDirectoryController.createTag
);
linkDirectoryRouter.put(
    "/tags/:tagId",
    authWithRoles,
    requireEditor,
    validateRequest({ params: linkDirectoryTagIdParamSchema, body: tagUpdateBodySchema }),
    linkDirectoryController.updateTag
);
linkDirectoryRouter.delete(
    "/tags/:tagId",
    authWithRoles,
    requireEditor,
    validateRequest({ params: linkDirectoryTagIdParamSchema }),
    linkDirectoryController.deleteTag
);

// --- Editor: submissions ---
linkDirectoryRouter.get(
    "/admin/submissions",
    authWithRoles,
    requireEditor,
    linkDirectoryController.getAdminSubmissions
);
linkDirectoryRouter.patch(
    "/admin/submissions/:submissionId",
    authWithRoles,
    requireEditor,
    validateRequest({
        params: linkDirectorySubmissionIdParamSchema,
        body: linkDirectorySubmissionReviewSchema,
    }),
    linkDirectoryController.reviewSubmission
);

linkDirectoryRouter.get(
    "/admin/site-comments",
    authWithRoles,
    requireEditor,
    parseAdminSiteCommentsQuery,
    linkDirectoryController.getAdminSiteComments
);
linkDirectoryRouter.patch(
    "/admin/site-comments/:id/approve",
    authWithRoles,
    requireEditor,
    validateRequest({ params: linkDirectorySiteCommentIdParamSchema }),
    linkDirectoryController.approveSiteComment
);
linkDirectoryRouter.delete(
    "/admin/site-comments/:id",
    authWithRoles,
    requireEditor,
    validateRequest({ params: linkDirectorySiteCommentIdParamSchema }),
    linkDirectoryController.deleteSiteComment
);

// --- Editor: sites list ---
linkDirectoryRouter.get(
    "/all-full",
    authWithRoles,
    requireEditor,
    parseAdminQuery,
    linkDirectoryController.getAdminSites
);

linkDirectoryRouter.post(
    "/sites",
    authWithRoles,
    requireEditor,
    validateRequest({ body: linkDirectorySiteBodySchema }),
    linkDirectoryController.createSite
);

linkDirectoryRouter.post(
    "/sites/:siteId/opportunities",
    authWithRoles,
    requireEditor,
    validateRequest({
        params: linkDirectorySiteIdParamSchema,
        body: linkDirectoryOpportunityCreateSchema,
    }),
    linkDirectoryController.createOpportunity
);

linkDirectoryRouter.put(
    "/opportunities/:opportunityId",
    authWithRoles,
    requireEditor,
    validateRequest({
        params: linkDirectoryOpportunityIdParamSchema,
        body: linkDirectoryOpportunityUpdateSchema,
    }),
    linkDirectoryController.updateOpportunity
);

linkDirectoryRouter.delete(
    "/opportunities/:opportunityId",
    authWithRoles,
    requireEditor,
    validateRequest({ params: linkDirectoryOpportunityIdParamSchema }),
    linkDirectoryController.deleteOpportunity
);

linkDirectoryRouter.get(
    "/sites/:siteId",
    whenParamIsId,
    authWithRoles,
    requireEditor,
    validateRequest({ params: linkDirectorySiteIdParamSchema }),
    linkDirectoryController.getSiteById
);

linkDirectoryRouter.put(
    "/sites/:siteId",
    whenParamIsId,
    authWithRoles,
    requireEditor,
    validateRequest({ params: linkDirectorySiteIdParamSchema, body: linkDirectorySiteUpdateBodySchema }),
    linkDirectoryController.updateSite
);

linkDirectoryRouter.delete(
    "/sites/:siteId",
    whenParamIsId,
    authWithRoles,
    requireEditor,
    validateRequest({ params: linkDirectorySiteIdParamSchema }),
    linkDirectoryController.deleteSite
);

export { linkDirectoryRouter };
