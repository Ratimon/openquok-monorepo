import type { Request, Response, NextFunction } from "express";
import type { RequestHandler } from "express";
import type { ConfigObject } from "./config/GlobalConfig";

// Ensure Sentry is initialized before any other application modules
import { Sentry } from "./connections/index";

import http from "http";
import express, { json } from "express";
import type { Express } from "express";
import path from "path";
import helmet from "helmet";
import cors from "cors";

import { supabaseServiceClientConnection } from "./connections/index";
import { mountAllRoutes } from "./routes/index";
import { errorHandler } from "./controllers/ErrorController";
import { configureCoreMiddleware } from "./middlewares/core";
import { generateSitemapMiddleware } from "./middlewares/generateSitemap";
import { logger } from "./utils/Logger";
import { config } from "./config/GlobalConfig";

const checkConfigIsValid = () => {
    const criticalConfigKeys = ["server", "api", "cors"];
    const missingKeys: string[] = [];
    criticalConfigKeys.forEach((key) => {
        if (!config[key]) missingKeys.push(key);
    });
    if (missingKeys.length > 0) {
        logger.error({ msg: "[Config] Critical config is invalid", missingKeys, config: Object.keys(config) });
        throw new Error(`Critical config missing: ${missingKeys.join(", ")}`);
    }
    const nodeEnv = (config.server as { nodeEnv?: string }).nodeEnv;
    const allowedOrigins = (config.cors as { allowedOrigins?: string[] | string }).allowedOrigins;
    if (nodeEnv === "production") {
        const origins = Array.isArray(allowedOrigins) ? allowedOrigins : [String(allowedOrigins ?? "")];
        const hasWildcard = origins.some((origin) => origin.includes("*"));
        if (hasWildcard) {
            throw new Error("CORS wildcard origins are not allowed in production");
        }
    }
    logger.info({ msg: "[Config] Configuration validation passed" });
};

try {
    checkConfigIsValid();
} catch (error) {
    logger.error({
        msg: "[Config] CRITICAL: Configuration validation failed",
        error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
}

const getCorsOptions = () => {
    const c = config.cors as {
        allowedOrigins?: string[] | string;
        methods?: string[];
        allowedHeaders?: string[];
        credentials?: boolean;
        maxAge?: number;
    };
    return {
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
            if (!origin) return callback(null, true);
            const origins = c.allowedOrigins;
            if (origins === "*" || (Array.isArray(origins) && origins.includes("*"))) return callback(null, true);
            if (Array.isArray(origins) && origins.includes(origin)) return callback(null, true);
            if (Array.isArray(origins)) {
                for (const allowed of origins) {
                    if (allowed.includes("*")) {
                        const escaped = allowed.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
                        if (new RegExp(`^${escaped}$`).test(origin)) return callback(null, true);
                    }
                }
            }
            logger.warn({ msg: "[CORS] Origin rejected", origin });
            return callback(new Error(`Origin ${origin} not allowed by CORS policy`), false);
        },
        methods: c.methods ?? ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders:
            c.allowedHeaders ?? [
                "Content-Type",
                "Authorization",
                "X-Requested-With",
                "X-CSRF-Token",
                "Accept",
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers",
            ],
        credentials: c.credentials !== false,
        maxAge: c.maxAge ?? 86400,
        optionsSuccessStatus: 204,
    };
};

const app: Express = express();

/**
 * Creates and configures the Express app (middleware, routes, error handler).
 * For local/ECS we call createApp() then app.listen(); for Vercel/serverless the handler calls createApp() and uses the app.
 */
async function createApp(): Promise<Express> {
    const { config } = await import("./config/GlobalConfig");

    app.set("trust proxy", 1);

    app.use(
        helmet({
            contentSecurityPolicy: false,
            crossOriginResourcePolicy: { policy: "cross-origin" },
        })
    );

    const corsOptions = getCorsOptions();
    app.use(cors(corsOptions));
    app.options("/{*path}", cors(corsOptions) as RequestHandler);

    app.use((req: Request & { _skipJsonParsing?: boolean }, res: Response, next: NextFunction) => {
        if (req._skipJsonParsing) return next();
        return json()(req, res, next);
    });

    configureCoreMiddleware(app, config as ConfigObject, supabaseServiceClientConnection);

    try {
        const isProduction = (config.server as { nodeEnv?: string }).nodeEnv === "production";
        const currentDir = process.cwd();
        const manifestPath = path.join(currentDir, "static", "routes-manifest.json");
        const sitemapMiddleware = generateSitemapMiddleware({
            supabaseClient: supabaseServiceClientConnection,
            baseURL: (config.server as { frontendDomainUrl?: string }).frontendDomainUrl ?? "http://localhost:5173",
            routesPath: isProduction ? undefined : path.join(currentDir, "../web/src/routes"),
            routesManifestPath: isProduction ? manifestPath : undefined,
        });
        app.get("/sitemap.xml", sitemapMiddleware);
        logger.info({ msg: "[Setup] Sitemap endpoint mounted at /sitemap.xml" });
    } catch (error) {
        logger.error({
            msg: "[Setup] Failed to mount sitemap (non-fatal)",
            error: error instanceof Error ? error.message : String(error),
        });
    }

    app.get("/", (_req: Request, res: Response) => {
        res.status(200).json({
            success: true,
            message: "API is running",
            version: "1.0.0",
            health: "/health",
            sitemap: "/sitemap.xml",
        });
    });

    app.get("/health", (_req: Request, res: Response) => {
        res.status(200).json({ server: "ok" });
    });

    app.get("/debug-sentry", function mainHandler(_req, res) {
        throw new Error("My first Sentry error!");
    });

    // /** Test Sentry transport: sends a message (not an exception). If this appears in Sentry, DSN/project are correct. */
    // app.get("/debug-sentry-msg", (_req: Request, res: Response) => {
    //     const eventId = Sentry.captureMessage("Backend test message from /debug-sentry-msg", "info");
    //     res.status(200).json({ sentry: "message sent", eventId: eventId ?? "(none)" });
    // });

    const mounted = await mountAllRoutes(app, config as ConfigObject);
    if (!mounted) {
        logger.error({ msg: "[Setup] Failed to mount API routes" });
        throw new Error("Failed to mount API routes");
    }

    Sentry.setupExpressErrorHandler(app);

    app.use(errorHandler);

    logger.info({ msg: "[App] Application initialized successfully." });
    return app;
}

// Local/ECS: start the server. Vercel: handler/index.ts calls createApp() and uses the app as handler.
if (!process.env.VERCEL) {
    createApp()
        .then(async (configuredApp) => {
            const { config } = await import("./config/GlobalConfig");
            const port = (config.server as { port?: number }).port ?? 3000;
            if (process.env.JEST_WORKER_ID) {
                return;
            }
            // Create HTTP server and raise header size limit to avoid 431 (Node default can be 8–16KB)
            const server = http.createServer(configuredApp);
            (server as http.Server & { maxHeaderSize: number }).maxHeaderSize = 32 * 1024; // 32KB
            server.listen(port, () => {
                logger.info({ msg: "[server] Server is running", port });
            });
        })
        .catch((error) => {
            logger.error({ msg: "[App] CRITICAL: Failed to initialize application", error: error instanceof Error ? error.message : String(error) });
            logger.error({
                msg: "[App] Error stack",
                stack: error instanceof Error ? error.stack : "No stack trace",
            });
            process.exit(1);
        });
}

export { app, createApp };
