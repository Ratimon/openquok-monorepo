import type { Request, Response, NextFunction } from "express";
import type { ProgrammaticAuthRequest } from "../middlewares/programmaticAuth";
import type { PostsService, RepeatIntervalKey } from "../services/PostsService";
import { PostDTOMapper } from "../utils/dtos/PostDTO";

/**
 * Programmatic posts API: organization resolved from API key (`{api.prefix}/public/posts/*`).
 * No user JWT; actions are scoped to the organization via the API key.
 */
export class PublicPostsController {
    constructor(private readonly postsService: PostsService) {}

    /** GET /public/posts/list?start=...&end=...&integrationIds=... */
    listPosts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
            const q = req.query as { start: string; end: string; integrationIds?: string };
            const integrationIds =
                typeof q.integrationIds === "string" && q.integrationIds.trim().length > 0
                    ? q.integrationIds
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                    : null;

            const rows = await this.postsService.listPostsForCalendarProgrammatic({
                organizationId,
                startIso: q.start,
                endIso: q.end,
                integrationIds,
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
            };

            const result = await this.postsService.createPostProgrammatic({
                organizationId,
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

    /** GET /public/posts/group/:postGroup */
    getPostGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
            const postGroup = (req.params as { postGroup: string }).postGroup;
            const data = await this.postsService.getPostGroupProgrammatic(postGroup, organizationId);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** PUT /public/posts/group/:postGroup */
    updatePostGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
            const postGroup = (req.params as { postGroup: string }).postGroup;
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
            };

            const result = await this.postsService.updatePostGroupProgrammatic({
                postGroup,
                organizationId,
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

    /** DELETE /public/posts/group/:postGroup */
    deletePostGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
            const postGroup = (req.params as { postGroup: string }).postGroup;
            await this.postsService.deletePostGroupProgrammatic(postGroup, organizationId);
            res.status(200).json({ success: true });
        } catch (error) {
            next(error);
        }
    };
}

