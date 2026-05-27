import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const ALG = "sha256";
const SEP = ".";

/** Workspace invite link lifetime (email + join-org validation). */
export const INVITE_TOKEN_TTL_MS = 60 * 60 * 1000;
export const INVITE_TOKEN_TTL_HOURS = 1;

export interface InviteTokenPayload {
    email: string;
    organizationId: string;
    workspaceRole: "user" | "admin";
    expiresAt: string; // ISO
    id: string;
}

export type InviteTokenInvalidReason =
    | "missing_secret"
    | "malformed"
    | "invalid_signature"
    | "expired";

export type DecodeInviteTokenResult =
    | { ok: true; payload: InviteTokenPayload }
    | { ok: false; reason: InviteTokenInvalidReason };

function base64UrlEncode(buf: Buffer): string {
    return buf.toString("base64url");
}

function base64UrlDecode(str: string): Buffer {
    return Buffer.from(str, "base64url");
}

/**
 * Sign an invite payload. Returns a token string (payload.signature).
 * Secret: SECURITY_SECRET (`config.auth.inviteTokenSecret`).
 */
export function signInviteToken(payload: Omit<InviteTokenPayload, "expiresAt" | "id">, secret: string): string {
    if (!secret) {
        throw new Error("Invite token secret is not configured (set SECURITY_SECRET)");
    }
    const expiresAt = new Date(Date.now() + INVITE_TOKEN_TTL_MS).toISOString();
    const id = randomBytes(6).toString("hex");
    const full: InviteTokenPayload = { ...payload, expiresAt, id };
    const raw = JSON.stringify(full);
    const payloadB64 = base64UrlEncode(Buffer.from(raw, "utf8"));
    const sig = createHmac(ALG, secret).update(payloadB64).digest();
    return `${payloadB64}${SEP}${base64UrlEncode(sig)}`;
}

/**
 * Verify signature and expiry without treating expiry as a malformed token.
 */
export function decodeInviteToken(token: string, secret: string): DecodeInviteTokenResult {
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
        const payload = JSON.parse(raw) as InviteTokenPayload;
        if (new Date(payload.expiresAt).getTime() < Date.now()) {
            return { ok: false, reason: "expired" };
        }
        return { ok: true, payload };
    } catch {
        return { ok: false, reason: "malformed" };
    }
}

/**
 * Verify and decode an invite token. Returns payload or null if invalid/expired.
 */
export function verifyInviteToken(token: string, secret: string): InviteTokenPayload | null {
    const decoded = decodeInviteToken(token, secret);
    return decoded.ok ? decoded.payload : null;
}
