import type { Request } from "express";

export const BLOG_POSTS_PREFIX = "/blog-system/posts/";
/** PUT /blog-system/posts/:postId/activity — public; route may still attach user if token is sent. */
export const BLOG_POST_ACTIVITY_PATH = /^\/blog-system\/posts\/[^/]+\/activity$/;
export const LISTINGS_PUBLISHED_PREFIX = "/listings/published/";
export const LISTINGS_STACKS_PUBLISHED_PREFIX = "/listings/stacks/published/";
export const LISTING_STAT_PATH = /^\/listings\/stats\/(views|likes|clicks)\/[^/]+$/;
export const LISTING_COMMENTS_PATH = /^\/listings\/[0-9a-f-]{36}\/comments$/i;

/** Prefix trees that skip user JWT auth (any HTTP method unless narrowed below). */
export const PUBLIC_PATH_PREFIXES = [
    "/auth",
    "/company",
    "/feedback",
    "/public",
    "/oauth",
    "/posts/preview",
    "/docs",
    "/billing/webhooks",
] as const;

/** Index/list endpoints (exact path only). */
export const PUBLIC_PATH_EXACT = [
    "/blog-system/posts",
    "/blog-system/rss",
    "/blog-system/authors",
    "/blog-system/topics",
    "/blog-system/topics/active",
    "/listings/published",
    "/listings/stacks/published",
    "/listings/categories/active-partial",
    "/listings/categories/active-full",
    "/listings/categories/all-partial",
    "/listings/categories/all-full",
    "/listings/categories/groups",
    "/listings/tags/active-partial",
    "/listings/tags/active-full",
    "/listings/tags/all-full",
    "/listings/tags/groups",
    "/listings/creators",
    "/openapi.json",
    /** Join-org page: invitees validate the link before sign-in. */
    "/settings/invite/validate",
] as const;

/** Non-API auth paths that bypass auth middleware entirely. */
export const BYPASS_PATHS = ["/health", "/sitemap.xml"] as const;

const matchesPublicPathPrefix = (routePath: string): boolean =>
    PUBLIC_PATH_PREFIXES.some((p) => routePath === p || routePath.startsWith(`${p}/`));

const matchesPublicPathExact = (routePath: string): boolean =>
    PUBLIC_PATH_EXACT.some((p) => routePath === p);

const isPublicImageDownloadGet = (req: Request, routePath: string): boolean => {
    if (req.method !== "GET" || routePath !== "/image/download") return false;
    const query = req.query ?? {};
    const dbName = typeof query.databaseName === "string" ? query.databaseName : "";
    const imageUrlParam = typeof query.imageUrl === "string" ? query.imageUrl : "";
    return (
        (dbName === "blog_images" || dbName === "listing_images") && imageUrlParam.length > 0
    );
};

/**
 * Routes under the API prefix normally require `Authorization: Bearer` (see `requireFullAuth`).
 * These checks define exceptions: callers skip the auth middleware entirely.
 */
export const isAuthExemptRoute = (req: Request, routePath: string): boolean => {
    if (matchesPublicPathExact(routePath)) {
        return true;
    }

    if (matchesPublicPathPrefix(routePath)) {
        return true;
    }

    if (
        req.method === "GET" &&
        routePath.startsWith(BLOG_POSTS_PREFIX) &&
        routePath.length > BLOG_POSTS_PREFIX.length
    ) {
        return true;
    }

    if (req.method === "PUT" && BLOG_POST_ACTIVITY_PATH.test(routePath)) {
        return true;
    }

    if (req.method === "PUT" && LISTING_STAT_PATH.test(routePath)) {
        return true;
    }

    if (req.method === "GET" && routePath.startsWith(LISTINGS_PUBLISHED_PREFIX)) {
        return true;
    }
    if (req.method === "GET" && routePath.startsWith(LISTINGS_STACKS_PUBLISHED_PREFIX)) {
        return true;
    }

    if (req.method === "GET" && LISTING_COMMENTS_PATH.test(routePath)) {
        return true;
    }

    if (req.method === "GET" && routePath.startsWith("/listings/creators/")) {
        return true;
    }

    if (isPublicImageDownloadGet(req, routePath)) {
        return true;
    }

    if (req.method === "GET" && routePath === "/integrations") {
        return true;
    }

    if (req.method === "POST" && isIntegrationConnectPath(routePath)) {
        return true;
    }

    return false;
};

/**
 * Public CMS/catalog GETs used by website SSR. Aligned with `isAuthExemptRoute` slug and query rules.
 */
export const isPublicReadGet = (req: Request, routePath: string): boolean => {
    if (req.method !== "GET") return false;
    return isAuthExemptRoute(req, routePath);
};

/** Anonymous write routes that use the dedicated public write limiter. */
export const isPublicWriteRoute = (req: Request, routePath: string): boolean => {
    if (req.method === "POST" && routePath === "/company/t") {
        return true;
    }
    if (req.method === "PUT" && BLOG_POST_ACTIVITY_PATH.test(routePath)) {
        return true;
    }
    if (req.method === "PUT" && LISTING_STAT_PATH.test(routePath)) {
        return true;
    }
    return false;
};

export const isPublicApiPath = (path: string): boolean =>
    path === "/public" || path.startsWith("/public/");

export const isUploadPath = (path: string): boolean =>
    path === "/public/upload" ||
    path.startsWith("/public/upload/") ||
    path === "/public/upload-from-url" ||
    path === "/media/upload" ||
    path === "/media/upload-server" ||
    path === "/media/upload-simple";

export const isIntegrationConnectPath = (path: string): boolean =>
    /^\/integrations\/social-connect\/[^/]+$/.test(path) ||
    /^\/integrations\/public\/provider\/[^/]+\/connect$/.test(path);

export const isWebhookPath = (path: string, originalUrl: string): boolean =>
    path.includes("/webhooks/") || originalUrl.includes("/webhooks/");

/** Routes with a dedicated rate limiter (skip the global bucket). */
export const hasDedicatedRateLimiter = (req: Request, routePath: string): boolean =>
    isPublicApiPath(routePath) ||
    isUploadPath(routePath) ||
    (req.method === "POST" && routePath === "/feedback") ||
    (req.method === "POST" && routePath === "/oauth/token") ||
    (req.method === "POST" && isIntegrationConnectPath(routePath)) ||
    isPublicWriteRoute(req, routePath);

/** Normalize a path under the API prefix (matches `core.ts` auth middleware). */
export const normalizeApiRoutePath = (pathName: string, apiPrefix: string): string => {
    let routePath = pathName.slice(apiPrefix.length) || "/";
    if (routePath.length > 1 && routePath.endsWith("/")) {
        routePath = routePath.slice(0, -1);
    }
    if (!routePath.startsWith("/")) {
        routePath = `/${routePath}`;
    }
    return routePath;
};
