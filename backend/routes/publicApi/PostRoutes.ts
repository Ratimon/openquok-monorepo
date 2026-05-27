import { Router } from "express";
import { postsController, publicPostsController } from "../../controllers/index.js";
import { validatePublicPostCommentsParams } from "../../data/schemas/postSchemas";
import { organizationRepository } from "../../repositories/index.js";
import { requireProgrammaticAuth } from "../../guards";
import {
    validatePublicCreatePostBody,
    validatePublicFindSlotParams,
    validatePublicFlipPostStatusRequest,
    validatePublicListPostsQuery,
    validatePublicPostIdParams,
    validatePublicUpdateReleaseIdRequest,
    validatePublicUpdatePostReviewTodoRequest,
} from "../../data/schemas/publicPostsSchemas";
import { oauthAppService } from "../../services/index";

type PublicPostRouter = ReturnType<typeof Router>;

/**
 * `/public/posts` router.
 * - Anonymous: `GET /:postId/comments`
 * - Programmatic auth: OAuth app token (hashed) with a legacy fallback org api_key
 *
 * NOTE: order matters — static segments (`/list`, `/find-slot/...`) and
 * suffix routes (`/:postId/status`, `/:postId/missing`, `/:postId/release-id`) are registered **before**
 * `GET /:postId` and `DELETE /:postId` so Express does not greedily match the catch-all.
 */
const publicPostRouter: PublicPostRouter = Router();
const apiKeyAuth = requireProgrammaticAuth({ oauthAppService, organizationRepository });

publicPostRouter.get("/:postId/comments", validatePublicPostCommentsParams, postsController.getPublicComments);

publicPostRouter.get("/list", apiKeyAuth, validatePublicListPostsQuery, publicPostsController.listPosts);
publicPostRouter.get("/find-slot", apiKeyAuth, publicPostsController.findSlot);
publicPostRouter.get(
    "/find-slot/:integrationId",
    apiKeyAuth,
    validatePublicFindSlotParams,
    publicPostsController.findSlot
);
publicPostRouter.post("/", apiKeyAuth, validatePublicCreatePostBody, publicPostsController.createPost);
publicPostRouter.put(
    "/:postId/review-todo",
    apiKeyAuth,
    validatePublicUpdatePostReviewTodoRequest,
    publicPostsController.updatePostReviewTodo
);
publicPostRouter.put(
    "/:postId/status",
    apiKeyAuth,
    validatePublicFlipPostStatusRequest,
    publicPostsController.flipPostStatus
);
publicPostRouter.get(
    "/:postId/missing",
    apiKeyAuth,
    validatePublicPostIdParams,
    publicPostsController.getMissingContent
);
publicPostRouter.put(
    "/:postId/release-id",
    apiKeyAuth,
    validatePublicUpdateReleaseIdRequest,
    publicPostsController.updateReleaseId
);
publicPostRouter.get(
    "/:postId",
    apiKeyAuth,
    validatePublicPostIdParams,
    publicPostsController.getPostByIdSummary
);
publicPostRouter.delete(
    "/:postId",
    apiKeyAuth,
    validatePublicPostIdParams,
    publicPostsController.deletePostById
);

export { publicPostRouter };
