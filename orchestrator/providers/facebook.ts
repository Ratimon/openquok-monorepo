import { attachFollowUpCommentMedia } from "./scheduledPublish/followUpCommentMedia.js";
import type { ScheduledPublishProviderHooks } from "./scheduledPublish/types.js";

function isFacebookStoryProviderSettings(providerSettings: Record<string, unknown> | null): boolean {
    if (!providerSettings) return false;
    const facebook = providerSettings.facebook;
    if (facebook && typeof facebook === "object" && !Array.isArray(facebook)) {
        const fb = facebook as Record<string, unknown>;
        if (fb.postType === "story" || fb.post_type === "story") return true;
    }
    if (providerSettings.postType === "story" || providerSettings.post_type === "story") return true;
    return false;
}

export const facebookScheduledPublishHooks: ScheduledPublishProviderHooks = {
    displayName: "Facebook",
    supportsFollowUpComments: true,
    supportsThreadFinisher: false,
    shouldSkipFollowUpComments: (rootProviderSettings) =>
        isFacebookStoryProviderSettings(rootProviderSettings)
            ? { skip: true, logMessage: "[Orchestrator] skipping follow-up replies for Facebook Story" }
            : { skip: false },
    buildFollowUpCommentSettings: ({ media }) => attachFollowUpCommentMedia({}, media, "facebook"),
};
