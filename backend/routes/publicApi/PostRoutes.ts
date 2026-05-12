import { Router } from "express";
import { postsController, publicPostsController } from "../../controllers/index.js";
import { validatePublicPostCommentsParams } from "../../data/schemas/postSchemas";
import { organizationRepository } from "../../repositories/index.js";
import { requireProgrammaticAuth } from "../../middlewares/programmaticAuth";
import {
    validatePublicCreatePostBody,
    validatePublicFindSlotParams,
    validatePublicListPostsQuery,
    validatePublicPostGroupParams,
    validatePublicPostIdParams,
    validatePublicUpdatePostGroupBody,
    validatePublicUpdateReleaseIdRequest,
} from "../../data/schemas/publicPostsSchemas";
import { oauthAppService } from "../../services/index";

type PublicPostRouter = ReturnType<typeof Router>;

/**
 * `/public/posts` router.
 * - Anonymous: `GET /:postId/comments`
 * - Programmatic auth: OAuth app token (hashed) with a legacy fallback org api_key
 *
 * NOTE: order matters — static segments (`/list`, `/group/...`, `/find-slot/...`) and
 * suffix routes (`/:postId/missing`, `/:postId/release-id`) are registered **before**
 * `DELETE /:postId` so Express does not greedily match the catch-all.
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
publicPostRouter.get("/group/:postGroup", apiKeyAuth, validatePublicPostGroupParams, publicPostsController.getPostGroup);
publicPostRouter.put(
    "/group/:postGroup",
    apiKeyAuth,
    validatePublicUpdatePostGroupBody,
    publicPostsController.updatePostGroup
);
publicPostRouter.delete(
    "/group/:postGroup",
    apiKeyAuth,
    validatePublicPostGroupParams,
    publicPostsController.deletePostGroup
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
publicPostRouter.delete(
    "/:postId",
    apiKeyAuth,
    validatePublicPostIdParams,
    publicPostsController.deletePostById
);

export { publicPostRouter };
