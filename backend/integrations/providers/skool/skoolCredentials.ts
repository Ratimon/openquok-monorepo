export type SkoolSessionCookies = Record<string, string>;

/** Matches `extensionCookies` on {@link SkoolProvider} and the shared browser-extension catalog. */
export const SKOOL_REQUIRED_COOKIE_NAMES = ["auth_token", "client_id"] as const;

export function decodeSkoolConnectCode(code: string): SkoolSessionCookies {
    try {
        const raw = Buffer.from(code.trim(), "base64").toString("utf8");
        const parsed = JSON.parse(raw) as SkoolSessionCookies;
        if (!parsed || typeof parsed !== "object") {
            throw new Error("Invalid cookie payload");
        }
        const out: SkoolSessionCookies = {};
        for (const [key, value] of Object.entries(parsed)) {
            if (typeof value === "string" && value.trim()) {
                out[key] = value.trim();
            }
        }
        const missing = SKOOL_REQUIRED_COOKIE_NAMES.filter((name) => !out[name]);
        if (missing.length > 0) {
            throw new Error(`Missing required cookies: ${missing.join(", ")}`);
        }
        return out;
    } catch (e) {
        const message = e instanceof Error ? e.message : "Invalid cookie data";
        throw new Error(message);
    }
}

export function parseSkoolSessionToken(accessToken: string): SkoolSessionCookies {
    try {
        const parsed = JSON.parse(accessToken) as SkoolSessionCookies;
        if (!parsed || typeof parsed !== "object") {
            throw new Error("Invalid stored session");
        }
        const missing = SKOOL_REQUIRED_COOKIE_NAMES.filter((name) => !parsed[name]?.trim());
        if (missing.length > 0) {
            throw new Error(`Missing session cookies: ${missing.join(", ")}`);
        }
        return parsed;
    } catch (e) {
        const message = e instanceof Error ? e.message : "Invalid stored session";
        throw new Error(message);
    }
}

export function serializeSkoolSessionToken(cookies: SkoolSessionCookies): string {
    return JSON.stringify(cookies);
}

export function skoolCookieHeader(cookies: SkoolSessionCookies): string {
    return Object.entries(cookies)
        .filter(([, value]) => typeof value === "string" && value.length > 0)
        .map(([name, value]) => `${name}=${value}`)
        .join("; ");
}
