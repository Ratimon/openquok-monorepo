import {
    applyTrustedListingDofollowOnComplete,
    mergeSubmissionListingEvidence,
} from "./submissionListingEvidence";

describe("applyTrustedListingDofollowOnComplete", () => {
    it("sets listingDofollow true when catalog is dofollow", () => {
        const evidence = applyTrustedListingDofollowOnComplete(
            { listingDofollow: false },
            "dofollow"
        );
        expect(evidence.listingDofollow).toBe(true);
    });

    it("sets listingDofollow false when catalog is nofollow", () => {
        const evidence = applyTrustedListingDofollowOnComplete(
            mergeSubmissionListingEvidence({}, { listingDofollow: true }),
            "nofollow"
        );
        expect(evidence.listingDofollow).toBe(false);
    });

    it("preserves user checkbox when catalog link type is unknown", () => {
        const evidence = applyTrustedListingDofollowOnComplete(
            { listingDofollow: true },
            "unknown"
        );
        expect(evidence.listingDofollow).toBe(true);
    });
});
