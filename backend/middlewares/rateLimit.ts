import { createHash } from "node:crypto";

import rateLimit, {
    ipKeyGenerator,
    type Options as RateLimitOptions,
    type RateLimitRequestHandler,
} from "express-rate-limit";
import type { Request, Response } from "express";
import type { Express } from "express";

import { BULL_BOARD_ACCESS_COOKIE_NAME } from "../guards/auth/types";
import { config } from "../config/GlobalConfig";
import {
    hasDedicatedRateLimiter,
    isIntegrationConnectPath,
    isPublicReadGet,
    isPublicWriteRoute,
    isUploadPath,
    isWebhookPath,
} from "./publicRouteRegistry";
import { clientIpFromRequest, trustedClientIp } from "./trustedClientIp";
import { createRateLimitStore, isRateLimitRedisStoreActive } from "./rateLimitStore";
import { logger } from "../utils/Logger";

export { clientIpFromRequest, trustedClientIp };

interface RateLimitConfig {
    limiterName: string;
    windowMs: number;
    max: number;
    standardHeaders: boolean;
    legacyHeaders: boolean;
    message?: string;
    skip?: boolean | ((req: Request) => boolean);
    keyGenerator?: (req: Request) => string;
    storeName?: string;
}

export interface RateLimitExceededLogPayload {
    msg: string;
    limiter: string;
    path: string;
    method: string;
    trustedClientIp: string;
    userId: string | null;
    windowMs: number;
    max: number;
}

/** Structured fields for 429 observability (limiter name, client IP, user id when known). */
export const buildRateLimitExceededLog = (
    req: Request,
    limiterName: string,
    options: Pick<RateLimitOptions, "windowMs" | "max">
): RateLimitExceededLogPayload => ({
    msg: "Rate limit exceeded",
    limiter: limiterName,
    path: req.path,
    method: req.method,
    trustedClientIp: trustedClientIp(req),
    userId: tryResolveUserIdFromRequest(req),
    windowMs: options.windowMs as number,
    max: options.max as number,
});

const PROGRAMMATIC_TOKEN_PREFIX = "opo_";

const hashRateLimitKey = (value: string): string =>
    createHash("sha256").update(value).digest("hex").slice(0, 32);

/** Public cached CMS/catalog GETs used by website SSR (see `publicReadLimiter`). */
export const isPublicCachedGetRequest = (req: Request): boolean => isPublicReadGet(req, req.path);

const extractBearerToken = (req: Request): string | null => {
    const authHeader = req.headers?.authorization;
    if (!authHeader?.startsWith("Bearer ")) return null;
    const token = authHeader.slice("Bearer ".length).trim();
    return token.length > 0 ? token : null;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const normalizeAccessTokenForPeek = (raw: string): string | null => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("{")) {
        try {
            const parsed = JSON.parse(trimmed) as { value?: string };
            if (typeof parsed?.value === "string" && parsed.value.length > 0) {
                return parsed.value.trim();
            }
            return null;
        } catch {
            return null;
        }
    }
    return trimmed;
};

const extractAccessTokenForPeek = (req: Request): string | null => {
    const bearer = extractBearerToken(req);
    if (bearer) {
        const normalized = normalizeAccessTokenForPeek(bearer);
        if (normalized?.startsWith(PROGRAMMATIC_TOKEN_PREFIX)) return null;
        return normalized;
    }
    const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
    const fromCookie = cookies?.[BULL_BOARD_ACCESS_COOKIE_NAME];
    if (!fromCookie) return null;
    return normalizeAccessTokenForPeek(fromCookie);
};

const decodeJwtSubForRateLimitKey = (token: string): string | null => {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    try {
        const payloadJson = Buffer.from(parts[1], "base64url").toString("utf8");
        const payload = JSON.parse(payloadJson) as { sub?: unknown; exp?: unknown };
        const sub = payload.sub;
        if (typeof sub !== "string" || !UUID_RE.test(sub)) return null;
        const exp = payload.exp;
        if (typeof exp === "number" && exp * 1000 < Date.now()) return null;
        return sub;
    } catch {
        return null;
    }
};

/**
 * Lightweight JWT peek for rate-limit keying only (no signature verify, no DB).
 * Returns Supabase auth user id (`sub`) when a Bearer token or Bull Board cookie is present.
 */
export const tryResolveUserIdFromRequest = (req: Request): string | null => {
    const authenticatedUserId = (req as Request & { user?: { id?: string } }).user?.id;
    if (authenticatedUserId && UUID_RE.test(authenticatedUserId)) {
        return authenticatedUserId;
    }
    const token = extractAccessTokenForPeek(req);
    if (!token) return null;
    return decodeJwtSubForRateLimitKey(token);
};

const clientIpKey = (req: Request): string => ipKeyGenerator(clientIpFromRequest(req));

