import type { ConfigObject } from "../config/GlobalConfig";
import { Queue } from "bullmq";
import express, { type Request, type Response, type Router } from "express";
import { createRequire } from "node:module";
import path from "node:path";

import { supabaseAnonClient } from "../connections/index";
import { getQueueRedisConnectionOptions } from "../connections/bullmq/createQueueIoredis";
import {
    BULL_BOARD_ACCESS_COOKIE_NAME,
    parseBearerToken,
    requireFullAuthWithRoles,
    requirePlatformAdmin,
} from "../middlewares/authenticateUser";
import { rbacRepository, userRepository } from "../repositories/index";
import { logger } from "../utils/Logger";

/**
 * Returns this module's `import.meta.url` at runtime without exposing the `import.meta` syntax
 * to a CommonJS TypeScript compile pass (e.g. ts-jest), which rejects it with TS1343. In the
 * tsc-emitted ESM build, the direct `eval` runs in this module's scope so `import.meta.url`
 * resolves normally; under CJS test transpilation the inner string is a SyntaxError at eval time
 * and the surrounding `try/catch` falls back to `null`.
 *
 * In the tsup-bundled Vercel handler, `@bull-board/ui` is not present as a separate node_modules
 * package anyway, so we short-circuit to `null` via a bundler-substituted sentinel. esbuild
 * dead-code-eliminates the `eval` branch in that build, which also silences its direct-eval
 * warning.
 */
function readImportMetaUrl(): string | null {
    if (process.env.__TSUP_BUNDLE__) {
        return null;
    }
    try {
        return eval("import.meta.url") as string;
    } catch {
        return null;
    }
}

/**
 * `@bull-board/api` runs `require.resolve('@bull-board/ui/package.json')` at **module load** time.
 * A static `import` of this package therefore crashes app startup (500 on every route, including
 * auth) when `@bull-board/ui` is absent from a serverless bundle (Vercel NFT, Lambda prune, etc.).
 *
 * We only `import()` `@bull-board/*` after `resolveBullBoardUiBasePath()` succeeds, and we pass
 * `uiBasePath` into `createBullBoard` so the dashboard can still work when load-time resolution is fragile.
 */
function resolveBullBoardUiBasePath(): string | null {
    try {
        const metaUrl = readImportMetaUrl();
        if (!metaUrl) return null;
        const localRequire = createRequire(metaUrl);
        const uiPackageJsonPath = localRequire.resolve("@bull-board/ui/package.json");
        return path.dirname(uiPackageJsonPath);
    } catch (error) {
        logger.error({
            msg: "[BullBoard] Failed to resolve @bull-board/ui package; dashboard will not mount",
            error: error instanceof Error ? error.message : String(error),
        });
        return null;
    }
}

function normalizeLeadingSlash(p: string): string {
    const s = p.trim();
    if (!s) return "/";
    return s.startsWith("/") ? s : `/${s}`;
}

function joinUrlPath(a: string, b: string): string {
    const left = a.replace(/\/+$/, "") || "/";
    const right = normalizeLeadingSlash(b).replace(/^\/+/, "");
    if (left === "/") return `/${right}`;
    return `${left}/${right}`;
}

export type BullBoardPathLayout = {
    fullPath: string;
    mountPath: string;
    apiPrefix: string;
};

/**
 * Resolves the public URL path and Express mount for Bull Board (e.g. `/api/v1/admin-queues`).
 * Returns `null` when the feature is disabled or the path is misconfigured.
 */
export function getBullBoardPathLayout(config: ConfigObject): BullBoardPathLayout | null {
    const admin = (config.admin as { bullBoard?: { enabled?: boolean; path?: string } } | undefined)?.bullBoard;
    if (admin?.enabled !== true) {
        return null;
    }

    const api = (config.api as { prefix?: string } | undefined)?.prefix ?? "/api/v1";
    const apiPrefix = normalizeLeadingSlash(api);

    const configuredPath = normalizeLeadingSlash(String(admin?.path ?? "/admin-queues"));
    const fullPath = configuredPath.startsWith(apiPrefix) ? configuredPath : joinUrlPath(apiPrefix, configuredPath);

    if (!fullPath.startsWith(apiPrefix)) {
        logger.error({
            msg: "[BullBoard] Invalid BULL_BOARD_PATH (must be under API_PREFIX)",
            apiPrefix,
            configuredPath,
            fullPath,
        });
        return null;
    }
    const mountPath = fullPath.slice(apiPrefix.length) || "/";
    return { fullPath, mountPath, apiPrefix };
}

const DEFAULT_BULL_BOARD_SESSION_MAX_AGE_SEC = 30 * 60;

function getBullBoardSessionMaxAgeMs(): number {
    const raw = String(process.env.BULL_BOARD_SESSION_MAX_AGE_SEC ?? "").trim();
    if (!raw) {
        return DEFAULT_BULL_BOARD_SESSION_MAX_AGE_SEC * 1000;
    }
    const n = Number.parseInt(raw, 10);
    if (Number.isFinite(n) && n > 0) {
        return n * 1000;
    }
    return DEFAULT_BULL_BOARD_SESSION_MAX_AGE_SEC * 1000;
}

