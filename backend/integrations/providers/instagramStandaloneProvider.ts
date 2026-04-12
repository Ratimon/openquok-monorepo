import type {
    AuthTokenDetails,
    GenerateAuthUrlResponse,
    IntegrationRecord,
    PostDetails,
    PostResponse,
    SocialProvider,
} from "../social.integrations.interface";

import dayjs from "dayjs";
import { config } from "../../config/GlobalConfig";
import { makeId } from "../../utils/make.is";
import { oauthFrontendOrigin } from "../utils/oauthFrontendOrigin";

const IG_GRAPH = "https://graph.instagram.com";

function instagramStandaloneOAuth(): { appId: string; appSecret: string } {
    return (config.integrations as { instagramStandalone: { appId: string; appSecret: string } }).instagramStandalone;
}

function instagramStandaloneRedirectUri(): string {
    return `${oauthFrontendOrigin()}/account/integrations/social/instagram-standalone`;
}

/**
 * Instagram professional account via Instagram API with Instagram Login (no Facebook Page required).
 */
export class InstagramStandaloneProvider implements SocialProvider {
    identifier = "instagram-standalone";
    name = "Instagram (Standalone)";
    editor = "normal" as const;
    isBetweenSteps = false;
    refreshCron = true;

    scopes = [
        "instagram_business_basic",
        "instagram_business_content_publish",
        "instagram_business_manage_comments",
        "instagram_business_manage_insights",
    ];

    maxLength(_additionalSettings?: unknown): number {
        return 2200;
    }

    async post(
        _id: string,
        _accessToken: string,
        _postDetails: PostDetails[],
        _integration: IntegrationRecord
    ): Promise<PostResponse[]> {
        throw new Error("Instagram posting is not implemented");
    }

    private checkScopes(required: readonly string[], granted: readonly string[]): void {
        const missing = required.filter((s) => !granted.includes(s));
        if (missing.length > 0) {
            throw new Error(`Missing permissions: ${missing.join(", ")}`);
        }
    }

    async refreshToken(refresh_token: string): Promise<AuthTokenDetails> {
        const res = await fetch(
            `${IG_GRAPH}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(refresh_token)}`
        );
        const body = (await res.json()) as { access_token?: string; error?: { message?: string } };
        if (!body.access_token) {
            throw new Error(body.error?.message ?? "Instagram token refresh failed");
        }

        const meRes = await fetch(
            `https://graph.instagram.com/v21.0/me?fields=user_id,username,name,profile_picture_url&access_token=${encodeURIComponent(body.access_token)}`
        );
        const me = (await meRes.json()) as {
            user_id?: string;
            name?: string;
            username?: string;
            profile_picture_url?: string;
        };

        const id = me.user_id ?? "";

        return {
            id,
            name: me.name ?? me.username ?? "",
            accessToken: body.access_token,
            refreshToken: body.access_token,
            expiresIn: dayjs().add(58, "days").unix() - dayjs().unix(),
            picture: me.profile_picture_url ?? "",
            username: me.username ?? "",
        };
    }

    async generateAuthUrl(): Promise<GenerateAuthUrlResponse> {
        const { appId } = instagramStandaloneOAuth();
        if (!appId) throw new Error("Instagram OAuth is not configured");

        const state = makeId(6);
        const codeVerifier = makeId(10);
        const redirectUri = instagramStandaloneRedirectUri();
        const url =
            "https://www.instagram.com/oauth/authorize?enable_fb_login=0" +
            `&client_id=${encodeURIComponent(appId)}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            "&response_type=code" +
            `&scope=${encodeURIComponent(this.scopes.join(","))}` +
            `&state=${state}`;

        return { url, codeVerifier, state };
    }

    async authenticate(params: { code: string; codeVerifier: string; refresh?: string }): Promise<AuthTokenDetails | string> {
        const { appId, appSecret } = instagramStandaloneOAuth();
        if (!appId || !appSecret) return "Instagram OAuth is not configured";

        const redirectUri = instagramStandaloneRedirectUri();

        const formData = new FormData();
        formData.append("client_id", appId);
        formData.append("client_secret", appSecret);
        formData.append("grant_type", "authorization_code");
        formData.append("redirect_uri", redirectUri);
        formData.append("code", params.code);

        const shortRes = await fetch("https://api.instagram.com/oauth/access_token", {
            method: "POST",
            body: formData,
        });
        const shortLived = (await shortRes.json()) as {
            access_token?: string;
            permissions?: string[];
            error_message?: string;
        };
        if (!shortLived.access_token) {
            return shortLived.error_message ?? "Instagram token exchange failed";
        }

        const longRes = await fetch(
            `${IG_GRAPH}/access_token?grant_type=ig_exchange_token` +
                `&client_id=${encodeURIComponent(appId)}` +
                `&client_secret=${encodeURIComponent(appSecret)}` +
                `&access_token=${encodeURIComponent(shortLived.access_token)}`
        );
        const longLived = (await longRes.json()) as { access_token?: string; error?: { message?: string } };
        if (!longLived.access_token) {
            return longLived.error?.message ?? "Instagram long-lived token exchange failed";
        }

        try {
            this.checkScopes(this.scopes, shortLived.permissions ?? []);
        } catch (e) {
            return e instanceof Error ? e.message : "Missing OAuth permissions";
        }

        const meRes = await fetch(
            `https://graph.instagram.com/v21.0/me?fields=user_id,username,name,profile_picture_url&access_token=${encodeURIComponent(longLived.access_token)}`
        );
        const me = (await meRes.json()) as {
            user_id?: string;
            name?: string;
            username?: string;
            profile_picture_url?: string;
        };

        const id = me.user_id ?? "";

        return {
            id,
            name: me.name ?? me.username ?? "",
            accessToken: longLived.access_token,
            refreshToken: longLived.access_token,
            expiresIn: dayjs().add(58, "days").unix() - dayjs().unix(),
            picture: me.profile_picture_url ?? "",
            username: me.username ?? "",
        };
    }
}
