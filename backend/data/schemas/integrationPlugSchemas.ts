import { z } from "zod";
import type { RequestHandler } from "express";
import { validateRequest } from "../../middlewares/validateRequest";

import { integrationOrganizationQuerySchema } from "./integrationSchemas";

export const integrationPlugProviderParamsSchema = z.object({
    providerIdentifier: z.string().min(1, "providerIdentifier is required"),
});

export const integrationPlugIntegrationParamsSchema = z.object({
    integrationId: z.string().uuid("Invalid integration id"),
});

export const integrationPlugUpsertBodySchema = z.object({
    func: z.string().min(1, "func is required"),
    fields: z.array(
        z.object({
            name: z.string().min(1),
            value: z.string(),
        })
    ),
    plugId: z.string().uuid("Invalid plug id").optional(),
});

export const integrationPlugActivateParamsSchema = z.object({
    plugId: z.string().uuid("Invalid plug id"),
});

export const integrationPlugActivateBodySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    activated: z.boolean(),
});

export const validateIntegrationInternalPlugsRequest: RequestHandler = validateRequest({
    query: integrationOrganizationQuerySchema,
    params: integrationPlugProviderParamsSchema,
});

export const validateIntegrationPlugsListRequest: RequestHandler = validateRequest({
    query: integrationOrganizationQuerySchema,
    params: integrationPlugIntegrationParamsSchema,
});

export const validateIntegrationPlugsUpsertRequest: RequestHandler = validateRequest({
    query: integrationOrganizationQuerySchema,
    params: integrationPlugIntegrationParamsSchema,
    body: integrationPlugUpsertBodySchema,
});

export const validateIntegrationPlugActivateRequest: RequestHandler = validateRequest({
    params: integrationPlugActivateParamsSchema,
    body: integrationPlugActivateBodySchema,
});

export const validateIntegrationPlugDeleteRequest: RequestHandler = validateRequest({
    query: integrationOrganizationQuerySchema,
    params: integrationPlugActivateParamsSchema,
});
