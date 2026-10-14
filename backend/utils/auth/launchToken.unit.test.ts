import { decodeLaunchToken, signLaunchToken, verifyLaunchToken } from "./launchToken.js";

const secret = "unit-test-launch-token-secret";

describe("launchToken", () => {
    it("round-trips a signed payload", () => {
        const token = signLaunchToken(
            {
                submissionId: "11111111-1111-1111-1111-111111111111",
                organizationId: "22222222-2222-2222-2222-222222222222",
                destinationId: "33333333-3333-3333-3333-333333333333",
                providerSlug: "uneed-join-line",
            },
            secret
        );

        const payload = verifyLaunchToken(token, secret);
        expect(payload).toMatchObject({
            submissionId: "11111111-1111-1111-1111-111111111111",
            organizationId: "22222222-2222-2222-2222-222222222222",
            destinationId: "33333333-3333-3333-3333-333333333333",
            providerSlug: "uneed-join-line",
        });
    });

    it("rejects tampered tokens", () => {
        const token = signLaunchToken(
            {
                submissionId: "a",
                organizationId: "b",
                destinationId: "c",
                providerSlug: "uneed-join-line",
            },
            secret
        );
        const decoded = decodeLaunchToken(`${token}x`, secret);
        expect(decoded.ok).toBe(false);
    });
});
