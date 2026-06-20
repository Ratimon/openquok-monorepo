import { describe, expect, it } from "@jest/globals";
import { LinkedInProvider } from "./linkedinProvider";

describe("LinkedInProvider company tool", () => {
    it("rejects invalid company URLs", async () => {
        const provider = new LinkedInProvider();
        await expect(
            provider.company("token", { url: "https://example.com/acme" }, "user-1", {} as never)
        ).rejects.toThrow(/Invalid LinkedIn company URL/);
    });
});

describe("LinkedInProvider internal plug catalog", () => {
    it("exposes cross-account comment and repost plugs", () => {
        const provider = new LinkedInProvider();
        const plugs = provider.internalPlugCatalog?.() ?? [];
        expect(plugs.map((p) => p.identifier)).toEqual(
            expect.arrayContaining(["linkedin-add-comment", "linkedin-repost-post-users"])
        );
    });

    it("exposes company resolver in tools()", () => {
        const provider = new LinkedInProvider();
        expect(provider.tools?.().map((t) => t.methodName)).toContain("company");
    });
});
