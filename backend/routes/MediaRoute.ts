import { Router } from "express";
import multer from "multer";

import { mediaController, MAX_MEDIA_UPLOAD_BYTES } from "../controllers/index";
import { requireFullAuthWithRoles, requireEditor } from "../middlewares/authenticateUser";
import { supabaseAnonClient } from "../connections/index";
import { userRepository, rbacRepository } from "../repositories/index";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_MEDIA_UPLOAD_BYTES },
});

const authWithRoles = requireFullAuthWithRoles(
    supabaseAnonClient,
    userRepository,
    rbacRepository
);

type MediaRouter = ReturnType<typeof Router>;
const mediaRouter: MediaRouter = Router();

/** All media routes require a valid user JWT (Bearer). Download/delete/save are scoped to the caller's own object keys. */
mediaRouter.get("/download", authWithRoles, mediaController.download);

mediaRouter.post(
    "/upload",
    authWithRoles,
    requireEditor,
    upload.single("mediaFile"),
    mediaController.upload
);

mediaRouter.delete("/delete", authWithRoles, requireEditor, mediaController.delete);

mediaRouter.post("/save", authWithRoles, requireEditor, mediaController.saveMedia);

export { mediaRouter };
