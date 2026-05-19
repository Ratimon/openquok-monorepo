import { z } from "zod";
import type { RequestHandler } from "express";

import { validateRequest } from "../../middlewares/validateRequest";

export const mediaOrganizationQuerySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
});

export const validateMediaOrganizationQuery: RequestHandler = validateRequest({
    query: mediaOrganizationQuerySchema,
});

/** Body schema for `POST {api.prefix}/public/upload-from-url` — programmatic URL-based media upload. */
export const publicUploadFromUrlBodySchema = z.object({
    url: z.string().url("Invalid URL").max(2048, "URL is too long"),
});

export const validatePublicUploadFromUrlBody: RequestHandler = validateRequest({
    body: publicUploadFromUrlBodySchema,
});

export const saveMediaInformationBodySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    id: z.string().uuid("Invalid media id"),
    alt: z.string().max(2000).optional().nullable(),
    /** Public URL or storage object key written to `media.thumbnail`. */
    thumbnail: z.string().max(2048).optional().nullable(),
    thumbnailTimestamp: z.number().int().nonnegative().optional().nullable(),
});

export const validateSaveMediaInformationBody: RequestHandler = validateRequest({
    body: saveMediaInformationBodySchema,
});

export const multipartEndpointParamsSchema = z.object({
    endpoint: z.enum([
        "create-multipart-upload",
        "prepare-upload-parts",
        "complete-multipart-upload",
        "list-parts",
        "abort-multipart-upload",
        "sign-part",
    ]),
});

export const validateMultipartEndpointParams: RequestHandler = validateRequest({
    params: multipartEndpointParamsSchema,
});

export const multipartBodySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
}).passthrough();

export const validateMultipartEndpoint: RequestHandler = validateRequest({
    params: multipartEndpointParamsSchema,
    body: multipartBodySchema,
});

export const mediaMoveBodySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    ids: z.array(z.string().min(1)).min(1),
    target: z.string().min(1).max(512),
});

export const validateMediaMoveBody: RequestHandler = validateRequest({
    body: mediaMoveBodySchema,
});

export const mediaCopyBodySchema = mediaMoveBodySchema;

export const validateMediaCopyBody: RequestHandler = validateRequest({
    body: mediaCopyBodySchema,
});

export const mediaRenameBodySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    id: z.string().min(1).max(512),
    name: z.string().trim().min(1).max(256),
});

export const validateMediaRenameBody: RequestHandler = validateRequest({
    body: mediaRenameBodySchema,
});

