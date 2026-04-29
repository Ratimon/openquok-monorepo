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

type IntegrationSessionRouter = ReturnType<typeof Router>;

const integrationSessionRouter: IntegrationSessionRouter = Router();
const auth = requireFullAuth(supabaseAnonClient);

integrationSessionRouter.use(auth);
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
