import {
    BLUESKY_MAX_GRAPHEMES,
    BLUESKY_MAX_UTF8_BYTES,
    blueskyGraphemeLength,
    blueskyUtf8ByteLength,
    validateBlueskyText,
} from "./blueskyText.js";

describe("blueskyText", () => {
    it("counts ASCII as one grapheme per character", () => {
        expect(blueskyGraphemeLength("hello")).toBe(5);
    });

    it("counts emoji as one grapheme", () => {
        expect(blueskyGraphemeLength("👋")).toBe(1);
        expect("👋".length).toBe(2);
    });

    it("counts graphemes at the 300 limit", () => {
        const atLimit = "a".repeat(BLUESKY_MAX_GRAPHEMES);
        expect(blueskyGraphemeLength(atLimit)).toBe(BLUESKY_MAX_GRAPHEMES);
        expect(validateBlueskyText(atLimit)).toBeNull();
        expect(validateBlueskyText(atLimit + "b")).toMatch(/grapheme limit/);
    });

    it("enforces UTF-8 byte limit", () => {
        const heavy = "\u3042".repeat(BLUESKY_MAX_UTF8_BYTES / 3);
        expect(blueskyUtf8ByteLength(heavy)).toBe(BLUESKY_MAX_UTF8_BYTES);
        expect(validateBlueskyText(heavy)).toBeNull();
        expect(validateBlueskyText(heavy + "\u3042")).toMatch(/UTF-8 byte limit/);
    });
});
