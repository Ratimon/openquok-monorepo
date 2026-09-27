import type { GlobalPlugCatalogEntryDto } from "../../../utils/dtos/PlugDTO";
import type { IntegrationRecord } from "../../social.integrations.interface";
import type { BskyAgent } from "@atproto/api";

import { stripComposerBodyForEditor } from "../../../utils/content/stripComposerBodyForEditor.js";
import { createBlueskyAppViewAgent } from "./blueskyAnalytics";
import { parseBlueskyToken } from "./blueskyCredentials";
import { createBlueskyAgent, loginBlueskyAgent } from "./blueskyPublish";

function sleepMs(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Channel-level Bluesky plugs (likes threshold via orchestrator). */
export const BLUESKY_GLOBAL_PLUG_CATALOG: GlobalPlugCatalogEntryDto[] = [
    {
        methodName: "autoRepostPost",
        identifier: "bluesky-auto-repost",
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
        identifier: "bluesky-auto-plug",
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

export type BlueskyPlugsDeps = {
    createAppViewAgent?: () => BskyAgent;
    createAgent?: (service: string) => BskyAgent;
};

export async function fetchBlueskyPostLikeCount(
    postUri: string,
    deps?: BlueskyPlugsDeps
): Promise<number> {
    const uri = postUri.trim();
    if (!uri.includes("://")) {
        throw new Error("Missing Bluesky post URI for like lookup");
    }
    const createAppViewAgent = deps?.createAppViewAgent ?? createBlueskyAppViewAgent;
    const agent = createAppViewAgent();
    const res = await agent.getPosts({ uris: [uri] });
    const post = res.data.posts?.[0];
    return post?.likeCount ?? 0;
}

async function resolvePostStrongRef(
    agent: BskyAgent,
    postUri: string
): Promise<{ uri: string; cid: string }> {
    const uri = postUri.trim();
    if (!uri.includes("://")) {
        throw new Error("Bluesky post reference must be an AT Protocol URI");
    }
    const res = await agent.getPosts({ uris: [uri] });
    const post = res.data.posts?.[0];
    if (!post?.uri || !post.cid) {
        throw new Error("Bluesky could not resolve the post to repost");
    }
    return { uri: post.uri, cid: post.cid };
}

export async function repostBlueskyPost(
    token: string,
    postUri: string,
    deps?: BlueskyPlugsDeps
): Promise<void> {
    const credentials = parseBlueskyToken(token);
    const createAgent = deps?.createAgent ?? createBlueskyAgent;
    const agent = createAgent(credentials.service);
    await loginBlueskyAgent(agent, credentials);
    const subject = await resolvePostStrongRef(agent, postUri);
    await agent.repost(subject.uri, subject.cid);
}

export async function runBlueskyAutoRepostPlug(
    integration: IntegrationRecord,
    postUri: string,
    fields: { likesAmount: string },
    deps?: BlueskyPlugsDeps
): Promise<boolean> {
    const threshold = Number(fields.likesAmount);
    if (!Number.isFinite(threshold) || threshold < 0) return false;

    const likes = await fetchBlueskyPostLikeCount(postUri, deps);
    if (likes < threshold) return false;

    await sleepMs(2000);
    await repostBlueskyPost(integration.token, postUri, deps);
    return true;
}

export async function runBlueskyAutoPlugPost(
    integration: IntegrationRecord,
    postUri: string,
    fields: { likesAmount: string; post: string },
    publishReply: (message: string, rootUri: string, parentUri: string) => Promise<void>,
    deps?: BlueskyPlugsDeps
): Promise<boolean> {
    const threshold = Number(fields.likesAmount);
    if (!Number.isFinite(threshold) || threshold < 0) return false;

    const likes = await fetchBlueskyPostLikeCount(postUri, deps);
    if (likes < threshold) return false;

    await sleepMs(2000);

    const text = stripComposerBodyForEditor("normal", fields.post ?? "");
    if (text.length < 3) return false;

    const trimmed = postUri.trim();
    await publishReply(text, trimmed, trimmed);
    return true;
}
