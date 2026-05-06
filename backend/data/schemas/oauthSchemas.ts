import { z } from "zod";
import type { RequestHandler } from "express";
import { validateRequest } from "../../middlewares/validateRequest";

export const oauthAuthorizeQuerySchema = z.object({
    client_id: z.string().min(1, "client_id is required"),
    state: z.string().optional(),
});

export const validateOauthAuthorizeQuery: RequestHandler = validateRequest({
    query: oauthAuthorizeQuerySchema,
});

export const oauthTokenBodySchema = z.object({
    grant_type: z.literal("authorization_code"),
    client_id: z.string().min(1, "client_id is required"),
    client_secret: z.string().min(1, "client_secret is required"),
    code: z.string().min(1, "code is required"),
});

export const validateOauthTokenBody: RequestHandler = validateRequest({
    body: oauthTokenBodySchema,
});

export const oauthApproveBodySchema = z.object({
    client_id: z.string().min(1, "client_id is required"),
    organizationId: z.string().uuid("Invalid organization id"),
    state: z.string().optional(),
    action: z.enum(["approve", "deny"]),
});

export const validateOauthApproveBody: RequestHandler = validateRequest({
    body: oauthApproveBodySchema,
});

export const oauthRevokeBodySchema = z.object({
    authorizationId: z.string().uuid("Invalid authorization id"),
});

export const validateOauthRevokeBody: RequestHandler = validateRequest({
    body: oauthRevokeBodySchema,
});

