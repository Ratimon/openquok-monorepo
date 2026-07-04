import { Router, type Request, type Response, type NextFunction } from "express";
import { listingController } from "../controllers/index";
import {
    requireFullAuthWithRoles,
    optionalAuthWithRoles,
    requireEditor,
} from "../guards";
import {
    createPublishedListingsParser,
    createAdminListingsParser,
    createCategoriesPaginationParser,
    createAdminListingCommentsParser,
    createAdminListingActivitiesParser,
} from "../middlewares/queryParsers";
import { supabaseAnonClient } from "../connections/index";
import { userRepository, rbacRepository } from "../repositories/index";
import { validateRequest } from "../middlewares/validateRequest";
import {
    listingCreateBodySchema,
    listingUpdateBodySchema,
    listingIdParamSchema,
    listingSlugParamSchema,
    listingStatParamSchema,
    listingCreatorUsernameParamSchema,
    listingCommentIdParamSchema,
    listingGithubImportBodySchema,
    listingCommentCreateSchema,
    listingCommentsParamSchema,
    listingRatingBodySchema,
} from "../data/schemas/listingSchemas";
import {
    listingCategoryCreateSchema,
    listingCategoryUpdateSchema,
    listingCategoryIdParamSchema,
} from "../data/schemas/listingCategorySchemas";
import {
    listingTagCreateSchema,
    listingTagUpdateSchema,
    listingTagIdParamSchema,
} from "../data/schemas/listingTagSchemas";
import { isValidUUID } from "../utils/validation/uuid";
import { z } from "zod";

type ListingRouter = ReturnType<typeof Router>;

const listingRouter: ListingRouter = Router();

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

const parsePublishedListingsQuery = createPublishedListingsParser();
const parseAdminListingsQuery = createAdminListingsParser();
const parseCategoriesPaginationQuery = createCategoriesPaginationParser();
const parseAdminListingCommentsQuery = createAdminListingCommentsParser();
const parseAdminListingActivitiesQuery = createAdminListingActivitiesParser();

const categoryBodySchema = z.object({
    categoryData: listingCategoryCreateSchema,
    categoryGroupIds: z.array(z.string().uuid()).optional(),
});

const categoryUpdateBodySchema = z.object({
    categoryData: listingCategoryUpdateSchema,
    categoryGroupIds: z.array(z.string().uuid()).optional(),
});

const tagBodySchema = z.object({
    tagData: listingTagCreateSchema,
    tagGroupIds: z.array(z.string().uuid()).optional(),
});

const tagUpdateBodySchema = z.object({
    tagData: listingTagUpdateSchema,
    tagGroupIds: z.array(z.string().uuid()).optional(),
});

const whenParamIsId = (req: Request, _res: Response, next: NextFunction): void => {
    const id = (req.params as { id?: string }).id;
    if (id && isValidUUID(id)) {
        next();
    } else {
        next("route");
    }
};

// --- Categories (before /:id) ---
listingRouter.get(
    "/categories/active-partial",
    parseCategoriesPaginationQuery,
    listingController.getActivePartialCategories
);
listingRouter.get(
    "/categories/active-full",
    parseCategoriesPaginationQuery,
    listingController.getActiveFullCategories
);
listingRouter.get("/categories/all-partial", listingController.getAllPartialCategories);
listingRouter.get("/categories/all-full", listingController.getAllFullCategories);
listingRouter.get("/categories/groups", listingController.getAllCategoryGroups);

listingRouter.post(
    "/categories",
    authWithRoles,
    requireEditor,
    validateRequest({ body: categoryBodySchema }),
    listingController.createCategory
);
listingRouter.put(
    "/categories/:categoryId",
    authWithRoles,
    requireEditor,
    validateRequest({ params: listingCategoryIdParamSchema, body: categoryUpdateBodySchema }),
    listingController.updateCategory
);
listingRouter.delete(
    "/categories/:categoryId",
    authWithRoles,
    requireEditor,
    validateRequest({ params: listingCategoryIdParamSchema }),
    listingController.deleteCategory
);

// --- Tags ---
listingRouter.get("/tags/active-partial", listingController.getActivePartialTags);
listingRouter.get("/tags/active-full", listingController.getActiveFullTags);
listingRouter.get("/tags/all-full", listingController.getAllFullTags);
listingRouter.get("/tags/groups", listingController.getAllTagGroups);

listingRouter.post(
    "/tags",
    authWithRoles,
    requireEditor,
    validateRequest({ body: tagBodySchema }),
    listingController.createTag
);
listingRouter.put(
    "/tags/:tagId",
    authWithRoles,
    requireEditor,
    validateRequest({ params: listingTagIdParamSchema, body: tagUpdateBodySchema }),
    listingController.updateTag
);
listingRouter.delete(
    "/tags/:tagId",
    authWithRoles,
    requireEditor,
    validateRequest({ params: listingTagIdParamSchema }),
    listingController.deleteTag
);

// --- Creators ---
listingRouter.get("/creators", listingController.getListingCreators);
listingRouter.get(
    "/creators/:username",
    validateRequest({ params: listingCreatorUsernameParamSchema }),
    listingController.getCreatorListings
);

