import { Router } from "express";
import { publicIntegrationController } from "../../controllers/index";
import { organizationRepository } from "../../repositories/index";
import { requireOrganizationApiKey } from "../../middlewares/organizationApiKey";
import { validatePublicSocialOAuthQuery } from "../../data/schemas/publicIntegrationsSchemas";

type PublicIntegrationRouter = ReturnType<typeof Router>;

/**
 * Programmatic integration API under `/public` (full URL: `{api.prefix}/public/...`, e.g. `/api/v1/public/...`).
 * Version is carried by `api.prefix` only — no second `v1` segment. Organization from API key (not user JWT).
 * Listed in `middlewares/core.ts` `publicPaths` as `/public`; routes here use `requireOrganizationApiKey`.
 *
 * Session-scoped integration UX lives under `{api.prefix}/integrations` — see `routes/integrationRoutes.ts`
 */
const publicIntegrationRouter: PublicIntegrationRouter = Router();
const apiKeyAuth = requireOrganizationApiKey(organizationRepository);

publicIntegrationRouter.get("/is-connected", apiKeyAuth, publicIntegrationController.isConnected);
publicIntegrationRouter.get("/integrations", apiKeyAuth, publicIntegrationController.listIntegrations);
publicIntegrationRouter.get(
    "/social/:integration",
    apiKeyAuth,
    validatePublicSocialOAuthQuery,
    publicIntegrationController.getIntegrationUrl
);
publicIntegrationRouter.delete("/integrations/:id", apiKeyAuth, publicIntegrationController.deleteChannel);

export { publicIntegrationRouter };
