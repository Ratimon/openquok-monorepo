import type Redis from "ioredis";

const WORKFLOW_STATE_KEY_PREFIX = "workflow:state:";

/**
 * Seeds Flowcraft Redis context for `scheduled-social-post` distributed runs.
 */
export async function seedScheduledSocialPostWorkflowContext(
    redis: Redis,
    runId: string,
    fields: { organizationId: string; postGroup: string; blueprintVersion: string }
): Promise<void> {
    const key = `${WORKFLOW_STATE_KEY_PREFIX}${runId}`;
    const flat: Record<string, string> = {
        organizationId: JSON.stringify(fields.organizationId),
        postGroup: JSON.stringify(fields.postGroup),
        blueprintVersion: JSON.stringify(fields.blueprintVersion),
    };
    await redis.hset(key, flat);
}
