import { attachFollowUpCommentMedia } from "./scheduledPublish/followUpCommentMedia.js";
import type { ScheduledPublishProviderHooks } from "./scheduledPublish/types.js";

/** Instagram media can take a moment after publish before comments are accepted. */
export const INSTAGRAM_FOLLOW_UP_COMMENT_SETTLE_MS = 2_000;

export const instagramScheduledPublishHooks: ScheduledPublishProviderHooks = {
    displayName: "Instagram",
    supportsFollowUpComments: true,
    supportsThreadFinisher: false,
    followUpCommentSettleMs: INSTAGRAM_FOLLOW_UP_COMMENT_SETTLE_MS,
    buildFollowUpCommentSettings: ({ media }) =>
        attachFollowUpCommentMedia({}, media, "instagram-business"),
};
