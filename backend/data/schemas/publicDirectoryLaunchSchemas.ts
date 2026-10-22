import { z } from "zod";
import type { RequestHandler } from "express";

import { validateRequest } from "../../middlewares/validateRequest";
import {
    autoLaunchMainProfileIdParamSchema,
    autoLaunchProfileIdParamSchema,
    createAutoLaunchProfileBodySchema,
    createDirectoryProfileVariantBodySchema,
    listAutoLaunchProfilesQuerySchema,
    listAutoLaunchSubmissionsQuerySchema,
    updateAutoLaunchProfileBodySchema,
} from "./autoLaunchSchemas";

/**
 * Programmatic directory launch API (`{api.prefix}/public/directory-launch/*`).
 * Organization id is derived from the API key and MUST NOT be supplied by callers.
 */

export const publicListDirectoryProfilesQuerySchema = listAutoLaunchProfilesQuerySchema.omit({
    organizationId: true,
});

export const validatePublicListDirectoryProfilesQuery: RequestHandler = validateRequest({
    query: publicListDirectoryProfilesQuerySchema,
});

export const publicDirectoryProfileIdParamsSchema = autoLaunchProfileIdParamSchema;

export const validatePublicDirectoryProfileIdParams: RequestHandler = validateRequest({
    params: publicDirectoryProfileIdParamsSchema,
});

export const publicDirectoryMainProfileIdParamsSchema = autoLaunchMainProfileIdParamSchema;

export const publicCreateDirectoryProfileBodySchema = createAutoLaunchProfileBodySchema.omit({
    organizationId: true,
});

export const validatePublicCreateDirectoryProfileRequest: RequestHandler = validateRequest({
    body: publicCreateDirectoryProfileBodySchema,
});

export const validatePublicUpdateDirectoryProfileRequest: RequestHandler = validateRequest({
    params: publicDirectoryProfileIdParamsSchema,
    body: updateAutoLaunchProfileBodySchema,
});

export const validatePublicEnsureDirectoryVariantRequest: RequestHandler = validateRequest({
    params: publicDirectoryMainProfileIdParamsSchema,
    body: createDirectoryProfileVariantBodySchema,
});

export const publicListDirectorySubmissionsQuerySchema = listAutoLaunchSubmissionsQuerySchema.omit({
    organizationId: true,
});

export const validatePublicListDirectorySubmissionsQuery: RequestHandler = validateRequest({
    query: publicListDirectorySubmissionsQuerySchema,
});

export type PublicCreateDirectoryProfileBody = z.infer<typeof publicCreateDirectoryProfileBodySchema>;
export type PublicUpdateDirectoryProfileBody = z.infer<typeof updateAutoLaunchProfileBodySchema>;
export type PublicListDirectoryProfilesQuery = z.infer<typeof publicListDirectoryProfilesQuerySchema>;
export type PublicListDirectorySubmissionsQuery = z.infer<typeof publicListDirectorySubmissionsQuerySchema>;
export type PublicEnsureDirectoryVariantBody = z.infer<typeof createDirectoryProfileVariantBodySchema>;
