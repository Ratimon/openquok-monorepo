import { z } from "zod";

export const setIdParamSchema = z.object({
    id: z.string().uuid("Invalid set id"),
});

export const listSetsQuerySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
});

export const upsertSetBodySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    id: z.string().uuid("Invalid set id").optional(),
    name: z.string().min(1, "Name is required").max(200, "Name is too long").trim(),
    content: z.string().min(1, "Content is required").max(500_000, "Content is too large"),
});

export type UpsertSetBody = z.infer<typeof upsertSetBodySchema>;
export type ListSetsQuery = z.infer<typeof listSetsQuerySchema>;
