import type {
    AuthTokenDetails,
    GenerateAuthUrlResponse,
    IntegrationRecord,
    PostDetails,
    PostResponse,
    SocialProvider,
    ValidateCreatePostInput,
} from "../../social.integrations.interface";
import {
    assertTiktokBusinessApiOk,
    tiktokBusinessApiGet,
    tiktokBusinessApiPostJson,
} from "./tiktokBusinessApiClient";
import { publishTiktokBusinessPost } from "./tiktokBusinessPublish";
import { generateTiktokPkcePair } from "./tiktokPkce";

import dayjs from "dayjs";
import { config } from "../../../config/GlobalConfig";
import { AppError } from "../../../errors/AppError";
import { makeId } from "../../../utils/ids/makeId";
import { oauthFrontendOrigin } from "../../utils/oauthFrontendOrigin";
import { oauthFrontendSocialCallbackPath } from "../../utils/oauthFrontendCallbackPath";

const TIKTOK_BUSINESS_AUTH_URL = "https://www.tiktok.com/v2/auth/authorize";

type TiktokBusinessTokenData = {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    open_id?: string;
    scope?: string;
};

function tiktokBusinessOAuth(): { clientId: string; clientSecret: string } {
    return (config.integrations as { tiktokBusiness: { clientId: string; clientSecret: string } })
        .tiktokBusiness;
}

/** TikTok Business portal requires the registered redirect URI to end with `/`. */
export function tiktokBusinessRedirectUri(): string {
    const base = `${oauthFrontendOrigin()}${oauthFrontendSocialCallbackPath("tiktok-business")}`;
    return base.endsWith("/") ? base : `${base}/`;
}

function parseGrantedTiktokBusinessScopes(scope: string | undefined): string[] {
    if (!scope?.trim()) return [];
    const decoded = decodeURIComponent(scope.trim());
    const delimiter = decoded.includes(",") ? "," : " ";
    return decoded
        .split(delimiter)
        .map((part) => part.trim())
        .filter(Boolean);
}

function checkTiktokBusinessScopes(required: readonly string[], granted: readonly string[]): void {
    const missing = required.filter((scope) => !granted.includes(scope));
    if (missing.length > 0) {
        throw new Error(`Missing permissions: ${missing.join(", ")}`);
    }
}

async function exchangeTiktokBusinessToken(body: Record<string, string>): Promise<TiktokBusinessTokenData> {
    const envelope = await tiktokBusinessApiPostJson("/tt_user/oauth2/token/", body);
    return assertTiktokBusinessApiOk(envelope) as TiktokBusinessTokenData;
}

async function refreshTiktokBusinessToken(refreshToken: string): Promise<TiktokBusinessTokenData> {
    const { clientId, clientSecret } = tiktokBusinessOAuth();
    const envelope = await tiktokBusinessApiPostJson("/tt_user/oauth2/refresh_token/", {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
    });
    return assertTiktokBusinessApiOk(envelope) as TiktokBusinessTokenData;
}

async function fetchTiktokBusinessProfile(
    accessToken: string,
    businessId: string
): Promise<{ id: string; name: string; username: string; picture: string }> {
    const fields = JSON.stringify([
        "display_name",
        "username",
        "profile_image",
        "profile_deep_link",
    ]);
    const envelope = await tiktokBusinessApiGet(accessToken, "/business/get/", {
        business_id: businessId,
        fields,
    });
    const data = assertTiktokBusinessApiOk(envelope);
    const displayName = typeof data.display_name === "string" ? data.display_name : "";
    const username = typeof data.username === "string" ? data.username : "";
    const picture = typeof data.profile_image === "string" ? data.profile_image : "";
    return {
        id: businessId,
        name: displayName || username || businessId,
        username: username || displayName || businessId,
        picture,
    };
}

