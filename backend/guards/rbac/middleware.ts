/**
 * App-level RBAC Express middleware.
 * Requires `req.user.roles` / `req.user.permissions` populated by `requireFullAuthWithRoles`.
 */
import type { NextFunction, Response } from "express";
import type { AppPermission, AppRole } from "../../data/types/rbacTypes";
import { PermissionError, TokenError } from "../../errors/AuthError";
import { logger } from "../../utils/Logger";
import type { AuthenticatedRequest } from "../auth/types";

/** Require editor role or higher (editor, admin) or super admin. Use for blog management. */
export function requireEditor(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
    if (!req.user?.id) {
        next(new TokenError("Authentication required"));
        return;
    }
    const hasEditor = req.user.roles?.includes("editor");
    const hasAdmin = req.user.roles?.includes("admin");
    if (!req.user.isPlatformAdmin && !hasAdmin && !hasEditor) {
        next(new PermissionError("editor"));
        return;
    }
    next();
}

/** Require support role or higher (support, admin) or super admin. Use for feedback management. */
export function requireSupport(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
    if (!req.user?.id) {
        next(new TokenError("Authentication required"));
        return;
    }
    const hasSupport = req.user.roles?.includes("support");
    const hasAdmin = req.user.roles?.includes("admin");
    if (!req.user.isPlatformAdmin && !hasAdmin && !hasSupport) {
        next(new PermissionError("support"));
        return;
    }
    next();
}

/** Require admin role or super admin. */
export function requireAdmin(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
    if (!req.user?.id) {
        next(new TokenError("Authentication required"));
        return;
    }
    const hasAdmin = req.user.roles?.includes("admin");
    if (!req.user.isPlatformAdmin && !hasAdmin) {
        next(new PermissionError("admin"));
        return;
    }
    next();
}

/** Require platform admin (`users.is_super_admin = true`) only. */
export function requirePlatformAdmin(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
    if (!req.user?.id) {
        next(new TokenError("Authentication required"));
        return;
    }
    if (!req.user.isPlatformAdmin) {
        next(new PermissionError("super_admin"));
        return;
    }
    next();
}

/** Factory: require a specific app role (or platform admin). */
export function requireRole(role: AppRole) {
    return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
        if (!req.user?.id) {
            next(new TokenError("Authentication required"));
            return;
        }
        const hasRole = req.user.roles?.includes(role);
        if (!req.user.isPlatformAdmin && !hasRole) {
            next(new PermissionError(role));
            return;
        }
        next();
    };
}

/** Factory: require a specific permission (platform admin bypasses). */
export function requirePermission(permission: AppPermission) {
    return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
        if (!req.user?.id) {
            next(new TokenError("Authentication required"));
            return;
        }
        if (req.user.isPlatformAdmin) {
            next();
            return;
        }
        const hasPermission = req.user.permissions?.includes(permission);
        if (!hasPermission) {
            logger.debug({
                msg: "Permission denied",
                userId: req.user.publicId ?? req.user.id,
                permission,
            });
            next(new PermissionError(permission));
            return;
        }
        next();
    };
}

/** Factory: require any of the given permissions (platform admin bypasses). */
export function requireAnyPermission(permissions: AppPermission[]) {
    return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
        if (!req.user?.id) {
            next(new TokenError("Authentication required"));
            return;
        }
        if (req.user.isPlatformAdmin) {
            next();
            return;
        }
        const hasAny = permissions.some((p) => req.user?.permissions?.includes(p));
        if (!hasAny) {
            next(new PermissionError(permissions.join(" or ")));
            return;
        }
        next();
    };
}
