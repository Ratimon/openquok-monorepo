import { z } from "zod";

/** Public creator slug for `/creators/{username}` and listing URLs. */
export const usernameSchema = z
    .string()
    .min(3, { message: "Username must be at least 3 characters." })
    .max(30, { message: "Username must be at most 30 characters." })
    .regex(/^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/, {
        message: "Username must use lowercase letters, numbers, and hyphens only.",
    })
    .trim();

export const optionalUsernameSchema = z
    .union([usernameSchema, z.literal(""), z.null()])
    .optional()
    .transform((val) => (val === "" || val === null || val === undefined ? undefined : val));
