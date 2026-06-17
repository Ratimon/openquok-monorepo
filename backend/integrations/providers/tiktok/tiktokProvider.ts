import type {
    AnalyticsData,
    AuthTokenDetails,
    GenerateAuthUrlResponse,
    IntegrationRecord,
    PostDetails,
    PostResponse,
    SocialProvider,
    ValidateCreatePostInput,
} from "../../social.integrations.interface";
import { publishTiktokPost } from "./tiktokDataPublish";
import { generateTiktokPkcePair } from "./tiktokPkce";
import { mapTiktokApiErrorCode, parseTiktokApiEnvelope } from "./tiktokApiErrors";

import dayjs from "dayjs";
import { config } from "../../../config/GlobalConfig";
import { AppError } from "../../../errors/AppError";
import { makeId } from "../../../utils/ids/makeId";
import { oauthFrontendOrigin } from "../../utils/oauthFrontendOrigin";
import { oauthFrontendSocialCallbackPath } from "../../utils/oauthFrontendCallbackPath";

const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const TIKTOK_AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TIKTOK_API = "https://open.tiktokapis.com";

type TiktokTokenResponse = {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    refresh_expires_in?: number;
    open_id?: string;
    scope?: string;
    error?: string;
    error_description?: string;
};

function tiktokOAuth(): { clientId: string; clientSecret: string } {
    return (config.integrations as { tiktok: { clientId: string; clientSecret: string } }).tiktok;
}

function tiktokRedirectUri(): string {
    return `${oauthFrontendOrigin()}${oauthFrontendSocialCallbackPath("tiktok")}`;
}

async function exchangeTiktokToken(body: Record<string, string>): Promise<TiktokTokenResponse> {
    const params = new URLSearchParams(body);
    const res = await fetch(TIKTOK_TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Cache-Control": "no-cache",
        },
        body: params.toString(),
    });
    return (await res.json()) as TiktokTokenResponse;
}

