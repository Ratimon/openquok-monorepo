import type Redis from "ioredis";

const WORKFLOW_STATE_KEY_PREFIX = "workflow:state:";

/**
 * Seeds Redis hash for Flowcraft `notification-send-plain` distributed runs.
 * Field values must be `JSON.stringify` per key (same as the BullMQ adapter context).
 */
export async function seedNotificationSendPlainWorkflowContext(
    redis: Redis,
    runId: string,
    fields: {
        to: string;
        subject: string;
        html: string;
        replyTo?: string;
        blueprintVersion: string;
    }
): Promise<void> {
    const key = `${WORKFLOW_STATE_KEY_PREFIX}${runId}`;
    const flat: Record<string, string> = {
        to: JSON.stringify(fields.to),
        subject: JSON.stringify(fields.subject),
        html: JSON.stringify(fields.html),
        blueprintVersion: JSON.stringify(fields.blueprintVersion),
    };
    if (fields.replyTo !== undefined && fields.replyTo !== "") {
        flat.replyTo = JSON.stringify(fields.replyTo);
    }
    await redis.hset(key, flat);
}

/** Seeds minimal context for `notification-digest-flush` one-shot runs. */
export async function seedNotificationDigestFlushWorkflowContext(
    redis: Redis,
    runId: string,
    blueprintVersion: string
): Promise<void> {
    const key = `${WORKFLOW_STATE_KEY_PREFIX}${runId}`;
    await redis.hset(key, "blueprintVersion", JSON.stringify(blueprintVersion));
}
