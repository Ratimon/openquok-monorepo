import type { PostMediaItemInput } from "backend/utils/dtos/PostDTO.js";

export type BuildFollowUpCommentSettingsInput = {
    media?: PostMediaItemInput[];
    rootProviderSettings: Record<string, unknown> | null;
};

/** Post-publish orchestration hooks per social provider (follow-ups, thread finisher). */
export type ScheduledPublishProviderHooks = {
    /** Notification and email copy; registry falls back to capitalized identifier when empty. */
    displayName: string;
    supportsFollowUpComments: boolean;
    supportsThreadFinisher: boolean;
    /** Delay before the first follow-up comment (e.g. Instagram graph settle time). */
    followUpCommentSettleMs?: number;
    shouldSkipFollowUpComments?: (
        rootProviderSettings: Record<string, unknown> | null
    ) => { skip: true; logMessage: string } | { skip: false };
    buildFollowUpCommentSettings?: (input: BuildFollowUpCommentSettingsInput) => Record<string, unknown>;
    threadFinisherMessage?: (rootProviderSettings: Record<string, unknown> | null) => string | null;
};
