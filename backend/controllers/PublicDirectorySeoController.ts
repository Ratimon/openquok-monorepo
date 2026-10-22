import type { NextFunction, Request, Response } from "express";
import type { ProgrammaticAuthRequest } from "../guards";
import type { DirectorySeoWorkspaceService } from "../services/DirectorySeoWorkspaceService";
import { countPublicApiRequest } from "../connections/index";
import type {
    PublicDirectorySeoAddCompetitorBody,
    PublicDirectorySeoDeleteCompetitorBody,
    PublicDirectorySeoRefreshBody,
    PublicDirectorySeoUpdateCompetitorBody,
    PublicDirectorySeoWorkspaceHistoryQuery,
    PublicDirectorySeoWorkspaceQuery,
} from "../data/schemas/publicDirectorySeoSchemas";

/**
 * Programmatic directory SEO API: organization resolved from API key
 * (`{api.prefix}/public/directory-seo/*`). Session handlers live on
 * {@link DirectorySeoController} under `/api/v1/directory-seo/*`.
 */
export class PublicDirectorySeoController {
    constructor(private readonly directorySeoWorkspaceService: DirectorySeoWorkspaceService) {}

    /** GET /public/directory-seo/workspace/overview */
    getWorkspaceOverview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("directory-seo-overview");
            const programmaticReq = req as ProgrammaticAuthRequest;
            const organizationId = programmaticReq.organization!.id;
            const authUserId = programmaticReq.publicUserId!;
            const query = req.query as unknown as PublicDirectorySeoWorkspaceQuery;
            const data = await this.directorySeoWorkspaceService.getWorkspaceOverview(
                authUserId,
                organizationId,
                query.productProfileId
            );
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** GET /public/directory-seo/workspace/history */
    getWorkspaceHistory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("directory-seo-history");
            const programmaticReq = req as ProgrammaticAuthRequest;
            const organizationId = programmaticReq.organization!.id;
            const authUserId = programmaticReq.publicUserId!;
            const query = req.query as unknown as PublicDirectorySeoWorkspaceHistoryQuery;
            const data = await this.directorySeoWorkspaceService.getWorkspaceHistory(
                authUserId,
                organizationId,
                query.productProfileId,
                query.days
            );
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** POST /public/directory-seo/workspace/competitors */
    addCompetitor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("directory-seo-competitors-add");
            const programmaticReq = req as ProgrammaticAuthRequest;
            const organizationId = programmaticReq.organization!.id;
            const authUserId = programmaticReq.publicUserId!;
            const body = req.body as PublicDirectorySeoAddCompetitorBody;
            const data = await this.directorySeoWorkspaceService.addCompetitor(authUserId, {
                organizationId,
                domain: body.domain,
                label: body.label,
                sortOrder: body.sortOrder,
            });
            res.status(201).json({ success: true, data, message: "Competitor added" });
        } catch (error) {
            next(error);
        }
    };

    /** DELETE /public/directory-seo/workspace/competitors */
    deleteCompetitor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("directory-seo-competitors-delete");
            const programmaticReq = req as ProgrammaticAuthRequest;
            const organizationId = programmaticReq.organization!.id;
            const authUserId = programmaticReq.publicUserId!;
            const body = req.body as PublicDirectorySeoDeleteCompetitorBody;
            await this.directorySeoWorkspaceService.deleteCompetitor(authUserId, {
                organizationId,
                domain: body.domain,
            });
            res.status(200).json({ success: true, message: "Competitor removed" });
        } catch (error) {
            next(error);
        }
    };

    /** PATCH /public/directory-seo/workspace/competitors */
    updateCompetitor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("directory-seo-competitors-update");
            const programmaticReq = req as ProgrammaticAuthRequest;
            const organizationId = programmaticReq.organization!.id;
            const authUserId = programmaticReq.publicUserId!;
            const body = req.body as PublicDirectorySeoUpdateCompetitorBody;
            const data = await this.directorySeoWorkspaceService.updateCompetitor(authUserId, {
                organizationId,
                domain: body.domain,
                label: body.label,
            });
            res.status(200).json({ success: true, data, message: "Competitor updated" });
        } catch (error) {
            next(error);
        }
    };

    /** POST /public/directory-seo/workspace/refresh */
    refreshWorkspace = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("directory-seo-refresh");
            const programmaticReq = req as ProgrammaticAuthRequest;
            const organizationId = programmaticReq.organization!.id;
            const authUserId = programmaticReq.publicUserId!;
            const body = req.body as PublicDirectorySeoRefreshBody;
            const data = await this.directorySeoWorkspaceService.refreshWorkspace(authUserId, {
                organizationId,
                productProfileId: body.productProfileId,
                force: body.force,
            });
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };
}
