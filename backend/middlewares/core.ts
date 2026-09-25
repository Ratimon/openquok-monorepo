import type { ConfigObject } from "../config/GlobalConfig";
import type { Express } from "express";
import type { Request, Response, NextFunction } from "express";
import type { SupabaseClient } from "@supabase/supabase-js";
import express from "express";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";

import { requireFullAuth } from "../guards";
import {
    BYPASS_PATHS,
    isAuthExemptRoute,
    normalizeApiRoutePath,
} from "../middlewares/publicRouteRegistry";
import { applyPublicCmsCacheHeaders } from "../middlewares/publicCmsCacheHeaders";
import { applyMaintenanceMode } from "../middlewares/maintenanceMode";
import { applyRateLimiting } from "../middlewares/rateLimit";
import { trialBrowserSignalMiddleware } from "../middlewares/trialBrowserSignalMiddleware";
import { logger } from "../utils/Logger";

interface RequestWithId extends Request {
    id?: string;
}

function configureCoreMiddleware(app: Express, config: ConfigObject, supabase: SupabaseClient) {
    logger.info({ msg: "[Setup] Configuring core middleware..." });

    applyMaintenanceMode(app);

    // Rate limiting (before body parsing so limits apply to all API requests)
    applyRateLimiting(app);
    applyPublicCmsCacheHeaders(app);

    app.use((req: Request & { _skipJsonParsing?: boolean }, res: Response, next: NextFunction) => {
        if (req._skipJsonParsing) return next();
        const limit = (config.server as { bodyLimit?: string })?.bodyLimit ?? "10mb";
        return express.json({ limit })(req, res, next);
    });
    app.use((req: Request & { _skipJsonParsing?: boolean }, res: Response, next: NextFunction) => {
        if (req._skipJsonParsing) return next();
        const limit = (config.server as { bodyLimit?: string })?.bodyLimit ?? "10mb";
        return express.urlencoded({ extended: true, limit })(req, res, next);
    });
    app.use(cookieParser());
    app.use(trialBrowserSignalMiddleware);

    app.use((req: RequestWithId, res: Response, next: NextFunction) => {
        req.id = uuidv4();
        res.setHeader("X-Request-Id", req.id);
        next();
    });

    try {
        if (!supabase) {
            throw new Error("Supabase client not provided for auth middleware");
        }
        const authMiddleware = requireFullAuth(supabase);
        const rawPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
        const apiPrefix = rawPrefix.replace(/\/+$/, "") || "/";

        app.use((req: Request, res: Response, next: NextFunction) => {
            const pathName = req.path;
            if (BYPASS_PATHS.some((p) => pathName.startsWith(p))) return next();
            if (pathName.startsWith(apiPrefix)) {
                const routePath = normalizeApiRoutePath(pathName, apiPrefix);
                if (isAuthExemptRoute(req, routePath)) {
                    return next();
                }
                return authMiddleware(req, res, next);
            }
            next();
        });

        logger.info({ msg: "[Setup] Core middleware configured" });
    } catch (error) {
        logger.error({
            msg: "[Setup] CRITICAL: Failed to configure auth middleware",
            error: error instanceof Error ? error.message : String(error),
        });
        app.use((_req: Request, _res: Response, next: NextFunction) => {
            next(new Error("Authentication middleware setup failed"));
        });
    }
}

export { configureCoreMiddleware };
