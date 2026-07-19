import { z } from "zod";
import type { RequestHandler } from "express";
import { validateRequest } from "../../middlewares/validateRequest";

/** Optional `group` query on `GET /public/integrations` (channel group / customer id). */
export const publicIntegrationsListQuerySchema = z.object({
    group: z.string().uuid("Invalid channel group id").optional(),
});

export const validatePublicIntegrationsListQuery: RequestHandler = validateRequest({
    query: publicIntegrationsListQuerySchema,
});

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

/** `:plugId` path param for global plug rule mutations. */
export const publicPlugIdParamsSchema = z.object({
    plugId: z.string().uuid("Invalid plug id"),
});

export const validatePublicPlugIdParams: RequestHandler = validateRequest({
    params: publicPlugIdParamsSchema,
});

/** Body for `POST /public/integration-plugs/:id` (global plug upsert). */
export const publicIntegrationPlugUpsertBodySchema = z.object({
    func: z.string().min(1, "func is required"),
    fields: z.array(
        z.object({
            name: z.string().min(1),
            value: z.string(),
        })
    ),
    plugId: z.string().uuid("Invalid plug id").optional(),
});

export type PublicIntegrationPlugUpsertBodyDto = z.infer<typeof publicIntegrationPlugUpsertBodySchema>;

export const validatePublicIntegrationPlugUpsertRequest: RequestHandler = validateRequest({
    params: publicIntegrationIdParamsSchema,
    body: publicIntegrationPlugUpsertBodySchema,
});

/** Body for `PUT /public/plugs/:plugId/activate`. */
export const publicPlugActivateBodySchema = z.object({
    activated: z.boolean(),
});

export const validatePublicPlugActivateRequest: RequestHandler = validateRequest({
    params: publicPlugIdParamsSchema,
    body: publicPlugActivateBodySchema,
});
