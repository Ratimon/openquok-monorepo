import { faker } from "@faker-js/faker";

import {
    formatSchedulePostToolOutput,
    mapPostsAndCommentsForIntegration,
    mapSchedulePostToolInput,
    mapSchedulePostType,
    mergeProviderSettings,
} from "./schedulePostTool.adapter";

faker.seed(88_001);

describe("schedulePostTool.adapter", () => {
    const threadsIntegrationId = faker.string.uuid();
    const facebookIntegrationId = faker.string.uuid();

    describe("mapSchedulePostType", () => {
        it("maps draft to draft status with a timestamp", () => {
            const out = mapSchedulePostType("draft");
            expect(out.status).toBe("draft");
            expect(new Date(out.scheduledAtIso).getTime()).not.toBeNaN();
        });

        it("maps now to scheduled status at current time", () => {
            const before = Date.now();
            const out = mapSchedulePostType("now");
            const after = Date.now();
            expect(out.status).toBe("scheduled");
            const ts = new Date(out.scheduledAtIso).getTime();
            expect(ts).toBeGreaterThanOrEqual(before);
            expect(ts).toBeLessThanOrEqual(after);
        });

        it("maps schedule with explicit date", () => {
            const iso = "2026-06-25T15:00:00.000Z";
            const out = mapSchedulePostType("schedule", iso);
            expect(out).toEqual({ status: "scheduled", scheduledAtIso: iso });
        });

        it("throws when schedule type has no date", () => {
            expect(() => mapSchedulePostType("schedule")).toThrow("`date` is required");
        });
    });

    describe("mapPostsAndCommentsForIntegration", () => {
        it("maps comment-platform follow-ups into provider reply buckets", () => {
            const out = mapPostsAndCommentsForIntegration({
                postsAndComments: ["Main post", "First reply", "Second reply"],
                providerIdentifier: "facebook",
            });
            expect(out.body).toBe("Main post");
            expect(out.providerSettings.threads).toMatchObject({
                replies: [
                    expect.objectContaining({ message: "First reply" }),
                    expect.objectContaining({ message: "Second reply" }),
                ],
            });
        });

        it("maps thread-style providers into reply buckets", () => {
            const out = mapPostsAndCommentsForIntegration({
                postsAndComments: ["Post 1", "Post 2"],
                providerIdentifier: "threads",
            });
            expect(out.body).toBe("Post 1");
            expect(out.providerSettings.threads).toMatchObject({
                replies: [expect.objectContaining({ message: "Post 2" })],
            });
        });

        it("maps x follow-ups into the x bucket", () => {
            const out = mapPostsAndCommentsForIntegration({
                postsAndComments: ["Tweet", "Reply"],
                providerIdentifier: "x",
            });
            expect(out.providerSettings.x).toMatchObject({
                replies: [expect.objectContaining({ message: "Reply" })],
            });
        });
    });

    describe("mergeProviderSettings", () => {
        it("merges nested reply settings without dropping explicit settings", () => {
            const merged = mergeProviderSettings(
                { threads: { active: true }, url: "https://example.com" },
                { threads: { replies: [{ id: "r1", message: "hi", delaySeconds: 0 }] } }
            );
            expect(merged).toEqual({
                threads: { active: true, replies: [{ id: "r1", message: "hi", delaySeconds: 0 }] },
                url: "https://example.com",
            });
        });
    });

    describe("mapSchedulePostToolInput", () => {
        it("builds programmatic create input from socialPost entries", () => {
            const mapped = mapSchedulePostToolInput({
                input: {
                    type: "schedule",
                    date: "2026-06-25T12:00:00.000Z",
                    socialPost: [
                        {
                            integration: threadsIntegrationId,
                            postsAndComments: ["Hello threads", "Follow-up"],
                            settings: { threads: { active: true } },
                        },
                        {
                            integration: facebookIntegrationId,
                            postsAndComments: ["Facebook body"],
                        },
                    ],
                },
                integrationProviderById: {
                    [threadsIntegrationId]: "threads",
                    [facebookIntegrationId]: "facebook",
                },
                mediaByIntegrationId: {
                    [threadsIntegrationId]: [{ id: "media-1", path: "org/media-1.png" }],
                },
            });

            expect(mapped.createInput.status).toBe("scheduled");
            expect(mapped.createInput.scheduledAtIso).toBe("2026-06-25T12:00:00.000Z");
            expect(mapped.createInput.integrationIds).toEqual([threadsIntegrationId, facebookIntegrationId]);
            expect(mapped.createInput.isGlobal).toBe(true);
            expect(mapped.createInput.bodiesByIntegrationId).toEqual({
                [threadsIntegrationId]: "Hello threads",
                [facebookIntegrationId]: "Facebook body",
            });
            expect(mapped.createInput.media).toEqual([{ id: "media-1", path: "org/media-1.png" }]);
            expect(mapped.createInput.providerSettingsByIntegrationId?.[threadsIntegrationId]).toMatchObject({
                threads: expect.objectContaining({
                    active: true,
                    replies: [expect.objectContaining({ message: "Follow-up" })],
                }),
            });
            expect(mapped.createInput.isAgent).toBe(true);
        });
    });

    describe("formatSchedulePostToolOutput", () => {
        it("returns postId and integration identifier per created row", () => {
            const postId = faker.string.uuid();
            const out = formatSchedulePostToolOutput(
                [{ id: postId, integration_id: threadsIntegrationId }],
                { [threadsIntegrationId]: "threads" }
            );
            expect(out).toEqual({
                output: [{ postId, integration: "threads" }],
            });
        });
    });
});
