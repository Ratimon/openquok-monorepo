import { z } from "zod";
import type { RequestHandler } from "express";
import { validateRequest } from "../../middlewares/validateRequest";

/** Posting schedule payload: `{ time: [{ time: number }, ...] }`. */
export const integrationTimeBodySchema = z.object({
    time: z.array(z.object({ time: z.number() })).min(1),
});

export type IntegrationTimeDto = z.infer<typeof integrationTimeBodySchema>;

const integrationTimeParamsSchema = z.object({ id: z.string().uuid("Invalid integration id") });
const integrationTimeQuerySchema = z.object({ organizationId: z.string().uuid("Invalid organization id") });

/** POST /integrations/:id/time?organizationId= */
export const validateIntegrationTimeRequest: RequestHandler = validateRequest({
    params: integrationTimeParamsSchema,
    query: integrationTimeQuerySchema,
    body: integrationTimeBodySchema,
});
