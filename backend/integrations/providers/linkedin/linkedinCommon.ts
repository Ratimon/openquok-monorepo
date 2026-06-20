import { config } from "../../../config/GlobalConfig";
import { oauthFrontendOrigin } from "../../utils/oauthFrontendOrigin";
import { oauthFrontendSocialCallbackPath } from "../../utils/oauthFrontendCallbackPath";

export const LINKEDIN_API_VERSION = "202601";

export const LINKEDIN_SCOPES = [
    "openid",
    "profile",
    "w_member_social",
    "r_basicprofile",
    "rw_organization_admin",
    "w_organization_social",
    "r_organization_social",
] as const;

export function linkedinOAuth(): { clientId: string; clientSecret: string } {
    return (config.integrations as { linkedin: { clientId: string; clientSecret: string } }).linkedin;
}

export function linkedinRedirectUri(identifier: "linkedin" | "linkedin-page"): string {
    return `${oauthFrontendOrigin()}${oauthFrontendSocialCallbackPath(identifier)}`;
}

export function linkedinRestHeaders(accessToken: string): Record<string, string> {
    return {
        Authorization: `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
        "LinkedIn-Version": LINKEDIN_API_VERSION,
    };
}

export function checkLinkedInScopes(required: readonly string[], grantedScope: string | undefined): void {
    const granted = (grantedScope ?? "")
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    const missing = required.filter((s) => !granted.includes(s));
    if (missing.length > 0) {
        throw new Error(`Missing LinkedIn permissions: ${missing.join(", ")}`);
    }
}

export function resolveLinkedInPageIdFromPayload(data: unknown): string {
    if (!data || typeof data !== "object") {
        throw new Error("Missing page selection");
    }
    const o = data as Record<string, unknown>;
    const page = typeof o.page === "string" ? o.page.trim() : "";
    const pageId = typeof o.pageId === "string" ? o.pageId.trim() : "";
    const id = typeof o.id === "string" ? o.id.trim() : "";
    const resolved = page || pageId || id;
    if (!resolved) throw new Error("Missing page selection");
    return resolved;
}
