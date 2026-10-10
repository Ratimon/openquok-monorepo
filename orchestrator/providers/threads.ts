import { attachFollowUpCommentMedia } from "./scheduledPublish/followUpCommentMedia.js";
import { threadsThreadFinisherMessageFromSettings } from "./scheduledPublish/threadFinisherMessage.js";
import type { ScheduledPublishProviderHooks } from "./scheduledPublish/types.js";

export const threadsScheduledPublishHooks: ScheduledPublishProviderHooks = {
    displayName: "Threads",
    supportsFollowUpComments: true,
    supportsThreadFinisher: true,
    buildFollowUpCommentSettings: ({ media }) => attachFollowUpCommentMedia({}, media, "threads"),
    threadFinisherMessage: threadsThreadFinisherMessageFromSettings,
};
