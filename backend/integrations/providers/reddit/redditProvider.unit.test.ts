import { RedditProvider } from "./redditProvider.js";
import { REDDIT_MAX_LENGTH, REDDIT_SETTINGS_SCHEMA } from "./resolveRedditSettings.js";

const provider = new RedditProvider();

function encodeManualConnect(payload: Record<string, string>): string {
    return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
}

describe("RedditProvider", () => {
    it("declares manual channel metadata", () => {
        expect(provider.identifier).toBe("reddit");
        expect(provider.isChromeExtension).toBe(false);
        expect(provider.extensionPublishMode).toBe("member_browser_handoff");
        expect(provider.maxLength()).toBe(REDDIT_MAX_LENGTH);
        expect(provider.settingsSchema()).toEqual(REDDIT_SETTINGS_SCHEMA);
    });

    it("authenticates without Reddit network calls", async () => {
        const result = await provider.authenticate({
            code: encodeManualConnect({ label: "Launch account" }),
            codeVerifier: "none",
        });

        expect(result).toMatchObject({
            name: "Launch account",
            username: "Launch account",
            accessToken: "",
            refreshToken: "",
            picture: "",
        });
        expect(typeof result === "object" && "id" in result && result.id).toBeTruthy();
    });

    it("uses default display name when label is empty", async () => {
        const result = await provider.authenticate({
            code: encodeManualConnect({ label: "" }),
            codeVerifier: "none",
        });

        expect(result).toMatchObject({
            name: "Reddit",
            username: "Reddit",
            accessToken: "",
        });
    });

    it("rejects connect code with invalid label length", async () => {
        const result = await provider.authenticate({
            code: encodeManualConnect({ label: "x".repeat(81) }),
            codeVerifier: "none",
        });
        expect(result).toMatch(/80 characters/);
    });

    it("validateCreatePost allows global copy-only posts and enforces per-channel rules", () => {
        expect(
            provider.validateCreatePost({
                status: "scheduled",
                mediaCount: 0,
                providerSettings: {},
            })
        ).toBeNull();

        expect(
            provider.validateCreatePost({
                status: "scheduled",
                mediaCount: 0,
                providerSettings: { subreddit: "r/test", title: "Hi" },
            })
        ).toBeNull();

        expect(
            provider.validateCreatePost({
                status: "scheduled",
                mediaCount: 0,
                providerSettings: { title: "Hi" },
            })
        ).toMatch(/subreddit/);

        expect(
            provider.validateCreatePost({
                status: "scheduled",
                mediaCount: 0,
                providerSettings: {
                    reddit: { subreddit: "r/test", title: "Hi" },
                },
            })
        ).toBeNull();
    });

    it("post() rejects server publish", async () => {
        await expect(
            provider.post("user", "", [], {
                id: "int",
                organization_id: "org",
                internal_id: "user",
                name: "n",
                picture: null,
                provider_identifier: "reddit",
                type: "social",
                token: "",
                refresh_token: null,
                token_expiration: null,
                root_internal_id: null,
                in_between_steps: false,
                refresh_needed: false,
                deleted_at: null,
            })
        ).rejects.toThrow(/member browser/);
    });
});
