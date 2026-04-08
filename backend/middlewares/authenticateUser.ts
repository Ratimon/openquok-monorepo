import type { Request, Response, NextFunction } from "express";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppRole, AppPermission } from "../data/types/rbacTypes";
import type { UserRepository } from "../repositories/UserRepository";
import type { RbacRepository } from "../repositories/RbacRepository";

import { AuthError, TokenError, PermissionError } from "../errors/AuthError";
import { logger } from "../utils/Logger";

/** Auth id = Supabase auth.uid(); publicId = public.users.id (used in RBAC). */
export interface AuthenticatedRequest extends Request {
    user?: {
        /** Supabase auth user id (auth.uid()). */
        id: string;
        /** Public users.id; set when roles are loaded. */
        publicId?: string;
        /** From JWT / auth.getUser(); use when body omits email (e.g. feedback). */
        email?: string;
        roles?: AppRole[];
        permissions?: AppPermission[];
        isSuperAdmin?: boolean;
    };
}

function parseBearerToken(req: Request): string {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new TokenError("No token provided or invalid format");
    }
    const token = authHeader.split(" ")[1];
    if (!token) throw new TokenError("No token provided");

    if (token.startsWith("{")) {
        let parsed: { value?: string };
        try {
            parsed = JSON.parse(token);
        } catch {
            throw new TokenError("Invalid token format");
        }
        if (!parsed?.value || typeof parsed.value !== "string") {
            throw new TokenError("Invalid token format");
        }
        return parsed.value;
    }
    return token.trim();
}

/** @param supabase Anon client (same project as user JWTs); not the service-role client. */
export function requireFullAuth(supabase: SupabaseClient) {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        try {
            const accessToken = parseBearerToken(req);
            if (!supabase) {
                logger.error({ msg: "Supabase client was not provided to requireFullAuth" });
                throw new AuthError("Authentication configuration error", 500);
            }

            const { data, error } = await supabase.auth.getUser(accessToken);
            if (error) {
                logger.debug({ msg: "Token verification failed", error: error.message });
                if (error.message?.includes("expired") || (error as { code?: string }).code === "PGRST301") {
                    throw new TokenError("Token expired", true);
                }
                throw new TokenError(`Invalid token: ${error.message}`);
            }
            if (!data?.user) {
                throw new TokenError("Invalid token: no user data returned");
            }

            (req as AuthenticatedRequest).user = {
                id: data.user.id,
                email: data.user.email ?? undefined,
            };
            next();
        } catch (err) {
            next(err);
        }
    };
}

/**
 * Full auth + load roles/permissions and public user id.
 * Use this when routes need role or permission checks (e.g. requireEditor).
 */
/** @param supabase Anon client for `auth.getUser`; repositories use service role separately. */
export function requireFullAuthWithRoles(
    supabase: SupabaseClient,
    userRepository: UserRepository,
    rbacRepository: RbacRepository
) {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        try {
            const accessToken = parseBearerToken(req);
            if (!supabase) {
                logger.error({ msg: "Supabase client was not provided to requireFullAuthWithRoles" });
                throw new AuthError("Authentication configuration error", 500);
            }

            const { data, error } = await supabase.auth.getUser(accessToken);
            if (error) {
                logger.debug({ msg: "Token verification failed", error: error.message });
                if (error.message?.includes("expired") || (error as { code?: string }).code === "PGRST301") {
                    throw new TokenError("Token expired", true);
                }
                throw new TokenError(`Invalid token: ${error.message}`);
            }
            if (!data?.user) {
                throw new TokenError("Invalid token: no user data returned");
            }

            const authId = data.user.id;
            const { userId: publicId, error: resolveError } = await userRepository.findUserIdByAuthId(authId);
            if (resolveError || !publicId) {
                throw new TokenError("User profile not found");
            }

            const [rolesResult, permissionsResult] = await Promise.all([
                rbacRepository.getUserRoles(publicId),
                rbacRepository.getUserPermissions(publicId),
            ]);
            const isSuperAdmin = await rbacRepository.isSuperAdmin(publicId);

            (req as AuthenticatedRequest).user = {
                id: authId,
                publicId,
                email: data.user.email ?? undefined,
                roles: rolesResult.roles,
                permissions: permissionsResult.permissions,
                isSuperAdmin,
            };
            next();
        } catch (err) {
            next(err);
        }
    };
}

