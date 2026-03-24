import { Router } from "express";
import { rbacController } from "../controllers/index";
import {
    requireFullAuthWithRoles,
    requireAdmin,
    requirePermission,
} from "../middlewares/authenticateUser";
import { supabaseServiceClientConnection } from "../connections/index";
import { userRepository, rbacRepository } from "../repositories/index";

type RbacRouter = ReturnType<typeof Router>;
const rbacRouter: RbacRouter = Router();
const authWithRoles = requireFullAuthWithRoles(
    supabaseServiceClientConnection,
    userRepository,
    rbacRepository
);
const requireManageRoles = requirePermission("users.manage_roles");

// Mounted at /api/v1/roles — REST resource: role
rbacRouter.get("/permissions", authWithRoles, requireAdmin, rbacController.getAllRolePermissions);
rbacRouter.get("/:role/permissions", authWithRoles, requireAdmin, rbacController.getPermissionsForRole);
rbacRouter.get("/:role/users", authWithRoles, requireAdmin, rbacController.getUsersByRole);
rbacRouter.post(
    "/:role/permissions/:permission",
    authWithRoles,
    requireManageRoles,
    rbacController.assignPermissionToRole
);
rbacRouter.delete(
    "/:role/permissions/:permission",
    authWithRoles,
    requireManageRoles,
    rbacController.removePermissionFromRole
);

export { rbacRouter };
