import type { ConfigObject } from "../config/GlobalConfig";
import type { Express } from "express";
import type { Request, Response, NextFunction } from "express";
import type { SupabaseClient } from "@supabase/supabase-js";
import express from "express";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";

import { requireFullAuth } from "../guards";
import { applyRateLimiting } from "../middlewares/rateLimit";
import { logger } from "../utils/Logger";

interface RequestWithId extends Request {
    id?: string;
}

const BLOG_POSTS_PREFIX = "/blog-system/posts/";
/** PUT /blog-system/posts/:postId/activity — public; route may still attach user if token is sent. */
const BLOG_POST_ACTIVITY_PATH = /^\/blog-system\/posts\/[^/]+\/activity$/;
const LISTINGS_PUBLISHED_PREFIX = "/listings/published/";
const LISTINGS_STACKS_PUBLISHED_PREFIX = "/listings/stacks/published/";
const LISTING_STAT_PATH = /^\/listings\/stats\/(views|likes|clicks)\/[^/]+$/;
const LISTING_COMMENTS_PATH = /^\/listings\/[0-9a-f-]{36}\/comments$/i;

/**
 * Routes under the API prefix normally require `Authorization: Bearer` (see `requireFullAuth`).
 * These checks define exceptions: callers skip the auth middleware entirely.
 *
 * Order of checks does not change the final OR result; helpers are grouped by feature (blog, integrations).
 */
function shouldSkipApiAuth(
    req: Request,
    routePath: string,
    publicPaths: string[],
    publicPathsExact: string[]
): boolean {
    // Index / list endpoints (exact path only): e.g. GET /blog-system/rss, /topics/active
    if (publicPathsExact.some((p) => routePath === p)) {
        return true;
    }

    // Prefix trees: /auth/*, /company/*, /feedback/*, /public/* (programmatic integration API key)
    if (publicPaths.some((p) => routePath === p || routePath.startsWith(`${p}/`))) {
        return true;
    }

    // Blog: single post by slug (GET /blog-system/posts/:slug). Fetch-by-id routes still enforce auth in BlogRoute.
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

    // Listings: public stat counters (view/like/click).
    if (req.method === "PUT" && LISTING_STAT_PATH.test(routePath)) {
        return true;
    }

    // Listings: published extension/stack detail by slug.
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

    // Public image download for blog/listing embeds (browsers do not send Bearer on <img src>).
    if (req.method === "GET" && routePath === "/image/download") {
        const dbName = typeof req.query.databaseName === "string" ? req.query.databaseName : "";
        const imageUrlParam = typeof req.query.imageUrl === "string" ? req.query.imageUrl : "";
        if (
            (dbName === "blog_images" || dbName === "listing_images") &&
            imageUrlParam.length > 0
        ) {
            return true;
        }
    }

    // Integrations: public provider catalog (metadata only; no tokens).
    if (req.method === "GET" && routePath === "/integrations") {
        return true;
    }
    // Integrations: OAuth callback exchange uses short-lived OAuth state cache (no JWT required).
    if (req.method === "POST" && /^\/integrations\/social-connect\/[^/]+$/.test(routePath)) {
        return true;
    }
    if (req.method === "POST" && /^\/integrations\/public\/provider\/[^/]+\/connect$/.test(routePath)) {
        return true;
    }

    return false;
}

function configureCoreMiddleware(app: Express, config: ConfigObject, supabase: SupabaseClient) {
    logger.info({ msg: "[Setup] Configuring core middleware..." });

    // Rate limiting (before body parsing so limits apply to all API requests)
    applyRateLimiting(app);

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
        //  : check if we can refactor
        const publicPaths = [
            "/auth",
            "/company",
            "/feedback",
            "/public",
            "/oauth",
            "/posts/preview",
            "/docs",
            "/billing/webhooks",
        ];
        const publicPathsExact = [
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
        ];
        const bypassPaths = ["/health", "/sitemap.xml"];

        app.use((req: Request, res: Response, next: NextFunction) => {
            const pathName = req.path;
            if (bypassPaths.some((p) => pathName.startsWith(p))) return next();
            if (pathName.startsWith(apiPrefix)) {
                let routePath = pathName.slice(apiPrefix.length) || "/";
                if (routePath.length > 1 && routePath.endsWith("/")) {
                    routePath = routePath.slice(0, -1);
                }
                if (!routePath.startsWith("/")) {
                    routePath = `/${routePath}`;
                }
                if (shouldSkipApiAuth(req, routePath, publicPaths, publicPathsExact)) {
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
