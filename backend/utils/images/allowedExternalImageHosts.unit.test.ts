import { describe, expect, it } from "@jest/globals";

import { isAllowedExternalImageHost, isExternalCdnProfilePictureUrl } from "./allowedExternalImageHosts";

describe("allowedExternalImageHosts", () => {
    it("allows Instagram, Facebook, and LinkedIn CDN hosts", () => {
        expect(isAllowedExternalImageHost("scontent.cdninstagram.com")).toBe(true);
        expect(isAllowedExternalImageHost("cdninstagram.com")).toBe(true);
        expect(isAllowedExternalImageHost("scontent.xx.fbcdn.net")).toBe(true);
        expect(isAllowedExternalImageHost("platform-lookaside.fbsbx.com")).toBe(true);
        expect(isAllowedExternalImageHost("media.licdn.com")).toBe(true);
        expect(isAllowedExternalImageHost("media-exp1.licdn.com")).toBe(true);
    });

    it("rejects unrelated hosts", () => {
        expect(isAllowedExternalImageHost("example.com")).toBe(false);
        expect(isAllowedExternalImageHost("graph.facebook.com")).toBe(false);
        expect(isAllowedExternalImageHost("linkedin.com")).toBe(false);
        expect(isAllowedExternalImageHost("evil-licdn.com")).toBe(false);
    });

    it("matches full profile picture URLs", () => {
        expect(isExternalCdnProfilePictureUrl("https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=1")).toBe(
            true
        );
        expect(isExternalCdnProfilePictureUrl("https://media.licdn.com/dms/image/v2/abc/profile.jpg")).toBe(true);
        expect(isExternalCdnProfilePictureUrl("https://example.com/a.jpg")).toBe(false);
        expect(isExternalCdnProfilePictureUrl("not-a-url")).toBe(false);
    });
});
