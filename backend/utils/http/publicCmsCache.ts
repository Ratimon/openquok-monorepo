import type { Request, Response } from "express";

import { config } from "../../config/GlobalConfig";
import { isPublicReadGet } from "../../middlewares/publicRouteRegistry";

export interface PublicCmsCacheConfig {
    enabled?: boolean;
    maxAgeSeconds?: number;
    staleWhileRevalidateSeconds?: number;
    rssMaxAgeSeconds?: number;
    imageMaxAgeSeconds?: number;
    imageStaleWhileRevalidateSeconds?: number;
}

const getPublicCmsCacheConfig = (): PublicCmsCacheConfig => {
    const cmsCache = config.publicCmsCache as PublicCmsCacheConfig | undefined;
    return cmsCache ?? {};
};

export const buildCacheControlHeader = (
    maxAgeSeconds: number,
    staleWhileRevalidateSeconds?: number
): string => {
    const parts = [`public`, `max-age=${maxAgeSeconds}`];
    if (staleWhileRevalidateSeconds !== undefined && staleWhileRevalidateSeconds > 0) {
        parts.push(`stale-while-revalidate=${staleWhileRevalidateSeconds}`);
    }
    return parts.join(", ");
};

const isPublicCmsImageDownloadGet = (req: Request, routePath: string): boolean => {
    if (routePath !== "/image/download") return false;
    const query = req.query ?? {};
    const dbName = typeof query.databaseName === "string" ? query.databaseName : "";
    return dbName === "blog_images" || dbName === "listing_images";
};

export const resolvePublicCmsCacheControl = (req: Request, routePath: string): string | null => {
    const cmsCache = getPublicCmsCacheConfig();
    if (cmsCache.enabled === false) return null;
    if (!isPublicReadGet(req, routePath)) return null;

    if (routePath === "/blog-system/rss") {
        const maxAge = cmsCache.rssMaxAgeSeconds ?? 86400;
        return buildCacheControlHeader(maxAge);
    }

    if (isPublicCmsImageDownloadGet(req, routePath)) {
        const maxAge = cmsCache.imageMaxAgeSeconds ?? 3600;
        const swr = cmsCache.imageStaleWhileRevalidateSeconds ?? 86400;
        return buildCacheControlHeader(maxAge, swr);
    }

    const maxAge = cmsCache.maxAgeSeconds ?? 60;
    const swr = cmsCache.staleWhileRevalidateSeconds ?? 300;
    return buildCacheControlHeader(maxAge, swr);
};

export const setPublicCmsCacheHeaders = (res: Response, cacheControl: string): void => {
    if (!res.getHeader("Cache-Control")) {
        res.setHeader("Cache-Control", cacheControl);
    }
};

export const applyPublicCmsCacheHeadersForRequest = (
    req: Request,
    res: Response,
    routePath: string
): void => {
    const cacheControl = resolvePublicCmsCacheControl(req, routePath);
    if (cacheControl) {
        setPublicCmsCacheHeaders(res, cacheControl);
    }
};
