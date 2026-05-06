import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const ALG = "sha256";
const SEP = ".";
const TTL_MS = 60 * 60 * 1000; // 1 hour

export interface InviteTokenPayload {
    email: string;
    organizationId: string;
    workspaceRole: "user" | "admin";
    expiresAt: string; // ISO
    id: string;
}

function base64UrlEncode(buf: Buffer): string {
    return buf.toString("base64url");
}

function base64UrlDecode(str: string): Buffer {
    return Buffer.from(str, "base64url");
}

/**
 * Sign an invite payload. Returns a token string (payload.signature).
 * Secret: SECURITY_SECRET.
 */
export function signInviteToken(payload: Omit<InviteTokenPayload, "expiresAt" | "id">, secret: string): string {
    if (!secret) {
        throw new Error("Invite token secret is not configured (set SECURITY_SECRET)");
    }
    const expiresAt = new Date(Date.now() + TTL_MS).toISOString();
    const id = randomBytes(6).toString("hex");
    const full: InviteTokenPayload = { ...payload, expiresAt, id };
    const raw = JSON.stringify(full);
    const payloadB64 = base64UrlEncode(Buffer.from(raw, "utf8"));
    const sig = createHmac(ALG, secret).update(payloadB64).digest();
    return `${payloadB64}${SEP}${base64UrlEncode(sig)}`;
}

/**
 * Verify and decode an invite token. Returns payload or null if invalid/expired.
 */
export function verifyInviteToken(token: string, secret: string): InviteTokenPayload | null {
    if (!secret || !token) return null;
    const idx = token.lastIndexOf(SEP);
    if (idx === -1) return null;
    const payloadB64 = token.slice(0, idx);
    const sigB64 = token.slice(idx + 1);
    try {
        const expectedSig = createHmac(ALG, secret).update(payloadB64).digest();
        const actualSig = base64UrlDecode(sigB64);
        if (actualSig.length !== expectedSig.length || !timingSafeEqual(actualSig, expectedSig)) {
            return null;
        }
        const raw = base64UrlDecode(payloadB64).toString("utf8");
        const payload = JSON.parse(raw) as InviteTokenPayload;
        if (new Date(payload.expiresAt).getTime() < Date.now()) {
            return null;
        }
        return payload;
    } catch {
        return null;
    }
}
