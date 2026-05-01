import type {
    AnalyticsData,
    AuthTokenDetails,
    GenerateAuthUrlResponse,
    IntegrationRecord,
    PostDetails,
    PostResponse,
    SocialProvider,
    ValidateCreatePostInput,
} from "../social.integrations.interface";
import {
    fetchInstagramAccountInsights,
    fetchInstagramMediaInsights,
} from "./instagramInsightsAnalytics";

import dayjs from "dayjs";
import { config } from "../../config/GlobalConfig";
import { makeId } from "../../utils/make.is";
import { oauthFrontendOrigin } from "../utils/oauthFrontendOrigin";
import { oauthFrontendSocialCallbackPath } from "../utils/oauthFrontendCallbackPath";

const IG_GRAPH = "https://graph.instagram.com";
const IG_INSIGHTS_GRAPH = "https://graph.instagram.com/v21.0";

function instagramStandaloneOAuth(): { appId: string; appSecret: string } {
    return (config.integrations as { instagramStandalone: { appId: string; appSecret: string } }).instagramStandalone;
}

function instagramStandaloneRedirectUri(): string {
    return `${oauthFrontendOrigin()}${oauthFrontendSocialCallbackPath("instagram-standalone")}`;
}

function normalizeOAuthPermissionList(raw: unknown): string[] {
    if (Array.isArray(raw)) {
        return raw.filter((x): x is string => typeof x === "string");
    }
    if (typeof raw === "string") {
        return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
}

/**
 * Instagram professional account via **Business Login for Instagram** (Instagram API with Instagram Login).
 *
 * @see https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login
 */
export class InstagramStandaloneProvider implements SocialProvider {
    identifier = "instagram-standalone";
    name = "Instagram (Standalone)";
    editor = "normal" as const;
    isBetweenSteps = false;
    refreshCron = true;

    /** Matches Meta’s Business Login authorize example; omit scopes your app has not enabled in the dashboard. */
    scopes = [
        "instagram_business_basic",
        "instagram_business_content_publish",
        "instagram_business_manage_comments",
        "instagram_business_manage_insights",
    ];

    maxLength(_additionalSettings?: unknown): number {
        return 2200;
    }

    validateCreatePost(input: ValidateCreatePostInput): string | null {
        if (input.status === "scheduled" && input.mediaCount < 1) {
            return "Instagram should have at least one attachment";
        }
        return null;
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
        /** Meta documents `www.instagram.com/oauth/authorize` for this product; omit `enable_fb_login` for dashboard default. */
        const url =
            "https://www.instagram.com/oauth/authorize" +
            `?client_id=${encodeURIComponent(appId)}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            "&response_type=code" +
            `&scope=${encodeURIComponent(this.scopes.join(","))}` +
            `&state=${encodeURIComponent(state)}`;

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
        const shortRaw = (await shortRes.json()) as {
            data?: Array<{ access_token?: string; permissions?: string | string[]; user_id?: string }>;
            access_token?: string;
            permissions?: string | string[];
            error_message?: string;
        };
        const shortRow = shortRaw.data?.[0] ?? shortRaw;
        const shortToken = shortRow.access_token;
        if (!shortToken) {
            return shortRaw.error_message ?? "Instagram token exchange failed";
        }

        const longRes = await fetch(
            `${IG_GRAPH}/access_token?grant_type=ig_exchange_token` +
                `&client_id=${encodeURIComponent(appId)}` +
                `&client_secret=${encodeURIComponent(appSecret)}` +
                `&access_token=${encodeURIComponent(shortToken)}`
        );
        const longLived = (await longRes.json()) as { access_token?: string; error?: { message?: string } };
        if (!longLived.access_token) {
            return longLived.error?.message ?? "Instagram long-lived token exchange failed";
        }

        const granted = normalizeOAuthPermissionList(shortRow.permissions);
        try {
            this.checkScopes(this.scopes, granted);
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

    /** Same metrics as Instagram Business, via Instagram Graph host (Business Login). */
    async analytics(igUserId: string, accessToken: string, dateWindowDays: number): Promise<AnalyticsData[]> {
        return fetchInstagramAccountInsights(IG_INSIGHTS_GRAPH, igUserId, accessToken, dateWindowDays);
    }

    async postAnalytics(
        _integrationId: string,
        accessToken: string,
        mediaId: string,
        _fromDate: number
    ): Promise<AnalyticsData[]> {
        return fetchInstagramMediaInsights(IG_INSIGHTS_GRAPH, mediaId, accessToken);
    }
}
