import crypto from "node:crypto";

/**
 * Field-level AES-256-GCM for `integrations.token` / `integrations.refresh_token`.
 * Format: `enc:v1:` + base64url(iv || ciphertext || authTag). Random 12-byte IV per value.
 * Legacy plaintext (no prefix) decrypts as a no-op so existing rows keep working until rewritten.
 */

export const INTEGRATION_TOKEN_CIPHER_PREFIX = "enc:v1:";

const IV_BYTES = 12;
const AUTH_TAG_BYTES = 16;

function deriveAesKey(keyMaterial: string): Buffer {
    return crypto.createHash("sha256").update(String(keyMaterial), "utf8").digest();
}

export function isEncryptedIntegrationSecret(value: string | null | undefined): boolean {
    return typeof value === "string" && value.startsWith(INTEGRATION_TOKEN_CIPHER_PREFIX);
}

/**
 * Encrypt a provider secret for at-rest storage.
 * Empty plaintext stays empty. Empty key material leaves the value unchanged (dev / unset).
 * Already-prefixed ciphertext is returned as-is (idempotent).
 */
export function encryptIntegrationSecret(
    plaintext: string | null | undefined,
    keyMaterial: string
): string | null {
    if (plaintext == null) return null;
    const raw = String(plaintext);
    if (raw === "") return "";
    if (isEncryptedIntegrationSecret(raw)) return raw;
    const key = String(keyMaterial ?? "").trim();
    if (!key) return raw;

    const iv = crypto.randomBytes(IV_BYTES);
    const cipher = crypto.createCipheriv("aes-256-gcm", deriveAesKey(key), iv);
    const encrypted = Buffer.concat([cipher.update(raw, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    const packed = Buffer.concat([iv, encrypted, tag]);
    return `${INTEGRATION_TOKEN_CIPHER_PREFIX}${packed.toString("base64url")}`;
}

/**
 * Decrypt a stored secret. Legacy plaintext (no prefix) is returned unchanged.
 * Prefixed ciphertext with a missing key throws — callers must configure the key once encryption is enabled.
 */
export function decryptIntegrationSecret(
    stored: string | null | undefined,
    keyMaterial: string
): string | null {
    if (stored == null) return null;
    const raw = String(stored);
    if (raw === "") return "";
    if (!isEncryptedIntegrationSecret(raw)) return raw;

    const key = String(keyMaterial ?? "").trim();
    if (!key) {
        throw new Error(
            "INTEGRATIONS_TOKEN_ENCRYPTION_KEY (or SECURITY_SECRET fallback) is required to decrypt channel tokens"
        );
    }

    const packed = Buffer.from(raw.slice(INTEGRATION_TOKEN_CIPHER_PREFIX.length), "base64url");
    if (packed.length < IV_BYTES + AUTH_TAG_BYTES + 1) {
        throw new Error("Invalid encrypted integration secret");
    }
    const iv = packed.subarray(0, IV_BYTES);
    const tag = packed.subarray(packed.length - AUTH_TAG_BYTES);
    const ciphertext = packed.subarray(IV_BYTES, packed.length - AUTH_TAG_BYTES);
    const decipher = crypto.createDecipheriv("aes-256-gcm", deriveAesKey(key), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