function authDetailsFromTokenResponse(
    token: TiktokBusinessTokenData,
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

export class TiktokBusinessProvider implements SocialProvider {
    identifier = "tiktok-business";
    name = "TikTok (Business)";
    editor = "normal" as const;
    isBetweenSteps = false;
    refreshCron = true;
    convertToJPEG = true;

    scopes = [
        "user.info.basic",
        "user.info.username",
        "user.info.profile",
        "user.info.stats",
        "video.publish",
        "video.upload",
        "video.list",
    ];

    maxLength(_additionalSettings?: unknown): number {
        return 2200;
    }

    rules =
        "TikTok Business posts require one MP4 video or one to 35 images (JPEG, PNG, or WEBP). PNG images are converted to JPEG before publish. Video covers use a stored poster image when present, otherwise a frame timestamp. Set direct post vs inbox upload, interaction toggles, and optional trending audio on direct posts. Media must be on a verified HTTPS domain.";

    validateCreatePost(input: ValidateCreatePostInput): string | null {
        if (input.status === "scheduled" && input.mediaCount < 1) {
            return "TikTok requires a video or image attachment";
        }
        return null;
    }

    async post(
        businessId: string,
        accessToken: string,
        postDetails: PostDetails[],
        integration: IntegrationRecord
    ): Promise<PostResponse[]> {
        if (!postDetails.length) return [];
        const username = integration.name?.replace(/^@/, "") || undefined;
        const result = await publishTiktokBusinessPost(businessId, accessToken, postDetails[0]!, username);
        return [result];
    }

    async refreshToken(refreshToken: string): Promise<AuthTokenDetails> {
        const { clientId, clientSecret } = tiktokBusinessOAuth();
        if (!clientId || !clientSecret) {
            throw new AppError(
                "TikTok Business OAuth is not configured. Set TIKTOK_BUSINESS_CLIENT_ID and TIKTOK_BUSINESS_CLIENT_SECRET.",
                503
            );
        }

        const token = await refreshTiktokBusinessToken(refreshToken);
        if (!token.access_token) {
            throw new Error("TikTok Business token refresh failed");
        }

        const businessId = token.open_id?.trim() || "";
        if (!businessId) {
            throw new Error("TikTok Business token refresh did not return an account id");
        }

        const profile = await fetchTiktokBusinessProfile(token.access_token, businessId);
        return authDetailsFromTokenResponse(token, profile, refreshToken);
    }

    async generateAuthUrl(): Promise<GenerateAuthUrlResponse> {
        const { clientId } = tiktokBusinessOAuth();
        if (!clientId) {
            throw new AppError(
                "TikTok Business OAuth is not configured. Set TIKTOK_BUSINESS_CLIENT_ID and TIKTOK_BUSINESS_CLIENT_SECRET.",
                503
            );
        }

        const state = makeId(6);
        const { codeVerifier } = generateTiktokPkcePair();
        const redirectUri = tiktokBusinessRedirectUri();
        const params = new URLSearchParams({
            client_key: clientId,
            scope: this.scopes.join(","),
            response_type: "code",
            redirect_uri: redirectUri,
            state,
        });

        return { url: `${TIKTOK_BUSINESS_AUTH_URL}?${params.toString()}`, codeVerifier, state };
    }

    async authenticate(params: {
        code: string;
        codeVerifier: string;
        refresh?: string;
    }): Promise<AuthTokenDetails | string> {
        const { clientId, clientSecret } = tiktokBusinessOAuth();
        if (!clientId || !clientSecret) return "TikTok Business OAuth is not configured";

        let token: TiktokBusinessTokenData;
        try {
            token = await exchangeTiktokBusinessToken({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: "authorization_code",
                auth_code: params.code,
                redirect_uri: tiktokBusinessRedirectUri(),
            });
        } catch (e) {
            return e instanceof Error ? e.message : "TikTok Business token exchange failed";
        }

        if (!token.access_token) {
            return "TikTok Business token exchange failed";
        }

        try {
            const granted = parseGrantedTiktokBusinessScopes(token.scope);
            if (granted.length > 0) {
                checkTiktokBusinessScopes(this.scopes, granted);
            }
        } catch (e) {
            return e instanceof Error ? e.message : "Missing OAuth permissions";
        }

        const businessId = token.open_id?.trim() || "";
        if (!businessId) {
            return "TikTok Business token exchange did not return an account id";
        }

        try {
            const profile = await fetchTiktokBusinessProfile(token.access_token, businessId);
            return authDetailsFromTokenResponse(token, profile);
        } catch (e) {
            return e instanceof Error ? e.message : "TikTok Business user profile fetch failed";
        }
    }
}
