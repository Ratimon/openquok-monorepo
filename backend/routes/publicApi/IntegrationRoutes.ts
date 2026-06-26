import { Router } from "express";
import { publicIntegrationController } from "../../controllers/index";
import { organizationRepository } from "../../repositories/index";
import { requireProgrammaticAuth, requireProgrammaticPlanCapability } from "../../guards";
import { SubscriptionSection } from "openquok-common";
import {
    validatePublicIntegrationIdParams,
    validatePublicIntegrationTriggerRequest,
    validatePublicIntegrationsListQuery,
    validatePublicSocialOAuthQuery,
} from "../../data/schemas/publicIntegrationsSchemas";
import { oauthAppService, subscriptionGuard } from "../../services/index";

type PublicIntegrationRouter = ReturnType<typeof Router>;

/**
 * Programmatic integration API under `/public` (full URL: `{api.prefix}/public/...`, e.g. `/api/v1/public/...`).
 * Version is carried by `api.prefix` only — no second `v1` segment. Organization from API key (not user JWT).
 * Listed in `middlewares/core.ts` `publicPaths` as `/public`; routes here use `requireProgrammaticAuth` (OAuth app token).
 *
 * Session-scoped integration UX lives under `{api.prefix}/integrations` — see `routes/integrationRoutes.ts`
 */
const publicIntegrationRouter: PublicIntegrationRouter = Router();
const apiKeyAuth = requireProgrammaticAuth({ oauthAppService, organizationRepository, subscriptionGuard });

publicIntegrationRouter.get("/is-connected", apiKeyAuth, publicIntegrationController.isConnected);
publicIntegrationRouter.get("/workspace", apiKeyAuth, publicIntegrationController.getWorkspace);
publicIntegrationRouter.get(
    "/groups",
    apiKeyAuth,
    publicIntegrationController.listGroups
);
publicIntegrationRouter.get(
    "/integrations",
    apiKeyAuth,
    validatePublicIntegrationsListQuery,
    publicIntegrationController.listIntegrations
);
publicIntegrationRouter.get(
    "/social/:integration",
    apiKeyAuth,
    requireProgrammaticPlanCapability(SubscriptionSection.CHANNEL_PER_WORKSPACE),
    validatePublicSocialOAuthQuery,
    publicIntegrationController.getIntegrationUrl
);
publicIntegrationRouter.delete("/integrations/:id", apiKeyAuth, publicIntegrationController.deleteChannel);
publicIntegrationRouter.get(
    "/integration-settings/:id",
    apiKeyAuth,
    validatePublicIntegrationIdParams,
    publicIntegrationController.getIntegrationSettings
);
publicIntegrationRouter.post(
    "/integration-trigger/:id",
    apiKeyAuth,
    validatePublicIntegrationTriggerRequest,
    publicIntegrationController.triggerIntegration
);

export { publicIntegrationRouter };
