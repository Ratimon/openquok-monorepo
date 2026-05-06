import { Router } from "express";
import { postsController, publicPostsController } from "../../controllers/index.js";
import { validatePublicPostCommentsParams } from "../../data/schemas/postSchemas";
import { organizationRepository } from "../../repositories/index.js";
import { requireProgrammaticAuth } from "../../middlewares/programmaticAuth";
import {
    validatePublicCreatePostBody,
    validatePublicListPostsQuery,
    validatePublicPostGroupParams,
    validatePublicUpdatePostGroupBody,
} from "../../data/schemas/publicPostsSchemas";
import { oauthAppService } from "../../services/index";

type PublicPostRouter = ReturnType<typeof Router>;

/**
 * `/public/posts` router.
 * - Anonymous: `GET /:postId/comments`
 * - Programmatic auth: OAuth app token (hashed) with a legacy fallback org api_key
 */
const publicPostRouter: PublicPostRouter = Router();
const apiKeyAuth = requireProgrammaticAuth({ oauthAppService, organizationRepository });

publicPostRouter.get("/:postId/comments", validatePublicPostCommentsParams, postsController.getPublicComments);

publicPostRouter.get("/list", apiKeyAuth, validatePublicListPostsQuery, publicPostsController.listPosts);
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

export { publicPostRouter };
