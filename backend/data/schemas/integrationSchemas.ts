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
    refresh: z.string().uuid().optional(),
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
