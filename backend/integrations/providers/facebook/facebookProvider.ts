import type {
    AnalyticsData,
    AuthTokenDetails,
    GenerateAuthUrlResponse,
    IntegrationRecord,
    PostDetails,
    PostResponse,
    SocialProvider,
} from "../../social.integrations.interface";
import { publishFacebookComment, publishFacebookPagePost } from "./facebookGraphPublish";

import dayjs from "dayjs";
import { config } from "../../../config/GlobalConfig";
import { AppError } from "../../../errors/AppError";
import { makeId } from "../../../utils/ids/makeId";
import { oauthFrontendOrigin } from "../../utils/oauthFrontendOrigin";
import { oauthFrontendSocialCallbackPath } from "../../utils/oauthFrontendCallbackPath";

const GRAPH = "https://graph.facebook.com/v20.0";

export type FacebookPageOption = {
    id: string;
    name: string;
    pictureUrl: string;
    username?: string;
};

type GraphPageRow = {
    id: string;
    username?: string;
    name?: string;
    access_token?: string;
    picture?: { data?: { url?: string } };
};

function facebookOAuth(): { appId: string; appSecret: string } {
    return (config.integrations as { facebook: { appId: string; appSecret: string } }).facebook;
}

function facebookRedirectUri(): string {
    return `${oauthFrontendOrigin()}${oauthFrontendSocialCallbackPath("facebook")}`;
}

function normalizePageRow(page: GraphPageRow): FacebookPageOption {
    return {
        id: page.id,
        name: page.name ?? page.username ?? page.id,
        pictureUrl: page.picture?.data?.url ?? "",
        username: page.username,
    };
}

