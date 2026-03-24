import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/authenticateUser";
import { RbacService } from "../services/RbacService";
import type { UserRepository } from "../repositories/UserRepository";
import { RoleValidationError } from "../errors/RoleError";
import { UserAuthorizationError } from "../errors/UserError";

export class RbacController {
    constructor(
        private readonly rbacService: RbacService,
        private readonly userRepository: UserRepository
    ) {}

    private async getPublicUserIdFromAuth(authUserId: string): Promise<string> {
        const { userId, error } = await this.userRepository.findUserIdByAuthId(authUserId);
        if (error || !userId) {
            throw new UserAuthorizationError("User profile not found");
        }
        return userId;
    }

    assignRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authUserId = req.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));

            const { userId, role } = req.params as { userId: string; role: string };
            if (!userId) return next(new UserAuthorizationError("Missing user ID"));
            if (!role) return next(new RoleValidationError("Missing role"));

            const assignedBy = await this.getPublicUserIdFromAuth(authUserId);
            const validatedRole = RbacService.validateRole(role.trim());

            const isSuperAdmin = await this.rbacService.isSuperAdmin(assignedBy);
            const result = isSuperAdmin
                ? await this.rbacService.assignRoleBySuperAdmin(userId, validatedRole, assignedBy)
                : await this.rbacService.assignRoleByAdmin(userId, validatedRole, assignedBy);

            res.status(200).json({
                success: true,
                message: `Role '${validatedRole}' assigned successfully`,
                data: result,
            });
        } catch (err) {
            next(err);
        }
    };

    removeRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authUserId = req.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));

            const { userId, role } = req.params as { userId: string; role: string };
            if (!userId) return next(new UserAuthorizationError("Missing user ID"));
            if (!role) return next(new RoleValidationError("Missing role"));

            const removedBy = await this.getPublicUserIdFromAuth(authUserId);
            const validatedRole = RbacService.validateRole(role.trim());
            await this.rbacService.removeRole(userId, validatedRole, removedBy);

            res.status(200).json({
                success: true,
                message: `Role '${validatedRole}' removed successfully`,
            });
        } catch (err) {
            next(err);
        }
    };

    getUserRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { userId } = req.params as { userId: string };
            if (!userId) return next(new UserAuthorizationError("Missing user ID"));

            const result = await this.rbacService.getUserRoles(userId);
            res.status(200).json({ success: true, data: result });
        } catch (err) {
            next(err);
        }
    };

    getUsersByRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { role } = req.params as { role: string };
            const validatedRole = RbacService.validateRole(role?.trim());
            const result = await this.rbacService.getUsersByRole(validatedRole);
            res.status(200).json({ success: true, data: result });
        } catch (err) {
            next(err);
        }
    };

    getPermissionsForRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { role } = req.params as { role: string };
            const validatedRole = RbacService.validateRole(role?.trim());
            const result = await this.rbacService.getPermissionsForRole(validatedRole);
            res.status(200).json({ success: true, data: result });
        } catch (err) {
            next(err);
        }
    };

    getAllRolePermissions = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.rbacService.getAllRolePermissions();
            res.status(200).json({ success: true, data: result });
        } catch (err) {
            next(err);
        }
    };

    assignPermissionToRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { role, permission } = req.params as { role: string; permission: string };
            const validatedRole = RbacService.validateRole(role?.trim());
            const validatedPermission = RbacService.validatePermission(permission?.trim());
            const result = await this.rbacService.assignPermissionToRole(validatedRole, validatedPermission);
            res.status(200).json({
                success: true,
                message: "Permission assigned to role",
                data: result,
            });
        } catch (err) {
            next(err);
        }
    };

    removePermissionFromRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { role, permission } = req.params as { role: string; permission: string };
            const validatedRole = RbacService.validateRole(role?.trim());
            const validatedPermission = RbacService.validatePermission(permission?.trim());
            await this.rbacService.removePermissionFromRole(validatedRole, validatedPermission);
            res.status(200).json({
                success: true,
                message: "Permission removed from role",
            });
        } catch (err) {
            next(err);
        }
    };
}