// --- Stats (public) ---
listingRouter.put(
    "/stats/views/:listingId",
    optionalAuth,
    validateRequest({ params: listingStatParamSchema }),
    listingController.incrementViews
);
listingRouter.put(
    "/stats/likes/:listingId",
    optionalAuth,
    validateRequest({ params: listingStatParamSchema }),
    listingController.incrementLikes
);
listingRouter.put(
    "/stats/clicks/:listingId",
    optionalAuth,
    validateRequest({ params: listingStatParamSchema }),
    listingController.incrementClicks
);

// --- Published listings ---
listingRouter.get("/information", listingController.getListingInformation);
listingRouter.get("/published", parsePublishedListingsQuery, listingController.getPublishedListings);
listingRouter.get(
    "/stacks/published",
    parsePublishedListingsQuery,
    listingController.getPublishedStacks
);

listingRouter.get(
    "/published/:slug/skill-markdown",
    validateRequest({ params: listingSlugParamSchema }),
    listingController.getSkillMarkdown
);

listingRouter.get(
    "/stacks/published/:slug",
    validateRequest({ params: listingSlugParamSchema }),
    listingController.getPublishedStackBySlug
);

listingRouter.get(
    "/published/:slug",
    validateRequest({ params: listingSlugParamSchema }),
    listingController.getPublishedListingBySlug
);

listingRouter.get("/me/bookmarks", authWithRoles, listingController.getUserBookmarks);

listingRouter.get("/me/stats", authWithRoles, listingController.getOwnedListingStats);

listingRouter.get("/me/listings", authWithRoles, listingController.getOwnedListings);

listingRouter.get(
    "/me/listings/:id",
    whenParamIsId,
    authWithRoles,
    validateRequest({ params: listingIdParamSchema }),
    listingController.getOwnedListingById
);

listingRouter.post(
    "/me/listings",
    authWithRoles,
    validateRequest({ body: listingCreateBodySchema }),
    listingController.createOwnedListing
);

listingRouter.put(
    "/me/listings/:id",
    whenParamIsId,
    authWithRoles,
    validateRequest({ params: listingIdParamSchema, body: listingUpdateBodySchema }),
    listingController.updateOwnedListing
);

listingRouter.delete(
    "/me/listings/:id",
    whenParamIsId,
    authWithRoles,
    validateRequest({ params: listingIdParamSchema }),
    listingController.deleteOwnedListing
);

listingRouter.get(
    "/:listingId/comments",
    validateRequest({ params: listingCommentsParamSchema }),
    listingController.getListingComments
);

listingRouter.post(
    "/comments",
    authWithRoles,
    validateRequest({ body: listingCommentCreateSchema }),
    listingController.createListingComment
);

// --- Admin ---
listingRouter.get(
    "/admin/comments",
    authWithRoles,
    requireEditor,
    parseAdminListingCommentsQuery,
    listingController.getAdminListingComments
);

listingRouter.get(
    "/admin/activities",
    authWithRoles,
    requireEditor,
    parseAdminListingActivitiesQuery,
    listingController.getAdminListingActivities
);

listingRouter.patch(
    "/comments/:id/approve",
    authWithRoles,
    requireEditor,
    validateRequest({ params: listingCommentIdParamSchema }),
    listingController.approveListingComment
);

listingRouter.delete(
    "/comments/:id",
    authWithRoles,
    requireEditor,
    validateRequest({ params: listingCommentIdParamSchema }),
    listingController.deleteListingComment
);

listingRouter.get(
    "/all-full",
    authWithRoles,
    requireEditor,
    parseAdminListingsQuery,
    listingController.getAdminListings
);

listingRouter.post(
    "/import/github",
    authWithRoles,
    requireEditor,
    validateRequest({ body: listingGithubImportBodySchema }),
    listingController.importFromGithub
);

listingRouter.post(
    "/:id/sync-github",
    whenParamIsId,
    authWithRoles,
    requireEditor,
    validateRequest({ params: listingIdParamSchema }),
    listingController.syncListingFromGithub
);

listingRouter.get(
    "/:id",
    whenParamIsId,
    authWithRoles,
    requireEditor,
    validateRequest({ params: listingIdParamSchema }),
    listingController.getListingById
);

listingRouter.post(
    "/",
    authWithRoles,
    requireEditor,
    validateRequest({ body: listingCreateBodySchema }),
    listingController.createListing
);

listingRouter.put(
    "/:id",
    whenParamIsId,
    authWithRoles,
    requireEditor,
    validateRequest({ params: listingIdParamSchema, body: listingUpdateBodySchema }),
    listingController.updateListing
);

listingRouter.post(
    "/:id/ratings",
    whenParamIsId,
    authWithRoles,
    validateRequest({ params: listingIdParamSchema, body: listingRatingBodySchema }),
    listingController.upsertListingRating
);

listingRouter.post(
    "/:id/bookmark",
    whenParamIsId,
    authWithRoles,
    validateRequest({ params: listingIdParamSchema }),
    listingController.addBookmark
);

listingRouter.delete(
    "/:id/bookmark",
    whenParamIsId,
    authWithRoles,
    validateRequest({ params: listingIdParamSchema }),
    listingController.removeBookmark
);

listingRouter.delete(
    "/:id",
    whenParamIsId,
    authWithRoles,
    requireEditor,
    validateRequest({ params: listingIdParamSchema }),
    listingController.deleteListing
);

export { listingRouter };
