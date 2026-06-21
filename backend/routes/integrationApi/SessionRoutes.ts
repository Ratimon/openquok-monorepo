import { Router } from "express";
import { integrationController } from "../../controllers/index";
import { requireFullAuth, requirePlanCapabilityForOrganization } from "../../guards";
import { supabaseAnonClient } from "../../connections/index";
import {
    validateIntegrationOrganizationQuery,
    validateSocialConnectBody,
    validateIntegrationOrgAndIdBody,
    validateSaveProviderPage,
    validateIntegrationCustomersQuery,
    validateIntegrationCreateCustomerBody,
    validateIntegrationGroup,
    validateIntegrationMentionsRequest,
} from "../../data/schemas/integrationSchemas";
import {
    validateIntegrationInternalPlugsRequest,
    validateIntegrationPlugActivateRequest,
    validateIntegrationPlugDeleteRequest,
    validateIntegrationPlugsListRequest,
    validateIntegrationPlugsUpsertRequest,
    validateIntegrationTriggerRequest,
} from "../../data/schemas/integrationPlugSchemas";
import { validateIntegrationTimeRequest } from "../../data/schemas/integrationTimeSchemas";
import { SubscriptionSection } from "openquok-common";

type IntegrationSessionRouter = ReturnType<typeof Router>;

const integrationSessionRouter: IntegrationSessionRouter = Router();
const auth = requireFullAuth(supabaseAnonClient);

integrationSessionRouter.use(auth);

integrationSessionRouter.get("/plug/list", integrationController.getPlugCatalog);
integrationSessionRouter.get(
    "/internal-plugs/:providerIdentifier",
    validateIntegrationInternalPlugsRequest,
    integrationController.getInternalPlugDefinitions
);
integrationSessionRouter.post(
    "/:integrationId/trigger",
    validateIntegrationTriggerRequest,
    integrationController.triggerIntegrationTool
);
integrationSessionRouter.put(
    "/plugs/:plugId/activate",
    validateIntegrationPlugActivateRequest,
    integrationController.setIntegrationPlugActivated
);
integrationSessionRouter.delete(
    "/plugs/:plugId",
    validateIntegrationPlugDeleteRequest,
    integrationController.deleteIntegrationPlug
);
integrationSessionRouter.get(
    "/:integrationId/plugs",
    validateIntegrationPlugsListRequest,
    integrationController.listIntegrationPlugs
);
integrationSessionRouter.post(
    "/:integrationId/plugs",
    validateIntegrationPlugsUpsertRequest,
    integrationController.upsertIntegrationPlug
);

integrationSessionRouter.post(
    "/provider/:id/connect",
    validateSaveProviderPage,
    integrationController.saveProviderPage
);
integrationSessionRouter.get("/list", validateIntegrationOrganizationQuery, integrationController.getIntegrationList);
integrationSessionRouter.get(
    "/customers",
    validateIntegrationCustomersQuery,
    integrationController.getChannelCustomers
);
integrationSessionRouter.post(
    "/customers",
    validateIntegrationCreateCustomerBody,
    integrationController.createChannelCustomer
);
integrationSessionRouter.put(
    "/:id/group",
    validateIntegrationGroup,
    integrationController.assignChannelCustomer
);
integrationSessionRouter.post(
    "/:id/time",
    validateIntegrationTimeRequest,
    integrationController.setTime
);
integrationSessionRouter.get(
    "/social/:integration",
    validateIntegrationOrganizationQuery,
    requirePlanCapabilityForOrganization(SubscriptionSection.CHANNEL_PER_WORKSPACE, {
        resolveOrganizationId: (req) => (req.query as any)?.organizationId,
    }),
    integrationController.getIntegrationUrl
);
integrationSessionRouter.post(
    "/social-connect/:integration",
    validateSocialConnectBody,
    requirePlanCapabilityForOrganization(SubscriptionSection.CHANNEL_PER_WORKSPACE, {
        resolveOrganizationId: (req) => (req.body as any)?.organizationId,
    }),
    integrationController.connectSocialMedia
);
integrationSessionRouter.post(
    "/mentions",
    validateIntegrationMentionsRequest,
    integrationController.searchIntegrationMentions
);
integrationSessionRouter.post("/disable", validateIntegrationOrgAndIdBody, integrationController.disable);
integrationSessionRouter.post("/enable", validateIntegrationOrgAndIdBody, integrationController.enable);
integrationSessionRouter.delete("/", validateIntegrationOrgAndIdBody, integrationController.deleteChannel);

export { integrationSessionRouter };
