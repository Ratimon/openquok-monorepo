import type { GlobalPlugCatalogEntryDto, InternalPlugCatalogEntryDto } from "../../../utils/dtos/PlugDTO";
import type { IntegrationRecord } from "../../social.integrations.interface";
import type { TwitterApi } from "twitter-api-v2";

import { htmlToPlainText } from "../../../utils/content/htmlToPlain";
import { fetchXTweetLikeCount } from "./xAnalytics";
import { withXErrorMapping } from "./xErrors";

function sleepMs(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Channel-level X plugs (likes threshold via orchestrator). */
export const X_GLOBAL_PLUG_CATALOG: GlobalPlugCatalogEntryDto[] = [
    {
        methodName: "autoRepostPost",
        identifier: "x-auto-repost",
        title: "Auto repost posts",
        description:
            "When a post reaches a certain number of likes, repost it to increase engagement (runs up to 3 times, every 6 hours).",
        runEveryMilliseconds: 21600000,
        totalRuns: 3,
        fields: [
            {
                name: "likesAmount",
                description: "The number of likes required to trigger the repost",
                type: "number",
                placeholder: "Amount of likes",
                validation: "/^\\d+$/",
            },
        ],
    },
    {
        methodName: "autoPlugPost",
        identifier: "x-auto-plug",
        title: "Auto plug post",
        description:
            "When a post reaches a certain number of likes, publish a reply from this account to promote it.",
        runEveryMilliseconds: 21600000,
        totalRuns: 3,
        fields: [
            {
                name: "likesAmount",
                description: "The number of likes required to trigger the reply",
                type: "number",
                placeholder: "Amount of likes",
                validation: "/^\\d+$/",
            },
            {
                name: "post",
                description: "Message content for the reply",
                type: "richtext",
                placeholder: "Post to plug",
                validation: "/^[\\s\\S]{3,}$/g",
            },
        ],
    },
];

/** Post-compose cross-account repost plug. */
export const X_INTERNAL_PLUG_CATALOG: InternalPlugCatalogEntryDto[] = [
    {
        identifier: "x-repost-post-users",
        methodName: "repostPostUsers",
        title: "Add re-posters",
        description: "Choose other X channels to repost this post after it goes live.",
        pickIntegration: ["x"],
        fields: [],
    },
];

export async function runXAutoRepostPlug(
    client: TwitterApi,
    userId: string,
    tweetId: string,
    fields: { likesAmount: string }
): Promise<boolean> {
    const threshold = Number(fields.likesAmount);
    if (!Number.isFinite(threshold) || threshold < 0) return false;

    const likes = await fetchXTweetLikeCount(client, tweetId);
    if (likes < threshold) return false;

    await sleepMs(2000);
    await withXErrorMapping(() => client.v2.retweet(userId, tweetId));
    return true;
}

export async function runXAutoPlugPost(
    client: TwitterApi,
    tweetId: string,
    fields: { likesAmount: string; post: string },
    publishReply: (message: string, replyToTweetId: string) => Promise<void>
): Promise<boolean> {
    const threshold = Number(fields.likesAmount);
    if (!Number.isFinite(threshold) || threshold < 0) return false;

    const likes = await fetchXTweetLikeCount(client, tweetId);
    if (likes < threshold) return false;

    await sleepMs(2000);

    const text = htmlToPlainText(fields.post ?? "").trim();
    if (text.length < 3) return false;

    await publishReply(text, tweetId);
    return true;
}

export async function runXRepostFromAccount(client: TwitterApi, userId: string, tweetId: string): Promise<void> {
    if (!tweetId.trim()) return;
    await withXErrorMapping(() => client.v2.retweet(userId, tweetId.trim()));
}

export async function runXRepostPostUsersPlug(
    acting: IntegrationRecord,
    _original: IntegrationRecord,
    tweetId: string,
    _information: Record<string, unknown>,
    createClient: (token: string) => TwitterApi
): Promise<void> {
    const client = createClient(acting.token);
    await runXRepostFromAccount(client, acting.internal_id, tweetId);
}
