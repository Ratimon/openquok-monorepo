/**
 * Context + dependencies for the scheduled social post Flowcraft run (BullMQ worker).
 */
export const SCHEDULED_SOCIAL_POST_BLUEPRINT_ID = "scheduled-social-post" as const;
export const SCHEDULED_SOCIAL_POST_BLUEPRINT_VERSION = "1.0.0" as const;

export type ScheduledSocialPostFlowContext = {
    organizationId: string;
    postGroup: string;
    blueprintVersion: string;
};

export type ScheduledSocialPostWorkflowDependencies = {
    /** Load QUEUE rows for the group, post to each integration, set PUBLISHED / ERROR. */
    publishScheduledGroup: (input: { organizationId: string; postGroup: string }) => Promise<void>;
};
