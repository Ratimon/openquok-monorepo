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
                providerSettingsByIntegrationId?: Record<string, Record<string, unknown>>;
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

    createComposerComment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const postId = (req.params as { postId: string }).postId;
            const { organizationId, comment } = req.body as { organizationId: string; comment: string };
            const row = await this.postsService.createComposerComment({
                organizationId,
                authUserId,
                postId,
                comment,
            });
            res.status(201).json({
                success: true,
                data: { comment: PostDTOMapper.toPostCommentDTO(row)! },
            });
        } catch (error) {
            next(error);
        }
    };

    listPosts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }

            const q = req.query as {
                organizationId: string;
                start: string;
                end: string;
                integrationIds?: string;
            };

            const integrationIds =
                typeof q.integrationIds === "string" && q.integrationIds.trim().length > 0
                    ? q.integrationIds
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                    : null;

            const rows = await this.postsService.listPostsForCalendar({
                organizationId: q.organizationId,
                authUserId,
                startIso: q.start,
                endIso: q.end,
                integrationIds,
            });

            res.status(200).json({ success: true, data: { posts: PostDTOMapper.toDTOCollection(rows) } });
        } catch (error) {
            next(error);
        }
    };

    getPostGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const postGroup = (req.params as { postGroup: string }).postGroup;
            const d = await this.postsService.getPostGroup(postGroup, authUserId);
            res.status(200).json({ success: true, data: d });
        } catch (error) {
            next(error);
        }
    };

    debugExportPostGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const postGroup = (req.params as { postGroup: string }).postGroup;
            const d = await this.postsService.debugExportPostGroup(postGroup, authUserId);
            res.status(200).json({ success: true, data: d });
        } catch (error) {
            next(error);
        }
    };

    getPostPreview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const postId = (req.params as { postId: string }).postId;
            const share = typeof req.query.share === "string" ? req.query.share : null;
            const d = await this.postsService.getPostPreview(postId, share);
            res.status(200).json({ success: true, data: d });
        } catch (error) {
            next(error);
        }
    };

    getPublicComments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const postId = (req.params as { postId: string }).postId;
            const comments = await this.postsService.getPublicComments(postId);
            res.status(200).json({ comments: PostDTOMapper.toPostCommentDTOCollection(comments) });
        } catch (error) {
            next(error);
        }
    };

    updatePostGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const postGroup = (req.params as { postGroup: string }).postGroup;
            const b = req.body as {
                organizationId?: string;
                body?: string;
                bodiesByIntegrationId?: Record<string, string>;
                media?: { id: string; path: string }[];
                integrationIds?: string[];
                isGlobal?: boolean;
                scheduledAt: string;
                repeatInterval?: string | null;
                tagNames?: string[];
                providerSettingsByIntegrationId?: Record<string, Record<string, unknown>>;
                status: "draft" | "scheduled";
            };

            const result = await this.postsService.updatePostGroup({
                postGroup,
                organizationId: b.organizationId ?? null,
                authUserId,
                body: b.body ?? "",
                bodiesByIntegrationId: b.bodiesByIntegrationId ?? null,
                media: b.media ?? null,
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

    deletePostGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const postGroup = (req.params as { postGroup: string }).postGroup;
            const organizationId = (req.query as { organizationId?: string }).organizationId ?? null;
            await this.postsService.deletePostGroup(postGroup, authUserId, organizationId);
            res.status(200).json({ success: true });
        } catch (error) {
            next(error);
        }
    };

    getMissingPublishCandidates = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const postId = (req.params as { postId: string }).postId;
            const organizationId = (req.query as { organizationId: string }).organizationId;
            const items = await this.postsService.getMissingPublishCandidates({
                authUserId,
                organizationId,
                postId,
            });
            res.status(200).json({ success: true, data: { items } });
        } catch (error) {
            next(error);
        }
    };

    updatePostReleaseId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const postId = (req.params as { postId: string }).postId;
            const { organizationId, releaseId } = req.body as { organizationId: string; releaseId: string };
            await this.postsService.updatePostReleaseId({
                authUserId,
                organizationId,
                postId,
                releaseId,
            });
            res.status(200).json({ success: true });
        } catch (error) {
            next(error);
        }
    };
}
