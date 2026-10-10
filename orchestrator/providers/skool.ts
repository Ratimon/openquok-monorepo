import { attachFollowUpCommentMedia } from "./scheduledPublish/followUpCommentMedia.js";
import type { ScheduledPublishProviderHooks } from "./scheduledPublish/types.js";

/** Skool comments need the same group (and category) as the root post — replies do not carry their own. */
function skoolProviderSettingsForFollowUpComment(
    rootProviderSettings: Record<string, unknown> | null
): Record<string, unknown> | null {
    if (!rootProviderSettings) return null;
    const copy: Record<string, unknown> = { ...rootProviderSettings };
    const skool = copy.skool;
    if (skool && typeof skool === "object" && !Array.isArray(skool)) {
        const { replies: _omit, ...skoolWithoutReplies } = skool as Record<string, unknown>;
        copy.skool = skoolWithoutReplies;
    }
    return copy;
}

export const skoolScheduledPublishHooks: ScheduledPublishProviderHooks = {
    displayName: "Skool",
    supportsFollowUpComments: true,
    supportsThreadFinisher: false,
    buildFollowUpCommentSettings: ({ media, rootProviderSettings }) => {
        const out: Record<string, unknown> = {};
        const ps = skoolProviderSettingsForFollowUpComment(rootProviderSettings);
        if (ps) {
            out.providerSettings = ps;
        }
        return attachFollowUpCommentMedia(out, media, "skool");
    },
};
