import { z } from "zod";
import type { RequestHandler } from "express";
import { validateRequest } from "../../middlewares/validateRequest";

/** Optional `refresh` integration id when requesting an OAuth URL via programmatic API. */
export const publicSocialOAuthQuerySchema = z.object({
    refresh: z.string().uuid().optional(),
});

export const validatePublicSocialOAuthQuery: RequestHandler = validateRequest({
    query: publicSocialOAuthQuerySchema,
});
