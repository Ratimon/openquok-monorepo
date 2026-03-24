import { Router } from "express";
import { configController, userController } from "../controllers/index";
import { requireFullAuthWithRoles, requireSuperAdmin } from "../middlewares/authenticateUser";
import { supabaseServiceClientConnection } from "../connections/index";
import { userRepository, rbacRepository } from "../repositories/index";
import configSchemas from "../data/schemas/configSchemas";

type AdminRouter = ReturnType<typeof Router>;

const adminRouter: AdminRouter = Router();
const authWithRoles = requireFullAuthWithRoles(
    supabaseServiceClientConnection,
    userRepository,
    rbacRepository
);

// --- Super-admin only: list users with roles (for role manager)
// REST: GET collection resource "admin's users" (with roles)
adminRouter.get("/users", authWithRoles, requireSuperAdmin, userController.getFullUsersWithRoles);

// --- Super-admin only: read/update module configs
adminRouter.get(
    "/config",
    authWithRoles,
    requireSuperAdmin,
    configSchemas.validateGetModuleConfigQuery,
    configController.getModuleConfig
);

adminRouter.put(
    "/config",
    authWithRoles,
    requireSuperAdmin,
    configSchemas.validateUpdateModuleConfigRequest,
    configController.updateModuleConfig
);

// Role assign/remove live under the user resource: POST/DELETE /api/v1/users/:userId/roles/:role (see UserRoute)

export { adminRouter };