const sessionKeyGenerator = (req: Request): string => {
    const userId = tryResolveUserIdFromRequest(req);
    if (userId) return `session:${userId}`;
    return `ip:${clientIpKey(req)}`;
};

const publicApiKeyGenerator = (req: Request): string => {
    const token = extractBearerToken(req);
    if (token?.startsWith(PROGRAMMATIC_TOKEN_PREFIX)) {
        return `public-api:token:${hashRateLimitKey(token)}`;
    }
    return `public-api:ip:${clientIpKey(req)}`;
};

/** Bearer first; else first path segment after `/mcp/` (query stripped). */
const extractMcpToken = (req: Request): string | null => {
    const bearer = extractBearerToken(req);
    if (bearer) return bearer;

    const pathCandidates = [req.originalUrl ?? "", req.path ?? "", req.url ?? ""];
    for (const candidate of pathCandidates) {
        const pathOnly = candidate.split("?")[0] ?? "";
        const match = pathOnly.match(/\/mcp\/([^/]+)/);
        if (match?.[1]) {
            const token = decodeURIComponent(match[1]).trim();
            if (token.length > 0) return token;
        }
    }
    return null;
};

const mcpKeyGenerator = (req: Request): string => {
    const token = extractMcpToken(req);
    if (token) {
        return `mcp:token:${hashRateLimitKey(token)}`;
    }
    return `mcp:ip:${clientIpKey(req)}`;
};

const uploadKeyGenerator = (req: Request): string => {
    const token = extractBearerToken(req);
    if (token?.startsWith(PROGRAMMATIC_TOKEN_PREFIX)) {
        return `upload:token:${hashRateLimitKey(token)}`;
    }
    return `upload:ip:${clientIpKey(req)}`;
};

const createRateLimiter = (options: RateLimitConfig): RateLimitRequestHandler => {
    let skipFunction: ((req: Request) => boolean) | undefined;
    if (options.skip !== undefined) {
        if (typeof options.skip === "boolean") {
            skipFunction = () => options.skip as boolean;
        } else {
            skipFunction = options.skip;
        }
    }

    const store = options.storeName ? createRateLimitStore(options.storeName) : undefined;

    const limiterName = options.limiterName;

    return rateLimit({
        ...(store ? { store } : {}),
        handler: (req: Request, res: Response, _next, options: RateLimitOptions) => {
            logger.warn(buildRateLimitExceededLog(req, limiterName, options));
            res.status(429).json({
                status: "error",
                message: "Too many requests, please try again later.",
                retryAfter: Math.ceil((options.windowMs as number) / 1000),
            });
        },
        standardHeaders: options.standardHeaders,
        legacyHeaders: options.legacyHeaders,
        windowMs: options.windowMs,
        max: options.max,
        message: options.message,
        skip: skipFunction,
        keyGenerator: options.keyGenerator ?? clientIpKey,
    });
};

const shouldSkipRateLimit = (): boolean => {
    const rateLimitConfig = config.rateLimit as { enabled?: boolean };
    return !rateLimitConfig?.enabled;
};

const isHealthOrSitemapPath = (path: string): boolean =>
    path === "/health" ||
    path.startsWith("/health") ||
    path === "/sitemap.xml" ||
    path.startsWith("/sitemap.xml");

const shouldSkipInfrastructurePaths = (req: Request): boolean => {
    const path = req.path;
    const originalUrl = req.originalUrl || req.url;
    return isWebhookPath(path, originalUrl) || isHealthOrSitemapPath(path);
};

