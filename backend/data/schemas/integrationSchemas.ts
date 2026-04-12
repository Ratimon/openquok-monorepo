import { z } from "zod";
import type { RequestHandler } from "express";
import { validateRequest } from "../../middlewares/validateRequest";

export const integrationOrganizationQuerySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
});

export const validateIntegrationOrganizationQuery: RequestHandler = validateRequest({
    query: integrationOrganizationQuerySchema,
});

export const socialConnectBodySchema = z.object({
    state: z.string().min(1, "state is required"),
    code: z.string().min(1, "code is required"),
    timezone: z.string().min(1, "timezone is required"),
    /** Optional OAuth refresh hint (e.g. Meta user id — not always a UUID). */
    refresh: z.string().min(1).optional(),
});

export const validateSocialConnectBody: RequestHandler = validateRequest({
    body: socialConnectBodySchema,
});

export const integrationOrgAndIdBodySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    id: z.string().uuid("Invalid integration id"),
});

export const validateIntegrationOrgAndIdBody: RequestHandler = validateRequest({
    body: integrationOrgAndIdBodySchema,
});

/** `POST /integrations/provider/:id/connect` — `organizationId` plus provider-specific fields (e.g. `pageId` + `id` for Instagram Business). */
export const saveProviderPageParamsSchema = z.object({
    id: z.string().uuid("Invalid integration id"),
});

export const saveProviderPageBodySchema = z
    .object({
        organizationId: z.string().uuid("Invalid organization id"),
    })
    .passthrough();

export const validateSaveProviderPage: RequestHandler = validateRequest({
    params: saveProviderPageParamsSchema,
    body: saveProviderPageBodySchema,
});
