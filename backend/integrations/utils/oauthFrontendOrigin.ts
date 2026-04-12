import { config } from "../../config/GlobalConfig";

function normalizeOAuthOriginInput(raw: string): string {
    return String(raw).trim().replace(/\/+$/, "");
}

/**
 * HTTPS origin used in OAuth redirect URIs (Meta requires HTTPS; dev may use a relay).
 * Uses URL parsing so stray paths or missing schemes in `FRONTEND_DOMAIN_URL` do not leak into `redirect_uri`.
 */
export function oauthFrontendOrigin(): string {
    const raw = (config.server as { frontendDomainUrl?: string })?.frontendDomainUrl ?? "http://localhost:5173";
    let candidate = normalizeOAuthOriginInput(raw);
    if (!/^https?:\/\//i.test(candidate)) {
        candidate = `https://${candidate}`;
    }
    try {
        const u = new URL(candidate);
        if (u.protocol === "https:") {
            return u.origin;
        }
        return `https://redirectmeto.com/${u.origin}`;
    } catch {
        return candidate.toLowerCase().startsWith("https") ? candidate : `https://redirectmeto.com/${raw}`;
    }
}
