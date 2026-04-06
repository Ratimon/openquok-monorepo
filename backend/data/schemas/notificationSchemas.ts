import type { RequestHandler } from "express";
import { z } from "zod";
import { validateRequest } from "../../middlewares/validateRequest";

export const notificationOrganizationQuerySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
});

export const validateNotificationOrganizationQuery: RequestHandler = validateRequest({
    query: notificationOrganizationQuerySchema,
});

export const notificationPaginatedQuerySchema = notificationOrganizationQuerySchema.extend({
    page: z.coerce.number().int().min(0).default(0),
});

export const validateNotificationPaginatedQuery: RequestHandler = validateRequest({
    query: notificationPaginatedQuerySchema,
});
