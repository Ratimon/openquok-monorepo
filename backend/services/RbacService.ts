import type { AppRole, AppPermission } from "../data/types/rbacTypes";
import { VALID_ROLES, VALID_PERMISSIONS } from "../data/types/rbacTypes";
import type { RbacRepository } from "../repositories/RbacRepository";
import type CacheService from "../connections/cache/CacheService";
import type CacheInvalidationService from "../connections/cache/CacheInvalidationService";
import { RoleValidationError } from "../errors/RoleError";
import { logger } from "../utils/Logger";

/** Domain-scoped cache key prefixes. */
const CACHE_KEYS = {
    RBAC_USER_ROLES: "rbac:user:roles",
    RBAC_PERMISSIONS_FOR_ROLE: "rbac:role:permissions",
    RBAC_ALL_ROLE_PERMISSIONS: "rbac:role-permissions:all",
    USER_LIST_FULL_WITH_ROLES: "user:list:full:with_roles",
};

const RBAC_CACHE_TTL_SEC = 300;

/**
 * App-level RBAC service. Admins cannot assign/remove admin role; only super admins can.
 */
export class RbacService {
    constructor(
        private readonly rbacRepository: RbacRepository,
        private readonly cache?: CacheService,
        private readonly cacheInvalidator?: CacheInvalidationService
    ) {}

    async assignRoleByAdmin(
        userId: string,
        role: AppRole,
        assignedBy: string
    ): Promise<{ roleId: string | null }> {
        if (role === "admin") {
            throw new RoleValidationError(
                "Admins cannot assign the admin role. Only super admins can assign admin roles."
            );
        }
        const result = await this.rbacRepository.assignRole(userId, role, assignedBy);
        if (result.roleId) {
            await this._invalidateRbacRelatedCaches();
        }
        return result;
    }

    async assignRoleBySuperAdmin(
        userId: string,
        role: AppRole,
        assignedBy: string
    ): Promise<{ roleId: string | null }> {
        const result = await this.rbacRepository.assignRole(userId, role, assignedBy);
        if (result.roleId) {
            await this._invalidateRbacRelatedCaches();
        }
        return result;
    }

    async removeRole(userId: string, role: AppRole, removedBy: string): Promise<boolean> {
        if (role === "admin") {
            const isSuperAdmin = await this.rbacRepository.isSuperAdmin(removedBy);
            if (!isSuperAdmin) {
                throw new RoleValidationError(
                    "Admins cannot remove the admin role. Only super admins can remove admin roles."
                );
            }
        }
        const result = await this.rbacRepository.removeRole(userId, role, removedBy);
        if (result) {
            await this._invalidateRbacRelatedCaches();
        }
        return result;
    }

    async getUserRoles(userId: string): Promise<{ roles: AppRole[] }> {
        const cacheKey = `${CACHE_KEYS.RBAC_USER_ROLES}:${userId}`;
        const factory = () => this.rbacRepository.getUserRoles(userId);
        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, RBAC_CACHE_TTL_SEC);
        }
        return factory();
    }

    async getUsersByRole(role: AppRole): Promise<{ userIds: string[] }> {
        return this.rbacRepository.getUsersByRole(role);
    }

    async getPermissionsForRole(role: AppRole): Promise<{ permissions: AppPermission[] }> {
        const validated = RbacService.validateRole(role);
        const cacheKey = `${CACHE_KEYS.RBAC_PERMISSIONS_FOR_ROLE}:${validated}`;
        const factory = () => this.rbacRepository.getPermissionsForRole(validated);
        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, RBAC_CACHE_TTL_SEC);
        }
        return factory();
    }

    async getAllRolePermissions(): Promise<{
        permissions: Array<{ role: AppRole; permission: AppPermission }>;
    }> {
        const cacheKey = CACHE_KEYS.RBAC_ALL_ROLE_PERMISSIONS;
        const factory = () => this.rbacRepository.getRolePermissions();
        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, RBAC_CACHE_TTL_SEC);
        }
        return factory();
    }

    async assignPermissionToRole(role: AppRole, permission: AppPermission): Promise<{ id: string | null }> {
        const validatedRole = RbacService.validateRole(role);
        const validatedPermission = RbacService.validatePermission(permission);
        const result = await this.rbacRepository.assignPermissionToRole(validatedRole, validatedPermission);
        if (result?.id) {
            await this._invalidateRbacRelatedCaches();
        }
        return { id: result?.id ?? null };
    }

    async removePermissionFromRole(role: AppRole, permission: AppPermission): Promise<void> {
        const validatedRole = RbacService.validateRole(role);
        const validatedPermission = RbacService.validatePermission(permission);
        await this.rbacRepository.removePermissionFromRole(validatedRole, validatedPermission);
        await this._invalidateRbacRelatedCaches();
    }

    /** Check if the given user (public.users.id) is a super admin. */
    async isSuperAdmin(publicUserId: string): Promise<boolean> {
        return this.rbacRepository.isSuperAdmin(publicUserId);
    }

    /**
     * Invalidate caches used by getUserRoles, getPermissionsForRole, getAllRolePermissions,
     * and UserService.getFullUsersWithRoles (USER_LIST_FULL_WITH_ROLES). Same keys as read.
     */
    private async _invalidateRbacRelatedCaches(): Promise<void> {
        if (!this.cacheInvalidator) return;
        try {
            await this.cacheInvalidator.invalidateKey(CACHE_KEYS.USER_LIST_FULL_WITH_ROLES);
            await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.RBAC_USER_ROLES}:*`);
            await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.RBAC_PERMISSIONS_FOR_ROLE}:*`);
            await this.cacheInvalidator.invalidateKey(CACHE_KEYS.RBAC_ALL_ROLE_PERMISSIONS);
            logger.debug({ msg: "Invalidated RBAC related caches" });
        } catch (error) {
            logger.error({ msg: "Error invalidating RBAC related caches", error: String(error) });
        }
    }

    static isAppRole(role: string): role is AppRole {
        return VALID_ROLES.includes(role as AppRole);
    }

    static validateRole(role: string): AppRole {
        if (!RbacService.isAppRole(role)) {
            throw new RoleValidationError(
                `Invalid role "${role}". Must be one of: ${VALID_ROLES.join(", ")}`
            );
        }
        return role as AppRole;
    }

    static isAppPermission(permission: string): permission is AppPermission {
        return VALID_PERMISSIONS.includes(permission as AppPermission);
    }

    static validatePermission(permission: string): AppPermission {
        if (!RbacService.isAppPermission(permission)) {
            throw new RoleValidationError(
                `Invalid permission "${permission}". Must be one of: ${VALID_PERMISSIONS.join(", ")}`
            );
        }
        return permission as AppPermission;
    }
}
