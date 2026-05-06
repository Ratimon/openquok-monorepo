import { z } from "zod";
import type { RequestHandler } from "express";
import { validateRequest } from "../../middlewares/validateRequest";

export const oauthAppOrganizationQuerySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
});

export const validateOauthAppOrganizationQuery: RequestHandler = validateRequest({
    query: oauthAppOrganizationQuerySchema,
});

export const createOauthAppBodySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    name: z.string().min(1, "Name is required").max(120).trim(),
    description: z.string().max(2000).trim().optional(),
    pictureId: z.string().uuid("Invalid picture id").optional(),
    redirectUrl: z.string().min(1, "Redirect URL is required").max(2000).trim(),
});

export const validateCreateOauthApp: RequestHandler = validateRequest({
    body: createOauthAppBodySchema,
});

export const oauthAppIdParamSchema = z.object({
    oauthAppId: z.string().uuid("Invalid oauth app id"),
});

export const validateOauthAppIdParam: RequestHandler = validateRequest({
    params: oauthAppIdParamSchema,
});

export const deleteOauthAppParamsSchema = oauthAppIdParamSchema;
export const validateDeleteOauthApp: RequestHandler = validateRequest({
    params: deleteOauthAppParamsSchema,
    query: oauthAppOrganizationQuerySchema,
});

export const updateOauthAppBodySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    oauthAppId: z.string().uuid("Invalid oauth app id"),
    name: z.string().min(1).max(120).trim().optional(),
    description: z.string().max(2000).trim().nullable().optional(),
    pictureId: z.string().uuid("Invalid picture id").nullable().optional(),
    redirectUrl: z.string().min(1).max(2000).trim().optional(),
});

export const validateUpdateOauthApp: RequestHandler = validateRequest({
    body: updateOauthAppBodySchema,
});

export const rotateOauthSecretBodySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    oauthAppId: z.string().uuid("Invalid oauth app id"),
});

export const validateRotateOauthSecret: RequestHandler = validateRequest({
    body: rotateOauthSecretBodySchema,
});

