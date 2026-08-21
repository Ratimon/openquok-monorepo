import {
    decryptIntegrationSecret,
    encryptIntegrationSecret,
    INTEGRATION_TOKEN_CIPHER_PREFIX,
    isEncryptedIntegrationSecret,
} from "./integrationTokenCrypto";

describe("integrationTokenCrypto", () => {
    const key = "unit-test-integrations-token-key";

    it("round-trips plaintext through AES-GCM", () => {
        const cipher = encryptIntegrationSecret("provider-access-token", key);
        expect(cipher).toMatch(new RegExp(`^${INTEGRATION_TOKEN_CIPHER_PREFIX}`));
        expect(cipher).not.toContain("provider-access-token");
        expect(decryptIntegrationSecret(cipher, key)).toBe("provider-access-token");
    });

    it("uses a fresh IV so identical plaintext yields different ciphertext", () => {
        const a = encryptIntegrationSecret("same-secret", key);
        const b = encryptIntegrationSecret("same-secret", key);
        expect(a).not.toEqual(b);
        expect(decryptIntegrationSecret(a, key)).toBe("same-secret");
        expect(decryptIntegrationSecret(b, key)).toBe("same-secret");
    });

    it("leaves legacy plaintext unchanged on decrypt", () => {
        expect(decryptIntegrationSecret("legacy-plaintext-token", key)).toBe("legacy-plaintext-token");
        expect(isEncryptedIntegrationSecret("legacy-plaintext-token")).toBe(false);
    });

    it("is idempotent when encrypting already-prefixed ciphertext", () => {
        const once = encryptIntegrationSecret("tok", key)!;
        expect(encryptIntegrationSecret(once, key)).toBe(once);
    });

    it("passes through when key material is empty (encryption disabled)", () => {
        expect(encryptIntegrationSecret("tok", "")).toBe("tok");
        expect(encryptIntegrationSecret("tok", "   ")).toBe("tok");
    });

    it("preserves null and empty strings", () => {
        expect(encryptIntegrationSecret(null, key)).toBeNull();
        expect(encryptIntegrationSecret("", key)).toBe("");
        expect(decryptIntegrationSecret(null, key)).toBeNull();
        expect(decryptIntegrationSecret("", key)).toBe("");
    });

    it("throws when decrypting ciphertext without a key", () => {
        const cipher = encryptIntegrationSecret("tok", key)!;
        expect(() => decryptIntegrationSecret(cipher, "")).toThrow(/INTEGRATIONS_TOKEN_ENCRYPTION_KEY/);
    });

    it("throws on tampered ciphertext", () => {
        const cipher = encryptIntegrationSecret("tok", key)!;
        const tampered = `${cipher.slice(0, -4)}xxxx`;
        expect(() => decryptIntegrationSecret(tampered, key)).toThrow();
    });
});
