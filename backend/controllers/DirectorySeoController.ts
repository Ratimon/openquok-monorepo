import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../guards";
import type { DirectorySeoWorkspaceService } from "../services/DirectorySeoWorkspaceService";
import { UserAuthorizationError } from "../errors/UserError";
import type {
    DirectorySeoAddCompetitorBody,
    DirectorySeoDeleteCompetitorBody,
    DirectorySeoRefreshBody,
    DirectorySeoWorkspaceHistoryQuery,
    DirectorySeoWorkspaceQuery,
} from "../data/schemas/directorySeoSchemas";

export class DirectorySeoController {
    constructor(private readonly directorySeoWorkspaceService: DirectorySeoWorkspaceService) {}

    getWorkspaceOverview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));

            const query = req.query as unknown as DirectorySeoWorkspaceQuery;
            const data = await this.directorySeoWorkspaceService.getWorkspaceOverview(
                authUserId,
                query.organizationId,
                query.productProfileId
            );
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    getWorkspaceHistory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));

            const query = req.query as unknown as DirectorySeoWorkspaceHistoryQuery;
            const data = await this.directorySeoWorkspaceService.getWorkspaceHistory(
                authUserId,
                query.organizationId,
                query.productProfileId,
                query.days
            );
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    addCompetitor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));

            const body = req.body as DirectorySeoAddCompetitorBody;
            const data = await this.directorySeoWorkspaceService.addCompetitor(authUserId, body);
            res.status(201).json({ success: true, data, message: "Competitor added" });
        } catch (error) {
            next(error);
        }
    };

    deleteCompetitor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));

            const body = req.body as DirectorySeoDeleteCompetitorBody;
            await this.directorySeoWorkspaceService.deleteCompetitor(authUserId, body);
            res.status(200).json({ success: true, message: "Competitor removed" });
        } catch (error) {
            next(error);
        }
    };

    refreshWorkspace = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));

            const body = req.body as DirectorySeoRefreshBody;
            const data = await this.directorySeoWorkspaceService.refreshWorkspace(authUserId, body);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };
}
