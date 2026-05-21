import crypto from "node:crypto";

/**
 * Hash a programmatic bearer token with a server-side pepper.
 * - Raw token is never stored.
 * - Pepper must be kept secret (env var).
 */
export function hashProgrammaticToken(rawToken: string, pepper: string): string {
    const token = String(rawToken ?? "").trim();
    const p = String(pepper ?? "").trim();
    // Deterministic HMAC (pepper as key) is safer than fixed-IV encryption.
    // Prefix so we can migrate/recognize hash versions.
    const hex = crypto.createHmac("sha256", p).update(token, "utf8").digest("hex");
    return `hmac_sha256:${hex}`;
}

/**
 * Backward compatible hashing (older rows stored as raw sha256 hex).
 */
export function hashProgrammaticTokenCandidates(rawToken: string, pepper: string): string[] {
    const token = String(rawToken ?? "").trim();
    const p = String(pepper ?? "").trim();
    const v2 = hashProgrammaticToken(token, p);
    const legacy = crypto.createHash("sha256").update(`${token}:${p}`).digest("hex");
    return [v2, legacy];
}

export function timingSafeEqualHexOrPrefixed(a: string, b: string): boolean {
    const aa = String(a ?? "");
    const bb = String(b ?? "");
    if (aa.length !== bb.length) return false;
    const ba = Buffer.from(aa, "utf8");
    const bbuff = Buffer.from(bb, "utf8");
    return crypto.timingSafeEqual(ba, bbuff);
}

