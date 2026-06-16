import {
    mapTiktokApiErrorCode,
    mapTiktokFailReason,
    parseTiktokApiEnvelope,
} from "./tiktokApiErrors.js";

describe("mapTiktokApiErrorCode", () => {
    it("maps known API error codes", () => {
        expect(mapTiktokApiErrorCode("url_ownership_unverified")).toContain("Verify your media domain");
        expect(mapTiktokApiErrorCode("scope_not_authorized")).toContain("video.publish");
    });

    it("falls back to message or generic text", () => {
        expect(mapTiktokApiErrorCode("unknown_code", "Custom message")).toBe("Custom message");
        expect(mapTiktokApiErrorCode(undefined)).toBe("TikTok request failed");
    });
});

describe("mapTiktokFailReason", () => {
    it("maps publish fail reasons", () => {
        expect(mapTiktokFailReason("video_pull_failed")).toContain("could not download the video URL");
    });
});

describe("parseTiktokApiEnvelope", () => {
    it("treats error.code ok as success", () => {
        expect(
            parseTiktokApiEnvelope({
                data: { publish_id: "pub-1" },
                error: { code: "ok", message: "" },
            })
        ).toMatchObject({ ok: true, data: { publish_id: "pub-1" } });
    });
});
