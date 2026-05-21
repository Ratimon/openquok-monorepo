import type { CookieOptions, Request, Response } from "express";
import { config } from "../config/GlobalConfig";

/** Active workspace id (original: `showorg`). */
export const ACTIVE_ORGANIZATION_COOKIE = "showorg";

/** Pending workspace invite token for POST /users/join-org. */
export const JOIN_ORGANIZATION_COOKIE = "joinOrg";

const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
const JOIN_ORG_COOKIE_MS = 1000 * 60 * 60;

const serverConfig = config.server as {
    nodeEnv?: string;
    frontendDomainUrl?: string;
    backendDomainUrl?: string;
};

const authConfig = config.auth as { notSecured?: boolean };

function getSiteKey(hostname: string): string {
    const h = hostname.toLowerCase();
    const parts = h.split(".").filter(Boolean);
    if (parts.length <= 1) return h;

    const threeLabelPublicSuffixes = new Set([
        "vercel.app",
        "netlify.app",
        "onrender.com",
        "fly.dev",
        "pages.dev",
        "web.app",
        "firebaseapp.com",
        "github.io",
    ]);

    const last2 = parts.slice(-2).join(".");
    if (threeLabelPublicSuffixes.has(last2) && parts.length >= 3) {
        return parts.slice(-3).join(".");
    }
    return last2;
}

/** Registrable domain for cross-subdomain cookies in production (mirrors refresh-token cookie rules). */
export function getSessionCookieDomain(): string | undefined {
    if (serverConfig.nodeEnv !== "production") return undefined;
    try {
        const backUrl = new URL(serverConfig.backendDomainUrl ?? "");
        const hostname = backUrl.hostname;
        if (hostname === "localhost") return undefined;
        if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return undefined;
        const site = getSiteKey(hostname);
        if (hostname !== site && hostname.endsWith(`.${site}`)) return site;
        return undefined;
    } catch {
        return undefined;
    }
}

function getSameSiteValue(): "lax" | "none" {
    if (serverConfig.nodeEnv !== "production") return "lax";
    try {
        const frontUrl = new URL(serverConfig.frontendDomainUrl ?? "");
        const backUrl = new URL(serverConfig.backendDomainUrl ?? "");
        return getSiteKey(frontUrl.hostname) === getSiteKey(backUrl.hostname) ? "lax" : "none";
    } catch {
        return "none";
    }
}

export function sessionCookieAttributes(maxAgeMs: number): CookieOptions {
    const isProduction = serverConfig.nodeEnv === "production";
    const domain = getSessionCookieDomain();
    const secure = isProduction || Boolean(authConfig.notSecured);
    return {
        httpOnly: true,
        secure,
        sameSite: getSameSiteValue(),
        path: "/",
        maxAge: maxAgeMs,
        ...(domain ? { domain } : {}),
    };
}

function readHeaderValue(req: Request, name: string): string | undefined {
    if (!authConfig.notSecured) return undefined;
    const raw = req.headers[name];
    if (typeof raw === "string" && raw.trim()) return raw.trim();
    return undefined;
}

/**
 * Resolve active workspace id: query `organizationId` → cookie `showorg` → header `showorg` (dev only).
 */
export function readActiveOrganizationId(req: Request): string | undefined {
    const queryId = (req.query as { organizationId?: string }).organizationId?.trim();
    if (queryId) return queryId;

    const fromCookie = req.cookies?.[ACTIVE_ORGANIZATION_COOKIE];
    if (typeof fromCookie === "string" && fromCookie.trim()) {
        return fromCookie.trim();
    }

    return readHeaderValue(req, ACTIVE_ORGANIZATION_COOKIE);
}

/** Invite token for join-org: body `org` → cookie `joinOrg` → header `joinOrg` (dev only). */
export function readJoinOrganizationToken(req: Request, bodyOrg?: string): string | undefined {
    const fromBody = bodyOrg?.trim();
    if (fromBody) return fromBody;

    const fromCookie = req.cookies?.[JOIN_ORGANIZATION_COOKIE];
    if (typeof fromCookie === "string" && fromCookie.trim()) {
        return fromCookie.trim();
    }

    return readHeaderValue(req, JOIN_ORGANIZATION_COOKIE);
}

export function setActiveOrganizationCookie(res: Response, organizationId: string): void {
    res.cookie(ACTIVE_ORGANIZATION_COOKIE, organizationId, sessionCookieAttributes(ONE_YEAR_MS));
    if (authConfig.notSecured) {
        res.setHeader(ACTIVE_ORGANIZATION_COOKIE, organizationId);
    }
}

export function clearActiveOrganizationCookie(res: Response): void {
    const attrs = { ...sessionCookieAttributes(0), expires: new Date(0) };
    res.clearCookie(ACTIVE_ORGANIZATION_COOKIE, attrs);
    if (authConfig.notSecured) {
        res.removeHeader(ACTIVE_ORGANIZATION_COOKIE);
    }
}

export function setJoinOrganizationCookie(res: Response, token: string): void {
    res.cookie(JOIN_ORGANIZATION_COOKIE, token, sessionCookieAttributes(JOIN_ORG_COOKIE_MS));
    if (authConfig.notSecured) {
        res.setHeader(JOIN_ORGANIZATION_COOKIE, token);
    }
}

export function clearJoinOrganizationCookie(res: Response): void {
    const attrs = { ...sessionCookieAttributes(0), expires: new Date(0) };
    res.clearCookie(JOIN_ORGANIZATION_COOKIE, attrs);
    if (authConfig.notSecured) {
        res.removeHeader(JOIN_ORGANIZATION_COOKIE);
    }
}

export function clearWorkspaceSessionCookies(res: Response): void {
    clearActiveOrganizationCookie(res);
    clearJoinOrganizationCookie(res);
}