const buildRateLimiters = () => ({
    publicReadLimiter: createRateLimiter({
        limiterName: "publicRead",
        storeName: "public-read",
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 600,
        standardHeaders: true,
        legacyHeaders: false,
        ...(config.rateLimit as { publicRead?: RateLimitConfig }).publicRead,
        skip: (req: Request) => {
            if (shouldSkipRateLimit()) return true;
            if (shouldSkipInfrastructurePaths(req)) return true;
            if (hasDedicatedRateLimiter(req, req.path)) return true;
            return !isPublicReadGet(req, req.path);
        },
    } as RateLimitConfig),
    sessionLimiter: createRateLimiter({
        limiterName: "session",
        storeName: "session",
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 2000,
        standardHeaders: true,
        legacyHeaders: false,
        ...(config.rateLimit as { session?: RateLimitConfig }).session,
        keyGenerator: sessionKeyGenerator,
        skip: (req: Request) => {
            if (shouldSkipRateLimit()) return true;
            if (shouldSkipInfrastructurePaths(req)) return true;
            return !tryResolveUserIdFromRequest(req);
        },
    } as RateLimitConfig),
    globalLimiter: createRateLimiter({
        limiterName: "global",
        storeName: "global",
        ...(config.rateLimit as { global?: RateLimitConfig }).global,
        skip: (req: Request) => {
            if (shouldSkipRateLimit()) return true;
            if (shouldSkipInfrastructurePaths(req)) return true;
            if (tryResolveUserIdFromRequest(req)) return true;
            if (isPublicReadGet(req, req.path)) return true;
            return hasDedicatedRateLimiter(req, req.path);
        },
    } as RateLimitConfig),
    authLimiter: createRateLimiter({
        limiterName: "auth",
        storeName: "auth",
        ...(config.rateLimit as { auth?: RateLimitConfig }).auth,
        skip: (req: Request) => {
            if (shouldSkipRateLimit()) return true;
            // OAuth endpoints have their own stricter limiter to reduce abuse of external auth flows.
            // Avoid double-counting by skipping them here.
            return req.path.startsWith("/oauth/");
        },
    } as RateLimitConfig),
    oauthLimiter: createRateLimiter({
        limiterName: "oauth",
        storeName: "oauth",
        // Stricter defaults for OAuth routes (start + callback). Can be overridden by config.rateLimit.oauth.
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 20,
        standardHeaders: true,
        legacyHeaders: false,
        ...(config.rateLimit as { oauth?: RateLimitConfig }).oauth,
        skip: shouldSkipRateLimit,
    } as RateLimitConfig),
    publicApiLimiter: createRateLimiter({
        limiterName: "publicApi",
        storeName: "public-api",
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 30,
        standardHeaders: true,
        legacyHeaders: false,
        ...(config.rateLimit as { publicApi?: RateLimitConfig }).publicApi,
        keyGenerator: publicApiKeyGenerator,
        skip: shouldSkipRateLimit,
    } as RateLimitConfig),
    mcpLimiter: createRateLimiter({
        limiterName: "mcp",
        storeName: "mcp",
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 120,
        standardHeaders: true,
        legacyHeaders: false,
        ...(config.rateLimit as { mcp?: RateLimitConfig }).mcp,
        keyGenerator: mcpKeyGenerator,
        skip: (req: Request) => shouldSkipRateLimit() || req.method === "OPTIONS",
    } as RateLimitConfig),
    uploadLimiter: createRateLimiter({
        limiterName: "upload",
        storeName: "upload",
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 20,
        standardHeaders: true,
        legacyHeaders: false,
        ...(config.rateLimit as { upload?: RateLimitConfig }).upload,
        keyGenerator: uploadKeyGenerator,
        skip: (req: Request) => shouldSkipRateLimit() || !isUploadPath(req.path),
    } as RateLimitConfig),
    feedbackLimiter: createRateLimiter({
        limiterName: "feedback",
        storeName: "feedback",
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 10,
        standardHeaders: true,
        legacyHeaders: false,
        ...(config.rateLimit as { feedback?: RateLimitConfig }).feedback,
        skip: (req: Request) => shouldSkipRateLimit() || req.method !== "POST",
    } as RateLimitConfig),
    integrationConnectLimiter: createRateLimiter({
        limiterName: "integrationConnect",
        storeName: "integration-connect",
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 30,
        standardHeaders: true,
        legacyHeaders: false,
        ...(config.rateLimit as { integrationConnect?: RateLimitConfig }).integrationConnect,
        skip: (req: Request) =>
            shouldSkipRateLimit() ||
            req.method !== "POST" ||
            !isIntegrationConnectPath(req.path),
    } as RateLimitConfig),
    oauthTokenLimiter: createRateLimiter({
        limiterName: "oauthToken",
        storeName: "oauth-token",
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 30,
        standardHeaders: true,
        legacyHeaders: false,
        ...(config.rateLimit as { oauthToken?: RateLimitConfig }).oauthToken,
        skip: (req: Request) => shouldSkipRateLimit() || req.method !== "POST" || req.path !== "/token",
    } as RateLimitConfig),
    publicWriteLimiter: createRateLimiter({
        limiterName: "publicWrite",
        storeName: "public-write",
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 60,
        standardHeaders: true,
        legacyHeaders: false,
        ...(config.rateLimit as { publicWrite?: RateLimitConfig }).publicWrite,
        skip: (req: Request) => shouldSkipRateLimit() || !isPublicWriteRoute(req, req.path),
    } as RateLimitConfig),
});

