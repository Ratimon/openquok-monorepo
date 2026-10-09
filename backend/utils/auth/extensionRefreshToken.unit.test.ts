import {
    decodeExtensionRefreshToken,
    signExtensionRefreshToken,
    verifyExtensionRefreshToken,
} from "./extensionRefreshToken.js";

const secret = "unit-test-extension-refresh-secret";

describe("extensionRefreshToken", () => {
    it("round-trips a signed payload", () => {
        const token = signExtensionRefreshToken(
            {
                integrationId: "11111111-1111-1111-1111-111111111111",
                organizationId: "22222222-2222-2222-2222-222222222222",
                internalId: "skool-user",
                provider: "skool",
            },
            secret
        );

        const payload = verifyExtensionRefreshToken(token, secret);
        expect(payload).toMatchObject({
            integrationId: "11111111-1111-1111-1111-111111111111",
            organizationId: "22222222-2222-2222-2222-222222222222",
            internalId: "skool-user",
            provider: "skool",
        });
    });

    it("rejects tampered tokens", () => {
        const token = signExtensionRefreshToken(
            {
                integrationId: "a",
                organizationId: "b",
                internalId: "c",
                provider: "skool",
            },
            secret
        );
        const decoded = decodeExtensionRefreshToken(`${token}x`, secret);
        expect(decoded.ok).toBe(false);
    });
});
