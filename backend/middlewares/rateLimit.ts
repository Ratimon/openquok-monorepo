import rateLimit, {
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
}

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
        return isWebhook || isBypass;
    },
} as RateLimitConfig);

export const authLimiter = createRateLimiter({
    ...(config.rateLimit as { auth?: RateLimitConfig }).auth,
    skip: shouldSkipRateLimit,
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

    app.use(`${apiPrefix}/auth`, authLimiter);
    logger.info({
        msg: "Applied authentication rate limiting",
        windowMs: authConfig?.windowMs,
        max: authConfig?.max,
    });
};
