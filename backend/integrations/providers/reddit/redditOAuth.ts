import { config } from "../../../config/GlobalConfig";
import { AppError } from "../../../errors/AppError";
import { ProviderAccessTokenExpiredError } from "../../../errors/ProviderIntegrationErrors";
import { oauthFrontendOrigin } from "../../utils/oauthFrontendOrigin";
import { oauthFrontendSocialCallbackPath } from "../../utils/oauthFrontendCallbackPath";

export const REDDIT_AUTHORIZE_URL = "https://www.reddit.com/api/v1/authorize";
export const REDDIT_TOKEN_URL = "https://www.reddit.com/api/v1/access_token";
export const REDDIT_OAUTH_API = "https://oauth.reddit.com";

export const REDDIT_SCOPES = ["identity", "read", "submit", "flair"] as const;

export const REDDIT_MAX_LENGTH = 10000;
export const REDDIT_TITLE_MAX_LENGTH = 300;

const DEFAULT_USER_AGENT = "web:openquok:1.0";

export type RedditOAuthConfig = {
    clientId: string;
    clientSecret: string;
    userAgent: string;
};

export function redditOAuth(): RedditOAuthConfig {
    const reddit = (config.integrations as { reddit?: Partial<RedditOAuthConfig> }).reddit ?? {};
    return {
        clientId: reddit.clientId ?? "",
        clientSecret: reddit.clientSecret ?? "",
        userAgent: reddit.userAgent?.trim() || DEFAULT_USER_AGENT,
    };
}

export function redditRedirectUri(): string {
    return `${oauthFrontendOrigin()}${oauthFrontendSocialCallbackPath("reddit")}`;
}

export function assertRedditOAuthConfigured(): RedditOAuthConfig {
    const cfg = redditOAuth();
    if (!cfg.clientId.trim() || !cfg.clientSecret.trim()) {
        throw new AppError(
            "Reddit OAuth is not configured. Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET.",
            503
        );
    }
    return cfg;
}

export function redditUserAgent(): string {
    return redditOAuth().userAgent;
}

export function redditTokenHeaders(): Record<string, string> {
    const { clientId, clientSecret, userAgent } = redditOAuth();
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    return {
        Authorization: `Basic ${basic}`,
        "User-Agent": userAgent,
        "Content-Type": "application/x-www-form-urlencoded",
    };
}

export function redditApiHeaders(accessToken: string): Record<string, string> {
    return {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": redditUserAgent(),
    };
}

export function throwIfRedditUnauthorized(status: number, body: unknown): void {
    if (status !== 401 && status !== 403) return;
    const message =
        isPlainObject(body) && typeof body.message === "string" && body.message.trim()
            ? body.message.trim()
            : "Reddit rejected the access token; reconnect the channel";
    throw new ProviderAccessTokenExpiredError(message);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
