import { z } from "zod";
import type { RequestHandler } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { createPostBodySchema, listPostsQuerySchema, postGroupParamsSchema, updatePostGroupBodySchema } from "./postSchemas";

/**
 * Programmatic posts API schemas (`{api.prefix}/public/posts/*`).
 * Organization id is derived from the API key and MUST NOT be supplied by callers.
 */

export const publicListPostsQuerySchema = listPostsQuerySchema.omit({ organizationId: true }).extend({
    /**
     * Optional `integration_customers.id` for this workspace. When set, only posts whose
     * `integration_id` belongs to a channel assigned to that channel group are returned.
     */
    customerGroupId: z.string().uuid("Invalid customer group id").optional(),
});

export const validatePublicListPostsQuery: RequestHandler = validateRequest({
    query: publicListPostsQuerySchema,
});

export const publicCreatePostBodySchema = createPostBodySchema.omit({ organizationId: true });

export const validatePublicCreatePostBody: RequestHandler = validateRequest({
    body: publicCreatePostBodySchema,
});

export const validatePublicPostGroupParams: RequestHandler = validateRequest({
    params: postGroupParamsSchema,
});

export const publicUpdatePostGroupBodySchema = updatePostGroupBodySchema.omit({ organizationId: true });

export const validatePublicUpdatePostGroupBody: RequestHandler = validateRequest({
    params: postGroupParamsSchema,
    body: publicUpdatePostGroupBodySchema,
});

/** `:postId` UUID param for single-post endpoints (delete/missing/release-id/analytics). */
export const publicPostIdParamsSchema = z.object({
    postId: z.string().uuid("Invalid post id"),
});

export const validatePublicPostIdParams: RequestHandler = validateRequest({
    params: publicPostIdParamsSchema,
});

/** Optional `:integrationId` UUID param for `find-slot` (no id means "use all org integrations"). */
export const publicFindSlotParamsSchema = z.object({
    integrationId: z.string().uuid("Invalid integration id").optional(),
});

export const validatePublicFindSlotParams: RequestHandler = validateRequest({
    params: publicFindSlotParamsSchema,
});

export const publicUpdateReleaseIdBodySchema = z.object({
    releaseId: z.string().min(1, "releaseId is required"),
});

export const validatePublicUpdateReleaseIdRequest: RequestHandler = validateRequest({
    params: publicPostIdParamsSchema,
    body: publicUpdateReleaseIdBodySchema,
});

