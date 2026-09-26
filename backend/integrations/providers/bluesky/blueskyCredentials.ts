import { isIP } from "node:net";
import dns from "node:dns/promises";

export type BlueskyStoredCredentials = {
    service: string;
    identifier: string;
    password: string;
};

const DEFAULT_SERVICE = "https://bsky.social";

export function normalizeBlueskyServiceUrl(raw: string): string {
    const trimmed = raw.trim();
    if (!trimmed) return DEFAULT_SERVICE;
    return trimmed.replace(/\/+$/, "");
}

function parseConnectPayload(raw: string): Record<string, unknown> {
    const decoded = Buffer.from(raw.trim(), "base64").toString("utf8");
    const parsed = JSON.parse(decoded) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Invalid account details");
    }
    return parsed as Record<string, unknown>;
}

export function decodeBlueskyConnectCode(code: string): BlueskyStoredCredentials {
    try {
        const o = parseConnectPayload(code);
        const service = normalizeBlueskyServiceUrl(
            typeof o.service === "string" && o.service.trim() ? o.service : DEFAULT_SERVICE
        );
        const identifier =
            typeof o.identifier === "string" ? o.identifier.trim() : typeof o.handle === "string" ? o.handle.trim() : "";
        const password = typeof o.password === "string" ? o.password.trim() : "";
        if (!identifier || identifier.length < 1) {
            throw new Error("Invalid account details");
        }
        if (!password || password.length < 1) {
            throw new Error("Invalid account details");
        }
        return { service, identifier, password };
    } catch (e) {
        if (e instanceof Error && e.message === "Invalid account details") throw e;
        throw new Error("Invalid account details");
    }
}

export function parseBlueskyToken(token: string): BlueskyStoredCredentials {
    const trimmed = token.trim();
    if (!trimmed) {
        throw new Error("Bluesky credentials are missing");
    }
    try {
        const parsed = JSON.parse(trimmed) as BlueskyStoredCredentials;
        if (
            typeof parsed.service !== "string" ||
            typeof parsed.identifier !== "string" ||
            typeof parsed.password !== "string"
        ) {
            throw new Error("Invalid Bluesky credentials");
        }
        return {
            service: normalizeBlueskyServiceUrl(parsed.service),
            identifier: parsed.identifier.trim(),
            password: parsed.password,
        };
    } catch {
        throw new Error("Invalid Bluesky credentials");
    }
}

export function serializeBlueskyToken(credentials: BlueskyStoredCredentials): string {
    return JSON.stringify({
        service: normalizeBlueskyServiceUrl(credentials.service),
        identifier: credentials.identifier.trim(),
        password: credentials.password,
    });
}

function isPrivateIpv4(ip: string): boolean {
    const parts = ip.split(".").map((x) => Number(x));
    if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return true;
    const [a, b] = parts;
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    return false;
}

function isPrivateIpv6(ip: string): boolean {
    const n = ip.toLowerCase();
    if (n === "::1" || n === "::") return true;
    if (n.startsWith("fc") || n.startsWith("fd")) return true;
    if (n.startsWith("fe80")) return true;
    return false;
}

function isBlockedIpAddress(ip: string): boolean {
    const kind = isIP(ip);
    if (kind === 4) return isPrivateIpv4(ip);
    if (kind === 6) return isPrivateIpv6(ip);
    return true;
}

function isBlockedHostname(hostname: string): boolean {
    const host = hostname.trim().toLowerCase();
    if (!host) return true;
    if (host === "localhost" || host.endsWith(".localhost")) return true;
    if (host.endsWith(".local") || host.endsWith(".internal")) return true;
    if (host === "0.0.0.0") return true;
    const ipKind = isIP(host);
    if (ipKind) return isBlockedIpAddress(host);
    return false;
}

/**
 * Rejects non-HTTPS PDS URLs and hosts that resolve to private or loopback addresses.
 */
export async function assertPublicHttpsBlueskyService(service: string): Promise<void> {
    let url: URL;
    try {
        url = new URL(normalizeBlueskyServiceUrl(service));
    } catch {
        throw new Error("Bluesky service URL must be a valid HTTPS address");
    }
    if (url.protocol !== "https:") {
        throw new Error("Bluesky service URL must use HTTPS");
    }
    if (url.username || url.password) {
        throw new Error("Bluesky service URL must not include credentials");
    }
    const hostname = url.hostname;
    if (isBlockedHostname(hostname)) {
        throw new Error("Bluesky service URL must be a public HTTPS host");
    }
    const ipKind = isIP(hostname);
    if (ipKind) {
        if (isBlockedIpAddress(hostname)) {
            throw new Error("Bluesky service URL must be a public HTTPS host");
        }
        return;
    }
    const records = await dns.lookup(hostname, { all: true, verbatim: true });
    if (!records.length) {
        throw new Error("Bluesky service URL could not be resolved");
    }
    for (const rec of records) {
        if (isBlockedIpAddress(rec.address)) {
            throw new Error("Bluesky service URL must be a public HTTPS host");
        }
    }
}
