import { Router } from "express";
import { userController, rbacController } from "../controllers/index";
import {
    validateUpdateProfileRequest,
    validateUpdatePasswordMeRequest,
} from "../data/schemas/userSchemas";
import {
    requireFullAuthWithRoles,
    requireAdmin,
    requirePermission,
} from "../middlewares/authenticateUser";
import { supabaseAnonClient } from "../connections/index";
import { userRepository, rbacRepository } from "../repositories/index";

type UserRouter = ReturnType<typeof Router>;

const userRouter: UserRouter = Router();
const authWithRoles = requireFullAuthWithRoles(
    supabaseAnonClient,
    userRepository,
    rbacRepository
);
const requireManageRoles = requirePermission("users.manage_roles");

// --- Current user (must be before /:userId to avoid "me" being captured)
userRouter.get("/me", authWithRoles, userController.getProfile);
userRouter.patch("/me", authWithRoles, validateUpdateProfileRequest, userController.updateProfile);
userRouter.put("/me/password", authWithRoles, validateUpdatePasswordMeRequest, userController.updatePasswordMe);
userRouter.post("/me/request-change-password", authWithRoles, userController.requestChangePasswordEmail);

// --- User roles (REST: users/:userId/roles)
userRouter.get("/:userId/roles", authWithRoles, requireAdmin, rbacController.getUserRoles);
userRouter.post(
    "/:userId/roles/:role",
    authWithRoles,
    requireManageRoles,
    rbacController.assignRole
);
userRouter.delete(
    "/:userId/roles/:role",
    authWithRoles,
    requireManageRoles,
    rbacController.removeRole
);

export { userRouter };
