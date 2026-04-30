import type {
    AuthTokenDetails,
    GenerateAuthUrlResponse,
    IntegrationRecord,
    PostDetails,
    PostResponse,
    SocialProvider,
    ValidateCreatePostInput,
} from "../social.integrations.interface";

import dayjs from "dayjs";
import { config } from "../../config/GlobalConfig";
import { AppError } from "../../errors/AppError";
import { makeId } from "../../utils/make.is";
import { oauthFrontendOrigin } from "../utils/oauthFrontendOrigin";
import { oauthFrontendSocialCallbackPath } from "../utils/oauthFrontendCallbackPath";

const GRAPH = "https://graph.facebook.com/v20.0";

function facebookOAuth(): { appId: string; appSecret: string } {
    return (config.integrations as { facebook: { appId: string; appSecret: string } }).facebook;
}

function instagramBusinessRedirectUri(): string {
    return `${oauthFrontendOrigin()}${oauthFrontendSocialCallbackPath("instagram-business")}`;
}

export type InstagramBusinessAccountOption = {
    pageId: string;
    id: string;
    name: string;
    pictureUrl: string;
};

/**
 * Instagram professional account via Facebook Login (Login for Business).
 * OAuth uses the same Meta app as Facebook; the user completes account selection after the first token exchange.
 */
export class InstagramBusinessProvider implements SocialProvider {
    identifier = "instagram-business";
    name = "Instagram (Business)";
    editor = "normal" as const;
    isBetweenSteps = true;
    refreshCron = true;
    toolTip = "Instagram account must be business and linked to a Facebook Page";

    scopes = [
        "instagram_basic",
        "pages_show_list",
        "pages_read_engagement",
        "business_management",
        "instagram_content_publish",
        "instagram_manage_comments",
        "instagram_manage_insights",
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
        throw new Error("Instagram Business posting is not implemented");
    }

    private checkScopes(required: readonly string[], granted: readonly string[]): void {
        const missing = required.filter((s) => !granted.includes(s));
        if (missing.length > 0) {
            throw new Error(`Missing permissions: ${missing.join(", ")}`);
        }
    }

    async refreshToken(refresh_token: string): Promise<AuthTokenDetails> {
        const { appId, appSecret } = facebookOAuth();
        if (!appId || !appSecret) {
            throw new AppError(
                "Facebook OAuth is not configured. Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET.",
                503
            );
        }

        const tokenRes = await fetch(
            `${GRAPH}/oauth/access_token?grant_type=fb_exchange_token` +
                `&client_id=${encodeURIComponent(appId)}` +
                `&client_secret=${encodeURIComponent(appSecret)}` +
                `&fb_exchange_token=${encodeURIComponent(refresh_token)}`
        );
        const extended = (await tokenRes.json()) as {
            access_token?: string;
            expires_in?: number;
            error?: { message?: string };
        };
        if (!extended.access_token) {
            throw new Error(extended.error?.message ?? "Facebook token refresh failed");
        }

        const meRes = await fetch(
            `${GRAPH}/me?fields=id,name,picture&access_token=${encodeURIComponent(extended.access_token)}`
        );
        const me = (await meRes.json()) as { id?: string; name?: string; picture?: { data?: { url?: string } } };

        return {
            id: me.id ?? "",
            name: me.name ?? "",
            accessToken: extended.access_token,
            refreshToken: extended.access_token,
            expiresIn:
                extended.expires_in != null && extended.expires_in > 0
                    ? extended.expires_in
                    : dayjs().add(59, "days").unix() - dayjs().unix(),
            picture: me.picture?.data?.url ?? "",
            username: "",
        };
    }

    async generateAuthUrl(): Promise<GenerateAuthUrlResponse> {
        const { appId } = facebookOAuth();
        if (!appId) {
            throw new AppError(
                "Facebook OAuth is not configured. Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET for the Meta app used by Instagram (Business).",
                503
            );
        }

        const state = makeId(6);
        const codeVerifier = makeId(10);
        const redirectUri = instagramBusinessRedirectUri();
        const url =
            "https://www.facebook.com/v20.0/dialog/oauth" +
            `?client_id=${encodeURIComponent(appId)}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&state=${state}` +
            `&scope=${encodeURIComponent(this.scopes.join(","))}`;

        return { url, codeVerifier, state };
    }

