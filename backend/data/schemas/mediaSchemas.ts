import { z } from "zod";
import type { RequestHandler } from "express";

import { validateRequest } from "../../middlewares/validateRequest";

export const mediaOrganizationQuerySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
});

export const validateMediaOrganizationQuery: RequestHandler = validateRequest({
    query: mediaOrganizationQuerySchema,
});

export const saveMediaInformationBodySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    id: z.string().uuid("Invalid media id"),
    alt: z.string().max(2000).optional().nullable(),
    thumbnail: z.string().url("thumbnail must be a URL").optional().nullable(),
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