function bullBoardSessionCookieAttributes(
    req: Request,
    cookiePath: string,
    maxAge: number
): {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax" | "none";
    path: string;
    maxAge: number;
} {
    const forwarded = String(req.get("x-forwarded-proto") ?? "").toLowerCase();
    const isHttps = forwarded === "https" || (req as Request & { secure?: boolean }).secure === true;
    if (isHttps) {
        return { httpOnly: true, secure: true, sameSite: "none", path: cookiePath, maxAge };
    }
    return { httpOnly: true, secure: false, sameSite: "lax", path: cookiePath, maxAge };
}

/**
 * Sets a path-scoped HttpOnly cookie with the current access token so the Bull Board SPA can load
 * subresources and call its JSON API (browsers do not add `Authorization` to `<script src>`/`<link>`, and
 * the embedded UI does not send your Bearer token). The client should call this once with
 * `Authorization: Bearer`, then navigate an iframe to the Bull Board URL.
 */
export function registerBullBoardSessionRoutes(apiRouter: Router, config: ConfigObject): void {
    const layout = getBullBoardPathLayout(config);
    if (!layout) {
        return;
    }
    const authWithRoles = requireFullAuthWithRoles(supabaseAnonClient, userRepository, rbacRepository);
    const maxAge = getBullBoardSessionMaxAgeMs();
    const cookiePath = layout.fullPath;

    const setSession = (req: Request, res: Response) => {
        const token = parseBearerToken(req);
        const attr = bullBoardSessionCookieAttributes(req, cookiePath, maxAge);
        res.cookie(BULL_BOARD_ACCESS_COOKIE_NAME, token, attr);
        res.status(200).json({ ok: true });
    };

    const clearSession = (req: Request, res: Response) => {
        const attr = bullBoardSessionCookieAttributes(req, cookiePath, 0);
        res.clearCookie(BULL_BOARD_ACCESS_COOKIE_NAME, {
            path: attr.path,
            secure: attr.secure,
            sameSite: attr.sameSite,
        });
        res.status(200).json({ ok: true });
    };

    const session = express.Router();
    session.post("/", authWithRoles, requirePlatformAdmin, setSession);
    session.post("/clear", authWithRoles, requirePlatformAdmin, clearSession);
    apiRouter.use("/admin/bull-board/session", session);

    logger.info({ msg: "[BullBoard] Session cookie routes mounted", cookiePath, sessionBase: "/admin/bull-board/session" });
}

/**
 * Bull Board (BullMQ) dashboard routes.
 *
 * Mounted under the normal API prefix (default `/api/v1`) so it uses the same global Bearer auth
 * (`middlewares/core.ts`) and can enforce RBAC via `requirePlatformAdmin` like `routes/AdminRoute.ts`.
 *
 * Any setup failure is caught and logged as non-fatal: a broken dashboard must never take down the
 * core API surface (sign-in, etc.). Vercel cold-start failures used to surface as 500s on every
 * route — including OPTIONS preflight — which the browser then rejects with a CORS error.
 */
export async function registerBullBoardRoutes(apiRouter: Router, config: ConfigObject): Promise<void> {
    const bullBoardEnabled = (config.admin as { bullBoard?: { enabled?: boolean } } | undefined)?.bullBoard?.enabled === true;
    const layout = getBullBoardPathLayout(config);
    if (!layout) {
        if (!bullBoardEnabled) {
            logger.info({ msg: "[BullBoard] Disabled (set BULL_BOARD_ENABLED=true to enable)" });
        }
        return;
    }
    const { fullPath, mountPath } = layout;

    const bullmq = (config.bullmq as {
        integrationRefresh?: { queueName?: string };
        notificationEmail?: { queueName?: string };
        scheduledSocialPost?: { queueName?: string };
    }) ?? {};

    const queueNames = [
        bullmq.integrationRefresh?.queueName,
        bullmq.notificationEmail?.queueName,
        bullmq.scheduledSocialPost?.queueName,
    ].filter((q): q is string => typeof q === "string" && q.length > 0);

    const uniqueQueueNames = [...new Set(queueNames)];
    if (uniqueQueueNames.length === 0) {
        logger.warn({ msg: "[BullBoard] No BullMQ queues configured; not mounting", fullPath });
        return;
    }

    const uiBasePath = resolveBullBoardUiBasePath();
    if (!uiBasePath) {
        return;
    }

    try {
        const [{ createBullBoard }, { BullMQAdapter }, { ExpressAdapter }] = await Promise.all([
            import("@bull-board/api"),
            import("@bull-board/api/bullMQAdapter"),
            import("@bull-board/express"),
        ]);

        const serverAdapter = new ExpressAdapter();
        serverAdapter.setBasePath(fullPath);

        const connection = getQueueRedisConnectionOptions();
        const queues = uniqueQueueNames.map((name) => new BullMQAdapter(new Queue(name, { connection })));

        createBullBoard({
            queues,
            serverAdapter,
            options: { uiBasePath, uiConfig: {} },
        });

        const boardRouter = express.Router();
        const authWithRoles = requireFullAuthWithRoles(supabaseAnonClient, userRepository, rbacRepository);

        boardRouter.use(authWithRoles, requirePlatformAdmin, serverAdapter.getRouter());
        apiRouter.use(mountPath, boardRouter);

        logger.info({
            msg: "[BullBoard] Mounted (super admin only)",
            publicUrl: fullPath,
            mountPath,
            queues: uniqueQueueNames,
        });
    } catch (error) {
        logger.error({
            msg: "[BullBoard] Failed to mount dashboard (non-fatal)",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}
