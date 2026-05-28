import { Router } from "express";
import { supabaseAnonClient } from "../connections/index";
import { requireFullAuth, requirePlanCapabilityForOrganization } from "../guards";
import { oauthAppController } from "../controllers/index.js";
import {
    validateCreateOauthApp,
    validateDeleteOauthApp,
    validateOauthAppOrganizationQuery,
    validateRotateOauthSecret,
    validateUpdateOauthApp,
} from "../data/schemas/oauthAppSchemas";
import { SubscriptionSection } from "openquok-common";

type OauthAppRouter = ReturnType<typeof Router>;

const oauthAppRouter: OauthAppRouter = Router();
const auth = requireFullAuth(supabaseAnonClient);

oauthAppRouter.get("/", auth, validateOauthAppOrganizationQuery, oauthAppController.listApps);
oauthAppRouter.get("/app", auth, validateOauthAppOrganizationQuery, oauthAppController.getApp);
oauthAppRouter.post(
    "/",
    auth,
    validateCreateOauthApp,
    requirePlanCapabilityForOrganization(SubscriptionSection.PUBLIC_API, {
        resolveOrganizationId: (req) => (req.body as any)?.organizationId,
    }),
    oauthAppController.createApp
);
oauthAppRouter.put(
    "/",
    auth,
    validateUpdateOauthApp,
    requirePlanCapabilityForOrganization(SubscriptionSection.PUBLIC_API, {
        resolveOrganizationId: (req) => (req.body as any)?.organizationId,
    }),
    oauthAppController.updateApp
);
oauthAppRouter.delete(
    "/:oauthAppId",
    auth,
    validateDeleteOauthApp,
    requirePlanCapabilityForOrganization(SubscriptionSection.PUBLIC_API, {
        resolveOrganizationId: (req) => (req.query as any)?.organizationId,
    }),
    oauthAppController.deleteApp
);
oauthAppRouter.post(
    "/rotate-secret",
    auth,
    validateRotateOauthSecret,
    requirePlanCapabilityForOrganization(SubscriptionSection.PUBLIC_API, {
        resolveOrganizationId: (req) => (req.body as any)?.organizationId,
    }),
    oauthAppController.rotateSecret
);

export { oauthAppRouter };

