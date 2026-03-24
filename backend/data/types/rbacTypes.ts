/**
 * App-level RBAC (distinct from workspace membership role).
 */

export type AppPermission = "users.manage_roles";

export type AppRole = "editor" | "support" | "admin";

export const VALID_PERMISSIONS: AppPermission[] = ["users.manage_roles"];

export const VALID_ROLES: AppRole[] = ["editor", "support", "admin"];
