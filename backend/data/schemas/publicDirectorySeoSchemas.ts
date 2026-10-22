import { z } from "zod";
import type { RequestHandler } from "express";

import { validateRequest } from "../../middlewares/validateRequest";
import {
    directorySeoAddCompetitorBodySchema,
    directorySeoDeleteCompetitorBodySchema,
    directorySeoRefreshBodySchema,
    directorySeoUpdateCompetitorBodySchema,
    directorySeoWorkspaceHistoryQuerySchema,
    directorySeoWorkspaceQuerySchema,
} from "./directorySeoSchemas";

/**
 * Programmatic directory SEO API (`{api.prefix}/public/directory-seo/*`).
 * Organization id is derived from the API key and MUST NOT be supplied by callers.
 */

export const publicDirectorySeoWorkspaceQuerySchema = directorySeoWorkspaceQuerySchema.omit({
    organizationId: true,
});

export const validatePublicDirectorySeoWorkspaceQuery: RequestHandler = validateRequest({
    query: publicDirectorySeoWorkspaceQuerySchema,
});

export const publicDirectorySeoWorkspaceHistoryQuerySchema =
    directorySeoWorkspaceHistoryQuerySchema.omit({
        organizationId: true,
    });

export const validatePublicDirectorySeoWorkspaceHistoryQuery: RequestHandler = validateRequest({
    query: publicDirectorySeoWorkspaceHistoryQuerySchema,
});

export const publicDirectorySeoAddCompetitorBodySchema = directorySeoAddCompetitorBodySchema.omit({
    organizationId: true,
});

export const validatePublicDirectorySeoAddCompetitorRequest: RequestHandler = validateRequest({
    body: publicDirectorySeoAddCompetitorBodySchema,
});

export const publicDirectorySeoDeleteCompetitorBodySchema =
    directorySeoDeleteCompetitorBodySchema.omit({
        organizationId: true,
    });

export const validatePublicDirectorySeoDeleteCompetitorRequest: RequestHandler = validateRequest({
    body: publicDirectorySeoDeleteCompetitorBodySchema,
});

export const publicDirectorySeoUpdateCompetitorBodySchema =
    directorySeoUpdateCompetitorBodySchema.omit({
        organizationId: true,
    });

export const validatePublicDirectorySeoUpdateCompetitorRequest: RequestHandler = validateRequest({
    body: publicDirectorySeoUpdateCompetitorBodySchema,
});

export const publicDirectorySeoRefreshBodySchema = directorySeoRefreshBodySchema.omit({
    organizationId: true,
});

export const validatePublicDirectorySeoRefreshRequest: RequestHandler = validateRequest({
    body: publicDirectorySeoRefreshBodySchema,
});

export type PublicDirectorySeoWorkspaceQuery = z.infer<typeof publicDirectorySeoWorkspaceQuerySchema>;
export type PublicDirectorySeoWorkspaceHistoryQuery = z.infer<
    typeof publicDirectorySeoWorkspaceHistoryQuerySchema
>;
export type PublicDirectorySeoAddCompetitorBody = z.infer<
    typeof publicDirectorySeoAddCompetitorBodySchema
>;
export type PublicDirectorySeoDeleteCompetitorBody = z.infer<
    typeof publicDirectorySeoDeleteCompetitorBodySchema
>;
export type PublicDirectorySeoUpdateCompetitorBody = z.infer<
    typeof publicDirectorySeoUpdateCompetitorBodySchema
>;
export type PublicDirectorySeoRefreshBody = z.infer<typeof publicDirectorySeoRefreshBodySchema>;
