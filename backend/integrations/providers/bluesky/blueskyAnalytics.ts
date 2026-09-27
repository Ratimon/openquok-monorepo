import type { AnalyticsData } from "../../social.integrations.interface";

import { BskyAgent } from "@atproto/api";
import type { AppBskyFeedDefs } from "@atproto/api";

import {
    BSKY_APP_VIEW_SERVICE,
    type BlueskyAnalyticsAgent,
    type BlueskyPostEngagementSnapshot,
    fetchBlueskyAccountAnalytics as fetchBlueskyAccountAnalyticsCore,
    fetchBlueskyPostAnalytics as fetchBlueskyPostAnalyticsCore,
    mapBlueskyPostBucketsToAnalytics,
    mapBlueskyPostViewToAnalytics,
} from "./blueskyAnalyticsCore";

export {
    BSKY_APP_VIEW_SERVICE,
    mapBlueskyPostBucketsToAnalytics,
    mapBlueskyPostViewToAnalytics,
};

export function createBlueskyAppViewAgent(): BskyAgent {
    return new BskyAgent({ service: BSKY_APP_VIEW_SERVICE });
}

function toEngagementSnapshot(post: AppBskyFeedDefs.PostView): BlueskyPostEngagementSnapshot {
    return {
        indexedAt: post.indexedAt,
        recordCreatedAt: (post.record as { createdAt?: string } | undefined)?.createdAt,
        likeCount: post.likeCount,
        replyCount: post.replyCount,
        repostCount: post.repostCount,
        quoteCount: post.quoteCount,
    };
}

function wrapBskyAgent(agent: BskyAgent): BlueskyAnalyticsAgent {
    return {
        did: agent.did,
        login: (credentials) => agent.login(credentials),
        getPosts: async (params) => {
            const res = await agent.getPosts(params);
            return {
                data: {
                    posts: res.data.posts?.map(toEngagementSnapshot),
                },
            };
        },
        app: {
            bsky: {
                feed: {
                    getAuthorFeed: async (params) => {
                        const res = await agent.app.bsky.feed.getAuthorFeed(params);
                        return {
                            data: {
                                cursor: res.data.cursor,
                                feed: res.data.feed?.map((item) => ({
                                    post: item.post ? toEngagementSnapshot(item.post) : undefined,
                                })),
                            },
                        };
                    },
                },
            },
        },
    };
}

function defaultAgentFactory(service: string): BlueskyAnalyticsAgent {
    return wrapBskyAgent(new BskyAgent({ service }));
}

/** Account timeline aggregation from the public App View author feed. */
export async function fetchBlueskyAccountAnalytics(
    actorId: string,
    accessToken: string,
    dateWindowDays: number,
    deps?: { createAgent?: (service: string) => BlueskyAnalyticsAgent }
): Promise<AnalyticsData[]> {
    const createAgent = deps?.createAgent ?? defaultAgentFactory;
    return fetchBlueskyAccountAnalyticsCore(actorId, accessToken, dateWindowDays, { createAgent });
}

/** Per-post public engagement via App View `getPosts`. */
export async function fetchBlueskyPostAnalytics(
    releaseId: string,
    deps?: { createAgent?: (service: string) => BlueskyAnalyticsAgent }
): Promise<AnalyticsData[]> {
    const createAgent = deps?.createAgent ?? defaultAgentFactory;
    return fetchBlueskyPostAnalyticsCore(releaseId, { createAgent });
}
