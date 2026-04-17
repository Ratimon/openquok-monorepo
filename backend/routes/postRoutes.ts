import { Router } from "express";
import { supabaseAnonClient } from "../connections/index";
import { requireFullAuth } from "../middlewares/authenticateUser";
import { postsController } from "../controllers/index.js";
import {
    validateCreatePostBody,
    validateCreatePostTagBody,
    validateDeletePostTag,
    validatePostOrganizationQuery,
} from "../data/schemas/postSchemas";

type PostRouter = ReturnType<typeof Router>;
const postRouter: PostRouter = Router();
const auth = requireFullAuth(supabaseAnonClient);

postRouter.get("/find-slot", auth, validatePostOrganizationQuery, postsController.findSlot);
postRouter.get("/tags", auth, validatePostOrganizationQuery, postsController.listTags);
postRouter.post("/tags", auth, validateCreatePostTagBody, postsController.createTag);
postRouter.delete("/tags/:tagId", auth, validateDeletePostTag, postsController.deleteTag);
postRouter.post("/", auth, validateCreatePostBody, postsController.createPost);

export { postRouter };
