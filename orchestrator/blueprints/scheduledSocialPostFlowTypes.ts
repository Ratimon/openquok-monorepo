/**
 * Context + dependencies for the scheduled social post Flowcraft run (BullMQ worker).
 */
export const SCHEDULED_SOCIAL_POST_BLUEPRINT_ID = "scheduled-social-post" as const;
export const SCHEDULED_SOCIAL_POST_BLUEPRINT_VERSION = "1.0.1" as const;

export type ScheduledSocialPostTodo =
    | {
          type: "repeat-post";
          /** The newly-created (or otherwise targeted) post group to publish. */
          postGroup: string;
          /** Optional delay when scheduling the child run. Defaults to 0. */
          delayMs?: number;
      };

export type ScheduledSocialPostFlowContext = {
    organizationId: string;
    postGroup: string;
    blueprintVersion: string;
};

export type ScheduledSocialPostWorkflowDependencies = {
    /** Load QUEUE rows for the group, post to each integration, set PUBLISHED / ERROR. */
    publishScheduledGroup: (input: { organizationId: string; postGroup: string }) => Promise<void | { todos?: ScheduledSocialPostTodo[] }>;

    /**
     * Start a new scheduled-social-post workflow run without awaiting it (Temporal `parentClosePolicy: ABANDON` analogue).
     * Implementations should be best-effort; failures must not prevent the parent workflow from completing.
     */
    startChildScheduledSocialPost?: (input: { organizationId: string; postGroup: string; delayMs?: number }) => Promise<void>;
};