export const applyRateLimiting = (app: Express): void => {
    const rateLimitConfig = config.rateLimit as { enabled?: boolean };
    if (!rateLimitConfig?.enabled) {
        logger.info({ msg: "API rate limiting is disabled" });
        return;
    }

    const {
        publicReadLimiter,
        sessionLimiter,
        globalLimiter,
        authLimiter,
        oauthLimiter,
        publicApiLimiter,
        mcpLimiter,
        uploadLimiter,
        feedbackLimiter,
        integrationConnectLimiter,
        oauthTokenLimiter,
        publicWriteLimiter,
    } = buildRateLimiters();

    const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
    const publicReadConfig = (config.rateLimit as { publicRead?: RateLimitConfig }).publicRead;
    const sessionConfig = (config.rateLimit as { session?: RateLimitConfig }).session;
    const globalConfig = (config.rateLimit as { global?: RateLimitConfig }).global;
    const authConfig = (config.rateLimit as { auth?: RateLimitConfig }).auth;

    app.use(apiPrefix, publicReadLimiter);
    logger.info({
        msg: "Applied public read rate limiting to CMS/catalog GET routes",
        windowMs: publicReadConfig?.windowMs ?? 60 * 60 * 1000,
        max: publicReadConfig?.max ?? 600,
        key: "trusted client IP",
        store: isRateLimitRedisStoreActive() ? "redis" : "memory",
    });

    app.use(apiPrefix, sessionLimiter);
    logger.info({
        msg: "Applied session rate limiting for authenticated API traffic",
        windowMs: sessionConfig?.windowMs ?? 60 * 60 * 1000,
        max: sessionConfig?.max ?? 2000,
        key: "JWT sub (peek) or req.user.id",
    });

    app.use(apiPrefix, globalLimiter);
    logger.info({
        msg: "Applied global rate limiting for anonymous non-public-read API routes",
        windowMs: globalConfig?.windowMs,
        max: globalConfig?.max,
        store: isRateLimitRedisStoreActive() ? "redis" : "memory",
    });

    const oauthConfig = (config.rateLimit as { oauth?: RateLimitConfig }).oauth;
    app.use(`${apiPrefix}/auth/oauth`, oauthLimiter);

    logger.info({
        msg: "Applied OAuth rate limiting",
        windowMs: oauthConfig?.windowMs ?? 5 * 60 * 1000,
        max: oauthConfig?.max ?? 20,
    });

    app.use(`${apiPrefix}/auth`, authLimiter);
    logger.info({
        msg: "Applied authentication rate limiting",
        windowMs: authConfig?.windowMs,
        max: authConfig?.max,
    });

    const publicApiConfig = (config.rateLimit as { publicApi?: RateLimitConfig }).publicApi;
    app.use(`${apiPrefix}/public`, publicApiLimiter);
    logger.info({
        msg: "Applied public API rate limiting",
        windowMs: publicApiConfig?.windowMs ?? 60 * 60 * 1000,
        max: publicApiConfig?.max ?? 30,
        key: "programmatic token (opo_) or IP for anonymous routes",
    });

    const mcpConfig = (config.rateLimit as { mcp?: RateLimitConfig }).mcp;
    app.use("/mcp", mcpLimiter);
    logger.info({
        msg: "Applied MCP rate limiting",
        windowMs: mcpConfig?.windowMs ?? 60 * 60 * 1000,
        max: mcpConfig?.max ?? 120,
        key: "Bearer or path token, else IP",
    });

    const uploadConfig = (config.rateLimit as { upload?: RateLimitConfig }).upload;
    app.use(apiPrefix, uploadLimiter);
    logger.info({
        msg: "Applied upload rate limiting",
        windowMs: uploadConfig?.windowMs ?? 60 * 60 * 1000,
        max: uploadConfig?.max ?? 20,
    });

    const feedbackConfig = (config.rateLimit as { feedback?: RateLimitConfig }).feedback;
    app.use(`${apiPrefix}/feedback`, feedbackLimiter);
    logger.info({
        msg: "Applied feedback rate limiting",
        windowMs: feedbackConfig?.windowMs ?? 60 * 60 * 1000,
        max: feedbackConfig?.max ?? 10,
    });

    const integrationConnectConfig = (config.rateLimit as { integrationConnect?: RateLimitConfig })
        .integrationConnect;
    app.use(`${apiPrefix}/integrations`, integrationConnectLimiter);
    logger.info({
        msg: "Applied integration connect rate limiting",
        windowMs: integrationConnectConfig?.windowMs ?? 15 * 60 * 1000,
        max: integrationConnectConfig?.max ?? 30,
    });

    const oauthTokenConfig = (config.rateLimit as { oauthToken?: RateLimitConfig }).oauthToken;
    app.use(`${apiPrefix}/oauth`, oauthTokenLimiter);
    logger.info({
        msg: "Applied OAuth token exchange rate limiting",
        windowMs: oauthTokenConfig?.windowMs ?? 15 * 60 * 1000,
        max: oauthTokenConfig?.max ?? 30,
    });

    const publicWriteConfig = (config.rateLimit as { publicWrite?: RateLimitConfig }).publicWrite;
    app.use(apiPrefix, publicWriteLimiter);
    logger.info({
        msg: "Applied public write rate limiting",
        windowMs: publicWriteConfig?.windowMs ?? 60 * 60 * 1000,
        max: publicWriteConfig?.max ?? 60,
    });
};
