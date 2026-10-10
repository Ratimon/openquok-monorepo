import { skoolScheduledPublishHooks } from "./skool.js";

describe("skoolScheduledPublishHooks", () => {
    it("copies root skool group onto follow-up comment settings without replies bucket", () => {
        const settings = skoolScheduledPublishHooks.buildFollowUpCommentSettings?.({
            rootProviderSettings: {
                skool: {
                    group: "group-abc",
                    label: "label-xyz",
                    title: "Weekly",
                    replies: [{ id: "r1", message: "hi", delaySeconds: 0 }],
                },
            },
        });
        expect(settings).toEqual({
            providerSettings: {
                skool: {
                    group: "group-abc",
                    label: "label-xyz",
                    title: "Weekly",
                },
            },
        });
    });
});
