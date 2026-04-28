import { Router } from "express";
import multer from "multer";

import { imageController } from "../controllers/index";
import { requireFullAuthWithRoles, requireEditor } from "../middlewares/authenticateUser";
import { supabaseAnonClient } from "../connections/index";
import { userRepository, rbacRepository } from "../repositories/index";

const MAX_IMAGE_UPLOAD_BYTES = 4 * 1024 * 1024;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_IMAGE_UPLOAD_BYTES },
});

const authWithRoles = requireFullAuthWithRoles(
    supabaseAnonClient,
    userRepository,
    rbacRepository
);

type ImageRouter = ReturnType<typeof Router>;
const imageRouter: ImageRouter = Router();

imageRouter.get("/download", imageController.getByUrl);

// Allowlisted external avatar proxy (Instagram CDN, etc.); JWT required (see `middlewares/core.ts`).
imageRouter.get("/external-proxy", imageController.allowlistedExternalImageProxy);

imageRouter.post(
    "/upload",
    authWithRoles,
    requireEditor,
    upload.single("imageFile"),
    imageController.upload
);

imageRouter.delete("/delete", authWithRoles, requireEditor, imageController.delete);

imageRouter.get("/proxy", authWithRoles, requireEditor, imageController.proxyImage);

export { imageRouter };
