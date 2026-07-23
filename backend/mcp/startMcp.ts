import type { Express, Request, Response, NextFunction, RequestHandler } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { config } from "../config/GlobalConfig";
import { organizationRepository } from "../repositories/index";
import {
    integrationConnectionService,
    integrationManager,
    oauthAppService,
    postsService,
    mediaService,
    subscriptionService,
    subscriptionGuard,
} from "../services/index";
import { UploadFactory } from "../connections/upload/upload.factory";
import { storageR2Repository } from "../repositories/index";
import { resolveMcpAuth } from "./auth";
import { createMcpServer } from "./createMcpServer";
import { runWithMcpContext } from "./context";
import { logger } from "../utils/Logger";

const mcpAuthDeps = {
    oauthAppService,
    organizationRepository,
    subscriptionGuard,
};

const mcpServerDeps = {
    integrationConnectionService,
    integrationManager,
    postsService,
    mediaUploadDeps: {
        mediaService,
        subscriptionService,
        uploadProvider: UploadFactory.createStorage(storageR2Repository),
    },
};

function parseBearerToken(req: Request): string | null {
    const raw = (req.headers.authorization ?? req.headers.Authorization) as string | undefined;
    if (!raw?.trim()) return null;
    return raw.startsWith("Bearer ") ? raw.slice(7).trim() : raw.trim();
}

/** Some MCP clients omit `text/event-stream` in Accept; the transport requires both. */
const fixAcceptHeader: RequestHandler = (req, _res, next) => {
    const accept = req.headers.accept;
    if (!accept || (!accept.includes("text/event-stream") && !accept.includes("application/json"))) {
        req.headers.accept = accept
            ? `${accept}, application/json, text/event-stream`
            : "application/json, text/event-stream";
    } else if (!accept.includes("text/event-stream")) {
        req.headers.accept = `${accept}, text/event-stream`;
    } else if (!accept.includes("application/json")) {
        req.headers.accept = `${accept}, application/json`;
    }
    next();
};

const mcpCors: RequestHandler = (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, Accept, mcp-session-id, Mcp-Session-Id"
    );
    if (req.method === "OPTIONS") {
        res.status(204).end();
        return;
    }
    next();
};

function mcpAuthFromHeader(req: Request, res: Response, next: NextFunction): void {
    const token = parseBearerToken(req);
    if (!token) {
        res.status(401).json({ msg: "No API key provided" });
        return;
    }
    void resolveMcpAuth(token, mcpAuthDeps)
        .then((ctx) => {
            if (!ctx) {
                res.status(401).json({ msg: "Invalid API key" });
                return;
            }
            (req as Request & { mcpAuth?: typeof ctx }).mcpAuth = ctx;
            next();
        })
        .catch(next);
}

function mcpAuthFromPath(req: Request, res: Response, next: NextFunction): void {
    const token = typeof req.params.token === "string" ? req.params.token.trim() : "";
    if (!token) {
        res.status(401).json({ msg: "No API key provided" });
        return;
    }
    void resolveMcpAuth(token, mcpAuthDeps)
        .then((ctx) => {
            if (!ctx) {
                res.status(401).json({ msg: "Invalid API key" });
                return;
            }
            (req as Request & { mcpAuth?: typeof ctx }).mcpAuth = ctx;
            next();
        })
        .catch(next);
}

async function handleMcpRequest(req: Request, res: Response): Promise<void> {
    const auth = (req as Request & { mcpAuth?: { organizationId: string; tokenId: string; publicUserId: string } })
        .mcpAuth;
    if (!auth) {
        res.status(401).json({ msg: "Unauthorized" });
        return;
    }

    const server = createMcpServer(mcpServerDeps);
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
    });

    await server.connect(transport);
    res.on("close", () => {
        void transport.close();
        void server.close();
    });

    await runWithMcpContext(
        { organizationId: auth.organizationId, tokenId: auth.tokenId, publicUserId: auth.publicUserId },
        () => transport.handleRequest(req, res, (req as Request & { body?: unknown }).body)
    );
}

async function mcpHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        await handleMcpRequest(req, res);
    } catch (error) {
        logger.error({
            msg: "[MCP] Request failed",
            error: error instanceof Error ? error.message : String(error),
        });
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: "2.0",
                error: { code: -32603, message: "Internal server error" },
                id: null,
            });
        } else {
            next(error);
        }
    }
}

/**
 * Mount hosted HTTP MCP at `/mcp` and `/mcp/:token` (app root, not under API prefix).
 */
export function mountMcpRoutes(app: Express): void {
    const mcpCfg = config.mcp as { enabled?: boolean } | undefined;
    if (mcpCfg?.enabled === false) {
        logger.info({ msg: "[MCP] Disabled via MCP_ENABLED=false" });
        return;
    }

    const stack: RequestHandler[] = [mcpCors, fixAcceptHeader];

    app.options("/mcp", ...stack);
    app.options("/mcp/:token", ...stack);

    app.get("/mcp", ...stack, mcpAuthFromHeader, mcpHandler);
    app.post("/mcp", ...stack, mcpAuthFromHeader, mcpHandler);
    app.get("/mcp/:token", ...stack, mcpAuthFromPath, mcpHandler);
    app.post("/mcp/:token", ...stack, mcpAuthFromPath, mcpHandler);

    logger.info({ msg: "[MCP] Mounted at /mcp and /mcp/:token" });
}
