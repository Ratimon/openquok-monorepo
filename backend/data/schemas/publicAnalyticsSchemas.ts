import { z } from "zod";
import type { RequestHandler } from "express";
import { validateRequest } from "../../middlewares/validateRequest";

/**
 * Programmatic analytics API schemas (`{api.prefix}/public/analytics/*`).
 * Organization id is derived from the API key; date window is one of `7|30|90` days.
 */

const dateWindowSchema = z.string().refine((v) => {
    const n = Number(v);
    return Number.isFinite(n) && [7, 30, 90].includes(n);
}, "Invalid date window (use 7, 30, or 90)");

export const publicIntegrationAnalyticsParamsSchema = z.object({
    integrationId: z.string().uuid("Invalid integration id"),
});

export const publicIntegrationAnalyticsQuerySchema = z.object({
    date: dateWindowSchema,
});

export const validatePublicIntegrationAnalyticsRequest: RequestHandler = validateRequest({
    params: publicIntegrationAnalyticsParamsSchema,
    query: publicIntegrationAnalyticsQuerySchema,
});

export const publicPostAnalyticsParamsSchema = z.object({
    postId: z.string().uuid("Invalid post id"),
});

export const publicPostAnalyticsQuerySchema = z.object({
    date: dateWindowSchema,
});

export const validatePublicPostAnalyticsRequest: RequestHandler = validateRequest({
    params: publicPostAnalyticsParamsSchema,
    query: publicPostAnalyticsQuerySchema,
});
