import { createServer, type Server } from "node:http";
import { Queue } from "bullmq";
import { config } from "backend/config/GlobalConfig.js";
import { createQueueIoredisClient } from "backend/connections/bullmq/createQueueIoredis.js";
import { logger } from "backend/utils/Logger.js";

const startedAt = Date.now();

export type WorkerHealthServerOptions = {
    label: string;
    queueName?: string;
};

export type WorkerHealthPayload = {
    status: "ok" | "error";
    worker: string;
    queueName?: string;
    uptimeSeconds: number;
    redis: "ok" | "error";
    queue?: {
        waiting: number;
        delayed: number;
        active: number;
        failed: number;
    };
    error?: string;
};

function resolveHealthPort(): number {
    const workerCfg = config.orchestratorWorker as { healthPort?: number } | undefined;
    const configured = workerCfg?.healthPort;
    if (typeof configured === "number" && configured === 0) {
        return 0;
    }
    if (typeof configured === "number" && configured > 0) {
        return configured;
    }
    return 3091;
}

export async function buildHealthPayload(options: WorkerHealthServerOptions): Promise<WorkerHealthPayload> {
    const base: WorkerHealthPayload = {
        status: "ok",
        worker: options.label,
        ...(options.queueName ? { queueName: options.queueName } : {}),
        uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
        redis: "error",
    };

    const redis = createQueueIoredisClient();
    try {
        const pong = await redis.ping();
        if (pong !== "PONG") {
            return { ...base, status: "error", error: `unexpected Redis PING response: ${String(pong)}` };
        }
        base.redis = "ok";

        if (options.queueName) {
            const queue = new Queue(options.queueName, { connection: redis });
            try {
                const counts = await queue.getJobCounts("waiting", "delayed", "active", "failed");
                base.queue = {
                    waiting: counts.waiting ?? 0,
                    delayed: counts.delayed ?? 0,
                    active: counts.active ?? 0,
                    failed: counts.failed ?? 0,
                };
            } finally {
                await queue.close();
            }
        }

        return base;
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { ...base, status: "error", error: message };
    } finally {
        await redis.quit();
    }
}

/**
 * Minimal HTTP server for uptime monitors: `GET /health` and `GET /health/status` (Postiz-compatible path).
 * Disabled when `ORCHESTRATOR_WORKER_HEALTH_PORT=0`.
 */
export function startWorkerHealthServer(options: WorkerHealthServerOptions): {
    port: number;
    stop: () => Promise<void>;
} {
    const port = resolveHealthPort();
    if (port <= 0) {
        logger.info({
            msg: "[Worker] Health HTTP server disabled (ORCHESTRATOR_WORKER_HEALTH_PORT=0)",
            worker: options.label,
        });
        return {
            port: 0,
            stop: async () => undefined,
        };
    }

    let server: Server | undefined;
    const httpServer = createServer((req, res) => {
        const path = req.url?.split("?")[0] ?? "";
        if (req.method !== "GET" || (path !== "/health" && path !== "/health/status")) {
            res.writeHead(404, { "content-type": "application/json" });
            res.end(JSON.stringify({ status: "not_found" }));
            return;
        }

        void buildHealthPayload(options)
            .then((body) => {
                const code = body.status === "ok" ? 200 : 500;
                res.writeHead(code, { "content-type": "application/json" });
                res.end(JSON.stringify(body));
            })
            .catch((err: unknown) => {
                const message = err instanceof Error ? err.message : String(err);
                res.writeHead(500, { "content-type": "application/json" });
                res.end(
                    JSON.stringify({
                        status: "error",
                        worker: options.label,
                        error: message,
                    } satisfies Partial<WorkerHealthPayload>)
                );
            });
    });

    server = httpServer;
    httpServer.listen(port, () => {
        logger.info({
            msg: "[Worker] Health HTTP server listening",
            worker: options.label,
            port,
            paths: ["/health", "/health/status"],
        });
    });

    return {
        port,
        stop: () =>
            new Promise<void>((resolve, reject) => {
                if (!server) {
                    resolve();
                    return;
                }
                server.close((err) => (err ? reject(err) : resolve()));
            }),
    };
}
