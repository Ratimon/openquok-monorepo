import { Router } from "express";

import { thirdPartyController } from "../controllers/index";
import { requireFullAuthWithRoles } from "../middlewares/authenticateUser";
import { supabaseAnonClient } from "../connections/index";
import { userRepository, rbacRepository } from "../repositories/index";
import { validateMediaOrganizationQuery } from "../data/schemas/mediaSchemas";

const authWithRoles = requireFullAuthWithRoles(supabaseAnonClient, userRepository, rbacRepository);

type ThirdPartyRouter = ReturnType<typeof Router>;
const thirdPartyRouter: ThirdPartyRouter = Router();

thirdPartyRouter.get("/for-media", authWithRoles, validateMediaOrganizationQuery, thirdPartyController.listForMedia);

export { thirdPartyRouter };
