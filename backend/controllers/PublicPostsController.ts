import type { Request, Response, NextFunction } from "express";
import type { ProgrammaticAuthRequest } from "../middlewares/programmaticAuth";
import type { PostsService, RepeatIntervalKey } from "../services/PostsService";
import { PostDTOMapper } from "../utils/dtos/PostDTO";
import { countPublicApiRequest } from "../connections/index";

/**
 * Programmatic posts API: organization resolved from API key (`{api.prefix}/public/posts/*`).
 * No user JWT; actions are scoped to the organization via the API key.
 */
export class PublicPostsController {
    constructor(private readonly postsService: PostsService) {}

    /** GET /public/posts/find-slot/:integrationId? — next free schedule slot for the organization. */
    findSlot = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("posts-find-slot");
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
            const integrationId =
                typeof (req.params as { integrationId?: string }).integrationId === "string"
                    ? (req.params as { integrationId?: string }).integrationId
                    : null;
            const date = await this.postsService.findFreeSlotProgrammatic(organizationId, integrationId);
            res.status(200).json({ success: true, data: { date } });
        } catch (error) {
            next(error);
        }
    };

    /** GET /public/posts/:postId — row id and parent post group (for correlation with list responses). */
    getPostByIdSummary = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("posts-get");
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
            const postId = (req.params as { postId: string }).postId;
            const data = await this.postsService.getPostSummaryProgrammatic(postId, organizationId);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** DELETE /public/posts/:postId — soft-deletes the whole post group; returns the row id and group id. */
    deletePostById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("posts-delete");
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
            const postId = (req.params as { postId: string }).postId;
            const result = await this.postsService.deletePostByIdProgrammatic(postId, organizationId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    };

    /** GET /public/posts/:postId/missing — candidate published assets for `release_id = "missing"` rows. */
    getMissingContent = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("posts-missing");
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
            const postId = (req.params as { postId: string }).postId;
            const items = await this.postsService.getMissingPublishCandidatesProgrammatic({
                organizationId,
                postId,
            });
            res.status(200).json({ success: true, data: { items } });
        } catch (error) {
            next(error);
        }
    };

    /** PUT /public/posts/:postId/release-id — manually link a published release id when worker mapping failed. */
    updateReleaseId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("posts-release-id");
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
            const postId = (req.params as { postId: string }).postId;
            const { releaseId } = req.body as { releaseId: string };
            const data = await this.postsService.updatePostReleaseIdProgrammatic({
                organizationId,
                postId,
                releaseId,
            });
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** PUT /public/posts/:postId/review-todo — update kanban review note / reviewed flag (agent or human). */
    updatePostReviewTodo = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("posts-review-todo");
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
            const postId = (req.params as { postId: string }).postId;
            const body = req.body as { note?: string | null; isReviewed?: boolean; isAgent?: boolean };
            const rows = await this.postsService.updatePostReviewTodoProgrammatic({
                organizationId,
                postId,
                note: body.note,
                isReviewed: body.isReviewed,
                isAgent: body.isAgent,
            });
            res.status(200).json({
                success: true,
                data: { posts: PostDTOMapper.toDTOCollection(rows) },
            });
        } catch (error) {
            next(error);
        }
    };

    /** PUT /public/posts/:postId/status — flip draft ↔ scheduled at the stored publish time (no public group CRUD). */
    flipPostStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("posts-flip-status");
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
            const postId = (req.params as { postId: string }).postId;
            const raw = (req.body as { status: "draft" | "schedule" | "scheduled" }).status;
            const status: "draft" | "scheduled" = raw === "draft" ? "draft" : "scheduled";
            const result = await this.postsService.flipPostGroupStatusByPostIdProgrammatic(
                postId,
                organizationId,
                status
            );
            res.status(200).json({
                success: true,
                data: {
                    postGroup: result.postGroup,
                    posts: PostDTOMapper.toDTOCollection(result.posts),
                },
            });
        } catch (error) {
            next(error);
        }
    };

    /** GET /public/posts/list?start=...&end=...&integrationIds=...&customerGroupId=... */
    listPosts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
            const q = req.query as { start: string; end: string; integrationIds?: string; customerGroupId?: string };
            const integrationIds =
                typeof q.integrationIds === "string" && q.integrationIds.trim().length > 0
                    ? q.integrationIds
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                    : null;

            const customerGroupId =
                typeof q.customerGroupId === "string" && q.customerGroupId.trim().length > 0
                    ? q.customerGroupId.trim()
                    : undefined;

            const rows = await this.postsService.listPostsForCalendarProgrammatic({
                organizationId,
                startIso: q.start,
                endIso: q.end,
                integrationIds,
                customerGroupId,
            });

            res.status(200).json({ success: true, data: { posts: PostDTOMapper.toDTOCollection(rows) } });
        } catch (error) {
            next(error);
        }
    };

    /** POST /public/posts */
    createPost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
            const b = req.body as {
                body?: string;
                bodiesByIntegrationId?: Record<string, string>;
                media?: { id: string; path: string; bucket?: string }[];
                integrationIds?: string[];
                isGlobal?: boolean;
                scheduledAt: string;
                repeatInterval?: string | null;
                tagNames?: string[];
                providerSettingsByIntegrationId?: Record<string, Record<string, unknown>>;
                status: "draft" | "scheduled";
                isAgent?: boolean;
            };

            const result = await this.postsService.createPostProgrammatic({
                organizationId,
                isAgent: b.isAgent,
                body: b.body ?? "",
                bodiesByIntegrationId: b.bodiesByIntegrationId ?? null,
                media: (b.media ?? null)?.map((m) => ({ id: m.id, path: m.path })) ?? null,
                integrationIds: b.integrationIds ?? [],
                isGlobal: b.isGlobal ?? true,
                scheduledAtIso: b.scheduledAt,
                repeatInterval: (b.repeatInterval ?? null) as RepeatIntervalKey | null,
                tagNames: b.tagNames ?? [],
                providerSettingsByIntegrationId: b.providerSettingsByIntegrationId ?? null,
                status: b.status,
            });

            res.status(200).json({
                success: true,
                data: {
                    postGroup: result.postGroup,
                    posts: PostDTOMapper.toDTOCollection(result.posts),
                },
            });
        } catch (error) {
            next(error);
        }
    };
}
