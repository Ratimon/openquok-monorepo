import type { NextFunction, Request, Response } from "express";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { RbacRepository } from "../../repositories/RbacRepository";
import type { UserRepository } from "../../repositories/UserRepository";
import { AuthError, TokenError } from "../../errors/AuthError";
import { logger } from "../../utils/Logger";
import { type AuthenticatedRequest, parseBearerToken } from "./types";

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
            const isPlatformAdmin = await rbacRepository.isPlatformAdmin(publicId);

            (req as AuthenticatedRequest).user = {
                id: authId,
                publicId,
                email: data.user.email ?? undefined,
                roles: rolesResult.roles,
                permissions: permissionsResult.permissions,
                isPlatformAdmin,
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
            const isPlatformAdmin = await rbacRepository.isPlatformAdmin(publicId);

            (req as AuthenticatedRequest).user = {
                id: authId,
                publicId,
                email: data.user.email ?? undefined,
                roles: rolesResult.roles,
                permissions: permissionsResult.permissions,
                isPlatformAdmin,
            };
            next();
        } catch {
            next();
        }
    };
}
