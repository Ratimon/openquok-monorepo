import { attachFollowUpCommentMedia } from "./scheduledPublish/followUpCommentMedia.js";
import { xThreadFinisherMessageFromSettings } from "./scheduledPublish/threadFinisherMessage.js";
import type { ScheduledPublishProviderHooks } from "./scheduledPublish/types.js";

export const xScheduledPublishHooks: ScheduledPublishProviderHooks = {
    displayName: "X",
    supportsFollowUpComments: true,
    supportsThreadFinisher: true,
    buildFollowUpCommentSettings: ({ media }) => attachFollowUpCommentMedia({}, media, "x"),
    threadFinisherMessage: xThreadFinisherMessageFromSettings,
};
