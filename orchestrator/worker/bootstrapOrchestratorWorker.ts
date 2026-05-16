import "./initWorkerSentry.js";
import { Sentry } from "./initWorkerSentry.js";
import { logger } from "backend/utils/Logger.js";
import { startWorkerHealthServer, type WorkerHealthServerOptions } from "./workerHealthServer.js";

let fatalHandlersRegistered = false;

function registerFatalErrorHandlers(label: string): void {
    if (fatalHandlersRegistered) return;
    fatalHandlersRegistered = true;

    const report = (err: unknown, kind: "uncaughtException" | "unhandledRejection") => {
        logger.error({
            msg: `[Worker] ${kind}`,
            worker: label,
            error: err instanceof Error ? err.message : String(err),
            ...(err instanceof Error && err.stack ? { stack: err.stack } : {}),
        });
        Sentry.captureException(err instanceof Error ? err : new Error(String(err)), {
            tags: { worker: label, fatal: kind },
        });
    };

    process.on("uncaughtException", (err) => {
        report(err, "uncaughtException");
    });
    process.on("unhandledRejection", (reason) => {
        report(reason, "unhandledRejection");
    });
}

/**
 * Call once at the top of each `run*BullMqWorker` entrypoint (before other imports in that file
 * are not possible — so this module must be the first import in the worker file).
 */
export function bootstrapOrchestratorWorker(options: WorkerHealthServerOptions): {
    stopHealthServer: () => Promise<void>;
    flushSentry: (timeoutMs?: number) => Promise<boolean>;
} {
    Sentry.setTag("openquok.component", "orchestrator-worker");
    Sentry.setTag("openquok.worker", options.label);
    if (options.queueName) {
        Sentry.setTag("openquok.worker.queue", options.queueName);
    }

    registerFatalErrorHandlers(options.label);

    const health = startWorkerHealthServer(options);

    return {
        stopHealthServer: health.stop,
        flushSentry: (timeoutMs = 2_000) => Sentry.flush(timeoutMs),
    };
}
