import { z } from "zod";
import type { RequestHandler } from "express";
import { validateRequest } from "../../middlewares/validateRequest";

export const integrationAnalyticsParamsSchema = z.object({
    integrationId: z.string().uuid("Invalid integration id"),
});

export const integrationAnalyticsQuerySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    date: z.string().refine((v) => {
        const n = Number(v);
        return Number.isFinite(n) && [7, 30, 90].includes(n);
    }, "Invalid date window"),
});

export const validateIntegrationAnalyticsRequest: RequestHandler = validateRequest({
    params: integrationAnalyticsParamsSchema,
    query: integrationAnalyticsQuerySchema,
});

export const postAnalyticsParamsSchema = z.object({
    postId: z.string().uuid("Invalid post id"),
});

export const postAnalyticsQuerySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    date: z.string().refine((v) => {
        const n = Number(v);
        return Number.isFinite(n) && [7, 30, 90].includes(n);
    }, "Invalid date window"),
});

export const validatePostAnalyticsRequest: RequestHandler = validateRequest({
    params: postAnalyticsParamsSchema,
    query: postAnalyticsQuerySchema,
});