function resolvePageIdFromPayload(data: unknown): string {
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

/**
 * Facebook Page publishing via Meta Graph (Facebook Login + Page picker).
 * Reuses the same Meta app credentials as Instagram (Business).
 */
export class FacebookProvider implements SocialProvider {
    identifier = "facebook";
    name = "Facebook Page";
    editor = "normal" as const;
    isBetweenSteps = true;
    refreshCron = true;
    toolTip = "Connect a Facebook Page you manage";

    scopes = [
        "pages_show_list",
        "business_management",
        "pages_manage_posts",
        "pages_manage_engagement",
        "pages_read_engagement",
        "read_insights",
    ];

    maxLength(_additionalSettings?: unknown): number {
        return 63206;
    }

    rules =
        "Facebook Page posts support text, link previews (optional URL in provider settings), photos, multi-photo posts, and MP4 videos. Follow-up comments may include one image attachment. App must be Live for media to be visible to all users.";

    async post(
        pageId: string,
        accessToken: string,
        postDetails: PostDetails[],
        _integration: IntegrationRecord
    ): Promise<PostResponse[]> {
        if (!postDetails.length) return [];
        const result = await publishFacebookPagePost(pageId, accessToken, postDetails[0]!);
        return [result];
    }

    async comment(
        _pageId: string,
        postId: string,
        lastCommentId: string | undefined,
        accessToken: string,
        postDetails: PostDetails[],
        _integration: IntegrationRecord
    ): Promise<PostResponse[]> {
        if (!postDetails.length) return [];
        const replyToId = lastCommentId || postId;
        const result = await publishFacebookComment(replyToId, accessToken, postDetails[0]!);
        return [result];
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
                "Facebook OAuth is not configured. Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET.",
                503
            );
        }

        const state = makeId(6);
        const codeVerifier = makeId(10);
        const redirectUri = facebookRedirectUri();
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

        const redirectUri = facebookRedirectUri();

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

    async pages(accessToken: string): Promise<FacebookPageOption[]> {
        return this.listPages(accessToken);
    }

    async listPages(accessToken: string): Promise<FacebookPageOption[]> {
        const seenIds = new Set<string>();
        const allPages: GraphPageRow[] = [];
        const fields = "id,username,name,access_token,picture.type(large)";
        const enc = encodeURIComponent(accessToken);

        const fetchPaginated = async (startUrl: string): Promise<void> => {
            let nextUrl: string | undefined = startUrl;
            while (nextUrl) {
                const response = await fetch(nextUrl);
                const json = (await response.json()) as {
                    data?: GraphPageRow[];
                    paging?: { next?: string };
                };
                for (const page of json.data ?? []) {
                    if (!seenIds.has(page.id)) {
                        seenIds.add(page.id);
                        allPages.push(page);
                    }
                }
                nextUrl = json.paging?.next;
            }
        };

        await fetchPaginated(
            `${GRAPH}/me/accounts?fields=${fields}&limit=100&access_token=${enc}`
        );

        try {
            let bizUrl: string | undefined = `${GRAPH}/me/businesses?access_token=${enc}`;
            while (bizUrl) {
                const bizResponse = await fetch(bizUrl);
                const bizJson = (await bizResponse.json()) as {
                    data?: Array<{ id: string }>;
                    paging?: { next?: string };
                };
                for (const business of bizJson.data ?? []) {
                    try {
                        await fetchPaginated(
                            `${GRAPH}/${business.id}/owned_pages?fields=${fields}&limit=100&access_token=${enc}`
                        );
                    } catch {
                        // Continue with other businesses.
                    }
                    try {
                        await fetchPaginated(
                            `${GRAPH}/${business.id}/client_pages?fields=${fields}&limit=100&access_token=${enc}`
                        );
                    } catch {
                        // Continue with other businesses.
                    }
                }
                bizUrl = bizJson.paging?.next;
            }
        } catch {
            // Business Manager API is not available for all users.
        }

        return allPages.map(normalizePageRow);
    }

    async fetchPageInformation(accessToken: string, data: unknown) {
        const pageId = resolvePageIdFromPayload(data);
        const fields = "id,username,name,access_token,picture.type(large)";
        const enc = encodeURIComponent(accessToken);

        const searchPaginated = async (startUrl: string): Promise<GraphPageRow | null> => {
            let url: string | undefined = startUrl;
            while (url) {
                const response = await fetch(url);
                const json = (await response.json()) as {
                    data?: GraphPageRow[];
                    paging?: { next?: string };
                };
                const page = (json.data ?? []).find((p) => String(p.id) === String(pageId));
                if (page) return page;
                url = json.paging?.next;
            }
            return null;
        };

        const fromAccounts = await searchPaginated(
            `${GRAPH}/me/accounts?fields=${fields}&limit=100&access_token=${enc}`
        );
        if (fromAccounts?.access_token) {
            return {
                id: fromAccounts.id,
                name: fromAccounts.name ?? "",
                access_token: fromAccounts.access_token,
                picture: fromAccounts.picture?.data?.url ?? "",
                username: fromAccounts.username ?? "",
            };
        }

        try {
            let bizUrl: string | undefined = `${GRAPH}/me/businesses?access_token=${enc}`;
            while (bizUrl) {
                const bizResponse = await fetch(bizUrl);
                const bizJson = (await bizResponse.json()) as {
                    data?: Array<{ id: string }>;
                    paging?: { next?: string };
                };
                for (const business of bizJson.data ?? []) {
                    const fromOwned = await searchPaginated(
                        `${GRAPH}/${business.id}/owned_pages?fields=${fields}&limit=100&access_token=${enc}`
                    );
                    if (fromOwned?.access_token) {
                        return {
                            id: fromOwned.id,
                            name: fromOwned.name ?? "",
                            access_token: fromOwned.access_token,
                            picture: fromOwned.picture?.data?.url ?? "",
                            username: fromOwned.username ?? "",
                        };
                    }
                    const fromClient = await searchPaginated(
                        `${GRAPH}/${business.id}/client_pages?fields=${fields}&limit=100&access_token=${enc}`
                    );
                    if (fromClient?.access_token) {
                        return {
                            id: fromClient.id,
                            name: fromClient.name ?? "",
                            access_token: fromClient.access_token,
                            picture: fromClient.picture?.data?.url ?? "",
                            username: fromClient.username ?? "",
                        };
                    }
                }
                bizUrl = bizJson.paging?.next;
            }
        } catch {
            // Business Manager API is not available for all users.
        }

        throw new Error("Page not found in your accounts");
    }

    async reConnect(
        _facebookUserId: string,
        pageId: string,
        accessToken: string
    ): Promise<Omit<AuthTokenDetails, "refreshToken" | "expiresIn">> {
        const information = await this.fetchPageInformation(accessToken, { page: pageId });
        return {
            id: information.id,
            name: information.name,
            accessToken: information.access_token,
            picture: information.picture,
            username: information.username,
        };
    }

    async analytics(pageId: string, accessToken: string, dateWindowDays: number): Promise<AnalyticsData[]> {
        const until = dayjs().endOf("day").unix();
        const since = dayjs().subtract(dateWindowDays, "day").unix();
        const enc = encodeURIComponent(accessToken);

        const res = await fetch(
            `${GRAPH}/${pageId}/insights?metric=page_impressions_unique,page_posts_impressions_unique,page_post_engagements,page_daily_follows,page_video_views&access_token=${enc}&period=day&since=${since}&until=${until}`
        );
        const json = (await res.json()) as { data?: Array<{ name?: string; values?: Array<{ value?: number; end_time?: string }> }> };

        return (json.data ?? []).map((d) => ({
            label:
                d.name === "page_impressions_unique"
                    ? "Page Impressions"
                    : d.name === "page_post_engagements"
                      ? "Posts Engagement"
                      : d.name === "page_daily_follows"
                        ? "Page followers"
                        : d.name === "page_video_views"
                          ? "Videos views"
                          : "Posts Impressions",
            percentageChange: 0,
            data: (d.values ?? []).map((v) => ({
                total: String(v.value ?? 0),
                date: dayjs(v.end_time).format("YYYY-MM-DD"),
            })),
        }));
    }

    async postAnalytics(
        _integrationId: string,
        accessToken: string,
        postId: string,
        _fromDate: number
    ): Promise<AnalyticsData[]> {
        const today = dayjs().format("YYYY-MM-DD");
        const enc = encodeURIComponent(accessToken);

        try {
            const res = await fetch(
                `${GRAPH}/${postId}/insights?metric=post_impressions_unique,post_reactions_by_type_total,post_clicks,post_clicks_by_type&access_token=${enc}`
            );
            const json = (await res.json()) as {
                data?: Array<{ name?: string; values?: Array<{ value?: number | Record<string, number> }> }>;
            };

            const result: AnalyticsData[] = [];
            for (const metric of json.data ?? []) {
                const value = metric.values?.[0]?.value;
                if (value === undefined) continue;

                let label = "";
                let total = "";

                switch (metric.name) {
                    case "post_impressions_unique":
                        label = "Impressions";
                        total = String(value);
                        break;
                    case "post_clicks":
                        label = "Clicks";
                        total = String(value);
                        break;
                    case "post_clicks_by_type":
                        if (typeof value === "object") {
                            label = "Clicks by Type";
                            total = String(
                                Object.values(value).reduce((sum, v) => sum + Number(v), 0)
                            );
                        }
                        break;
                    case "post_reactions_by_type_total":
                        if (typeof value === "object") {
                            label = "Reactions";
                            total = String(
                                Object.values(value).reduce((sum, v) => sum + Number(v), 0)
                            );
                        }
                        break;
                }

                if (label) {
                    result.push({ label, percentageChange: 0, data: [{ total, date: today }] });
                }
            }
            return result;
        } catch {
            return [];
        }
    }
}
