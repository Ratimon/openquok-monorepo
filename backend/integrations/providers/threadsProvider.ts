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
// import { logger } from "../../utils/Logger";

function threadsRedirectUri(): string {
    return `${oauthFrontendOrigin()}/account/integrations/social/threads`;
}

function threadsOAuth(): { appId: string; appSecret: string } {
    return (config.integrations as { threads: { appId: string; appSecret: string } }).threads;
}

/** Meta Threads OAuth provider. */
export class ThreadsProvider implements SocialProvider {
    identifier = "threads";
    name = "Threads";
    editor = "normal" as const;
    isBetweenSteps = false;
    refreshCron = true;

    scopes = [
        "threads_basic",
        "threads_content_publish",
        "threads_manage_replies",
        "threads_manage_insights",
    ];

    maxLength(_additionalSettings?: unknown): number {
        return 500;
    }

    async post(
        _id: string,
        _accessToken: string,
        _postDetails: PostDetails[],
        _integration: IntegrationRecord
    ): Promise<PostResponse[]> {
        throw new Error("Threads posting is not implemented");
    }

    async refreshToken(refresh_token: string): Promise<AuthTokenDetails> {
        const { appId } = threadsOAuth();
        if (!appId) throw new Error("THREADS_APP_ID is not configured");

        const tokenRes = await fetch(
            `https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token&access_token=${encodeURIComponent(refresh_token)}`
        );
        const { access_token } = (await tokenRes.json()) as { access_token?: string };
        if (!access_token) throw new Error("Threads token refresh failed");

        const { id, name, username, picture } = await this.fetchUserInfo(access_token);
        return {
            id,
            name,
            accessToken: access_token,
            refreshToken: access_token,
            expiresIn: dayjs().add(58, "days").unix() - dayjs().unix(),
            picture: picture || "",
            username: username || "",
        };
    }

    async generateAuthUrl(): Promise<GenerateAuthUrlResponse> {
        const { appId } = threadsOAuth();
        if (!appId) throw new Error("THREADS_APP_ID is not configured");

        const state = makeId(6);
        const codeVerifier = makeId(10);
        const redirectUri = threadsRedirectUri();
        const url =
            "https://www.threads.net/oauth/authorize" +
            `?client_id=${appId}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&state=${state}` +
            `&scope=${encodeURIComponent(this.scopes.join(","))}`;

        return { url, codeVerifier, state };
    }

    async authenticate(params: { code: string; codeVerifier: string; refresh?: string }): Promise<AuthTokenDetails | string> {
        const { appId, appSecret: secret } = threadsOAuth();
        if (!appId || !secret) return "Threads OAuth is not configured";

        const step1 = await fetch(
            "https://graph.threads.net/oauth/access_token" +
                `?client_id=${appId}` +
                `&redirect_uri=${encodeURIComponent(threadsRedirectUri())}` +
                "&grant_type=authorization_code" +
                `&client_secret=${secret}` +
                `&code=${encodeURIComponent(params.code)}`
        );
        const getAccessToken = (await step1.json()) as { access_token?: string; error?: { message?: string } };
        if (!getAccessToken.access_token) {
            return getAccessToken.error?.message ?? "Threads token exchange failed";
        }

        const step2 = await fetch(
            "https://graph.threads.net/access_token" +
                "?grant_type=th_exchange_token" +
                `&client_secret=${secret}` +
                `&access_token=${encodeURIComponent(getAccessToken.access_token)}`
        );
        const longLived = (await step2.json()) as { access_token?: string };
        if (!longLived.access_token) return "Threads long-lived token exchange failed";

        const { id, name, username, picture } = await this.fetchUserInfo(longLived.access_token);
        return {
            id,
            name,
            accessToken: longLived.access_token,
            refreshToken: longLived.access_token,
            expiresIn: dayjs().add(58, "days").unix() - dayjs().unix(),
            picture: picture || "",
            username: username || "",
        };
    }

    private async fetchUserInfo(accessToken: string): Promise<{
        id: string;
        name: string;
        username: string;
        picture: string;
    }> {
        const res = await fetch(
            `https://graph.threads.net/v1.0/me?fields=id,username,threads_profile_picture_url&access_token=${encodeURIComponent(accessToken)}`
        );
        const body = (await res.json()) as {
            id?: string;
            username?: string;
            threads_profile_picture_url?: string;
        };
        const id = body.id ?? "";
        const username = body.username ?? "";
        return {
            id,
            name: username,
            picture: body.threads_profile_picture_url || "",
            username,
        };
    }
}
