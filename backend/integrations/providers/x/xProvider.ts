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
import type { GlobalPlugCatalogEntryDto, InternalPlugCatalogEntryDto } from "../../../utils/dtos/PlugDTO";

import { TwitterApi } from "twitter-api-v2";
import { makeId } from "../../../utils/ids/makeId";
import {
    createXAppClient,
    createXUserClient,
    formatXAccessToken,
    xOAuth,
    xRedirectUri,
    xReleaseUrl,
} from "./xCommon";
import { withXErrorMapping } from "./xErrors";
import { uploadXMediaForSettings } from "./xMediaUpload";
import {
    buildTweetPayload,
    buildTweetText,
    resolveXSettings,
    validateTweetWeightedLength,
} from "./xPublish";
import { fetchXAccountAnalytics, fetchXPostAnalytics } from "./xAnalytics";
import {
    runXAutoPlugPost,
    runXAutoRepostPlug,
    runXRepostPostUsersPlug,
    X_GLOBAL_PLUG_CATALOG,
    X_INTERNAL_PLUG_CATALOG,
} from "./xPlugs";

/** X (Twitter) OAuth 1.0a provider. */
export class XProvider implements SocialProvider {
    identifier = "x";
    name = "X";
    editor = "normal" as const;
    isBetweenSteps = false;

    scopes = ["tweet.read", "tweet.write", "users.read", "offline.access"];

    rules =
        "Posts support plain text with up to four images or one video. Standard accounts have a 280 weighted character limit; Verified (Premium) accounts may use up to 4000. Thread replies chain as quote-less replies. OAuth tokens are long-lived — reconnect on auth errors.";

    globalPlugCatalog(): GlobalPlugCatalogEntryDto[] {
        return X_GLOBAL_PLUG_CATALOG;
    }

    internalPlugCatalog(): InternalPlugCatalogEntryDto[] {
        return X_INTERNAL_PLUG_CATALOG;
    }

    maxLength(verified?: unknown): number {
        return verified === true ? 4000 : 280;
    }

    validateCreatePost(input: ValidateCreatePostInput): string | null {
        if (input.mediaCount > 4) {
            return "X allows up to four images or one video per post.";
        }
        return null;
    }

    async post(
        _userId: string,
        accessToken: string,
        postDetails: PostDetails[],
        integration: IntegrationRecord
    ): Promise<PostResponse[]> {
        if (!postDetails.length) return [];

        const client = createXUserClient(accessToken);
        const verified = this.readVerifiedFromIntegration(integration);
        const maxLen = this.maxLength(verified);
        const out: PostResponse[] = [];

        for (const detail of postDetails) {
            const settings = resolveXSettings(detail.settings);
            const text = buildTweetText(detail.message, settings);
            validateTweetWeightedLength(text, maxLen);

            const mediaIds = await withXErrorMapping(() =>
                uploadXMediaForSettings(client, detail.settings)
            );
            const payload = buildTweetPayload(text, settings, mediaIds);
            const tweet = await withXErrorMapping(() => client.v2.tweet(payload));
            const tweetId = tweet.data.id;

            out.push({
                id: detail.id,
                postId: tweetId,
                status: "success",
                releaseURL: xReleaseUrl(integration.name || integration.internal_id, tweetId),
            });
        }

        return out;
    }

    async comment(
        _userId: string,
        postId: string,
        lastCommentId: string | undefined,
        accessToken: string,
        postDetails: PostDetails[],
        integration: IntegrationRecord
    ): Promise<PostResponse[]> {
        if (!postDetails.length) return [];

        const client = createXUserClient(accessToken);
        const [first] = postDetails;
        const settings = resolveXSettings(first.settings);
        const text = buildTweetText(first.message, settings);
        const verified = this.readVerifiedFromIntegration(integration);
        const maxLen = this.maxLength(verified);
        validateTweetWeightedLength(text, maxLen);

        const replyToId = (lastCommentId ?? postId ?? "").trim();
        if (!replyToId) {
            throw new Error("X reply target tweet id is required");
        }

        const mediaIds = await withXErrorMapping(() => uploadXMediaForSettings(client, first.settings));
        const payload = buildTweetPayload(text, settings, mediaIds, replyToId);
        const tweet = await withXErrorMapping(() => client.v2.tweet(payload));

        return [
            {
                id: first.id,
                postId: tweet.data.id,
                status: "success",
                releaseURL: xReleaseUrl(integration.name || integration.internal_id, tweet.data.id),
            },
        ];
    }

    async mention(
        token: string,
        data: { query: string },
        _id: string,
        _integration: IntegrationRecord
    ): Promise<{ id: string; label: string; image: string }[] | { none: true }> {
        const query = (data.query ?? "").trim().replace(/^@/, "");
        if (!query) return { none: true };

        const client = createXUserClient(token);
        const result = await withXErrorMapping(() =>
            client.v1.get("users/search.json", { q: query, count: 10, include_entities: false })
        );

        const users = (result as { users?: Array<{ id_str?: string; name?: string; screen_name?: string; profile_image_url_https?: string }> })
            .users;
        if (!users?.length) return { none: true };

        return users.map((user) => ({
            id: user.id_str ?? "",
            label: user.name ? `${user.name} (@${user.screen_name ?? ""})` : `@${user.screen_name ?? ""}`,
            image: user.profile_image_url_https ?? "",
        }));
    }

