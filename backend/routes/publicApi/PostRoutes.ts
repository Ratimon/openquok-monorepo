import { Router } from "express";
import { postsController } from "../../controllers/index.js";
import { validatePublicPostCommentsParams } from "../../data/schemas/postSchemas";

type PublicPostRouter = ReturnType<typeof Router>;

/**
 * JWT is skipped for `/public/*` via `middlewares/core.ts` `publicPaths`; this route attaches no alternate auth.
 */
const publicPostRouter: PublicPostRouter = Router();

publicPostRouter.get("/:postId/comments", validatePublicPostCommentsParams, postsController.getPublicComments);

export { publicPostRouter };