    async authenticate(params: { code: string; codeVerifier: string; refresh?: string }): Promise<AuthTokenDetails | string> {
        const { appId, appSecret } = facebookOAuth();
        if (!appId || !appSecret) return "Facebook OAuth is not configured";

        const redirectUri = instagramBusinessRedirectUri();

        const step1 = await fetch(
            `${GRAPH}/oauth/access_token` +
                `?client_id=${encodeURIComponent(appId)}` +
                `&redirect_uri=${encodeURIComponent(redirectUri)}` +
                "&grant_type=authorization_code" +
                `&client_secret=${encodeURIComponent(appSecret)}` +
                `&code=${encodeURIComponent(params.code)}`
        );
        const shortLived = (await step1.json()) as {
            access_token?: string;
            error?: { message?: string };
        };
        if (!shortLived.access_token) {
            return shortLived.error?.message ?? "Facebook token exchange failed";
        }

        const step2 = await fetch(
            `${GRAPH}/oauth/access_token` +
                "?grant_type=fb_exchange_token" +
                `&client_id=${encodeURIComponent(appId)}` +
                `&client_secret=${encodeURIComponent(appSecret)}` +
                `&fb_exchange_token=${encodeURIComponent(shortLived.access_token)}`
        );
        const longLived = (await step2.json()) as { access_token?: string; error?: { message?: string } };
        if (!longLived.access_token) {
            return longLived.error?.message ?? "Facebook long-lived token exchange failed";
        }

        const permRes = await fetch(
            `${GRAPH}/me/permissions?access_token=${encodeURIComponent(longLived.access_token)}`
        );
        const permJson = (await permRes.json()) as { data?: Array<{ permission?: string; status?: string }> };
        const permissions = (permJson.data ?? [])
            .filter((d) => d.status === "granted")
            .map((p) => p.permission)
            .filter(Boolean) as string[];

        try {
            this.checkScopes(this.scopes, permissions);
        } catch (e) {
            return e instanceof Error ? e.message : "Missing OAuth permissions";
        }

        const meRes = await fetch(
            `${GRAPH}/me?fields=id,name,picture&access_token=${encodeURIComponent(longLived.access_token)}`
        );
        const me = (await meRes.json()) as { id?: string; name?: string; picture?: { data?: { url?: string } } };

        return {
            id: me.id ?? "",
            name: me.name ?? "",
            accessToken: longLived.access_token,
            refreshToken: longLived.access_token,
            expiresIn: dayjs().add(59, "days").unix() - dayjs().unix(),
            picture: me.picture?.data?.url ?? "",
            username: "",
        };
    }

    /** Same as {@link listBetweenStepAccounts}; name matches common integration “pages” step after OAuth. */
    async pages(accessToken: string): Promise<InstagramBusinessAccountOption[]> {
        return this.listBetweenStepAccounts(accessToken);
    }

    /** Facebook Pages that have a linked Instagram professional account (for the between-steps picker). */
    async listBetweenStepAccounts(accessToken: string): Promise<InstagramBusinessAccountOption[]> {
        const res = await fetch(
            `${GRAPH}/me/accounts?fields=id,instagram_business_account,username,name,picture.type(large)` +
                `&access_token=${encodeURIComponent(accessToken)}&limit=500`
        );
        const json = (await res.json()) as {
            data?: Array<{
                id: string;
                instagram_business_account?: { id: string };
                name?: string;
                picture?: { data?: { url?: string } };
            }>;
        };
        const rows = json.data ?? [];
        const withIg = rows.filter((r) => r.instagram_business_account?.id);

        const out: InstagramBusinessAccountOption[] = [];
        for (const p of withIg) {
            const igId = p.instagram_business_account!.id;
            const igRes = await fetch(
                `${GRAPH}/${igId}?fields=name,profile_picture_url,username&access_token=${encodeURIComponent(accessToken)}`
            );
            const ig = (await igRes.json()) as {
                name?: string;
                profile_picture_url?: string;
                username?: string;
            };
            out.push({
                pageId: p.id,
                id: igId,
                name: ig.name ?? p.name ?? ig.username ?? igId,
                pictureUrl: ig.profile_picture_url || p.picture?.data?.url || "",
            });
        }
        return out;
    }

    async fetchPageInformation(
        accessToken: string,
        data: { pageId: string; id: string }
    ): Promise<{
        id: string;
        name: string;
        access_token: string;
        picture: string;
        username: string;
    }> {
        const pageRes = await fetch(
            `${GRAPH}/${data.pageId}?fields=access_token,name,picture.type(large)&access_token=${encodeURIComponent(accessToken)}`
        );
        const pageJson = (await pageRes.json()) as { access_token?: string; name?: string };
        const pageToken = pageJson.access_token;
        if (!pageToken) throw new Error("Could not load Page access token");

        const igRes = await fetch(
            `${GRAPH}/${data.id}?fields=username,name,profile_picture_url&access_token=${encodeURIComponent(accessToken)}`
        );
        const ig = (await igRes.json()) as {
            id?: string;
            name?: string;
            profile_picture_url?: string;
            username?: string;
        };

        return {
            id: data.id,
            name: ig.name ?? pageJson.name ?? "",
            picture: ig.profile_picture_url ?? "",
            access_token: pageToken,
            username: ig.username ?? "",
        };
    }

    async reConnect(
        _facebookUserId: string,
        instagramBusinessAccountId: string,
        accessToken: string
    ): Promise<Omit<AuthTokenDetails, "refreshToken" | "expiresIn">> {
        const accounts = await this.listBetweenStepAccounts(accessToken);
        const match = accounts.find((a) => a.id === instagramBusinessAccountId);
        if (!match) {
            throw new Error("Selected Instagram account was not found for this login");
        }
        const information = await this.fetchPageInformation(accessToken, {
            id: instagramBusinessAccountId,
            pageId: match.pageId,
        });

        return {
            id: information.id,
            name: information.name,
            accessToken: information.access_token,
            picture: information.picture,
            username: information.username,
        };
    }
}
