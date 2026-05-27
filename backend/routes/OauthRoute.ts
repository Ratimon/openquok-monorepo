import { Router } from "express";
import { supabaseAnonClient } from "../connections/index";
import { requireFullAuth } from "../guards";
import { oauthController } from "../controllers/index.js";
import {
    validateOauthApproveBody,
    validateOauthAuthorizeQuery,
    validateOauthTokenBody,
} from "../data/schemas/oauthSchemas";

type OauthRouter = ReturnType<typeof Router>;

const oauthRouter: OauthRouter = Router();
const auth = requireFullAuth(supabaseAnonClient);

oauthRouter.get("/authorize", validateOauthAuthorizeQuery, oauthController.authorize);
oauthRouter.post("/authorize", auth, validateOauthApproveBody, oauthController.approve);
oauthRouter.post("/token", validateOauthTokenBody, oauthController.token);

export { oauthRouter };

