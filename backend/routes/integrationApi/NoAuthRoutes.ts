import { Router } from "express";
import { integrationController } from "../../controllers/index";
import { optionalAuthWithRoles } from "../../middlewares/authenticateUser";
import { supabaseAnonClient } from "../../connections/index";
import { userRepository, rbacRepository } from "../../repositories/index";
import {
    validateSaveProviderPageNoAuth,
    validateSocialConnectBody,
} from "../../data/schemas/integrationSchemas";

type IntegrationNoAuthRouter = ReturnType<typeof Router>;

const integrationNoAuthRouter: IntegrationNoAuthRouter = Router();

const optionalAuth = optionalAuthWithRoles(supabaseAnonClient, userRepository, rbacRepository);

integrationNoAuthRouter.get("/", integrationController.getAllIntegrations);
integrationNoAuthRouter.post(
    "/social-connect/:integration",
    optionalAuth,
    validateSocialConnectBody,
    integrationController.connectSocialMediaNoAuth
);
integrationNoAuthRouter.post(
    "/public/provider/:id/connect",
    validateSaveProviderPageNoAuth,
    integrationController.saveProviderPageNoAuth
);

export { integrationNoAuthRouter };
