import type { Request, Response } from "express";

/**
 * API `Cache-Control` for anonymous public CMS GETs (hubs, RSS, images, editor-managed detail).
 * Complements Redis read-aside on services — does not replace SSR `no-store` or HTML document cache policy.
 * See `web/src/content/docs/configuration-backend/cache-design.md` → Public CMS HTTP cache layers.
 */
import { config } from "../../config/GlobalConfig";
import {
    EDITOR_MANAGED_PUBLIC_DETAIL_CACHE_CONTROL,
    isEditorManagedPublicDetailRoute,
    isPublicReadGet,
} from "../../middlewares/publicRouteRegistry";

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
    return (
        dbName === "blog_images" ||
        dbName === "listing_images" ||
        dbName === "link_directory_logos"
    );
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

    // Editor-managed detail (blog post/comments, listing/stack slug, link-directory site) — no CDN/browser cache.
    if (isEditorManagedPublicDetailRoute(routePath)) {
        return EDITOR_MANAGED_PUBLIC_DETAIL_CACHE_CONTROL;
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
