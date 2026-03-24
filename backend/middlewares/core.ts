import type { ConfigObject } from "../config/GlobalConfig";
import type { Express } from "express";
import type { Request, Response, NextFunction } from "express";
import type { SupabaseClient } from "@supabase/supabase-js";
import express from "express";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";

import { requireFullAuth } from "../middlewares/authenticateUser";
import { applyRateLimiting } from "../middlewares/rateLimit";
import { DATABASE_NAMES } from "../repositories/StorageRepository";
import { logger } from "../utils/Logger";

interface RequestWithId extends Request {
    id?: string;
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
        const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
        const publicPaths = ["/auth", "/company", "/feedback"];
        /** Exact path only (no prefix); used for GET /blog-system/posts, /topics, /topics/active, /rss, /authors */
        const publicPathsExact = [
            "/blog-system/posts",
            "/blog-system/rss",
            "/blog-system/authors",
            "/blog-system/topics",
            "/blog-system/topics/active",
        ];
        const bypassPaths = ["/health", "/sitemap.xml"];

        app.use((req: Request, res: Response, next: NextFunction) => {
            const pathName = req.path;
            if (bypassPaths.some((p) => pathName.startsWith(p))) return next();
            if (pathName.startsWith(apiPrefix)) {
                const routePath = pathName.slice(apiPrefix.length) || "/";
                const isPublicExact = publicPathsExact.some((p) => routePath === p);
                // GET /blog-system/posts/:identifier (by slug) is public; by-id still requires auth in BlogRoute
                const isPublicBlogPostBySlug =
                    req.method === "GET" && routePath.startsWith("/blog-system/posts/") && routePath.length > "/blog-system/posts/".length;
                // PUT /blog-system/posts/:postId/activity is public; optionalAuth in BlogRoute attaches user when token present
                const isPublicTrackActivity =
                    req.method === "PUT" && /^\/blog-system\/posts\/[^/]+\/activity$/.test(routePath);
                /** Blog inline/hero images: `<img src>` cannot send Bearer tokens; cookies are often cross-origin. */
                const dbName = typeof req.query.databaseName === "string" ? req.query.databaseName : "";
                const imageUrlParam = typeof req.query.imageUrl === "string" ? req.query.imageUrl : "";
                const isPublicBlogImageDownload =
                    req.method === "GET" &&
                    routePath === "/image/download" &&
                    dbName === DATABASE_NAMES.BLOG_IMAGES &&
                    imageUrlParam.length > 0;
                const isPublic =
                    isPublicExact ||
                    isPublicBlogPostBySlug ||
                    isPublicTrackActivity ||
                    isPublicBlogImageDownload ||
                    publicPaths.some((p) => routePath === p || routePath.startsWith(p + "/"));
                if (isPublic) return next();
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
