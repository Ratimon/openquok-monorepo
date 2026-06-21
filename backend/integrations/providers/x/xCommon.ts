import { TwitterApi } from "twitter-api-v2";

import { config } from "../../../config/GlobalConfig";
import { ProviderAccessTokenExpiredError } from "../../../errors/ProviderIntegrationErrors";
import { oauthFrontendOrigin } from "../../utils/oauthFrontendOrigin";
import { oauthFrontendSocialCallbackPath } from "../../utils/oauthFrontendCallbackPath";

export type XReplySettings = "following" | "mentionedUsers" | "subscribers" | "verified";

export function xRedirectUri(): string {
    return `${oauthFrontendOrigin()}${oauthFrontendSocialCallbackPath("x")}`;
}

export function xOAuth(): { apiKey: string; apiSecret: string } {
    return (config.integrations as { x: { apiKey: string; apiSecret: string } }).x;
}

export function parseXAccessToken(stored: string): { accessToken: string; accessSecret: string } {
    const idx = stored.indexOf(":");
    if (idx <= 0) {
        throw new ProviderAccessTokenExpiredError("X access token is malformed; reconnect the channel");
    }
    const accessToken = stored.slice(0, idx);
    const accessSecret = stored.slice(idx + 1);
    if (!accessToken || !accessSecret) {
        throw new ProviderAccessTokenExpiredError("X access token is malformed; reconnect the channel");
    }
    return { accessToken, accessSecret };
}

export function formatXAccessToken(accessToken: string, accessSecret: string): string {
    return `${accessToken}:${accessSecret}`;
}

export function createXAppClient(): TwitterApi {
    const { apiKey, apiSecret } = xOAuth();
    if (!apiKey || !apiSecret) {
        throw new Error("X OAuth is not configured");
    }
    return new TwitterApi({ appKey: apiKey, appSecret: apiSecret });
}

export function createXUserClient(storedToken: string): TwitterApi {
    const { apiKey, apiSecret } = xOAuth();
    const { accessToken, accessSecret } = parseXAccessToken(storedToken);
    return new TwitterApi({
        appKey: apiKey,
        appSecret: apiSecret,
        accessToken,
        accessSecret,
    });
}

export function xReleaseUrl(_username: string, tweetId: string): string {
    return `https://x.com/i/status/${tweetId}`;
}
