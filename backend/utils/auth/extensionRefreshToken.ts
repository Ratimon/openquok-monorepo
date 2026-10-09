import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const ALG = "sha256";
const SEP = ".";

/** Extension-stored JWT for periodic cookie refresh (browser extension alarm). */
export const EXTENSION_REFRESH_TOKEN_TTL_MS = 400 * 24 * 60 * 60 * 1000;

export interface ExtensionRefreshTokenPayload {
    integrationId: string;
    organizationId: string;
    internalId: string;
    provider: string;
    expiresAt: string;
    id: string;
}

export type ExtensionRefreshTokenInvalidReason =
    | "missing_secret"
    | "malformed"
    | "invalid_signature"
    | "expired";

export type DecodeExtensionRefreshTokenResult =
    | { ok: true; payload: ExtensionRefreshTokenPayload }
    | { ok: false; reason: ExtensionRefreshTokenInvalidReason };

function base64UrlEncode(buf: Buffer): string {
    return buf.toString("base64url");
}

function base64UrlDecode(str: string): Buffer {
    return Buffer.from(str, "base64url");
}

export function signExtensionRefreshToken(
    payload: Omit<ExtensionRefreshTokenPayload, "expiresAt" | "id">,
    secret: string
): string {
    if (!secret) {
        throw new Error("Extension refresh token secret is not configured (set SECURITY_SECRET)");
    }
    const expiresAt = new Date(Date.now() + EXTENSION_REFRESH_TOKEN_TTL_MS).toISOString();
    const id = randomBytes(6).toString("hex");
    const full: ExtensionRefreshTokenPayload = { ...payload, expiresAt, id };
    const raw = JSON.stringify(full);
    const payloadB64 = base64UrlEncode(Buffer.from(raw, "utf8"));
    const sig = createHmac(ALG, secret).update(payloadB64).digest();
    return `${payloadB64}${SEP}${base64UrlEncode(sig)}`;
}

export function decodeExtensionRefreshToken(
    token: string,
    secret: string
): DecodeExtensionRefreshTokenResult {
    if (!secret) return { ok: false, reason: "missing_secret" };
    if (!token?.trim()) return { ok: false, reason: "malformed" };
    const idx = token.lastIndexOf(SEP);
    if (idx === -1) return { ok: false, reason: "malformed" };
    const payloadB64 = token.slice(0, idx);
    const sigB64 = token.slice(idx + 1);
    try {
        const expectedSig = createHmac(ALG, secret).update(payloadB64).digest();
        const actualSig = base64UrlDecode(sigB64);
        if (actualSig.length !== expectedSig.length || !timingSafeEqual(actualSig, expectedSig)) {
            return { ok: false, reason: "invalid_signature" };
        }
        const raw = base64UrlDecode(payloadB64).toString("utf8");
        const payload = JSON.parse(raw) as ExtensionRefreshTokenPayload;
        if (new Date(payload.expiresAt).getTime() < Date.now()) {
            return { ok: false, reason: "expired" };
        }
        return { ok: true, payload };
    } catch {
        return { ok: false, reason: "malformed" };
    }
}

export function verifyExtensionRefreshToken(
    token: string,
    secret: string
): ExtensionRefreshTokenPayload | null {
    const decoded = decodeExtensionRefreshToken(token, secret);
    return decoded.ok ? decoded.payload : null;
}
