import { Router } from "express";
import { supabaseAnonClient } from "../connections/index";
import { requireFullAuth } from "../middlewares/authenticateUser";
import { oauthAppController } from "../controllers/index.js";
import {
    validateCreateOauthApp,
    validateDeleteOauthApp,
    validateOauthAppOrganizationQuery,
    validateRotateOauthSecret,
    validateUpdateOauthApp,
} from "../data/schemas/oauthAppSchemas";

type OauthAppRouter = ReturnType<typeof Router>;

const oauthAppRouter: OauthAppRouter = Router();
const auth = requireFullAuth(supabaseAnonClient);

oauthAppRouter.get("/", auth, validateOauthAppOrganizationQuery, oauthAppController.listApps);
oauthAppRouter.get("/app", auth, validateOauthAppOrganizationQuery, oauthAppController.getApp);
oauthAppRouter.post("/", auth, validateCreateOauthApp, oauthAppController.createApp);
oauthAppRouter.put("/", auth, validateUpdateOauthApp, oauthAppController.updateApp);
oauthAppRouter.delete("/:oauthAppId", auth, validateDeleteOauthApp, oauthAppController.deleteApp);
oauthAppRouter.post("/rotate-secret", auth, validateRotateOauthSecret, oauthAppController.rotateSecret);

export { oauthAppRouter };

