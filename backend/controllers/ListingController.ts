import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../guards";
import type {
    ListingCreateBodySchemaType,
    ListingUpdateBodySchemaType,
} from "../data/schemas/listingSchemas";
import type {
    ListingCategoryCreateSchemaType,
    ListingCategoryUpdateSchemaType,
} from "../data/schemas/listingCategorySchemas";
import type {
    ListingTagCreateSchemaType,
    ListingTagUpdateSchemaType,
} from "../data/schemas/listingTagSchemas";
import type {
    ParsedPublishedListingsQuery,
    ParsedAdminListingsQuery,
    ParsedCategoriesPaginationQuery,
    ParsedAdminListingCommentsQuery,
    ParsedAdminListingActivitiesQuery,
} from "../middlewares/queryParsers";
import { ListingService } from "../services/ListingService";
import { ListingDTOMapper, ListingAdminDTOMapper } from "../utils/dtos/ListingDTO";
import { DatabaseEntityNotFoundError } from "../errors/InfraError";
import type { ExtensionType, ListingKind, ListingComment } from "../data/types/listingTypes";

export class ListingController {
    constructor(private readonly listingService: ListingService) {}

    getListingInformation = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.listingService.getListingInformation();
            res.status(200).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    };

    getPublishedListings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const q = (req as Request & { parsedQuery?: ParsedPublishedListingsQuery }).parsedQuery ?? {};
            const { listingsResult, countResult } = await this.listingService.getPublishedListings({
                limit: q.limit,
                skipId: q.skipId,
                skip: q.skip,
                searchTerm: q.searchTerm,
                tagSlugs: q.tagSlugs,
                categorySlug: q.categorySlug,
                extensionType: q.extensionType as ExtensionType | null | undefined,
                listingKind: (q.listingKind as ListingKind | undefined) ?? "extension",
                sortByKey: q.sortByKey,
                sortByOrder: q.sortByOrder,
                range: q.range,
            });
            res.status(200).json({
                success: true,
                data: ListingDTOMapper.toDTOCollection(listingsResult),
                count: countResult,
            });
        } catch (err) {
            next(err);
        }
    };

    getPublishedStacks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const q = (req as Request & { parsedQuery?: ParsedPublishedListingsQuery }).parsedQuery ?? {};
            const { listingsResult, countResult } = await this.listingService.getPublishedListings({
                ...q,
                listingKind: "stack",
                extensionType: null,
            });
            res.status(200).json({
                success: true,
                data: ListingDTOMapper.toDTOCollection(listingsResult),
                count: countResult,
            });
        } catch (err) {
            next(err);
        }
    };

    getPublishedListingBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { slug } = req.params as { slug: string };
            const listing = await this.listingService.getPublishedListingBySlug(slug, "extension");
            if (!listing) {
                throw new DatabaseEntityNotFoundError("Extension not found", { slug });
            }
            res.status(200).json({
                success: true,
                data: ListingDTOMapper.toDTO(listing),
            });
        } catch (err) {
            next(err);
        }
    };

    getPublishedStackBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { slug } = req.params as { slug: string };
            const listing = await this.listingService.getPublishedListingBySlug(slug, "stack");
            if (!listing) {
                throw new DatabaseEntityNotFoundError("Stack not found", { slug });
            }
            res.status(200).json({
                success: true,
                data: ListingDTOMapper.toDTO(listing),
            });
        } catch (err) {
            next(err);
        }
    };

    getSkillMarkdown = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { slug } = req.params as { slug: string };
            const content = await this.listingService.getSkillMarkdown(slug);
            if (content == null) {
                throw new DatabaseEntityNotFoundError("Skill markdown not found", { slug });
            }
            res.setHeader("Content-Type", "text/markdown; charset=utf-8");
            res.status(200).send(content);
        } catch (err) {
            next(err);
        }
    };

    getAdminListings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const q = (req as Request & { parsedQuery?: ParsedAdminListingsQuery }).parsedQuery ?? {};
            const { listingsResult, countResult } = await this.listingService.getAdminListings({
                limit: q.limit,
                searchTerm: q.searchTerm,
                listingKind: q.listingKind as ListingKind | null | undefined,
                sortByKey: q.sortByKey,
                sortByOrder: q.sortByOrder,
                range: q.range,
            });
            res.status(200).json({
                success: true,
                data: ListingDTOMapper.toDTOCollection(listingsResult),
                count: countResult,
            });
        } catch (err) {
            next(err);
        }
    };

    getListingById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params as { id: string };
            const listing = await this.listingService.getListingById(id);
            res.status(200).json({
                success: true,
                data: ListingDTOMapper.toDTO(listing),
            });
        } catch (err) {
            next(err);
        }
    };

    getListingCreators = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.listingService.getListingCreators();
            res.status(200).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    };

    getCreatorListings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { username } = req.params as { username: string };
            const listings = await this.listingService.getCreatorListings(username);
            res.status(200).json({
                success: true,
                data: ListingDTOMapper.toDTOCollection(listings),
            });
        } catch (err) {
            next(err);
        }
    };

    incrementViews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            const { listingId } = req.params as { listingId: string };
            await this.listingService.incrementStatCounter(listingId, "views", authReq.user?.publicId ?? null);
            res.status(200).json({ success: true, message: "View recorded" });
        } catch (err) {
            next(err);
        }
    };

    incrementLikes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            const { listingId } = req.params as { listingId: string };
            await this.listingService.incrementStatCounter(listingId, "likes", authReq.user?.publicId ?? null);
            res.status(200).json({ success: true, message: "Like recorded" });
        } catch (err) {
            next(err);
        }
    };

    incrementClicks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            const { listingId } = req.params as { listingId: string };
            await this.listingService.incrementStatCounter(listingId, "clicks", authReq.user?.publicId ?? null);
            res.status(200).json({ success: true, message: "Click recorded" });
        } catch (err) {
            next(err);
        }
    };

    createListing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.publicId;
            if (!userId) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }
            const isPlatformAdmin = authReq.user?.isPlatformAdmin === true;
            const result = await this.listingService.createListing(
                req.body as ListingCreateBodySchemaType,
                userId,
                isPlatformAdmin
            );
            res.status(201).json({
                success: true,
                data: result,
                message: "Listing created successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    updateListing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            const actorUserId = authReq.user?.publicId;
            if (!actorUserId) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }
            const isPlatformAdmin = authReq.user?.isPlatformAdmin === true;
            const id = (req.params as { id: string }).id;
            const body = req.body as ListingUpdateBodySchemaType;
            body.listingData.id = id;
            const result = await this.listingService.updateListing(body, actorUserId, isPlatformAdmin);
            res.status(200).json({
                success: true,
                data: result,
                message: "Listing updated successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    deleteListing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params as { id: string };
            await this.listingService.deleteListing(id);
            res.status(200).json({ success: true, message: "Listing deleted successfully" });
        } catch (err) {
            next(err);
        }
    };

    // Categories
    getActivePartialCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const q = (req as Request & { parsedQuery?: ParsedCategoriesPaginationQuery }).parsedQuery ?? {};
            const data = await this.listingService.getActivePartialCategories(q);
            res.status(200).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    };

    getActiveFullCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const q = (req as Request & { parsedQuery?: ParsedCategoriesPaginationQuery }).parsedQuery ?? {};
            const data = await this.listingService.getActiveFullCategories(q);
            res.status(200).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    };

    getAllPartialCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.listingService.getAllPartialCategories();
            res.status(200).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    };

    getAllFullCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.listingService.getAllFullCategories();
            res.status(200).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    };

    createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const body = req.body as {
                categoryData: ListingCategoryCreateSchemaType;
                categoryGroupIds?: string[];
            };
            const result = await this.listingService.createCategory(
                body.categoryData,
                body.categoryGroupIds ?? []
            );
            res.status(201).json({ success: true, data: result });
        } catch (err) {
            next(err);
        }
    };

    updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { categoryId } = req.params as { categoryId: string };
            const body = req.body as {
                categoryData: ListingCategoryUpdateSchemaType;
                categoryGroupIds?: string[];
            };
            body.categoryData.id = categoryId;
            const result = await this.listingService.updateCategory(
                body.categoryData,
                body.categoryGroupIds ?? []
            );
            res.status(200).json({ success: true, data: result });
        } catch (err) {
            next(err);
        }
    };

    deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { categoryId } = req.params as { categoryId: string };
            await this.listingService.deleteCategory(categoryId);
            res.status(200).json({ success: true, message: "Category deleted" });
        } catch (err) {
            next(err);
        }
    };

    getAllCategoryGroups = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.listingService.getAllCategoryGroups();
            res.status(200).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    };

    // Tags
    getActivePartialTags = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.listingService.getActivePartialTags();
            res.status(200).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    };

    getActiveFullTags = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.listingService.getActiveFullTags();
            res.status(200).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    };

    getAllFullTags = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.listingService.getAllFullTags();
            res.status(200).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    };

    createTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const body = req.body as { tagData: ListingTagCreateSchemaType; tagGroupIds?: string[] };
            const result = await this.listingService.createTag(body.tagData, body.tagGroupIds ?? []);
            res.status(201).json({ success: true, data: result });
        } catch (err) {
            next(err);
        }
    };

    updateTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { tagId } = req.params as { tagId: string };
            const body = req.body as { tagData: ListingTagUpdateSchemaType; tagGroupIds?: string[] };
            body.tagData.id = tagId;
            const result = await this.listingService.updateTag(body.tagData, body.tagGroupIds ?? []);
            res.status(200).json({ success: true, data: result });
        } catch (err) {
            next(err);
        }
    };

    deleteTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { tagId } = req.params as { tagId: string };
            await this.listingService.deleteTag(tagId);
            res.status(200).json({ success: true, message: "Tag deleted" });
        } catch (err) {
            next(err);
        }
    };

    getAllTagGroups = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.listingService.getAllTagGroups();
            res.status(200).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    };

    getAdminListingComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsedQuery = (req as Request & { parsedQuery?: ParsedAdminListingCommentsQuery }).parsedQuery ?? {};
            const { commentsResult, countResult } = await this.listingService.getAdminListingComments({
                limit: parsedQuery.limit,
                searchTerm: parsedQuery.searchTerm,
                sortByKey: parsedQuery.sortByKey,
                sortByOrder: parsedQuery.sortByOrder,
                range: parsedQuery.range,
            });
            res.status(200).json({
                success: true,
                data: {
                    commentsResult: ListingAdminDTOMapper.toAdminCommentDTOCollection(commentsResult),
                    countResult,
                },
            });
        } catch (err) {
            next(err);
        }
    };

    getAdminListingActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsedQuery = (req as Request & { parsedQuery?: ParsedAdminListingActivitiesQuery }).parsedQuery ?? {};
            const { activitiesResult, countResult } = await this.listingService.getAdminListingActivities({
                limit: parsedQuery.limit,
                sortByKey: parsedQuery.sortByKey,
                sortByOrder: parsedQuery.sortByOrder,
                range: parsedQuery.range,
                listing_id: parsedQuery.listing_id,
                activity_type: parsedQuery.activity_type as import("../data/types/listingTypes").ListingActivityType | null,
            });
            res.status(200).json({
                success: true,
                data: {
                    activitiesResult: ListingAdminDTOMapper.toAdminActivityDTOCollection(activitiesResult),
                    countResult,
                },
            });
        } catch (err) {
            next(err);
        }
    };

    approveListingComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params as { id: string };
            const result = await this.listingService.approveListingComment(id);
            res.status(200).json({ success: true, data: result, message: "Comment approved." });
        } catch (err) {
            next(err);
        }
    };

    getListingComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { listingId } = req.params as { listingId: string };
            const comments = await this.listingService.getListingComments(listingId);
            res.status(200).json({
                success: true,
                data: ListingAdminDTOMapper.toPublicCommentDTOCollection(comments),
            });
        } catch (err) {
            next(err);
        }
    };

    createListingComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.publicId;
            if (!userId) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }
            const result = await this.listingService.createListingComment(
                req.body as import("../data/schemas/listingSchemas").ListingCommentCreateSchemaType,
                userId,
                authReq.user?.id
            );
            res.status(201).json({
                success: true,
                data: result,
                message: "Comment submitted. It may appear after moderation.",
            });
        } catch (err) {
            next(err);
        }
    };

    upsertListingRating = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.publicId;
            if (!userId) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }
            const { id } = req.params as { id: string };
            const { rating } = req.body as { rating: number };
            const result = await this.listingService.upsertListingRating(
                id,
                rating,
                userId,
                authReq.user?.id
            );
            res.status(200).json({ success: true, data: result, message: "Rating saved." });
        } catch (err) {
            next(err);
        }
    };

    cloneStack = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.publicId;
            if (!userId) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }
            const { id } = req.params as { id: string };
            const result = await this.listingService.cloneStack(id, userId, authReq.user?.id);
            res.status(201).json({
                success: true,
                data: result,
                message: "Stack cloned as a new draft.",
            });
        } catch (err) {
            next(err);
        }
    };

    getUserBookmarks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.publicId;
            if (!userId) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }
            const listings = await this.listingService.getUserBookmarks(userId, authReq.user?.id);
            res.status(200).json({
                success: true,
                data: ListingDTOMapper.toDTOCollection(listings),
                count: listings.length,
            });
        } catch (err) {
            next(err);
        }
    };

    addBookmark = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.publicId;
            if (!userId) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }
            const { id } = req.params as { id: string };
            await this.listingService.addBookmark(id, userId, authReq.user?.id);
            res.status(200).json({ success: true, message: "Extension bookmarked." });
        } catch (err) {
            next(err);
        }
    };

    removeBookmark = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.publicId;
            if (!userId) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }
            const { id } = req.params as { id: string };
            await this.listingService.removeBookmark(id, userId, authReq.user?.id);
            res.status(200).json({ success: true, message: "Bookmark removed." });
        } catch (err) {
            next(err);
        }
    };

    deleteListingComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params as { id: string };
            await this.listingService.deleteListingComment(id);
            res.status(200).json({ success: true, message: "Comment deleted." });
        } catch (err) {
            next(err);
        }
    };

    importFromGithub = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { githubUrl, extensionType } = req.body as {
                githubUrl: string;
                extensionType?: "skills" | "mcp" | "both" | null;
            };
            const preview = await this.listingService.previewGithubImport(githubUrl, extensionType ?? null);
            res.status(200).json({ success: true, data: preview });
        } catch (err) {
            next(err);
        }
    };

    syncListingFromGithub = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params as { id: string };
            const result = await this.listingService.syncListingFromGithub(id);
            res.status(200).json({ success: true, data: result, message: result.contentChanged ? "Content updated from GitHub." : "Already up to date." });
        } catch (err) {
            next(err);
        }
    };

    getOwnedListingStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.publicId;
            if (!userId) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }
            const stats = await this.listingService.getOwnedListingStats(userId);
            res.status(200).json({
                success: true,
                data: stats,
            });
        } catch (err) {
            next(err);
        }
    };

    getOwnedListings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.publicId;
            if (!userId) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }
            const listingKind = (req.query.listing_kind as ListingKind | undefined) ?? undefined;
            const { data, count } = await this.listingService.getOwnedListings(userId, listingKind);
            res.status(200).json({
                success: true,
                data: ListingDTOMapper.toDTOCollection(data),
                count,
            });
        } catch (err) {
            next(err);
        }
    };

    getOwnedListingById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.publicId;
            if (!userId) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }
            const { id } = req.params as { id: string };
            const listing = await this.listingService.getOwnedListingById(id, userId);
            res.status(200).json({
                success: true,
                data: ListingDTOMapper.toDTO(listing),
            });
        } catch (err) {
            next(err);
        }
    };

    createOwnedListing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.publicId;
            if (!userId) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }
            const result = await this.listingService.createOwnedListing(
                req.body as ListingCreateBodySchemaType,
                userId,
                authReq.user?.id
            );
            res.status(201).json({
                success: true,
                data: result,
                message: "Listing created.",
            });
        } catch (err) {
            next(err);
        }
    };

    updateOwnedListing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.publicId;
            if (!userId) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }
            const { id } = req.params as { id: string };
            const body = req.body as ListingUpdateBodySchemaType;
            body.listingData.id = id;
            const result = await this.listingService.updateOwnedListing(body, userId, authReq.user?.id);
            res.status(200).json({
                success: true,
                data: result,
                message: "Listing updated.",
            });
        } catch (err) {
            next(err);
        }
    };

    deleteOwnedListing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.publicId;
            if (!userId) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }
            const { id } = req.params as { id: string };
            await this.listingService.deleteOwnedListing(id, userId, authReq.user?.id);
            res.status(200).json({ success: true, message: "Listing deleted." });
        } catch (err) {
            next(err);
        }
    };
}
