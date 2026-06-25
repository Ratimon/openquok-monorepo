import type { JobsOptions } from "bullmq";

/**
 * BullMQ job opts for Flowcraft `executeNode` enqueues. Completed jobs are removed immediately;
 * failed jobs are capped so shared Redis does not grow unbounded `bull:*:completed` / `failed` zsets.
 */
export function flowcraftExecuteNodeJobOptions(extra?: JobsOptions): JobsOptions {
    return {
        removeOnComplete: true,
        removeOnFail: { count: 200 },
        ...extra,
    };
}
