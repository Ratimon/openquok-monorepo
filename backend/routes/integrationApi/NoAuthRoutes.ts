import { Router } from "express";
import { integrationController } from "../../controllers/index";
import {
    validateSaveProviderPageNoAuth,
    validateSocialConnectBody,
} from "../../data/schemas/integrationSchemas";

type IntegrationNoAuthRouter = ReturnType<typeof Router>;

const integrationNoAuthRouter: IntegrationNoAuthRouter = Router();

integrationNoAuthRouter.get("/", integrationController.getAllIntegrations);
integrationNoAuthRouter.post(
    "/social-connect/:integration",
    validateSocialConnectBody,
    integrationController.connectSocialMediaNoAuth
);
integrationNoAuthRouter.post(
    "/public/provider/:id/connect",
    validateSaveProviderPageNoAuth,
    integrationController.saveProviderPageNoAuth
);

export { integrationNoAuthRouter };
