import { z } from "zod";
import type { RequestHandler } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { createPostBodySchema, listPostsQuerySchema, postGroupParamsSchema, updatePostGroupBodySchema } from "./postSchemas";

/**
 * Programmatic posts API schemas (`{api.prefix}/public/posts/*`).
 * Organization id is derived from the API key and MUST NOT be supplied by callers.
 */

export const publicListPostsQuerySchema = listPostsQuerySchema.omit({ organizationId: true });

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

