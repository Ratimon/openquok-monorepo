import { z } from "zod";
import type { RequestHandler } from "express";
import { validateRequest } from "../../middlewares/validateRequest";

/**
 * Programmatic notifications API schema (`{api.prefix}/public/notifications`).
 * Organization id is derived from the API key; `page` is a 0-based offset.
 */

export const publicListNotificationsQuerySchema = z.object({
    page: z
        .string()
        .optional()
        .refine((v) => v === undefined || (Number.isFinite(Number(v)) && Number(v) >= 0), "Invalid page"),
});

export const validatePublicListNotificationsQuery: RequestHandler = validateRequest({
    query: publicListNotificationsQuerySchema,
});
