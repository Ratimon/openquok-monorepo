import { z } from "zod";
import type { RequestHandler } from "express";
import { validateRequest } from "../../middlewares/validateRequest";

/** Optional `refresh` integration id when requesting an OAuth URL via programmatic API. */
export const publicSocialOAuthQuerySchema = z.object({
    refresh: z.string().uuid().optional(),
});

export const validatePublicSocialOAuthQuery: RequestHandler = validateRequest({
    query: publicSocialOAuthQuerySchema,
});

/** `:id` path param for routes that operate on a single integration row. */
export const publicIntegrationIdParamsSchema = z.object({
    id: z.string().uuid("Invalid integration id"),
});

export const validatePublicIntegrationIdParams: RequestHandler = validateRequest({
    params: publicIntegrationIdParamsSchema,
});

/**
 * Body schema for `POST /public/integration-trigger/:id`. The shape of `data` is
 * provider-specific (each tool defines its own `dataSchema`), so we accept any
 * record here and let the provider's tool method validate further if needed.
 */
export const publicIntegrationTriggerBodySchema = z.object({
    methodName: z.string().min(1, "methodName is required"),
    data: z.record(z.string(), z.unknown()).optional(),
});

export type PublicIntegrationTriggerBodyDto = z.infer<typeof publicIntegrationTriggerBodySchema>;

export const validatePublicIntegrationTriggerRequest: RequestHandler = validateRequest({
    params: publicIntegrationIdParamsSchema,
    body: publicIntegrationTriggerBodySchema,
});