/**
 * Optional auth: if Bearer token is present, verify and load user + roles (same as requireFullAuthWithRoles).
 * If no token or token invalid/expired, continues without setting req.user (anonymous).
 * Use for endpoints that support both authenticated and anonymous calls (e.g. track blog activity).
 */
/** @param supabase Anon client for `auth.getUser`; repositories use service role separately. */
export function optionalAuthWithRoles(
    supabase: SupabaseClient,
    userRepository: UserRepository,
    rbacRepository: RbacRepository
) {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                next();
                return;
            }
            const token = authHeader.split(" ")[1]?.trim();
            if (!token) {
                next();
                return;
            }

            if (!supabase) {
                logger.error({ msg: "Supabase client was not provided to optionalAuthWithRoles" });
                next();
                return;
            }

            const { data, error } = await supabase.auth.getUser(token);
            if (error || !data?.user) {
                next();
                return;
            }

            const authId = data.user.id;
            const { userId: publicId, error: resolveError } = await userRepository.findUserIdByAuthId(authId);
            if (resolveError || !publicId) {
                next();
                return;
            }

            const [rolesResult, permissionsResult] = await Promise.all([
                rbacRepository.getUserRoles(publicId),
                rbacRepository.getUserPermissions(publicId),
            ]);
            const isSuperAdmin = await rbacRepository.isSuperAdmin(publicId);

            (req as AuthenticatedRequest).user = {
                id: authId,
                publicId,
                email: data.user.email ?? undefined,
                roles: rolesResult.roles,
                permissions: permissionsResult.permissions,
                isSuperAdmin,
            };
            next();
        } catch {
            next();
        }
    };
}

/** Require editor role or higher (editor, admin) or super admin. Use for blog management. */
export function requireEditor(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
    if (!req.user?.id) {
        next(new TokenError("Authentication required"));
        return;
    }
    const hasEditor = req.user.roles?.includes("editor");
    const hasAdmin = req.user.roles?.includes("admin");
    if (!req.user.isSuperAdmin && !hasAdmin && !hasEditor) {
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
    if (!req.user.isSuperAdmin && !hasAdmin && !hasSupport) {
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
    if (!req.user.isSuperAdmin && !hasAdmin) {
        next(new PermissionError("admin"));
        return;
    }
    next();
}

/** Require super admin (is_super_admin = true) only. */
export function requireSuperAdmin(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
    if (!req.user?.id) {
        next(new TokenError("Authentication required"));
        return;
    }
    if (!req.user.isSuperAdmin) {
        next(new PermissionError("super_admin"));
        return;
    }
    next();
}

/** Factory: require a specific role (or super admin). */
export function requireRole(role: AppRole) {
    return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
        if (!req.user?.id) {
            next(new TokenError("Authentication required"));
            return;
        }
        const hasRole = req.user.roles?.includes(role);
        if (!req.user.isSuperAdmin && !hasRole) {
            next(new PermissionError(role));
            return;
        }
        next();
    };
}

/** Factory: require a specific permission (super admin bypasses). */
export function requirePermission(permission: AppPermission) {
    return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
        if (!req.user?.id) {
            next(new TokenError("Authentication required"));
            return;
        }
        if (req.user.isSuperAdmin) {
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

/** Factory: require any of the given permissions (super admin bypasses). */
export function requireAnyPermission(permissions: AppPermission[]) {
    return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
        if (!req.user?.id) {
            next(new TokenError("Authentication required"));
            return;
        }
        if (req.user.isSuperAdmin) {
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
