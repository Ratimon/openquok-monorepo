import { Router } from "express";
import { supabaseAnonClient } from "../connections/index";
import { requireFullAuth } from "../middlewares/authenticateUser";
import { oauthController } from "../controllers/index.js";
import {
    validateOauthApproveBody,
    validateOauthAuthorizeQuery,
    validateOauthRevokeBody,
    validateOauthTokenBody,
} from "../data/schemas/oauthSchemas";

type OauthRouter = ReturnType<typeof Router>;

const oauthRouter: OauthRouter = Router();
const auth = requireFullAuth(supabaseAnonClient);

oauthRouter.get("/authorize", validateOauthAuthorizeQuery, oauthController.authorize);
oauthRouter.post("/authorize", auth, validateOauthApproveBody, oauthController.approve);
oauthRouter.post("/token", validateOauthTokenBody, oauthController.token);
oauthRouter.get("/approved-apps", auth, oauthController.approvedApps);
oauthRouter.post("/revoke", auth, validateOauthRevokeBody, oauthController.revoke);

export { oauthRouter };

