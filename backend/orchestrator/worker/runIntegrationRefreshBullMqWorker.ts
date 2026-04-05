/**
 * Long-running worker for integration token refresh when INTEGRATION_REFRESH_TRANSPORT=bullmq.
 * Uses the same Redis connection settings as cache (`REDIS_*`, optional `REDIS_BULLMQ_DB`).
 *
 * Run: pnpm worker:integration-refresh-bullmq (from backend/)
 */
import { config } from "../../config/GlobalConfig";
import { IntegrationManager } from "../../integrations/integrationManager";
import { integrationRepository } from "../../repositories/index";
import { RefreshIntegrationService } from "../../services/RefreshIntegrationService";
import { logger } from "../../utils/Logger";
import { createIntegrationRefreshBullMqAdapter } from "../bullmq/createIntegrationRefreshBullMqAdapter";

const transport = (config.bullmq as { integrationRefresh?: { transport?: string } }).integrationRefresh?.transport;
if (transport !== "bullmq") {
    logger.warn({
        msg: "[Worker] INTEGRATION_REFRESH_TRANSPORT is not bullmq; worker will still start. Set INTEGRATION_REFRESH_TRANSPORT=bullmq when using this process.",
        transport: transport ?? "in_process",
    });
}

const integrationManager = new IntegrationManager();
const refreshService = new RefreshIntegrationService(integrationRepository, integrationManager);

const { adapter, redis } = createIntegrationRefreshBullMqAdapter({
    integrationRepository,
    runRefresh: (row) => refreshService.refresh(row),
});

adapter.start();
logger.info({
    msg: "[Worker] Flowcraft BullMQ adapter listening for integration refresh workflows",
    queueName: (config.bullmq as { queueName?: string }).queueName ?? "integration-refresh",
});

async function shutdown(signal: string): Promise<void> {
    logger.info({ msg: "[Worker] Shutting down BullMQ adapter", signal });
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
