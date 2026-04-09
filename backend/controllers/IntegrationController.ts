import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/authenticateUser";
import type { IntegrationConnectionService } from "../services/IntegrationConnectionService";
import type { IntegrationManager } from "../integrations/integrationManager";
import type { IntegrationCatalogDTO, IntegrationListDTO } from "../utils/dtos/IntegrationDTO";

import { UserAuthorizationError } from "../errors/UserError";

/**
 * Session-scoped integration routes under `/integrations` (JWT + org in query/body).
 * Programmatic routes under `/public` (within the API prefix) use {@link PublicIntegrationController}.
 */
export class IntegrationController {
    constructor(
        private readonly integrationConnectionService: IntegrationConnectionService,
        private readonly integrationManager: IntegrationManager
    ) {}

    /** GET /integrations — public catalog (provider metadata only). */
    getAllIntegrations = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const data = (await this.integrationManager.getAllIntegrationsWithCustomFields()) as IntegrationCatalogDTO;
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** GET /integrations/list?organizationId= */
    getIntegrationList = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const organizationId = (req.query as { organizationId: string }).organizationId;
            const data = (await this.integrationConnectionService.getIntegrationList(
                authUserId,
                organizationId
            )) as IntegrationListDTO;
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** GET /integrations/social/:integration?organizationId=&refresh=&onboarding=&externalUrl= */
    getIntegrationUrl = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const organizationId = (req.query as { organizationId: string }).organizationId;
            const { integration } = req.params as { integration: string };
            const q = req.query as { refresh?: string; externalUrl?: string; onboarding?: string };
            const result = await this.integrationConnectionService.getIntegrationUrl(authUserId, organizationId, integration, {
                refresh: q.refresh,
                externalUrl: q.externalUrl,
                onboarding: q.onboarding,
            });
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    };

    /** POST /integrations/social-connect/:integration */
    connectSocialMedia = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const { integration } = req.params as { integration: string };
            const body = req.body as { state: string; code: string; timezone: string; refresh?: string };
            const data = await this.integrationConnectionService.connectSocialMedia(authUserId, integration, body);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** POST /integrations/:id/time?organizationId= */
    setTime = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const organizationId = (req.query as { organizationId: string }).organizationId;
            const integrationId = (req.params as { id: string }).id;
            await this.integrationConnectionService.setTimes(authUserId, organizationId, integrationId, req.body);
            res.status(200).json({ success: true, data: { ok: true } });
        } catch (error) {
            next(error);
        }
    };

    /** POST /integrations/disable */
    disable = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const { organizationId, id } = req.body as { organizationId: string; id: string };
            await this.integrationConnectionService.disableChannel(authUserId, organizationId, id);
            res.status(200).json({ success: true, data: { ok: true } });
        } catch (error) {
            next(error);
        }
    };

    /** POST /integrations/enable */
    enable = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const { organizationId, id } = req.body as { organizationId: string; id: string };
            await this.integrationConnectionService.enableChannel(authUserId, organizationId, id);
            res.status(200).json({ success: true, data: { ok: true } });
        } catch (error) {
            next(error);
        }
    };

    /** DELETE /integrations — body { organizationId, id } */
    deleteChannel = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const { organizationId, id } = req.body as { organizationId: string; id: string };
            await this.integrationConnectionService.deleteChannel(authUserId, organizationId, id);
            res.status(200).json({ success: true, data: { ok: true } });
        } catch (error) {
            next(error);
        }
    };
}
