import type Redis from "ioredis";

const WORKFLOW_STATE_KEY_PREFIX = "workflow:state:";

/**
 * Seeds the Redis hash used by Flowcraft’s RedisContext so field values match
 * `JSON.stringify` per key (same as the adapter’s context implementation).
 *
 * `blueprintVersion` must match `blueprint.metadata.version` before the first job runs,
 * otherwise the distributed adapter rejects the job for version mismatch.
 */
export async function seedRefreshTokenWorkflowContext(
    redis: Redis,
    runId: string,
    fields: {
        integrationId: string;
        organizationId: string;
        loopShouldContinue: boolean;
        blueprintVersion: string;
    }
): Promise<void> {
    const key = `${WORKFLOW_STATE_KEY_PREFIX}${runId}`;
    const flat: Record<string, string> = {
        integrationId: JSON.stringify(fields.integrationId),
        organizationId: JSON.stringify(fields.organizationId),
        loopShouldContinue: JSON.stringify(fields.loopShouldContinue),
        blueprintVersion: JSON.stringify(fields.blueprintVersion),
    };
    await redis.hset(key, flat);
}
