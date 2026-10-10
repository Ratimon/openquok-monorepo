import type { ScheduledPublishProviderHooks } from "./scheduledPublish/types.js";

export const linkedinScheduledPublishHooks: ScheduledPublishProviderHooks = {
    displayName: "LinkedIn",
    supportsFollowUpComments: true,
    supportsThreadFinisher: false,
    buildFollowUpCommentSettings: () => ({}),
};
