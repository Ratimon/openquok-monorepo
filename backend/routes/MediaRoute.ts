import { Router } from "express";
import multer from "multer";

import { mediaController, MAX_MEDIA_UPLOAD_BYTES } from "../controllers/index";
import { requireFullAuthWithRoles } from "../middlewares/authenticateUser";
import { supabaseAnonClient } from "../connections/index";
import { userRepository, rbacRepository } from "../repositories/index";
import {
    validateMediaOrganizationQuery,
    validateSaveMediaInformationBody,
    validateMultipartEndpoint,
} from "../data/schemas/mediaSchemas";

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

/**
 * User-owned R2 media: any authenticated user may upload/delete their own keys (`${auth.uid}-…`).
 * Editor-only restriction would block account holders without the editor role (see account media library).
 */
mediaRouter.get("/", authWithRoles, validateMediaOrganizationQuery, mediaController.list);

mediaRouter.get("/download", authWithRoles, validateMediaOrganizationQuery, mediaController.download);

mediaRouter.post("/upload", authWithRoles, upload.single("mediaFile"), mediaController.upload);

/** Multipart field name `file`, includes `originalName` in response for compatibility. */
mediaRouter.post("/upload-server", authWithRoles, upload.single("file"), mediaController.uploadServer);

/** Multipart field name `file`, supports `preventSave=true` returning `{ path }`. */
mediaRouter.post("/upload-simple", authWithRoles, upload.single("file"), mediaController.uploadSimple);

mediaRouter.delete("/delete", authWithRoles, mediaController.delete);

mediaRouter.post("/save", authWithRoles, mediaController.saveMedia);

/** Alias for `save-media` body shape (`name`, `originalName`). */
mediaRouter.post("/save-media", authWithRoles, mediaController.saveMedia);

/** Update thumbnail/alt metadata. */
mediaRouter.post("/information", authWithRoles, validateSaveMediaInformationBody, mediaController.saveMediaInformation);

/** Multipart upload orchestration endpoints (S3-compatible, e.g. presigned part URLs). */
mediaRouter.post("/:endpoint", authWithRoles, validateMultipartEndpoint, mediaController.multipart);

export { mediaRouter };
