import { BlueskyProvider } from "./blueskyProvider.js";

describe("BlueskyProvider", () => {
    const provider = new BlueskyProvider();

    it("exposes catalog metadata", () => {
        expect(provider.identifier).toBe("bluesky");
        expect(provider.maxLength()).toBe(300);
        expect(provider.editor).toBe("normal");
    });

    it("formats mentions as @handle", () => {
        expect(provider.mentionFormat!("bob.bsky.social", "Bob")).toBe("@bob.bsky.social");
    });

    it("validates media mix on create", () => {
        const err = provider.validateCreatePost!({
            status: "scheduled",
            mediaCount: 2,
            message: "",
            providerSettings: {
                media: { items: [{ path: "a.mp4" }, { path: "b.jpg" }] },
            },
        });
        expect(err).toMatch(/mixing/);
    });

    it("requires text or media when scheduling", () => {
        const err = provider.validateCreatePost!({
            status: "scheduled",
            mediaCount: 0,
            message: "   ",
            providerSettings: {},
        });
        expect(err).toMatch(/requires text or at least one/);
    });

    it("seeds custom fields with default service URL", async () => {
        const fields = await provider.customFields!();
        const service = fields.find((f) => f.key === "service");
        expect(service?.defaultValue).toBe("https://bsky.social");
        expect(fields).toHaveLength(3);
    });
});
