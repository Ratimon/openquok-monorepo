/**
 * Housekeeping worker: transactional notification email (BullMQ) + periodic Directory SEO domain refresh.
 * Email blueprints: `notification-send-plain`, `notification-digest-flush` (see `blueprints/notificationEmailBlueprint.ts`).
 *
 * Run: pnpm worker:housekeeping-bullmq (from backend/ or repo root)
 */
import { bootstrapOrchestratorWorker } from "./bootstrapOrchestratorWorker.js";
import { startWorkerHealthServer } from "./workerHealthServer.js";
import { config } from "backend/config/GlobalConfig.js";
import { createNotificationEmailBullMqAdapter } from "../adapters/flowcraft-bullmq/notification/createNotificationEmailBullMqAdapter.js";
import { executeNotificationDigestFlush } from "../flows/notificationDigestFlushExecution.js";
import { runNotificationDigestFlushOrchestration } from "../flows/notificationEmailWorkflow.js";
import {
    NOTIFICATION_DIGEST_FLUSH_BLUEPRINT_ID,
    NOTIFICATION_SEND_PLAIN_BLUEPRINT_ID,
} from "../blueprints/notificationEmailFlowTypes.js";
import { acquireNotificationSendPlainSlot } from "../stores/notificationSendPlainRateRedis.js";
import { directorySeoService, transactionalNotificationEmailService } from "backend/services/index.js";
import { EmailService } from "backend/services/EmailService.js";
import { logger } from "backend/utils/Logger.js";
import { startFlowcraftBullMqReconciliationTimer } from "./flowcraftBullMqReconciliationTimer.js";

const WORKER_LABEL = "housekeeping";

const bullmqConfig = config.bullmq as {
    notificationEmail?: { queueName?: string; digestFlushIntervalMs?: number; sendPlainMinIntervalMs?: number };
};
const emailCfg = config.email as { enabled?: boolean } | undefined;
const directorySeoCfg = config.directorySeo as {
    weeklyRefreshEnabled?: boolean;
    weeklyRefreshIntervalMs?: number;
};

const queueName = bullmqConfig.notificationEmail?.queueName ?? "notification-email";
const digestEveryMs = bullmqConfig.notificationEmail?.digestFlushIntervalMs ?? 300_000;
const sendPlainMinIntervalMs = bullmqConfig.notificationEmail?.sendPlainMinIntervalMs ?? 700;
const directorySeoWeeklyEveryMs = Math.max(
    60_000,
    directorySeoCfg?.weeklyRefreshIntervalMs ?? 7 * 24 * 60 * 60 * 1000
);
const directorySeoWeeklyEnabled = directorySeoCfg?.weeklyRefreshEnabled ?? true;

const { flushSentry } = bootstrapOrchestratorWorker({
    label: WORKER_LABEL,
    queueName,
});

const emailService = new EmailService({
    isEnabled: emailCfg?.enabled ?? false,
});

const { adapter, redis } = createNotificationEmailBullMqAdapter({
    sendPlain: (params) => emailService.sendPlain(params),
    acquireSendPlainSlot: () => acquireNotificationSendPlainSlot(redis, sendPlainMinIntervalMs),
    flushAllPendingDigestEmails: () =>
        executeNotificationDigestFlush(redis, {
            transactionalNotificationEmailService,
            sendPlain: (to, subj, html) => emailService.sendPlain({ to, subject: subj, html }),
        }),
});

const health = startWorkerHealthServer({
    label: WORKER_LABEL,
    queueName,
    redis,
});

adapter.start();
const flowcraftReconciler = startFlowcraftBullMqReconciliationTimer({
    adapter,
    redis,
    label: WORKER_LABEL,
    allowedBlueprintIds: [NOTIFICATION_SEND_PLAIN_BLUEPRINT_ID, NOTIFICATION_DIGEST_FLUSH_BLUEPRINT_ID],
});
logger.info({
    msg: "[Worker] Housekeeping BullMQ adapter listening (notification email workflows)",
    queueName,
    digestFlushIntervalMs: digestEveryMs,
    sendPlainMinIntervalMs,
    directorySeoWeeklyRefreshEnabled: directorySeoWeeklyEnabled,
    directorySeoWeeklyRefreshIntervalMs: directorySeoWeeklyEveryMs,
});

const digestInterval = setInterval(() => {
    void runNotificationDigestFlushOrchestration(redis, { queueName });
}, digestEveryMs);

async function runDirectorySeoWeeklyRefresh(): Promise<void> {
    try {
        const result = await directorySeoService.runWeeklyRefresh();
        logger.info({
            msg: "[Worker] Directory SEO weekly refresh finished",
            attempted: result.attempted,
            refreshed: result.refreshed,
        });
    } catch (err) {
        logger.error({
            msg: "[Worker] Directory SEO weekly refresh failed",
            error: err instanceof Error ? err.message : String(err),
        });
    }
}

let directorySeoWeeklyInterval: ReturnType<typeof setInterval> | undefined;
if (directorySeoWeeklyEnabled) {
    directorySeoWeeklyInterval = setInterval(() => {
        void runDirectorySeoWeeklyRefresh();
    }, directorySeoWeeklyEveryMs);
}

async function shutdown(signal: string): Promise<void> {
    logger.info({ msg: "[Worker] Shutting down housekeeping adapter", signal });
    flowcraftReconciler.stop();
    clearInterval(digestInterval);
    if (directorySeoWeeklyInterval) clearInterval(directorySeoWeeklyInterval);
    try {
        await health.stop();
        await adapter.close();
        await redis.quit();
    } catch (err) {
        logger.error({
            msg: "[Worker] Error closing housekeeping adapter",
            error: err instanceof Error ? err.message : String(err),
        });
    }
    await flushSentry();
    process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
