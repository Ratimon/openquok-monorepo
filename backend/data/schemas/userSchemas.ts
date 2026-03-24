import { z } from "zod";
import type { RequestHandler } from "express";
import { validateRequest } from "../../middlewares/validateRequest";

const passwordRequirements = z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(72, { message: "Password must be at most 72 characters long." })
    .trim();

export const updatePasswordBodySchema = z.object({
    password: passwordRequirements,
});

const optionalWebsiteUrl = z
    .union([z.string().max(2048).trim(), z.null(), z.literal("")])
    .optional()
    .refine(
        (val) =>
            val === undefined ||
            val === null ||
            val === "" ||
            (typeof val === "string" && /^https?:\/\//i.test(val)),
        { message: "Website must be empty or a valid http(s) URL." }
    );

export const updateProfileBodySchema = z
    .object({
        fullName: z
            .string()
            .min(1, { message: "Full name is required." })
            .max(256, { message: "Full name must be at most 256 characters." })
            .trim()
            .optional(),
        avatarUrl: z.union([z.string(), z.null()]).optional(),
        websiteUrl: optionalWebsiteUrl,
    })
    .refine(
        (data) =>
            data.fullName !== undefined || data.avatarUrl !== undefined || data.websiteUrl !== undefined,
        { message: "At least one of fullName, avatarUrl, or websiteUrl is required." }
    );

export const validateUpdateProfileRequest: RequestHandler = validateRequest({
    body: updateProfileBodySchema,
});

/** Body-only validation for PUT /users/me/password (no userId in params). */
export const validateUpdatePasswordMeRequest: RequestHandler = validateRequest({
    body: updatePasswordBodySchema,
});

export type ValidateUpdateProfileRequestHandler = typeof validateUpdateProfileRequest;
export type ValidateUpdatePasswordMeRequestHandler = typeof validateUpdatePasswordMeRequest;
