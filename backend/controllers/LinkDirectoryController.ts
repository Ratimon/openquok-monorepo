import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../guards";
import type {
    ParsedPublishedLinkDirectoryQuery,
    ParsedAdminLinkDirectoryQuery,
    ParsedAdminLinkDirectorySiteCommentsQuery,
} from "../middlewares/queryParsers";
import type {
    LinkDirectoryCategoryCreateSchemaType,
    LinkDirectoryCategoryUpdateSchemaType,
    LinkDirectoryOpportunityCreateSchemaType,
    LinkDirectoryOpportunityUpdateSchemaType,
    LinkDirectorySiteCreateSchemaType,
    LinkDirectorySiteUpdateSchemaType,
    LinkDirectorySubmissionCreateSchemaType,
    LinkDirectorySubmissionReviewSchemaType,
    LinkDirectoryTagCreateSchemaType,
    LinkDirectoryTagGroupCreateSchemaType,
    LinkDirectoryTagUpdateSchemaType,
    LinkDirectorySavedSitesPutSchemaType,
    LinkDirectorySavedSitesOrderSchemaType,
    LinkDirectorySavedSiteOutreachCompletionSchemaType,
    LinkDirectorySiteCommentCreateSchemaType,
    LinkDirectorySiteRatingBodySchemaType,
} from "../data/schemas/linkDirectorySchemas";
import { LinkDirectoryService } from "../services/LinkDirectoryService";
import {
    toLinkDirectorySavedSiteDtoCollection,
    toLinkDirectoryCategoryDtoCollection,
    toLinkDirectoryOpportunityTypeDtoCollection,
    toLinkDirectorySiteDto,
    toLinkDirectorySiteDtoCollection,
    toLinkDirectorySubmissionDtoCollection,
    toLinkDirectoryTagDtoCollection,
    toLinkDirectorySiteCommentDtoCollection,
    toAdminLinkDirectorySiteCommentDtoCollection,
} from "../utils/dtos/LinkDirectoryDTO";
import { DatabaseEntityNotFoundError } from "../errors/InfraError";
import type {
    LinkDirectoryApprovalMode,
    LinkDirectoryCostTier,
    LinkDirectoryDofollow,
    LinkDirectoryEffort,
} from "../data/types/linkDirectoryTypes";

export class LinkDirectoryController {
    constructor(private readonly linkDirectoryService: LinkDirectoryService) {}

    getPublishedHubStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const stats = await this.linkDirectoryService.getPublishedHubStats();
            res.status(200).json({
                success: true,
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    };

    getPublishedSites = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const q = (req as Request & { parsedQuery?: ParsedPublishedLinkDirectoryQuery }).parsedQuery ?? {};
            const { sites, count } = await this.linkDirectoryService.getPublishedSites({
                limit: q.limit,
                skip: q.skip,
                searchTerm: q.searchTerm,
                tagSlugs: q.tagSlugs,
                categorySlug: q.categorySlug,
                costTiers: q.costTiers as LinkDirectoryCostTier[] | null | undefined,
                dofollow: q.dofollow as LinkDirectoryDofollow[] | null | undefined,
                effort: q.effort as LinkDirectoryEffort[] | null | undefined,
                approvalMode: q.approvalMode as LinkDirectoryApprovalMode[] | null | undefined,
                opportunityTypeSlugs: q.opportunityTypeSlugs,
                sortByKey: q.sortByKey,
                sortByOrder: q.sortByOrder,
                range: q.range,
            });
            res.status(200).json({
                success: true,
                data: toLinkDirectorySiteDtoCollection(sites),
                count,
            });
        } catch (err) {
            next(err);
        }
    };

    getPublishedSiteBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { siteSlug } = req.params as { siteSlug: string };
            const site = await this.linkDirectoryService.getPublishedSiteBySlug(siteSlug);
            if (!site) {
                throw new DatabaseEntityNotFoundError("Link directory site not found", { siteSlug });
            }
            res.status(200).json({
                success: true,
                data: toLinkDirectorySiteDto(site),
            });
        } catch (err) {
            next(err);
        }
    };

    getActiveCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const categories = await this.linkDirectoryService.getActiveCategories();
            res.status(200).json({
                success: true,
                data: toLinkDirectoryCategoryDtoCollection(categories),
            });
        } catch (err) {
            next(err);
        }
    };

    getActiveTags = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tags = await this.linkDirectoryService.getActiveTags();
            res.status(200).json({
                success: true,
                data: toLinkDirectoryTagDtoCollection(tags),
            });
        } catch (err) {
            next(err);
        }
    };

    getOpportunityTypes = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const types = await this.linkDirectoryService.getOpportunityTypes();
            res.status(200).json({
                success: true,
                data: toLinkDirectoryOpportunityTypeDtoCollection(types),
            });
        } catch (err) {
            next(err);
        }
    };

    createSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const body = req.body as LinkDirectorySubmissionCreateSchemaType;
            const auth = req as AuthenticatedRequest;
            const id = await this.linkDirectoryService.createSubmission(body, auth.user?.publicId);
            res.status(201).json({
                success: true,
                data: { id },
                message: "Submission received. Our editors will review it.",
            });
        } catch (err) {
            next(err);
        }
    };

    getUserSavedSites = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const auth = req as AuthenticatedRequest;
            const userId = auth.user?.publicId;
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }
            const savedSites = await this.linkDirectoryService.getUserSavedSites(userId);
            res.status(200).json({
                success: true,
                data: toLinkDirectorySavedSiteDtoCollection(savedSites),
            });
        } catch (err) {
            next(err);
        }
    };

    putUserSavedSites = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const auth = req as AuthenticatedRequest;
            const userId = auth.user?.publicId;
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }
            const { siteIds } = req.body as LinkDirectorySavedSitesPutSchemaType;
            await this.linkDirectoryService.replaceUserSavedSites(userId, siteIds);
            const savedSites = await this.linkDirectoryService.getUserSavedSites(userId);
            res.status(200).json({
                success: true,
                data: toLinkDirectorySavedSiteDtoCollection(savedSites),
                message: "Saved sites updated.",
            });
        } catch (err) {
            next(err);
        }
    };

    putUserSavedSitesOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const auth = req as AuthenticatedRequest;
            const userId = auth.user?.publicId;
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }
            const { siteIds } = req.body as LinkDirectorySavedSitesOrderSchemaType;
            await this.linkDirectoryService.reorderUserSavedSites(userId, siteIds);
            const savedSites = await this.linkDirectoryService.getUserSavedSites(userId);
            res.status(200).json({
                success: true,
                data: toLinkDirectorySavedSiteDtoCollection(savedSites),
                message: "Saved site order updated.",
            });
        } catch (err) {
            next(err);
        }
    };

    patchUserSavedSiteOutreachCompletion = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const auth = req as AuthenticatedRequest;
            const userId = auth.user?.publicId;
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }
            const siteId = (req.params as { siteId: string }).siteId;
            const { completed } = req.body as LinkDirectorySavedSiteOutreachCompletionSchemaType;
            await this.linkDirectoryService.setUserSavedSiteOutreachCompleted(userId, siteId, completed);
            const savedSites = await this.linkDirectoryService.getUserSavedSites(userId);
            res.status(200).json({
                success: true,
                data: toLinkDirectorySavedSiteDtoCollection(savedSites),
                message: completed ? "Outreach marked done." : "Outreach marked not done.",
            });
        } catch (err) {
            next(err);
        }
    };

    getAdminSites = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const q = (req as Request & { parsedQuery?: ParsedAdminLinkDirectoryQuery }).parsedQuery ?? {};
            const { sites, count } = await this.linkDirectoryService.getAdminSites({
                limit: q.limit,
                searchTerm: q.searchTerm,
                sortByKey: q.sortByKey,
                sortByOrder: q.sortByOrder,
                range: q.range,
            });
            res.status(200).json({
                success: true,
                data: toLinkDirectorySiteDtoCollection(sites),
                count,
            });
        } catch (err) {
            next(err);
        }
    };

    getSiteById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { siteId } = req.params as { siteId: string };
            const site = await this.linkDirectoryService.getSiteById(siteId);
            res.status(200).json({
                success: true,
                data: toLinkDirectorySiteDto(site),
            });
        } catch (err) {
            next(err);
        }
    };

    createSite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { siteData, tagIds } = req.body as {
                siteData: LinkDirectorySiteCreateSchemaType;
                tagIds?: string[];
            };
            const id = await this.linkDirectoryService.createSite(siteData, tagIds ?? []);
            res.status(201).json({ success: true, data: { id }, message: "Site created." });
        } catch (err) {
            next(err);
        }
    };

    updateSite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { siteId } = req.params as { siteId: string };
            const { siteData, tagIds } = req.body as {
                siteData: LinkDirectorySiteUpdateSchemaType;
                tagIds?: string[];
            };
            siteData.id = siteId;
            const id = await this.linkDirectoryService.updateSite(siteData, tagIds);
            res.status(200).json({ success: true, data: { id }, message: "Site updated." });
        } catch (err) {
            next(err);
        }
    };

    deleteSite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { siteId } = req.params as { siteId: string };
            await this.linkDirectoryService.deleteSite(siteId);
            res.status(200).json({ success: true, message: "Site deleted." });
        } catch (err) {
            next(err);
        }
    };

    createOpportunity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { siteId } = req.params as { siteId: string };
            const payload = req.body as LinkDirectoryOpportunityCreateSchemaType;
            const id = await this.linkDirectoryService.createOpportunity(siteId, payload);
            res.status(201).json({ success: true, data: { id }, message: "Opportunity created." });
        } catch (err) {
            next(err);
        }
    };

    updateOpportunity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { opportunityId } = req.params as { opportunityId: string };
            const payload = req.body as LinkDirectoryOpportunityUpdateSchemaType;
            payload.id = opportunityId;
            const id = await this.linkDirectoryService.updateOpportunity(payload);
            res.status(200).json({ success: true, data: { id }, message: "Opportunity updated." });
        } catch (err) {
            next(err);
        }
    };

    deleteOpportunity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { opportunityId } = req.params as { opportunityId: string };
            await this.linkDirectoryService.deleteOpportunity(opportunityId);
            res.status(200).json({ success: true, message: "Opportunity deleted." });
        } catch (err) {
            next(err);
        }
    };

    getAllCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const categories = await this.linkDirectoryService.getAllCategories();
            res.status(200).json({
                success: true,
                data: toLinkDirectoryCategoryDtoCollection(categories),
            });
        } catch (err) {
            next(err);
        }
    };

    createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const payload = req.body as LinkDirectoryCategoryCreateSchemaType;
            const id = await this.linkDirectoryService.createCategory(payload);
            res.status(201).json({ success: true, data: { id }, message: "Category created." });
        } catch (err) {
            next(err);
        }
    };

    updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { categoryId } = req.params as { categoryId: string };
            const payload = req.body as LinkDirectoryCategoryUpdateSchemaType;
            payload.id = categoryId;
            const id = await this.linkDirectoryService.updateCategory(payload);
            res.status(200).json({ success: true, data: { id }, message: "Category updated." });
        } catch (err) {
            next(err);
        }
    };

    deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { categoryId } = req.params as { categoryId: string };
            await this.linkDirectoryService.deleteCategory(categoryId);
            res.status(200).json({ success: true, message: "Category deleted." });
        } catch (err) {
            next(err);
        }
    };

    getAllTags = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tags = await this.linkDirectoryService.getAllTags();
            res.status(200).json({
                success: true,
                data: toLinkDirectoryTagDtoCollection(tags),
            });
        } catch (err) {
            next(err);
        }
    };

    getAllTagGroups = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const groups = await this.linkDirectoryService.getAllTagGroups();
            res.status(200).json({ success: true, data: groups });
        } catch (err) {
            next(err);
        }
    };

    createTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { tagData, tagGroupIds } = req.body as {
                tagData: LinkDirectoryTagCreateSchemaType;
                tagGroupIds?: string[];
            };
            const id = await this.linkDirectoryService.createTag(tagData, tagGroupIds ?? []);
            res.status(201).json({ success: true, data: { id }, message: "Tag created." });
        } catch (err) {
            next(err);
        }
    };

    updateTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { tagId } = req.params as { tagId: string };
            const { tagData, tagGroupIds } = req.body as {
                tagData: LinkDirectoryTagUpdateSchemaType;
                tagGroupIds?: string[];
            };
            tagData.id = tagId;
            const id = await this.linkDirectoryService.updateTag(tagData, tagGroupIds ?? []);
            res.status(200).json({ success: true, data: { id }, message: "Tag updated." });
        } catch (err) {
            next(err);
        }
    };

    deleteTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { tagId } = req.params as { tagId: string };
            await this.linkDirectoryService.deleteTag(tagId);
            res.status(200).json({ success: true, message: "Tag deleted." });
        } catch (err) {
            next(err);
        }
    };

    createTagGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const payload = req.body as LinkDirectoryTagGroupCreateSchemaType;
            const id = await this.linkDirectoryService.createTagGroup(payload);
            res.status(201).json({ success: true, data: { id }, message: "Tag group created." });
        } catch (err) {
            next(err);
        }
    };

    updateTagGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { tagGroupId } = req.params as { tagGroupId: string };
            const payload = req.body as LinkDirectoryTagGroupCreateSchemaType;
            const id = await this.linkDirectoryService.updateTagGroup(tagGroupId, payload);
            res.status(200).json({ success: true, data: { id }, message: "Tag group updated." });
        } catch (err) {
            next(err);
        }
    };

    deleteTagGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { tagGroupId } = req.params as { tagGroupId: string };
            await this.linkDirectoryService.deleteTagGroup(tagGroupId);
            res.status(200).json({ success: true, message: "Tag group deleted." });
        } catch (err) {
            next(err);
        }
    };

    getAdminSubmissions = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const submissions = await this.linkDirectoryService.getAdminSubmissions();
            res.status(200).json({
                success: true,
                data: toLinkDirectorySubmissionDtoCollection(submissions),
            });
        } catch (err) {
            next(err);
        }
    };

    reviewSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const auth = req as AuthenticatedRequest;
            const reviewerId = auth.user?.publicId;
            if (!reviewerId) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }
            const { submissionId } = req.params as { submissionId: string };
            const { status } = req.body as LinkDirectorySubmissionReviewSchemaType;
            await this.linkDirectoryService.reviewSubmission(submissionId, status, reviewerId);
            res.status(200).json({ success: true, message: `Submission marked ${status}.` });
        } catch (err) {
            next(err);
        }
    };

    incrementSiteViews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { siteId } = req.params as { siteId: string };
            await this.linkDirectoryService.incrementSiteViews(siteId);
            res.status(200).json({ success: true, message: "View recorded" });
        } catch (err) {
            next(err);
        }
    };

    incrementSiteLikes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { siteId } = req.params as { siteId: string };
            await this.linkDirectoryService.incrementSiteLikes(siteId);
            res.status(200).json({ success: true, message: "Like recorded" });
        } catch (err) {
            next(err);
        }
    };

    getSiteComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { siteId } = req.params as { siteId: string };
            const comments = await this.linkDirectoryService.getSiteComments(siteId);
            res.status(200).json({
                success: true,
                data: toLinkDirectorySiteCommentDtoCollection(comments),
            });
        } catch (err) {
            next(err);
        }
    };

    createSiteComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const auth = req as AuthenticatedRequest;
            const userId = auth.user?.publicId;
            if (!userId) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }
            const { siteId } = req.params as { siteId: string };
            const body = req.body as LinkDirectorySiteCommentCreateSchemaType;
            const result = await this.linkDirectoryService.createSiteComment(
                siteId,
                body,
                userId,
                auth.user?.id
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

    upsertSiteRating = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const auth = req as AuthenticatedRequest;
            const userId = auth.user?.publicId;
            if (!userId) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }
            const { siteId } = req.params as { siteId: string };
            const { rating } = req.body as LinkDirectorySiteRatingBodySchemaType;
            const result = await this.linkDirectoryService.upsertSiteRating(
                siteId,
                rating,
                userId,
                auth.user?.id
            );
            res.status(200).json({ success: true, data: result, message: "Rating saved." });
        } catch (err) {
            next(err);
        }
    };

    getAdminSiteComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsedQuery =
                (req as Request & { parsedQuery?: ParsedAdminLinkDirectorySiteCommentsQuery }).parsedQuery ?? {};
            const { comments, count } = await this.linkDirectoryService.getAdminSiteComments({
                limit: parsedQuery.limit,
                searchTerm: parsedQuery.searchTerm,
                sortByKey: parsedQuery.sortByKey,
                sortByOrder: parsedQuery.sortByOrder,
                range: parsedQuery.range,
            });
            res.status(200).json({
                success: true,
                data: {
                    commentsResult: toAdminLinkDirectorySiteCommentDtoCollection(comments),
                    countResult: count,
                },
            });
        } catch (err) {
            next(err);
        }
    };

    approveSiteComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params as { id: string };
            const result = await this.linkDirectoryService.approveSiteComment(id);
            res.status(200).json({ success: true, data: result, message: "Comment approved." });
        } catch (err) {
            next(err);
        }
    };

    deleteSiteComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params as { id: string };
            await this.linkDirectoryService.deleteSiteComment(id);
            res.status(200).json({ success: true, message: "Comment deleted." });
        } catch (err) {
            next(err);
        }
    };
}
