import { Router } from "express";
import { integrationController } from "../../controllers/index";
import { requireFullAuth } from "../../middlewares/authenticateUser";
import { supabaseAnonClient } from "../../connections/index";
import {
    validateIntegrationOrganizationQuery,
    validateSocialConnectBody,
    validateIntegrationOrgAndIdBody,
    validateSaveProviderPage,
    validateIntegrationCustomersQuery,
    validateIntegrationCreateCustomerBody,
    validateIntegrationGroup,
} from "../../data/schemas/integrationSchemas";
import { validateIntegrationTimeRequest } from "../../data/schemas/integrationTimeSchemas";

type SessionIntegrationsRouter = ReturnType<typeof Router>;

/**
 * Session + catalog under `/integrations`:
 * - GET `/` — provider catalog (no JWT; also whitelisted in `core.ts`).
 * - Other routes — JWT; org from query/body.
 */
const sessionIntegrationsRouter: SessionIntegrationsRouter = Router();
const auth = requireFullAuth(supabaseAnonClient);

sessionIntegrationsRouter.get("/", integrationController.getAllIntegrations);

sessionIntegrationsRouter.use(auth);
sessionIntegrationsRouter.post(
    "/provider/:id/connect",
    validateSaveProviderPage,
    integrationController.saveProviderPage
);
sessionIntegrationsRouter.get("/list", validateIntegrationOrganizationQuery, integrationController.getIntegrationList);
sessionIntegrationsRouter.get(
    "/customers",
    validateIntegrationCustomersQuery,
    integrationController.getChannelCustomers
);
sessionIntegrationsRouter.post(
    "/customers",
    validateIntegrationCreateCustomerBody,
    integrationController.createChannelCustomer
);
sessionIntegrationsRouter.put(
    "/:id/group",
    validateIntegrationGroup,
    integrationController.assignChannelCustomer
);
sessionIntegrationsRouter.post(
    "/:id/time",
    validateIntegrationTimeRequest,
    integrationController.setTime
);
sessionIntegrationsRouter.get(
    "/social/:integration",
    validateIntegrationOrganizationQuery,
    integrationController.getIntegrationUrl
);
sessionIntegrationsRouter.post(
    "/social-connect/:integration",
    validateSocialConnectBody,
    integrationController.connectSocialMedia
);
sessionIntegrationsRouter.post("/disable", validateIntegrationOrgAndIdBody, integrationController.disable);
sessionIntegrationsRouter.post("/enable", validateIntegrationOrgAndIdBody, integrationController.enable);
sessionIntegrationsRouter.delete("/", validateIntegrationOrgAndIdBody, integrationController.deleteChannel);

export { sessionIntegrationsRouter };
