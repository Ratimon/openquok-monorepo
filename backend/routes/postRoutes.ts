import { Router } from "express";
import { supabaseAnonClient } from "../connections/index";
import { requireFullAuth } from "../middlewares/authenticateUser";
import { postsController } from "../controllers/index.js";
import {
    validateCreateComposerComment,
    validateCreatePostBody,
    validateCreatePostTagBody,
    validateDeletePostGroup,
    validateDeletePostTag,
    validateListPostsQuery,
    validatePostGroupParams,
    validatePostPreviewParams,
    validatePostOrganizationQuery,
    validateUpdatePostGroupBody,
} from "../data/schemas/postSchemas";

type PostRouter = ReturnType<typeof Router>;
const postRouter: PostRouter = Router();
const auth = requireFullAuth(supabaseAnonClient);

postRouter.get("/find-slot", auth, validatePostOrganizationQuery, postsController.findSlot);
postRouter.get("/tags", auth, validatePostOrganizationQuery, postsController.listTags);
postRouter.post("/tags", auth, validateCreatePostTagBody, postsController.createTag);
postRouter.delete("/tags/:tagId", auth, validateDeletePostTag, postsController.deleteTag);
postRouter.get("/list", auth, validateListPostsQuery, postsController.listPosts);
postRouter.post("/", auth, validateCreatePostBody, postsController.createPost);
postRouter.post("/:postId/comments", auth, validateCreateComposerComment, postsController.createComposerComment);
// public preview
postRouter.get("/preview/:postId", validatePostPreviewParams, postsController.getPostPreview);
postRouter.get(
    "/group/:postGroup/debug-export",
    auth,
    validatePostGroupParams,
    postsController.debugExportPostGroup
);
postRouter.get("/group/:postGroup", auth, validatePostGroupParams, postsController.getPostGroup);
postRouter.put("/group/:postGroup", auth, validateUpdatePostGroupBody, postsController.updatePostGroup);
postRouter.delete("/group/:postGroup", auth, validateDeletePostGroup, postsController.deletePostGroup);
postRouter.delete("/:postGroup", auth, validateDeletePostGroup, postsController.deletePostGroup);

export { postRouter };
