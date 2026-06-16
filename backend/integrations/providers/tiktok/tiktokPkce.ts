import { createHash, randomBytes } from "node:crypto";

/** TikTok OAuth v2 PKCE pair (code_challenge is SHA-256 hex digest of code_verifier). */
export function generateTiktokPkcePair(): { codeVerifier: string; codeChallenge: string } {
    const codeVerifier = randomBytes(48).toString("base64url").slice(0, 64);
    const codeChallenge = createHash("sha256").update(codeVerifier).digest("hex");
    return { codeVerifier, codeChallenge };
}
