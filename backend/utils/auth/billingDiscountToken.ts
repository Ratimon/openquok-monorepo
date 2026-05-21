import { createHmac, timingSafeEqual } from "node:crypto";

const PREFIX = "bd1.";
const TTL_MS = 15 * 60 * 1000;

function mustGetSecret(secret: string): string {
    const trimmed = secret.trim();
    if (!trimmed) {
        throw new Error("Billing discount token secret is not configured (set SECURITY_SECRET)");
    }
    return trimmed;
}

/** Short-lived token returned when a retention discount is offered (client may show apply UI). */
export function signBillingDiscountToken(secret: string): string {
    const key = mustGetSecret(secret);
    const exp = Date.now() + TTL_MS;
    const payload = Buffer.from(JSON.stringify({ discount: true, exp }), "utf8").toString("base64url");
    const sig = createHmac("sha256", key).update(payload).digest("base64url");
    return `${PREFIX}${payload}.${sig}`;
}

export function verifyBillingDiscountToken(token: string, secret: string): boolean {
    const key = mustGetSecret(secret);
    if (!token.startsWith(PREFIX)) return false;
    const rest = token.slice(PREFIX.length);
    const dot = rest.lastIndexOf(".");
    if (dot <= 0) return false;
    const payload = rest.slice(0, dot);
    const sig = rest.slice(dot + 1);
    const expected = createHmac("sha256", key).update(payload).digest("base64url");
    const sigBuf = Buffer.from(sig, "utf8");
    const expectedBuf = Buffer.from(expected, "utf8");
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
        return false;
    }
    try {
        const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
            discount?: boolean;
            exp?: number;
        };
        if (!parsed.discount || typeof parsed.exp !== "number") return false;
        return parsed.exp > Date.now();
    } catch {
        return false;
    }
}
