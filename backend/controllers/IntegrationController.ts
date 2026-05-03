import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/authenticateUser";
import type { IntegrationConnectionService } from "../services/IntegrationConnectionService";
import type { IntegrationManager } from "../integrations/integrationManager";
import type {
    IntegrationCustomerAssignOkDTO,
    IntegrationCustomerCreatedDTO,
    IntegrationCustomersListDTO,
} from "../utils/dtos/CustomerDTO";
import type { IntegrationCatalogDTO, IntegrationListDTO } from "../utils/dtos/IntegrationDTO";
import type { PlugUpsertBodyDto } from "../utils/dtos/PlugDTO";

import { UserAuthorizationError } from "../errors/UserError";

/**
 * Session-scoped integration routes under `/integrations` (JWT + org in query/body); mounted from `routes/integrationRoutes.ts`.
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

    /** GET /integrations/customers?organizationId= */
    getChannelCustomers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const organizationId = (req.query as { organizationId: string }).organizationId;
            const customers = await this.integrationConnectionService.getIntegrationCustomers(
                authUserId,
                organizationId
            );
            const data: IntegrationCustomersListDTO = { customers };
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** POST /integrations/customers */
    createChannelCustomer = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const body = req.body as { organizationId: string; name: string };
            const row = (await this.integrationConnectionService.createIntegrationCustomer(
                authUserId,
                body.organizationId,
                body.name
            )) as IntegrationCustomerCreatedDTO;
            res.status(200).json({ success: true, data: row });
        } catch (error) {
            next(error);
        }
    };

    /** PUT /integrations/:id/group */
    assignChannelCustomer = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const integrationId = (req.params as { id: string }).id;
            const body = req.body as { organizationId: string; customerId: string | null };
            await this.integrationConnectionService.assignIntegrationCustomer(
                authUserId,
                body.organizationId,
                integrationId,
                body.customerId
            );
            const data: IntegrationCustomerAssignOkDTO = { ok: true };
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

    /** POST /integrations/social-connect/:integration (no-auth callback variant; organization resolved from OAuth state cache). */
    connectSocialMediaNoAuth = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { integration } = req.params as { integration: string };
            const body = req.body as { state: string; code: string; timezone: string; refresh?: string };
            const data = await this.integrationConnectionService.connectSocialMediaNoAuth(integration, body);
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

    /** POST /integrations/provider/:id/connect?… — complete in-between-step selection (e.g. Instagram Business `pageId` + `id`). */
    saveProviderPage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const integrationId = (req.params as { id: string }).id;
            const body = req.body as Record<string, unknown>;
            const organizationId = body.organizationId as string;
            const data = await this.integrationConnectionService.saveProviderPage(
                authUserId,
                organizationId,
                integrationId,
                body
            );
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** POST /integrations/public/provider/:id/connect — no-auth completion using OAuth state cache. */
    saveProviderPageNoAuth = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const integrationId = (req.params as { id: string }).id;
            const body = req.body as Record<string, unknown>;
            const data = await this.integrationConnectionService.saveProviderPageNoAuth(integrationId, body);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** GET /integrations/plug/list — global plug catalog (threshold-style rules). */
    getPlugCatalog = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const data = this.integrationConnectionService.getPlugCatalog();
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** GET /integrations/internal-plugs/:providerIdentifier?organizationId= */
    getInternalPlugDefinitions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const organizationId = (req.query as { organizationId: string }).organizationId;
            const providerIdentifier = (req.params as { providerIdentifier: string }).providerIdentifier;
            const data = await this.integrationConnectionService.getInternalPlugDefinitions(
                authUserId,
                organizationId,
                providerIdentifier
            );
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** GET /integrations/:integrationId/plugs?organizationId= */
    listIntegrationPlugs = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const organizationId = (req.query as { organizationId: string }).organizationId;
            const integrationId = (req.params as { integrationId: string }).integrationId;
            const plugs = await this.integrationConnectionService.listIntegrationPlugs(
                authUserId,
                organizationId,
                integrationId
            );
            res.status(200).json({ success: true, data: { plugs } });
        } catch (error) {
            next(error);
        }
    };

    /** POST /integrations/:integrationId/plugs?organizationId= */
    upsertIntegrationPlug = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const organizationId = (req.query as { organizationId: string }).organizationId;
            const integrationId = (req.params as { integrationId: string }).integrationId;
            const body = req.body as PlugUpsertBodyDto;
            const data = await this.integrationConnectionService.upsertIntegrationPlug(
                authUserId,
                organizationId,
                integrationId,
                body
            );
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** PUT /integrations/plugs/:plugId/activate */
    setIntegrationPlugActivated = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const plugId = (req.params as { plugId: string }).plugId;
            const { organizationId, activated } = req.body as { organizationId: string; activated: boolean };
            const data = await this.integrationConnectionService.setIntegrationPlugActivated(
                authUserId,
                organizationId,
                plugId,
                activated
            );
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** DELETE /integrations/plugs/:plugId?organizationId= */
    deleteIntegrationPlug = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const organizationId = (req.query as { organizationId: string }).organizationId;
            const plugId = (req.params as { plugId: string }).plugId;
            const data = await this.integrationConnectionService.deleteIntegrationPlug(
                authUserId,
                organizationId,
                plugId
            );
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };
}
