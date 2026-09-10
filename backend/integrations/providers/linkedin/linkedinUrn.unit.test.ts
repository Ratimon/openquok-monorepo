import { describe, expect, it } from "@jest/globals";

import {
    encodeLinkedInUrnForRestPath,
    linkedInActivityUrnFromPostUrn,
    linkedInReshareParentCandidates,
    linkedInRestSocialActionCommentsUrl,
    normalizeLinkedInPostUrnForSocialAction,
} from "./linkedinUrn";

describe("linkedinUrn helpers", () => {
    it("normalizes activity URNs to share URNs for social actions", () => {
        expect(normalizeLinkedInPostUrnForSocialAction("urn:li:activity:7503820346815336448")).toBe(
            "urn:li:share:7503820346815336448"
        );
    });

    it("builds activity object URNs from share ids", () => {
        expect(linkedInActivityUrnFromPostUrn("urn:li:share:7503820346815336448")).toBe(
            "urn:li:activity:7503820346815336448"
        );
    });

    it("URL-encodes REST socialActions comment paths", () => {
        expect(linkedInRestSocialActionCommentsUrl("urn:li:share:7503820346815336448")).toBe(
            `https://api.linkedin.com/rest/socialActions/${encodeLinkedInUrnForRestPath("urn:li:share:7503820346815336448")}/comments`
        );
    });

    it("offers share and ugcPost reshare parent fallbacks", () => {
        expect(linkedInReshareParentCandidates("urn:li:share:123")).toEqual([
            "urn:li:share:123",
            "urn:li:ugcPost:123",
        ]);
    });
});
