import { z } from "zod";

export const signatureIdParamSchema = z.object({
    id: z.string().uuid("Invalid signature id"),
});

export const listSignaturesQuerySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
});

export const createSignatureBodySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    title: z.string().min(1, "Title is required").max(80, "Title is too long").trim(),
    content: z.string().min(1, "Content is required").max(500, "Signature is too long").trim(),
    isDefault: z.boolean().optional(),
});

export const updateSignatureBodySchema = z.object({
    title: z.string().min(1, "Title is required").max(80, "Title is too long").trim().optional(),
    content: z.string().min(1, "Content is required").max(500, "Signature is too long").trim().optional(),
    isDefault: z.boolean().optional(),
});

export type CreateSignatureBody = z.infer<typeof createSignatureBodySchema>;
export type UpdateSignatureBody = z.infer<typeof updateSignatureBodySchema>;
export type ListSignaturesQuery = z.infer<typeof listSignaturesQuerySchema>;
