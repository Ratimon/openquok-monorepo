import { z } from "zod";
import type { RequestHandler } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { createPostBodySchema, listPostsQuerySchema } from "./postSchemas";

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

export const publicCreatePostBodySchema = createPostBodySchema.omit({ organizationId: true }).extend({
    /**
     * When true (default for API-key creates), rows are flagged `isAgentEdited` for the kanban board.
     * The dashboard session API never accepts this — human creates always clear the flag server-side.
     */
    isAgent: z.boolean().optional(),
    /** Optional human review checklist shown on the kanban board (agent/CLI creates). */
    note: z.string().max(2000).nullable().optional(),
});

export const validatePublicCreatePostBody: RequestHandler = validateRequest({
    body: publicCreatePostBodySchema,
});

/** `:postId` UUID param for single-post endpoints (delete/missing/release-id/status). */
export const publicPostIdParamsSchema = z.object({
    postId: z.string().uuid("Invalid post id"),
});

export const validatePublicPostIdParams: RequestHandler = validateRequest({
    params: publicPostIdParamsSchema,
});

export const publicFlipPostStatusBodySchema = z.object({
    status: z.enum(["draft", "schedule", "scheduled"], {
        errorMap: () => ({ message: "status must be draft, schedule, or scheduled" }),
    }),
});

export const validatePublicFlipPostStatusRequest: RequestHandler = validateRequest({
    params: publicPostIdParamsSchema,
    body: publicFlipPostStatusBodySchema,
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

export const publicUpdatePostReviewTodoBodySchema = z.object({
    note: z.string().max(2000).nullable().optional(),
    isReviewed: z.boolean().optional(),
    /** When true (CLI/agent), keeps `isAgentEdited` on the post group. Dashboard calls omit or set false. */
    isAgent: z.boolean().optional(),
});

export const validatePublicUpdatePostReviewTodoRequest: RequestHandler = validateRequest({
    params: publicPostIdParamsSchema,
    body: publicUpdatePostReviewTodoBodySchema,
});

