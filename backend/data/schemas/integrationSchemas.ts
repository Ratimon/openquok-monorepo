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

export const saveProviderPageNoAuthBodySchema = z
    .object({
        state: z.string().min(1, "state is required"),
    })
    .passthrough();

export const validateSaveProviderPageNoAuth: RequestHandler = validateRequest({
    params: saveProviderPageParamsSchema,
    body: saveProviderPageNoAuthBodySchema,
});

export const integrationCustomersQuerySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
});

export const validateIntegrationCustomersQuery: RequestHandler = validateRequest({
    query: integrationCustomersQuerySchema,
});

export const integrationCreateCustomerBodySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    name: z.string().trim().min(1, "Name is required").max(200),
});

export const validateIntegrationCreateCustomerBody: RequestHandler = validateRequest({
    body: integrationCreateCustomerBodySchema,
});

export const integrationGroupParamsSchema = z.object({
    id: z.string().uuid("Invalid integration id"),
});

export const integrationGroupBodySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    /** Set to `null` to clear the customer assignment. */
    customerId: z.union([z.string().uuid("Invalid customer id"), z.null()]),
});

export const validateIntegrationGroup: RequestHandler = validateRequest({
    params: integrationGroupParamsSchema,
    body: integrationGroupBodySchema,
});
