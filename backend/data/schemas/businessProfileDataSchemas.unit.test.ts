import {
    BUSINESS_PROFILE_MAX_GALLERY_URLS,
    BUSINESS_PROFILE_MAX_TAGS,
    BUSINESS_PROFILE_SELLING_REASON_MIN_LENGTH,
} from "openquok-common";
import {
    businessProfileDataSchema,
    parseBusinessProfileDataInput,
    parseBusinessProfileDataPatch,
} from "./businessProfileDataSchemas";

describe("businessProfileDataSchema", () => {
    it("accepts an empty object", () => {
        const result = businessProfileDataSchema.safeParse({});
        expect(result.success).toBe(true);
    });

    it("rejects more than three tags", () => {
        const result = businessProfileDataSchema.safeParse({
            tags: ["a", "b", "c", "d"],
        });
        expect(result.success).toBe(false);
    });

    it("rejects more than three gallery paths", () => {
        const result = businessProfileDataSchema.safeParse({
            gallery_urls: ["org/p/1.png", "org/p/2.png", "org/p/3.png", "org/p/4.png"],
        });
        expect(result.success).toBe(false);
    });

    it("rejects a short selling reason when acquisition is listed", () => {
        const result = businessProfileDataSchema.safeParse({
            acquisition_listed: true,
            selling_reason: "too short",
        });
        expect(result.success).toBe(false);
    });

    it("accepts acquisition listing with a long enough selling reason", () => {
        const result = businessProfileDataSchema.safeParse({
            acquisition_listed: true,
            selling_reason: "Focusing on a different product line and want a clean handoff.",
        });
        expect(result.success).toBe(true);
    });

    it("rejects unknown keys via strict mode", () => {
        const result = businessProfileDataSchema.safeParse({
            pricing_type: "free",
            internal_note: "nope",
        });
        expect(result.success).toBe(false);
    });

    it(`accepts up to ${BUSINESS_PROFILE_MAX_TAGS} tags and ${BUSINESS_PROFILE_MAX_GALLERY_URLS} gallery paths`, () => {
        const result = businessProfileDataSchema.safeParse({
            tags: ["alpha", "beta", "gamma"],
            gallery_urls: ["org/p/1.png", "org/p/2.png", "org/p/3.png"],
            pricing_type: "freemium",
        });
        expect(result.success).toBe(true);
    });

    it("rejects invalid repository URLs and invalid included asset slugs", () => {
        expect(
            businessProfileDataSchema.safeParse({ repository_url: "not-a-url" }).success
        ).toBe(false);
        expect(
            businessProfileDataSchema.safeParse({ included_assets: ["domain", "not_real"] }).success
        ).toBe(false);
    });

    it("rejects a short selling reason when provided, even if acquisition is not listed", () => {
        const result = businessProfileDataSchema.safeParse({
            acquisition_listed: false,
            selling_reason: "short",
        });
        expect(result.success).toBe(false);
        expect(result.error?.issues.some((i) => i.path[0] === "selling_reason")).toBe(true);
    });

    it(`requires selling reason length ${BUSINESS_PROFILE_SELLING_REASON_MIN_LENGTH}+ when listed`, () => {
        const result = businessProfileDataSchema.safeParse({
            acquisition_listed: true,
            selling_reason: "x".repeat(BUSINESS_PROFILE_SELLING_REASON_MIN_LENGTH - 1),
        });
        expect(result.success).toBe(false);
    });
});

describe("parseBusinessProfileDataInput", () => {
    it("normalizes empty input to an empty object", () => {
        expect(parseBusinessProfileDataInput(undefined)).toEqual({});
    });

    it("parses a full patch object", () => {
        expect(
            parseBusinessProfileDataPatch({
                social_x: "https://x.com/acme",
                included_assets: ["domain", "source_code"],
            })
        ).toEqual({
            social_x: "https://x.com/acme",
            included_assets: ["domain", "source_code"],
        });
    });
});
