import { z } from "zod";
import type { RequestHandler } from "express";
import { validateRequest } from "../../middlewares/validateRequest";

/** Path param for DELETE …/approved-apps/:id (oauth authorization row id). */
export const approvedAppAuthorizationIdParamSchema = z.object({
    id: z.string().uuid("Invalid authorization id"),
});

export const validateApprovedAppAuthorizationIdParam: RequestHandler = validateRequest({
    params: approvedAppAuthorizationIdParamSchema,
});
