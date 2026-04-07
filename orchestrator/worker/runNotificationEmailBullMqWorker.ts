/**
 * Flowcraft + `@flowcraft/bullmq-adapter` for transactional notification email.
 * Blueprints: `notification-send-plain`, `notification-digest-flush` (see `blueprints/notificationEmailBlueprint.ts`).
 *
 * Run: pnpm worker:notification-email-bullmq (from backend/)
 */
import { config } from "backend/config/GlobalConfig.js";
import { createNotificationEmailBullMqAdapter } from "../adapters/flowcraft-bullmq/createNotificationEmailBullMqAdapter.js";
import { executeNotificationDigestFlush } from "../flows/notificationDigestFlushExecution.js";
import { runNotificationDigestFlushOrchestration } from "../flows/notificationEmailWorkflow.js";
import { acquireNotificationSendPlainSlot } from "../stores/notificationSendPlainRateRedis.js";
import { transactionalNotificationEmailService } from "backend/services/index.js";
import { EmailService } from "backend/services/EmailService.js";
import { logger } from "backend/utils/Logger.js";

const bullmqConfig = config.bullmq as {
    notificationEmail?: { queueName?: string; digestFlushIntervalMs?: number; sendPlainMinIntervalMs?: number };
};
const emailCfg = config.email as { enabled?: boolean } | undefined;
const queueName = bullmqConfig.notificationEmail?.queueName ?? "notification-email";
const digestEveryMs = bullmqConfig.notificationEmail?.digestFlushIntervalMs ?? 300_000;
const sendPlainMinIntervalMs = bullmqConfig.notificationEmail?.sendPlainMinIntervalMs ?? 700;

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

adapter.start();
logger.info({
    msg: "[Worker] Flowcraft BullMQ adapter listening for notification-email workflows",
    queueName,
    digestFlushIntervalMs: digestEveryMs,
    sendPlainMinIntervalMs,
});

const digestInterval = setInterval(() => {
    void runNotificationDigestFlushOrchestration(redis, { queueName });
}, digestEveryMs);

async function shutdown(signal: string): Promise<void> {
    logger.info({ msg: "[Worker] Shutting down notification email adapter", signal });
    clearInterval(digestInterval);
    try {
        await adapter.close();
        await redis.quit();
    } catch (err) {
        logger.error({
            msg: "[Worker] Error closing notification email adapter",
            error: err instanceof Error ? err.message : String(err),
        });
    }
    process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
