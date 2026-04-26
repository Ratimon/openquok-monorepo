/**
 * Long-running worker for integration refresh when `config.bullmq.integrationRefresh.transport` is `bullmq`
 * (set in `config/orchestratorFlows.ts`).
 * Uses the same Redis connection settings as cache (`REDIS_*`, optional `REDIS_BULLMQ_DB`).
 *
 * Run: pnpm worker:integration-refresh-bullmq (from backend/)
 */
import { config } from "backend/config/GlobalConfig.js";
import { integrationRepository, notificationRepository, organizationRepository, userRepository } from "backend/repositories/index.js";
import { EmailService } from "backend/services/EmailService.js";
import { NotificationService } from "backend/services/NotificationService.js";
import { RefreshIntegrationService } from "backend/services/RefreshIntegrationService.js";
import { TransactionalNotificationEmailService } from "backend/services/TransactionalNotificationEmailService.js";
import { IntegrationManager } from "backend/integrations/integrationManager.js";
import { logger } from "backend/utils/Logger.js";
import { createIntegrationRefreshBullMqAdapter } from "../adapters/flowcraft-bullmq/integration-refresh/createIntegrationRefreshBullMqAdapter.js";
import { REFRESH_TOKEN_BLUEPRINT_ID } from "../blueprints/refreshTokenTypes.js";
import { startFlowcraftBullMqReconciliationTimer } from "./flowcraftBullMqReconciliationTimer.js";

const transport = (config.bullmq as { integrationRefresh?: { transport?: string } }).integrationRefresh?.transport;
if (transport !== "bullmq") {
    logger.warn({
        msg: "[Worker] integration refresh transport is not bullmq; worker will still start. Set orchestratorFlows.integrationRefresh.transport to bullmq in config/orchestratorFlows.ts when using this process.",
        transport: transport ?? "in_process",
    });
}

const emailCfg = config.email as { enabled?: boolean } | undefined;
const emailService = new EmailService({
    isEnabled: emailCfg?.enabled ?? false,
});
const transactionalNotificationEmailService = new TransactionalNotificationEmailService(organizationRepository);
const notificationService = new NotificationService(
    notificationRepository,
    userRepository,
    organizationRepository,
    emailService,
    transactionalNotificationEmailService
);

const integrationManager = new IntegrationManager();
const refreshIntegrationService = new RefreshIntegrationService(integrationRepository, integrationManager, notificationService);

const { adapter, redis } = createIntegrationRefreshBullMqAdapter({
    integrationRepository,
    runRefresh: (row) => refreshIntegrationService.refresh(row),
});

adapter.start();
const flowcraftReconciler = startFlowcraftBullMqReconciliationTimer({
    adapter,
    redis,
    label: "integration-refresh",
    allowedBlueprintIds: [REFRESH_TOKEN_BLUEPRINT_ID],
});
logger.info({
    msg: "[Worker] Flowcraft BullMQ adapter listening for integration refresh workflows",
    queueName: (config.bullmq as { integrationRefresh?: { queueName?: string } }).integrationRefresh?.queueName ?? "integration-refresh",
});

async function shutdown(signal: string): Promise<void> {
    logger.info({ msg: "[Worker] Shutting down BullMQ adapter", signal });
    flowcraftReconciler.stop();
    try {
        await adapter.close();
        await redis.quit();
    } catch (err) {
        logger.error({
            msg: "[Worker] Error closing BullMQ adapter",
            error: err instanceof Error ? err.message : String(err),
        });
    }
    process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
