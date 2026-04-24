import { BullMQAdapter, RedisCoordinationStore } from "@flowcraft/bullmq-adapter";
import type IORedis from "ioredis";
import { config } from "backend/config/GlobalConfig.js";
import { createQueueIoredisClient } from "backend/connections/bullmq/createQueueIoredis.js";
import {
    buildScheduledSocialPostBlueprintDistributed,
    getScheduledSocialPostNodeRegistry,
} from "../../../blueprints/scheduledSocialPostBlueprint.js";
import {
    SCHEDULED_SOCIAL_POST_BLUEPRINT_ID,
    type ScheduledSocialPostWorkflowDependencies,
} from "../../../blueprints/scheduledSocialPostFlowTypes.js";

/**
 * BullMQ + Flowcraft adapter for scheduled social posting (`scheduled-social-post`).
 * Use with `pnpm worker:scheduled-social-post-bullmq`.
 */
export function createScheduledSocialPostBullMqAdapter(workflowDependencies: ScheduledSocialPostWorkflowDependencies): {
    adapter: BullMQAdapter;
    redis: IORedis;
} {
    const redis = createQueueIoredisClient();
    const coordinationStore = new RedisCoordinationStore(redis);
    const bullmq = config.bullmq as { scheduledSocialPost?: { queueName?: string } };
    const queueName = bullmq.scheduledSocialPost?.queueName ?? "scheduled-social-post";
    const blueprint = buildScheduledSocialPostBlueprintDistributed();

    const adapter = new BullMQAdapter({
        connection: redis,
        coordinationStore,
        queueName,
        runtimeOptions: {
            blueprints: { [SCHEDULED_SOCIAL_POST_BLUEPRINT_ID]: blueprint },
            registry: getScheduledSocialPostNodeRegistry(),
            dependencies: workflowDependencies,
        },
    });

    return { adapter, redis };
}
