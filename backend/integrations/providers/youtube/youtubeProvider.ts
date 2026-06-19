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
import { mapYoutubeApiError, publishYoutubeVideo } from "./youtubeDataPublish";

import dayjs from "dayjs";
import { google } from "googleapis";
import { config } from "../../../config/GlobalConfig";
import { AppError } from "../../../errors/AppError";
import { makeId } from "../../../utils/ids/makeId";
import { logger } from "../../../utils/Logger";
import { oauthFrontendOrigin } from "../../utils/oauthFrontendOrigin";
import { oauthFrontendSocialCallbackPath } from "../../utils/oauthFrontendCallbackPath";

export type YoutubeChannelOption = {
    id: string;
    name: string;
    pictureUrl: string;
    username?: string;
};

function youtubeOAuth(): { clientId: string; clientSecret: string } {
    return (config.integrations as { youtube: { clientId: string; clientSecret: string } }).youtube;
}

function youtubeRedirectUri(): string {
    return `${oauthFrontendOrigin()}${oauthFrontendSocialCallbackPath("youtube")}`;
}

function createOAuth2Client() {
    const { clientId, clientSecret } = youtubeOAuth();
    return new google.auth.OAuth2(clientId, clientSecret, youtubeRedirectUri());
}

function resolveChannelIdFromPayload(data: unknown): string {
    if (!data || typeof data !== "object") {
        throw new Error("Missing channel selection");
    }
    const o = data as Record<string, unknown>;
    const page = typeof o.page === "string" ? o.page.trim() : "";
    const pageId = typeof o.pageId === "string" ? o.pageId.trim() : "";
    const id = typeof o.id === "string" ? o.id.trim() : "";
    const resolved = page || pageId || id;
    if (!resolved) throw new Error("Missing channel selection");
    return resolved;
}

const YOUTUBE_ANALYTICS_METRICS = [
    "views",
    "estimatedMinutesWatched",
    "averageViewDuration",
    "averageViewPercentage",
    "subscribersGained",
    "likes",
    "subscribersLost",
].join(",");

const METRIC_LABELS: Record<string, string> = {
    views: "Views",
    estimatedMinutesWatched: "Watch time (minutes)",
    averageViewDuration: "Avg view duration",
    averageViewPercentage: "Avg view percentage",
    subscribersGained: "Subscribers gained",
    likes: "Likes",
    subscribersLost: "Subscribers lost",
};

export class YoutubeProvider implements SocialProvider {
    identifier = "youtube";
    name = "YouTube";
    editor = "normal" as const;
    isBetweenSteps = true;
    refreshCron = true;

    scopes = [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/youtube",
        "https://www.googleapis.com/auth/youtube.force-ssl",
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/youtube.upload",
        "https://www.googleapis.com/auth/yt-analytics.readonly",
    ];

    maxLength(_additionalSettings?: unknown): number {
        return 5000;
    }

    rules =
        "YouTube posts require exactly one MP4 video. Set a title (2–100 characters), privacy (public, private, or unlisted), optional tags, and an optional custom thumbnail image.";

    validateCreatePost(input: ValidateCreatePostInput): string | null {
        if (input.status === "scheduled" && input.mediaCount !== 1) {
            return "YouTube requires one video attachment";
        }
        return null;
    }

    async post(
        channelId: string,
        accessToken: string,
        postDetails: PostDetails[],
        _integration: IntegrationRecord
    ): Promise<PostResponse[]> {
        if (!postDetails.length) return [];
        const result = await publishYoutubeVideo(channelId, accessToken, postDetails[0]!);
        return [result];
    }

    private checkScopes(required: readonly string[], granted: readonly string[]): void {
        const missing = required.filter((s) => !granted.includes(s));
        if (missing.length > 0) {
            throw new Error(`Missing permissions: ${missing.join(", ")}`);
        }
    }

