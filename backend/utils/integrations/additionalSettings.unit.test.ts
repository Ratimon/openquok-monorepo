import {
    isVerifiedFromAdditionalSettings,
    parseAdditionalSettings,
} from "./additionalSettings.js";

describe("parseAdditionalSettings", () => {
    it("returns an empty array for empty, null, or undefined input", () => {
        expect(parseAdditionalSettings(undefined)).toEqual([]);
        expect(parseAdditionalSettings(null)).toEqual([]);
        expect(parseAdditionalSettings("")).toEqual([]);
    });

    it("returns an empty array for malformed JSON", () => {
        expect(parseAdditionalSettings("{not-json")).toEqual([]);
    });

    it("returns an empty array when JSON is not an array", () => {
        expect(parseAdditionalSettings(JSON.stringify({ title: "Verified", value: true }))).toEqual([]);
    });

    it("returns the parsed array of setting rows", () => {
        const rows = [{ title: "Verified", value: true }];
        expect(parseAdditionalSettings(JSON.stringify(rows))).toEqual(rows);
    });
});

describe("isVerifiedFromAdditionalSettings", () => {
    it("is true only when a Verified row has boolean true", () => {
        expect(isVerifiedFromAdditionalSettings([{ title: "Verified", value: true }])).toBe(true);
        expect(isVerifiedFromAdditionalSettings([{ title: "Verified", value: "true" }])).toBe(false);
        expect(isVerifiedFromAdditionalSettings([{ title: "Verified", value: false }])).toBe(false);
        expect(isVerifiedFromAdditionalSettings([])).toBe(false);
        expect(isVerifiedFromAdditionalSettings([{ title: "Other", value: true }])).toBe(false);
    });
});
