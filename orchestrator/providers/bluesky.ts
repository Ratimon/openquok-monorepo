import { attachFollowUpCommentMedia } from "./scheduledPublish/followUpCommentMedia.js";
import type { ScheduledPublishProviderHooks } from "./scheduledPublish/types.js";

export const blueskyScheduledPublishHooks: ScheduledPublishProviderHooks = {
    displayName: "Bluesky",
    supportsFollowUpComments: true,
    supportsThreadFinisher: false,
    buildFollowUpCommentSettings: ({ media }) => attachFollowUpCommentMedia({}, media, "bluesky"),
};
