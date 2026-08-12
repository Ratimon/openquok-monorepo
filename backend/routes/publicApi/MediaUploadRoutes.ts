import { Router } from "express";
import multer from "multer";

import { mediaController } from "../../controllers/index";
import { organizationRepository } from "../../repositories/index";
import { requireProgrammaticAuth } from "../../guards";
import { oauthAppService, subscriptionGuard } from "../../services/index";
import {
    validatePublicAbortMultipartBody,
    validatePublicCompleteMultipartBody,
    validatePublicCreateMultipartBody,
    validatePublicSignPartsBody,
    validatePublicUploadFromUrlBody,
} from "../../data/schemas/mediaSchemas";
import { MAX_MEDIA_VIDEO_UPLOAD_BYTES } from "openquok-common";

type PublicMediaUploadRouter = ReturnType<typeof Router>;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_MEDIA_VIDEO_UPLOAD_BYTES },
});

/**
 * Programmatic media upload under `{api.prefix}/public/upload*`.
 * - **`POST /upload`** — multipart upload (field `file`). Hosted API inbound body is ~4.5 MB.
 * - **`POST /upload/create-multipart`**, **`/sign-parts`**, **`/complete-multipart`**, **`/abort-multipart`**
 *   — direct-to-storage for larger files (presigned R2 parts).
 * - **`POST /upload-from-url`** — server-side fetch of a JSON body `{ url }` then store as media.
 * Same auth as other `/public/*` routes (`requireProgrammaticAuth`).
 */
const publicMediaUploadRouter: PublicMediaUploadRouter = Router();
const apiKeyAuth = requireProgrammaticAuth({ oauthAppService, organizationRepository, subscriptionGuard });

publicMediaUploadRouter.post(
    "/upload/create-multipart",
    apiKeyAuth,
    validatePublicCreateMultipartBody,
    mediaController.uploadProgrammaticCreateMultipart
);
publicMediaUploadRouter.post(
    "/upload/sign-parts",
    apiKeyAuth,
    validatePublicSignPartsBody,
    mediaController.uploadProgrammaticSignParts
);
publicMediaUploadRouter.post(
    "/upload/complete-multipart",
    apiKeyAuth,
    validatePublicCompleteMultipartBody,
    mediaController.uploadProgrammaticCompleteMultipart
);
publicMediaUploadRouter.post(
    "/upload/abort-multipart",
    apiKeyAuth,
    validatePublicAbortMultipartBody,
    mediaController.uploadProgrammaticAbortMultipart
);
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
