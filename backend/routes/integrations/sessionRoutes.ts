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
import {
    validateIntegrationInternalPlugsRequest,
    validateIntegrationPlugActivateRequest,
    validateIntegrationPlugDeleteRequest,
    validateIntegrationPlugsListRequest,
    validateIntegrationPlugsUpsertRequest,
} from "../../data/schemas/integrationPlugSchemas";
import { validateIntegrationTimeRequest } from "../../data/schemas/integrationTimeSchemas";

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
    integrationController.getIntegrationUrl
);
integrationSessionRouter.post(
    "/social-connect/:integration",
    validateSocialConnectBody,
    integrationController.connectSocialMedia
);
integrationSessionRouter.post("/disable", validateIntegrationOrgAndIdBody, integrationController.disable);
integrationSessionRouter.post("/enable", validateIntegrationOrgAndIdBody, integrationController.enable);
integrationSessionRouter.delete("/", validateIntegrationOrgAndIdBody, integrationController.deleteChannel);

export { integrationSessionRouter };