    async refreshToken(refreshToken: string): Promise<AuthTokenDetails> {
        const { clientId, clientSecret } = youtubeOAuth();
        if (!clientId || !clientSecret) {
            throw new AppError(
                "YouTube OAuth is not configured. Set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET.",
                503
            );
        }

        const oauth2 = createOAuth2Client();
        oauth2.setCredentials({ refresh_token: refreshToken });
        const { credentials } = await oauth2.refreshAccessToken();
        if (!credentials.access_token) {
            throw new Error("YouTube token refresh failed");
        }

        oauth2.setCredentials(credentials);
        const profile = await this.fetchGoogleProfile(oauth2);

        return {
            id: profile.id,
            name: profile.name,
            accessToken: credentials.access_token,
            refreshToken: credentials.refresh_token ?? refreshToken,
            expiresIn:
                credentials.expiry_date != null
                    ? Math.max(0, Math.floor((credentials.expiry_date - Date.now()) / 1000))
                    : dayjs().add(55, "minutes").unix() - dayjs().unix(),
            picture: profile.picture,
            username: profile.username,
        };
    }

    async generateAuthUrl(): Promise<GenerateAuthUrlResponse> {
        const { clientId } = youtubeOAuth();
        if (!clientId) {
            throw new AppError(
                "YouTube OAuth is not configured. Set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET.",
                503
            );
        }

        const state = makeId(6);
        const codeVerifier = makeId(10);
        const oauth2 = createOAuth2Client();
        const url = oauth2.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            scope: this.scopes,
            state,
        });

        return { url, codeVerifier, state };
    }

    async authenticate(params: { code: string; codeVerifier: string; refresh?: string }): Promise<AuthTokenDetails | string> {
        const { clientId, clientSecret } = youtubeOAuth();
        if (!clientId || !clientSecret) return "YouTube OAuth is not configured";

        const oauth2 = createOAuth2Client();
        let tokens;
        try {
            const result = await oauth2.getToken(params.code);
            tokens = result.tokens;
        } catch (e) {
            return e instanceof Error ? e.message : "YouTube token exchange failed";
        }

        if (!tokens.access_token) {
            return "YouTube token exchange failed";
        }

        oauth2.setCredentials(tokens);

        try {
            const tokenInfo = await oauth2.getTokenInfo(tokens.access_token);
            const granted = tokenInfo.scopes ?? [];
            this.checkScopes(this.scopes, granted);
        } catch (e) {
            return e instanceof Error ? e.message : "Missing OAuth permissions";
        }

        const profile = await this.fetchGoogleProfile(oauth2);

        return {
            id: profile.id,
            name: profile.name,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token ?? "",
            expiresIn:
                tokens.expiry_date != null
                    ? Math.max(0, Math.floor((tokens.expiry_date - Date.now()) / 1000))
                    : dayjs().add(55, "minutes").unix() - dayjs().unix(),
            picture: profile.picture,
            username: profile.username,
        };
    }

    private async fetchGoogleProfile(oauth2: InstanceType<typeof google.auth.OAuth2>): Promise<{
        id: string;
        name: string;
        username: string;
        picture: string;
    }> {
        const oauth2Api = google.oauth2({ version: "v2", auth: oauth2 });
        const res = await oauth2Api.userinfo.get();
        const data = res.data;
        return {
            id: data.id ?? "",
            name: data.name ?? data.email ?? "",
            username: data.email ?? "",
            picture: data.picture ?? "",
        };
    }

    async pages(accessToken: string): Promise<YoutubeChannelOption[]> {
        const oauth2 = new google.auth.OAuth2();
        oauth2.setCredentials({ access_token: accessToken });
        const youtube = google.youtube({ version: "v3", auth: oauth2 });
        const res = await youtube.channels.list({
            part: ["snippet"],
            mine: true,
            maxResults: 50,
        });

        return (res.data.items ?? []).map((ch) => ({
            id: ch.id ?? "",
            name: ch.snippet?.title ?? ch.id ?? "",
            pictureUrl: ch.snippet?.thumbnails?.default?.url ?? "",
            username: ch.snippet?.customUrl ?? undefined,
        }));
    }

    async fetchPageInformation(accessToken: string, data: unknown) {
        const channelId = resolveChannelIdFromPayload(data);
        const oauth2 = new google.auth.OAuth2();
        oauth2.setCredentials({ access_token: accessToken });
        const youtube = google.youtube({ version: "v3", auth: oauth2 });
        const res = await youtube.channels.list({
            part: ["snippet"],
            id: [channelId],
        });
        const ch = res.data.items?.[0];
        if (!ch?.id) {
            throw new Error("Channel not found in your accounts");
        }

        return {
            id: ch.id,
            name: ch.snippet?.title ?? "",
            access_token: accessToken,
            picture: ch.snippet?.thumbnails?.default?.url ?? "",
            username: ch.snippet?.customUrl ?? "",
        };
    }

    async reConnect(
        _googleUserId: string,
        channelId: string,
        accessToken: string
    ): Promise<Omit<AuthTokenDetails, "refreshToken" | "expiresIn">> {
        const information = await this.fetchPageInformation(accessToken, { id: channelId });
        return {
            id: information.id,
            name: information.name,
            accessToken: information.access_token,
            picture: information.picture,
            username: information.username,
        };
    }

    async analytics(channelId: string, accessToken: string, dateWindowDays: number): Promise<AnalyticsData[]> {
        const oauth2 = new google.auth.OAuth2();
        oauth2.setCredentials({ access_token: accessToken });
        const analytics = google.youtubeAnalytics({ version: "v2", auth: oauth2 });

        const endDate = dayjs().format("YYYY-MM-DD");
        const startDate = dayjs().subtract(dateWindowDays, "day").format("YYYY-MM-DD");

        try {
            const res = await analytics.reports.query({
                ids: `channel==${channelId}`,
                startDate,
                endDate,
                metrics: YOUTUBE_ANALYTICS_METRICS,
                dimensions: "day",
            });

            const headers = res.data.columnHeaders ?? [];
            const metricNames = headers
                .filter((h) => h.columnType === "METRIC")
                .map((h) => h.name ?? "")
                .filter(Boolean);

            const byMetric = new Map<string, Array<{ total: string; date: string }>>();
            for (const name of metricNames) {
                byMetric.set(name, []);
            }

            for (const row of res.data.rows ?? []) {
                const day = String(row[0] ?? "");
                metricNames.forEach((metric, idx) => {
                    const value = row[idx + 1];
                    const list = byMetric.get(metric);
                    if (list) {
                        list.push({ total: String(value ?? 0), date: day });
                    }
                });
            }

            return metricNames.map((metric) => ({
                label: METRIC_LABELS[metric] ?? metric,
                percentageChange: 0,
                data: byMetric.get(metric) ?? [],
                average: metric === "averageViewDuration" || metric === "averageViewPercentage",
            }));
        } catch {
            return [];
        }
    }

    async postAnalytics(
        _integrationId: string,
        accessToken: string,
        videoId: string,
        _fromDate: number
    ): Promise<AnalyticsData[]> {
        const trimmedVideoId = videoId.trim();
        if (!trimmedVideoId) {
            throw new Error("Missing YouTube video id for post analytics");
        }

        const today = dayjs().format("YYYY-MM-DD");
        const oauth2 = createOAuth2Client();
        oauth2.setCredentials({ access_token: accessToken });
        const youtube = google.youtube({ version: "v3", auth: oauth2 });

        try {
            const res = await youtube.videos.list({
                part: ["statistics"],
                id: [trimmedVideoId],
            });
            const item = res.data.items?.[0];
            if (!item) {
                logger.warn({
                    msg: "[YouTube] postAnalytics video not found for connected account",
                    videoId: trimmedVideoId,
                });
                throw new Error(
                    "YouTube video not found. Confirm the post is published on the connected channel, or reconnect YouTube."
                );
            }

            const stats = item.statistics ?? {};
            const rows: AnalyticsData[] = [];
            const push = (label: string, total: string | null | undefined) => {
                rows.push({
                    label,
                    percentageChange: 0,
                    data: [{ total: String(total ?? "0"), date: today }],
                });
            };

            push("Views", stats.viewCount);
            push("Likes", stats.likeCount);
            push("Comments", stats.commentCount);
            push("Favorites", stats.favoriteCount);
            return rows;
        } catch (err) {
            if (err instanceof Error && err.message.includes("YouTube video not found")) {
                throw err;
            }
            const message = mapYoutubeApiError(err);
            logger.warn({
                msg: "[YouTube] postAnalytics failed",
                videoId: trimmedVideoId,
                error: message,
            });
            throw new Error(message);
        }
    }
}
