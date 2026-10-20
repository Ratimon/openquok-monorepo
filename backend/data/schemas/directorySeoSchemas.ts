import { z } from "zod";

export const directorySeoWorkspaceQuerySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    productProfileId: z.string().uuid("Invalid product profile id"),
});

export const directorySeoWorkspaceHistoryQuerySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    productProfileId: z.string().uuid("Invalid product profile id"),
    days: z.coerce.number().int().min(1).max(366).optional().default(90),
});

export const directorySeoAddCompetitorBodySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    domain: z.string().min(1).max(253).trim(),
    label: z.string().max(200).trim().nullable().optional(),
    sortOrder: z.number().int().min(0).max(10_000).optional(),
});

export const directorySeoDeleteCompetitorBodySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    domain: z.string().min(1).max(253).trim(),
});

export const directorySeoRefreshBodySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    productProfileId: z.string().uuid("Invalid product profile id"),
    force: z.boolean().optional().default(false),
});

export type DirectorySeoWorkspaceQuery = z.infer<typeof directorySeoWorkspaceQuerySchema>;
export type DirectorySeoWorkspaceHistoryQuery = z.infer<typeof directorySeoWorkspaceHistoryQuerySchema>;
export type DirectorySeoAddCompetitorBody = z.infer<typeof directorySeoAddCompetitorBodySchema>;
export type DirectorySeoDeleteCompetitorBody = z.infer<typeof directorySeoDeleteCompetitorBodySchema>;
export type DirectorySeoRefreshBody = z.infer<typeof directorySeoRefreshBodySchema>;
