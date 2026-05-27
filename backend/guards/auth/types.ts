import type { Request } from "express";
import type { AppPermission, AppRole } from "../../data/types/rbacTypes";
import { TokenError } from "../../errors/AuthError";

/**
 * HttpOnly cookie name for Bull Board: path-scoped mirror of the access token
 * (set by `POST /admin/bull-board/session`; see `routes/BullBoardRoute.ts`).
 */
export const BULL_BOARD_ACCESS_COOKIE_NAME = "openquok_bullboard_jwt";

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
        isPlatformAdmin?: boolean;
    };
}

function normalizeAccessTokenString(raw: string): string {
    if (raw.startsWith("{")) {
        let parsed: { value?: string };
        try {
            parsed = JSON.parse(raw);
        } catch {
            throw new TokenError("Invalid token format");
        }
        if (!parsed?.value || typeof parsed.value !== "string") {
            throw new TokenError("Invalid token format");
        }
        return parsed.value;
    }
    return raw.trim();
}

/**
 * Resolves a Supabase access token from `Authorization: Bearer` or, for Bull Board only, a path-scoped
 * {@link BULL_BOARD_ACCESS_COOKIE_NAME} (set via `POST /admin/bull-board/session`). Subresources like
 * `<script src>` cannot send the Bearer header; the cookie is HttpOnly and limited by Path.
 */
export function parseBearerToken(req: Request): string {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        if (!token) throw new TokenError("No token provided");
        return normalizeAccessTokenString(token);
    }
    const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
    const fromCookie = cookies?.[BULL_BOARD_ACCESS_COOKIE_NAME];
    if (fromCookie && fromCookie.length > 0) {
        return normalizeAccessTokenString(fromCookie.trim());
    }
    throw new TokenError("No token provided or invalid format");
}
