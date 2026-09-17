import type { Express, Request, Response, NextFunction } from "express";

import { config } from "../config/GlobalConfig";
import { applyPublicCmsCacheHeadersForRequest } from "../utils/http/publicCmsCache";
import { logger } from "../utils/Logger";

export const applyPublicCmsCacheHeaders = (app: Express): void => {
    const cmsCache = config.publicCmsCache as { enabled?: boolean } | undefined;
    if (cmsCache?.enabled === false) {
        logger.info({ msg: "Public CMS Cache-Control headers are disabled" });
        return;
    }

    const apiPrefix = ((config.api as { prefix?: string })?.prefix ?? "/api/v1").replace(/\/+$/, "") || "/";

    app.use(apiPrefix, (req: Request, res: Response, next: NextFunction) => {
        // Mounted under apiPrefix — req.path is the route suffix (same as publicReadLimiter).
        applyPublicCmsCacheHeadersForRequest(req, res, req.path);
        next();
    });

    const maxAge = (config.publicCmsCache as { maxAgeSeconds?: number })?.maxAgeSeconds ?? 60;
    const swr =
        (config.publicCmsCache as { staleWhileRevalidateSeconds?: number })?.staleWhileRevalidateSeconds ??
        300;

    logger.info({
        msg: "Applied public CMS Cache-Control headers on catalog GET routes",
        apiPrefix,
        default: `public, max-age=${maxAge}, stale-while-revalidate=${swr}`,
    });
};
