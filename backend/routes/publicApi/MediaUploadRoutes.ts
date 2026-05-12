import { Router } from "express";
import multer from "multer";

import { mediaController } from "../../controllers/index";
import { organizationRepository } from "../../repositories/index";
import { requireProgrammaticAuth } from "../../middlewares/programmaticAuth";
import { oauthAppService } from "../../services/index";
import { validatePublicUploadFromUrlBody } from "../../data/schemas/mediaSchemas";
import { MAX_MEDIA_UPLOAD_BYTES } from "openquok-common";

type PublicMediaUploadRouter = ReturnType<typeof Router>;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_MEDIA_UPLOAD_BYTES },
});

/**
 * Programmatic media upload under `{api.prefix}/public/upload*`.
 * - **`POST /upload`** — multipart upload (field `file`).
 * - **`POST /upload-from-url`** — server-side fetch of a JSON body `{ url }` then store as media.
 * Same auth as other `/public/*` routes (`requireProgrammaticAuth`).
 */
const publicMediaUploadRouter: PublicMediaUploadRouter = Router();
const apiKeyAuth = requireProgrammaticAuth({ oauthAppService, organizationRepository });

publicMediaUploadRouter.post(
    "/upload",
    apiKeyAuth,
    upload.single("file"),
    mediaController.uploadProgrammatic
);
publicMediaUploadRouter.post(
    "/upload-from-url",
    apiKeyAuth,
    validatePublicUploadFromUrlBody,
    mediaController.uploadProgrammaticFromUrl
);

export { publicMediaUploadRouter };
