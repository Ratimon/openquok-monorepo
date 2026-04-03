import type { Request, Response, NextFunction } from "express";
import type { OrganizationApiRequest } from "../middlewares/organizationApiKey";
import type { IntegrationConnectionService } from "../services/IntegrationConnectionService";

/**
 * Programmatic integration API: organization resolved from API key (`{api.prefix}/public/*`).
 * Session-scoped handlers live on {@link IntegrationController}.
 */
export class PublicIntegrationController {
    constructor(private readonly integrationConnectionService: IntegrationConnectionService) {}

    /** GET /public/is-connected (under API prefix, e.g. /api/v1/public/is-connected) */
    isConnected = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(200).json({ connected: true });
        } catch (error) {
            next(error);
        }
    };

    /** GET /public/integrations */
    listIntegrations = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const organizationId = (req as OrganizationApiRequest).organization!.id;
            const data = await this.integrationConnectionService.publicListIntegrations(organizationId);
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    /** GET /public/social/:integration — OAuth URL (same responsibility as reference `getIntegrationUrl`). */
    getIntegrationUrl = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const organizationId = (req as OrganizationApiRequest).organization!.id;
            const { integration } = req.params as { integration: string };
            const q = req.query as { refresh?: string };
            const data = await this.integrationConnectionService.getIntegrationUrlPublicApi(organizationId, integration, {
                refresh: q.refresh,
            });
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    /** DELETE /public/integrations/:id */
    deleteChannel = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const organizationId = (req as OrganizationApiRequest).organization!.id;
            const { id } = req.params as { id: string };
            await this.integrationConnectionService.publicDeleteChannel(organizationId, id);
            res.status(200).json({ id });
        } catch (error) {
            next(error);
        }
    };
}
