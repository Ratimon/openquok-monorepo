import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/authenticateUser";
import type { RepeatIntervalKey, PostsService } from "../services/PostsService";
import { PostDTOMapper } from "../utils/dtos/PostDTO";

import { UserAuthorizationError } from "../errors/UserError";

/**
 * Workspace composer: suggested slots, tags, and persisted drafts / scheduled rows.
 */
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

    findSlot = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const organizationId = (req.query as { organizationId: string }).organizationId;
            const date = await this.postsService.findFreeSlot(organizationId, authUserId);
            res.status(200).json({ success: true, data: { date } });
        } catch (error) {
            next(error);
        }
    };

    listTags = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const organizationId = (req.query as { organizationId: string }).organizationId;
            const tags = await this.postsService.listTags(organizationId, authUserId);
            res.status(200).json({
                success: true,
                data: { tags: PostDTOMapper.toPostTagDTOCollection(tags) },
            });
        } catch (error) {
            next(error);
        }
    };

    createTag = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const { organizationId, name, color } = req.body as {
                organizationId: string;
                name: string;
                color?: string;
            };
            const tag = await this.postsService.createTag(organizationId, authUserId, name, color);
            res.status(200).json({
                success: true,
                data: { tag: PostDTOMapper.toPostTagDTO(tag)! },
            });
        } catch (error) {
            next(error);
        }
    };

    deleteTag = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const organizationId = (req.query as { organizationId: string }).organizationId;
            const tagId = (req.params as { tagId: string }).tagId;
            await this.postsService.deleteTag(organizationId, authUserId, tagId);
            res.status(200).json({ success: true });
        } catch (error) {
            next(error);
        }
    };

    createPost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const b = req.body as {
                organizationId: string;
                body?: string;
                bodiesByIntegrationId?: Record<string, string>;
                media?: { id: string; path: string }[];
                integrationIds?: string[];
                isGlobal?: boolean;
                scheduledAt: string;
                repeatInterval?: string | null;
                tagNames?: string[];
                status: "draft" | "scheduled";
            };
            const result = await this.postsService.createPost({
                organizationId: b.organizationId,
                authUserId,
                body: b.body ?? "",
                bodiesByIntegrationId: b.bodiesByIntegrationId ?? null,
                media: b.media ?? null,
                integrationIds: b.integrationIds ?? [],
                isGlobal: b.isGlobal ?? true,
                scheduledAtIso: b.scheduledAt,
                repeatInterval: (b.repeatInterval ?? null) as RepeatIntervalKey | null,
                tagNames: b.tagNames ?? [],
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
