import { createHash } from "node:crypto";

import rateLimit, {
    ipKeyGenerator,
    type Options as RateLimitOptions,
    type RateLimitRequestHandler,
} from "express-rate-limit";
import type { Request, Response } from "express";
import type { Express } from "express";

import { config } from "../config/GlobalConfig";
import { logger } from "../utils/Logger";

interface RateLimitConfig {
    windowMs: number;
    max: number;
    standardHeaders: boolean;
    legacyHeaders: boolean;
    message?: string;
    skip?: boolean | ((req: Request) => boolean);
    keyGenerator?: (req: Request) => string;
}

const PROGRAMMATIC_TOKEN_PREFIX = "opo_";

const hashRateLimitKey = (value: string): string =>
    createHash("sha256").update(value).digest("hex").slice(0, 32);

const extractBearerToken = (req: Request): string | null => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return null;
    const token = authHeader.slice("Bearer ".length).trim();
    return token.length > 0 ? token : null;
};

const clientIpKey = (req: Request): string => ipKeyGenerator(req.ip ?? "unknown");

const publicApiKeyGenerator = (req: Request): string => {
    const token = extractBearerToken(req);
    if (token?.startsWith(PROGRAMMATIC_TOKEN_PREFIX)) {
        return `public-api:token:${hashRateLimitKey(token)}`;
    }
    return `public-api:ip:${clientIpKey(req)}`;
};

const uploadKeyGenerator = (req: Request): string => {
    const token = extractBearerToken(req);
    if (token?.startsWith(PROGRAMMATIC_TOKEN_PREFIX)) {
        return `upload:token:${hashRateLimitKey(token)}`;
    }
    return `upload:ip:${clientIpKey(req)}`;
};

const isPublicApiPath = (path: string): boolean =>
    path === "/public" || path.startsWith("/public/");

const isUploadPath = (path: string): boolean =>
    path === "/public/upload" ||
    path === "/public/upload-from-url" ||
    path === "/media/upload" ||
    path === "/media/upload-server" ||
    path === "/media/upload-simple";

const isIntegrationConnectPath = (path: string): boolean =>
    /^\/integrations\/social-connect\/[^/]+$/.test(path) ||
    /^\/integrations\/public\/provider\/[^/]+\/connect$/.test(path);

const isPublicWritePath = (path: string, method: string): boolean => {
    if (method === "POST" && path === "/company/t") return true;
    if (method === "PUT" && /^\/blog-system\/posts\/[^/]+\/activity$/.test(path)) return true;
    if (method === "PUT" && /^\/listings\/stats\/(views|likes|clicks)\/[^/]+$/.test(path)) {
        return true;
    }
    return false;
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

    return rateLimit({
        handler: (req: Request, res: Response, _next, options: RateLimitOptions) => {
            logger.warn({
                msg: "Rate limit reached",
                path: req.path,
                method: req.method,
                ip: req.ip,
                limit: options.max,
                windowMs: options.windowMs,
            });
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
        keyGenerator: options.keyGenerator,
    });
};

const shouldSkipRateLimit = (): boolean => {
    const rateLimitConfig = config.rateLimit as { enabled?: boolean };
    return !rateLimitConfig?.enabled;
};

export const globalLimiter = createRateLimiter({
    ...(config.rateLimit as { global?: RateLimitConfig }).global,
    skip: (req: Request) => {
        if (shouldSkipRateLimit()) return true;
        const path = req.path;
        const originalUrl = req.originalUrl || req.url;
        const isWebhook =
            path.includes("/webhooks/") ||
            originalUrl.includes("/webhooks/");
        const isBypass =
            path === "/health" ||
            path.startsWith("/health") ||
            path === "/sitemap.xml" ||
            path.startsWith("/sitemap.xml");
        const isDedicatedLimiter =
            isPublicApiPath(path) ||
            isUploadPath(path) ||
            (req.method === "POST" && path === "/feedback") ||
            (req.method === "POST" && path === "/oauth/token") ||
            (req.method === "POST" && isIntegrationConnectPath(path)) ||
            isPublicWritePath(path, req.method);
        return isWebhook || isBypass || isDedicatedLimiter;
    },
} as RateLimitConfig);

export const authLimiter = createRateLimiter({
    ...(config.rateLimit as { auth?: RateLimitConfig }).auth,
    skip: (req: Request) => {
        if (shouldSkipRateLimit()) return true;
        // OAuth endpoints have their own stricter limiter to reduce abuse of external auth flows.
        // Avoid double-counting by skipping them here.
        return req.path.startsWith("/oauth/");
    },
} as RateLimitConfig);

export const oauthLimiter = createRateLimiter({
    // Stricter defaults for OAuth routes (start + callback). Can be overridden by config.rateLimit.oauth.
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    ...(config.rateLimit as { oauth?: RateLimitConfig }).oauth,
    skip: shouldSkipRateLimit,
} as RateLimitConfig);

export const publicApiLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    ...(config.rateLimit as { publicApi?: RateLimitConfig }).publicApi,
    keyGenerator: publicApiKeyGenerator,
    skip: shouldSkipRateLimit,
} as RateLimitConfig);

export const uploadLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    ...(config.rateLimit as { upload?: RateLimitConfig }).upload,
    keyGenerator: uploadKeyGenerator,
    skip: (req: Request) => shouldSkipRateLimit() || !isUploadPath(req.path),
} as RateLimitConfig);

export const feedbackLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    ...(config.rateLimit as { feedback?: RateLimitConfig }).feedback,
    skip: (req: Request) => shouldSkipRateLimit() || req.method !== "POST",
} as RateLimitConfig);

export const integrationConnectLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    ...(config.rateLimit as { integrationConnect?: RateLimitConfig }).integrationConnect,
    skip: (req: Request) =>
        shouldSkipRateLimit() ||
        req.method !== "POST" ||
        !isIntegrationConnectPath(req.path),
} as RateLimitConfig);

export const oauthTokenLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    ...(config.rateLimit as { oauthToken?: RateLimitConfig }).oauthToken,
    skip: (req: Request) => shouldSkipRateLimit() || req.method !== "POST" || req.path !== "/token",
} as RateLimitConfig);

export const publicWriteLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    ...(config.rateLimit as { publicWrite?: RateLimitConfig }).publicWrite,
    skip: (req: Request) => shouldSkipRateLimit() || !isPublicWritePath(req.path, req.method),
} as RateLimitConfig);

export const applyRateLimiting = (app: Express): void => {
    const rateLimitConfig = config.rateLimit as { enabled?: boolean };
    if (!rateLimitConfig?.enabled) {
        logger.info({ msg: "API rate limiting is disabled" });
        return;
    }

    const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
    const globalConfig = (config.rateLimit as { global?: RateLimitConfig }).global;
    const authConfig = (config.rateLimit as { auth?: RateLimitConfig }).auth;

    app.use(apiPrefix, globalLimiter);
    logger.info({
        msg: "Applied global rate limiting to all API routes",
        windowMs: globalConfig?.windowMs,
        max: globalConfig?.max,
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