    mentionFormat(idOrHandle: string, name: string): string {
        const handle = idOrHandle.replace(/^@/, "").trim();
        const display = name.replace(/^@/, "").trim();
        return `@${handle || display}`;
    }

    async generateAuthUrl(): Promise<GenerateAuthUrlResponse> {
        const client = createXAppClient();
        const link = await withXErrorMapping(() =>
            client.generateAuthLink(xRedirectUri(), { linkMode: "authorize" })
        );

        return {
            url: link.url,
            state: link.oauth_token,
            codeVerifier: `${link.oauth_token}:${link.oauth_token_secret}`,
        };
    }

    async authenticate(params: {
        code: string;
        codeVerifier: string;
        refresh?: string;
    }): Promise<AuthTokenDetails | string> {
        const { apiKey, apiSecret } = xOAuth();
        if (!apiKey || !apiSecret) return "X OAuth is not configured";

        const separator = params.codeVerifier.indexOf(":");
        if (separator <= 0) return "Invalid X OAuth session";

        const oauthToken = params.codeVerifier.slice(0, separator);
        const oauthSecret = params.codeVerifier.slice(separator + 1);
        if (!oauthToken || !oauthSecret) return "Invalid X OAuth session";

        const requestClient = new TwitterApi({
            appKey: apiKey,
            appSecret: apiSecret,
            accessToken: oauthToken,
            accessSecret: oauthSecret,
        });
        const { client: loggedClient, accessToken, accessSecret } = await withXErrorMapping(() =>
            requestClient.login(params.code)
        );

        const me = await withXErrorMapping(() =>
            loggedClient.v2.me({ "user.fields": ["profile_image_url", "username"] })
        );

        const username = me.data.username ?? "";
        return {
            id: me.data.id,
            name: me.data.name ?? username,
            username,
            picture: me.data.profile_image_url ?? "",
            accessToken: formatXAccessToken(accessToken, accessSecret),
            additionalSettings: [
                {
                    title: "Verified",
                    description: "Enable when this account has X Premium for longer posts (4000 characters).",
                    type: "checkbox",
                    value: false,
                },
            ],
        };
    }

    async refreshToken(refreshToken: string): Promise<AuthTokenDetails> {
        const [accessToken] = refreshToken.split(":");
        if (!accessToken) {
            throw new Error("X tokens cannot be refreshed automatically. Reconnect the channel.");
        }
        throw new Error("X tokens cannot be refreshed automatically. Reconnect the channel.");
    }

    async analytics(id: string, accessToken: string, dateWindowDays: number): Promise<AnalyticsData[]> {
        const client = createXUserClient(accessToken);
        return withXErrorMapping(() => fetchXAccountAnalytics(client, id, dateWindowDays));
    }

    async postAnalytics(
        _integrationId: string,
        accessToken: string,
        releaseId: string,
        _fromDateDays: number
    ): Promise<AnalyticsData[]> {
        const client = createXUserClient(accessToken);
        return withXErrorMapping(() => fetchXPostAnalytics(client, releaseId));
    }

    async autoRepostPost(
        integration: IntegrationRecord,
        tweetId: string,
        fields: { likesAmount: string }
    ): Promise<boolean> {
        const client = createXUserClient(integration.token);
        return runXAutoRepostPlug(client, integration.internal_id, tweetId, fields);
    }

    async autoPlugPost(
        integration: IntegrationRecord,
        tweetId: string,
        fields: { likesAmount: string; post: string }
    ): Promise<boolean> {
        const client = createXUserClient(integration.token);
        return runXAutoPlugPost(client, tweetId, fields, async (message, replyToTweetId) => {
            await this.comment(
                integration.internal_id,
                tweetId,
                replyToTweetId,
                integration.token,
                [{ id: makeId(10), message, settings: {} }],
                integration
            );
        });
    }

    async repostPostUsers(
        acting: IntegrationRecord,
        original: IntegrationRecord,
        tweetId: string,
        information: Record<string, unknown>
    ): Promise<void> {
        await runXRepostPostUsersPlug(acting, original, tweetId, information, createXUserClient);
    }

    private readVerifiedFromIntegration(integration: IntegrationRecord): boolean {
        const raw = (integration as IntegrationRecord & { additional_settings?: string | null })
            .additional_settings;
        if (!raw?.trim()) return false;
        try {
            const parsed = JSON.parse(raw) as Array<{ title?: string; value?: unknown }>;
            return parsed.find((s) => s.title === "Verified")?.value === true;
        } catch {
            return false;
        }
    }
}
