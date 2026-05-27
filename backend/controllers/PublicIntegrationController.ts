import type { Request, Response, NextFunction } from "express";
import type { ProgrammaticAuthRequest } from "../guards";
import type { IntegrationConnectionService } from "../services/IntegrationConnectionService";

import { countPublicApiRequest } from "../connections/index";

/**
 * Programmatic integration API: organization resolved from API key (`{api.prefix}/public/*`).
 * Session-scoped handlers live on {@link IntegrationController}.
 *
 * Every handler emits a `public_api-request` Sentry counter tagged by `route`
 * so the public API can be observed end-to-end in dashboards. The counter is
 * best-effort and never breaks the request path — see {@link countPublicApiRequest}.
 */
export class PublicIntegrationController {
    constructor(private readonly integrationConnectionService: IntegrationConnectionService) {}

    /** GET /public/is-connected (under API prefix, e.g. /api/v1/public/is-connected) */
    isConnected = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("is-connected");
            res.status(200).json({ connected: true });
        } catch (error) {
            next(error);
        }
    };

    /** GET /public/workspace — workspace resolved from the programmatic API key */
    getWorkspace = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("workspace");
            const organization = (req as ProgrammaticAuthRequest).organization!;
            res.status(200).json({
                workspace: {
                    id: organization.id,
                    name: organization.name,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    /** GET /public/integrations */
    listIntegrations = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("integrations");
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
            const data = await this.integrationConnectionService.publicListIntegrations(organizationId);
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    /** GET /public/social/:integration — returns the OAuth authorization URL for the given provider. */
    getIntegrationUrl = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("social");
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
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
            countPublicApiRequest("integrations-delete");
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
            const { id } = req.params as { id: string };
            await this.integrationConnectionService.publicDeleteChannel(organizationId, id);
            res.status(200).json({ id });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /public/integration-settings/:id — provider rules, max-length, settings schema,
     * and the allow-listed tools that {@link triggerIntegration} accepts.
     */
    getIntegrationSettings = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("integration-settings");
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
            const { id } = req.params as { id: string };
            const data = await this.integrationConnectionService.getIntegrationSettings(organizationId, id);
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /public/integration-trigger/:id — invoke an allow-listed provider method by `methodName`,
     * retrying once after a refresh-token round trip if the provider raises
     * {@link ProviderAccessTokenExpiredError}.
     */
    triggerIntegration = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("integration-trigger");
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
            const { id } = req.params as { id: string };
            const { methodName, data } = req.body as { methodName: string; data?: Record<string, unknown> };
            const result = await this.integrationConnectionService.triggerIntegrationTool(
                organizationId,
                id,
                methodName,
                data ?? {}
            );
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
}
