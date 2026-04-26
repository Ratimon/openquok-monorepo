import type { Express, Request, Response, NextFunction } from "express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { Queue } from "bullmq";
import crypto from "crypto";

import type { ConfigObject } from "../config/GlobalConfig";
import { getQueueRedisConnectionOptions } from "../connections/bullmq/createQueueIoredis";
import { logger } from "../utils/Logger";

function unauthorized(res: Response) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Bull Board"');
    res.status(401).send("Authentication required");
}

function timingSafeEquals(a: string, b: string): boolean {
    const aa = Buffer.from(a);
    const bb = Buffer.from(b);
    if (aa.length !== bb.length) return false;
    return crypto.timingSafeEqual(aa, bb);
}

function requireBasicAuth(username: string, password: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const header = req.headers.authorization;
        if (!header || !header.startsWith("Basic ")) {
            unauthorized(res);
            return;
        }
        const encoded = header.slice("Basic ".length).trim();
        let decoded = "";
        try {
            decoded = Buffer.from(encoded, "base64").toString("utf8");
        } catch {
            unauthorized(res);
            return;
        }
        const sep = decoded.indexOf(":");
        if (sep < 0) {
            unauthorized(res);
            return;
        }
        const user = decoded.slice(0, sep);
        const pass = decoded.slice(sep + 1);
        if (!timingSafeEquals(user, username) || !timingSafeEquals(pass, password)) {
            unauthorized(res);
            return;
        }
        next();
    };
}

/**
 * Bull Board (BullMQ) dashboard mount.
 *
 * - Mounted OUTSIDE `/api/v1` so it doesn't depend on Bearer-token auth (bull-board UI doesn't automatically send it).
 * - Protect with Basic Auth so job payloads and controls aren't exposed.
 */
export function mountBullBoard(app: Express, config: ConfigObject): void {
    const admin = (config.admin as { bullBoard?: { enabled?: boolean; username?: string; password?: string; path?: string } }) ?? {};
    const bullBoard = admin.bullBoard ?? {};
    const enabled = bullBoard.enabled === true;
    if (!enabled) {
        logger.info({ msg: "[BullBoard] Disabled (set BULL_BOARD_ENABLED=true to enable)" });
        return;
    }

    const username = String(bullBoard.username ?? "").trim();
    const password = String(bullBoard.password ?? "").trim();
    if (!username || !password) {
        logger.warn({ msg: "[BullBoard] Enabled but missing credentials; not mounting", hasUsername: Boolean(username), hasPassword: Boolean(password) });
        return;
    }

    const basePath = String(bullBoard.path ?? "/admin/queues").trim() || "/admin/queues";

    const bullmq =
        (config.bullmq as {
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
        logger.warn({ msg: "[BullBoard] No BullMQ queues configured; not mounting", basePath });
        return;
    }

    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath(basePath);

    const connection = getQueueRedisConnectionOptions();
    const queues = uniqueQueueNames.map((name) => new BullMQAdapter(new Queue(name, { connection })));

    createBullBoard({
        queues,
        serverAdapter,
    });

    app.use(basePath, requireBasicAuth(username, password), serverAdapter.getRouter());
    logger.info({ msg: "[BullBoard] Mounted", basePath, queues: uniqueQueueNames });
}

