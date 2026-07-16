import type { JobsOptions } from "bullmq";

/**
 * BullMQ job opts for Flowcraft `executeNode` enqueues (initial run adds and
 * {@link SafeBullMQAdapter} follow-on / reconcile adds). Completed jobs are removed immediately;
 * failed jobs are capped so shared Redis does not grow unbounded `bull:*:completed` / `failed` zsets.
 */
export function flowcraftExecuteNodeJobOptions(extra?: JobsOptions): JobsOptions {
    return {
        removeOnComplete: true,
        removeOnFail: { count: 200 },
        ...extra,
    };
}