async function fetchTiktokUserProfile(accessToken: string): Promise<{
    id: string;
    name: string;
    username: string;
    picture: string;
}> {
    const fields = [
        "open_id",
        "display_name",
        "username",
        "avatar_url",
    ].join(",");
    const res = await fetch(`${TIKTOK_API}/v2/user/info/?fields=${encodeURIComponent(fields)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const envelope = parseTiktokApiEnvelope(await res.json());
    if (!envelope.ok) {
        throw new Error(mapTiktokApiErrorCode(envelope.errorCode, envelope.errorMessage));
    }
    const user =
        envelope.data.user && typeof envelope.data.user === "object"
            ? (envelope.data.user as Record<string, unknown>)
            : {};
    const openId = typeof user.open_id === "string" ? user.open_id : "";
    const displayName = typeof user.display_name === "string" ? user.display_name : "";
    const username = typeof user.username === "string" ? user.username : "";
    const picture = typeof user.avatar_url === "string" ? user.avatar_url : "";
    return {
        id: openId,
        name: displayName || username || openId,
        username: username || displayName || openId,
        picture,
    };
}

function authDetailsFromTokenResponse(
    token: TiktokTokenResponse,
    profile: { id: string; name: string; username: string; picture: string },
    fallbackRefresh?: string
): AuthTokenDetails {
    return {
        id: profile.id,
        name: profile.name,
        accessToken: token.access_token ?? "",
        refreshToken: token.refresh_token ?? fallbackRefresh ?? "",
        expiresIn:
            typeof token.expires_in === "number" && token.expires_in > 0
                ? token.expires_in
                : dayjs().add(23, "hours").unix() - dayjs().unix(),
        picture: profile.picture,
        username: profile.username,
    };
}

export class TiktokProvider implements SocialProvider {
    identifier = "tiktok";
    name = "TikTok";
    editor = "normal" as const;
    isBetweenSteps = false;
    refreshCron = true;
    convertToJPEG = true;

    scopes = [
        "user.info.basic",
        "user.info.profile",
        "user.info.stats",
        "video.publish",
        "video.upload",
        "video.list",
    ];

    maxLength(_additionalSettings?: unknown): number {
        return 2000;
    }

    rules =
        "TikTok posts require one MP4 video or one to 35 images (JPEG, PNG, or WEBP). PNG images are converted to JPEG before publish. Set privacy, direct post vs inbox upload, and interaction toggles. Media must be on a verified HTTPS domain (PULL_FROM_URL).";

    validateCreatePost(input: ValidateCreatePostInput): string | null {
        if (input.status === "scheduled" && input.mediaCount < 1) {
            return "TikTok requires a video or image attachment";
        }
        return null;
    }

    async post(
        openId: string,
        accessToken: string,
        postDetails: PostDetails[],
        integration: IntegrationRecord
    ): Promise<PostResponse[]> {
        if (!postDetails.length) return [];
        const username = integration.name?.replace(/^@/, "") || undefined;
        const result = await publishTiktokPost(openId, accessToken, postDetails[0]!, username);
        return [result];
    }

    async refreshToken(refreshToken: string): Promise<AuthTokenDetails> {
        const { clientId, clientSecret } = tiktokOAuth();
        if (!clientId || !clientSecret) {
            throw new AppError(
                "TikTok OAuth is not configured. Set TIKTOK_CLIENT_ID and TIKTOK_CLIENT_SECRET.",
                503
            );
        }

        const token = await exchangeTiktokToken({
            client_key: clientId,
            client_secret: clientSecret,
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        });
        if (!token.access_token) {
            throw new Error(token.error_description ?? token.error ?? "TikTok token refresh failed");
        }

        const profile = await fetchTiktokUserProfile(token.access_token);
        return authDetailsFromTokenResponse(token, profile, refreshToken);
    }

    async generateAuthUrl(): Promise<GenerateAuthUrlResponse> {
        const { clientId } = tiktokOAuth();
        if (!clientId) {
            throw new AppError(
                "TikTok OAuth is not configured. Set TIKTOK_CLIENT_ID and TIKTOK_CLIENT_SECRET.",
                503
            );
        }

        const state = makeId(6);
        const { codeVerifier, codeChallenge } = generateTiktokPkcePair();
        const redirectUri = tiktokRedirectUri();
        const params = new URLSearchParams({
            client_key: clientId,
            scope: this.scopes.join(","),
            response_type: "code",
            redirect_uri: redirectUri,
            state,
            code_challenge: codeChallenge,
            code_challenge_method: "S256",
        });

        return { url: `${TIKTOK_AUTH_URL}?${params.toString()}`, codeVerifier, state };
    }

    async authenticate(params: {
        code: string;
        codeVerifier: string;
        refresh?: string;
    }): Promise<AuthTokenDetails | string> {
        const { clientId, clientSecret } = tiktokOAuth();
        if (!clientId || !clientSecret) return "TikTok OAuth is not configured";

        const token = await exchangeTiktokToken({
            client_key: clientId,
            client_secret: clientSecret,
            code: params.code,
            grant_type: "authorization_code",
            redirect_uri: tiktokRedirectUri(),
            code_verifier: params.codeVerifier,
        });

        if (!token.access_token) {
            return token.error_description ?? token.error ?? "TikTok token exchange failed";
        }

        try {
            const profile = await fetchTiktokUserProfile(token.access_token);
            return authDetailsFromTokenResponse(token, profile);
        } catch (e) {
            return e instanceof Error ? e.message : "TikTok user profile fetch failed";
        }
    }

    async analytics(_openId: string, accessToken: string, dateWindowDays: number): Promise<AnalyticsData[]> {
        const fields = ["follower_count", "following_count", "likes_count", "video_count"].join(",");
        const res = await fetch(`${TIKTOK_API}/v2/user/info/?fields=${encodeURIComponent(fields)}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const envelope = parseTiktokApiEnvelope(await res.json());
        if (!envelope.ok) return [];

        const user =
            envelope.data.user && typeof envelope.data.user === "object"
                ? (envelope.data.user as Record<string, unknown>)
                : {};
        const today = dayjs().format("YYYY-MM-DD");
        const rows: AnalyticsData[] = [];
        const push = (label: string, value: unknown) => {
            if (value == null) return;
            rows.push({
                label,
                percentageChange: 0,
                data: [{ total: String(value), date: today }],
            });
        };

        push("Followers", user.follower_count);
        push("Following", user.following_count);
        push("Likes", user.likes_count);
        push("Videos", user.video_count);

        if (rows.length === 0 && dateWindowDays > 0) {
            return rows;
        }
        return rows;
    }
}
