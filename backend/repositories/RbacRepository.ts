import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppRole, AppPermission } from "../data/types/rbacTypes";
import { DatabaseError } from "../errors/InfraError";

/**
 * RBAC Repository – app-level roles and permissions (distinct from workspace membership).
 * user_id everywhere is public.users.id.
 */
export class RbacRepository {
    static readonly TABLE_USER_ROLES = "user_roles";
    static readonly TABLE_ROLE_PERMISSIONS = "role_permissions";

    constructor(private readonly supabase: SupabaseClient) {}

    async getUserRoles(userId: string): Promise<{ roles: AppRole[] }> {
        const { data, error } = await this.supabase
            .from(RbacRepository.TABLE_USER_ROLES)
            .select("role")
            .eq("user_id", userId);

        if (error) {
            throw new DatabaseError("Error getting user roles", {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: RbacRepository.TABLE_USER_ROLES },
            });
        }
        const roles = (data ?? []).map((row) => row.role as AppRole);
        return { roles };
    }

    async getUserPermissions(userId: string): Promise<{ permissions: AppPermission[] }> {
        const { data, error } = await this.supabase.rpc("get_user_permissions", {
            user_uuid: userId,
        });

        if (error) {
            throw new DatabaseError("Error getting user permissions", {
                cause: error as unknown as Error,
                operation: "rpc",
                resource: { type: "function", name: "get_user_permissions" },
            });
        }
        const permissions = (data ?? []).map((row: { permission: string }) => row.permission as AppPermission);
        return { permissions };
    }

    async hasRole(userId: string, role: AppRole): Promise<boolean> {
        const { data, error } = await this.supabase.rpc("has_role", {
            user_uuid: userId,
            check_role: role,
        });

        if (error) {
            throw new DatabaseError("Error checking user role", {
                cause: error as unknown as Error,
                operation: "rpc",
                resource: { type: "function", name: "has_role" },
            });
        }
        return data === true;
    }

    async assignRole(
        userId: string,
        role: AppRole,
        assignedBy: string
    ): Promise<{ roleId: string | null }> {
        const { data, error } = await this.supabase.rpc("assign_user_role", {
            target_user_id: userId,
            role_to_assign: role,
            assigned_by_user_id: assignedBy,
        });

        if (error) {
            throw new DatabaseError(`Error assigning role: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "rpc",
                resource: { type: "function", name: "assign_user_role" },
            });
        }

        if (data != null) return { roleId: data as string };

        const { data: existing } = await this.supabase
            .from(RbacRepository.TABLE_USER_ROLES)
            .select("id")
            .eq("user_id", userId)
            .eq("role", role)
            .single();

        return { roleId: existing?.id ?? null };
    }

    async removeRole(userId: string, role: AppRole, removedBy: string): Promise<boolean> {
        const { data, error } = await this.supabase.rpc("remove_user_role", {
            target_user_id: userId,
            role_to_remove: role,
            removed_by_user_id: removedBy,
        });

        if (error) {
            throw new DatabaseError("Error removing user role", {
                cause: error as unknown as Error,
                operation: "rpc",
                resource: { type: "function", name: "remove_user_role" },
            });
        }
        return data === true;
    }

    async getUsersByRole(role: AppRole): Promise<{ userIds: string[] }> {
        const { data, error } = await this.supabase
            .from(RbacRepository.TABLE_USER_ROLES)
            .select("user_id")
            .eq("role", role);

        if (error) {
            throw new DatabaseError("Error getting users by role", {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: RbacRepository.TABLE_USER_ROLES },
            });
        }
        const userIds = (data ?? []).map((row) => row.user_id as string);
        return { userIds };
    }

    async getRolePermissions(role?: AppRole): Promise<{
        permissions: Array<{ role: AppRole; permission: AppPermission }>;
    }> {
        let query = this.supabase
            .from(RbacRepository.TABLE_ROLE_PERMISSIONS)
            .select("role, permission");
        if (role) query = query.eq("role", role);
        const { data, error } = await query;

        if (error) {
            throw new DatabaseError("Error getting role permissions", {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: RbacRepository.TABLE_ROLE_PERMISSIONS },
            });
        }
        const permissions = (data ?? []).map((row) => ({
            role: row.role as AppRole,
            permission: row.permission as AppPermission,
        }));
        return { permissions };
    }

    async getPermissionsForRole(role: AppRole): Promise<{ permissions: AppPermission[] }> {
        const { data, error } = await this.supabase
            .from(RbacRepository.TABLE_ROLE_PERMISSIONS)
            .select("permission")
            .eq("role", role);

        if (error) {
            throw new DatabaseError("Error getting permissions for role", {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: RbacRepository.TABLE_ROLE_PERMISSIONS },
            });
        }
        const permissions = (data ?? []).map((row) => row.permission as AppPermission);
        return { permissions };
    }

    /** Check if user (public.users.id) is super admin. */
    async isSuperAdmin(publicUserId: string): Promise<boolean> {
        const { data, error } = await this.supabase
            .from("users")
            .select("is_super_admin")
            .eq("id", publicUserId)
            .single();

        if (error) {
            throw new DatabaseError("Error checking super admin", {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: "users" },
            });
        }
        return data?.is_super_admin === true;
    }

    async assignPermissionToRole(role: AppRole, permission: AppPermission): Promise<{ id: string } | null> {
        const { data, error } = await this.supabase
            .from(RbacRepository.TABLE_ROLE_PERMISSIONS)
            .insert({ role, permission })
            .select("id")
            .single();

        if (error) {
            if (error.code === "23505") return null; // unique violation, already exists
            throw new DatabaseError("Error assigning permission to role", {
                cause: error as unknown as Error,
                operation: "insert",
                resource: { type: "table", name: RbacRepository.TABLE_ROLE_PERMISSIONS },
            });
        }
        return data ? { id: data.id as string } : null;
    }

    async removePermissionFromRole(role: AppRole, permission: AppPermission): Promise<boolean> {
        const { error } = await this.supabase
            .from(RbacRepository.TABLE_ROLE_PERMISSIONS)
            .delete()
            .eq("role", role)
            .eq("permission", permission);

        if (error) {
            throw new DatabaseError("Error removing permission from role", {
                cause: error as unknown as Error,
                operation: "delete",
                resource: { type: "table", name: RbacRepository.TABLE_ROLE_PERMISSIONS },
            });
        }
        return true;
    }
}
