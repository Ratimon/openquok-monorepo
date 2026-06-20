import type { GlobalPlugCatalogEntryDto, InternalPlugCatalogEntryDto } from "../../../utils/dtos/PlugDTO";
import type { IntegrationRecord } from "../../social.integrations.interface";
import { makeId } from "../../../utils/ids/makeId";
import { fixLinkedInCommentary, publishLinkedInComment, type LinkedInAuthorType } from "./linkedinPublish";
import { linkedinRestHeaders } from "./linkedinCommon";
import { htmlToPlainText } from "../../../utils/content/htmlToPlain";

function sleepMs(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Post-compose plugs: comment or reshare from another connected LinkedIn channel. */
export const LINKEDIN_INTERNAL_PLUG_CATALOG: InternalPlugCatalogEntryDto[] = [
    {
        identifier: "linkedin-add-comment",
        methodName: "addComment",
        title: "Add comments by a different account",
        description: "Choose other LinkedIn channels to comment on this post after it goes live.",
        pickIntegration: ["linkedin", "linkedin-page"],
        fields: [
            {
                name: "comment",
                description: "The comment to add to the post",
                type: "textarea",
                placeholder: "Enter your comment here",
            },
        ],
    },
    {
        identifier: "linkedin-repost-post-users",
        methodName: "repostPostUsers",
        title: "Add re-posters",
        description: "Choose other LinkedIn channels to reshare this post after it goes live.",
        pickIntegration: ["linkedin", "linkedin-page"],
        fields: [],
    },
];

/** Channel-level plugs for LinkedIn Page (likes threshold). */
export const LINKEDIN_PAGE_GLOBAL_PLUG_CATALOG: GlobalPlugCatalogEntryDto[] = [
    {
        methodName: "autoRepostPost",
        identifier: "linkedin-page-auto-repost",
        title: "Auto repost posts",
        description:
            "When a post reaches a certain number of likes, reshare it to increase engagement (runs up to 3 times, every 6 hours).",
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
        identifier: "linkedin-page-auto-plug",
        title: "Auto plug post",
        description:
            "When a post reaches a certain number of likes, add a comment from this Page to promote it.",
        runEveryMilliseconds: 21600000,
        totalRuns: 3,
        fields: [
            {
                name: "likesAmount",
                description: "The number of likes required to trigger the comment",
                type: "number",
                placeholder: "Amount of likes",
                validation: "/^\\d+$/",
            },
            {
                name: "post",
                description: "Message content for the promotional comment",
                type: "richtext",
                placeholder: "Post to plug",
                validation: "/^[\\s\\S]{3,}$/g",
            },
        ],
    },
];

export async function fetchLinkedInPostLikes(accessToken: string, postId: string): Promise<number> {
    const res = await fetch(
        `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(postId)}`,
        {
            method: "GET",
            headers: linkedinRestHeaders(accessToken),
        }
    );
    const json = (await res.json()) as {
        likesSummary?: { totalLikes?: number };
        message?: string;
    };
    if (!res.ok) {
        throw new Error(json.message ?? `LinkedIn likes lookup failed (HTTP ${res.status})`);
    }
    return Number(json.likesSummary?.totalLikes ?? 0);
}

export async function linkedInResharePost(
    integration: IntegrationRecord,
    postId: string,
    authorType: LinkedInAuthorType
): Promise<void> {
    const author =
        authorType === "personal"
            ? `urn:li:person:${integration.internal_id}`
            : `urn:li:organization:${integration.internal_id}`;

    const res = await fetch("https://api.linkedin.com/rest/posts", {
        method: "POST",
        headers: {
            ...linkedinRestHeaders(integration.token),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            author,
            commentary: "",
            visibility: "PUBLIC",
            distribution: {
                feedDistribution: "MAIN_FEED",
                targetEntities: [],
                thirdPartyDistributionChannels: [],
            },
            lifecycleState: "PUBLISHED",
            isReshareDisabledByAuthor: false,
            reshareContext: {
                parent: postId,
            },
        }),
    });

    if (!res.ok) {
        const errJson = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(errJson.message ?? `LinkedIn reshare failed (HTTP ${res.status})`);
    }
}

export async function runLinkedInAddCommentPlug(
    acting: IntegrationRecord,
    postId: string,
    information: { comment?: string },
    authorType: LinkedInAuthorType
): Promise<void> {
    const comment = typeof information.comment === "string" ? information.comment.trim() : "";
    if (!comment.length) return;

    await publishLinkedInComment(
        acting.internal_id,
        acting.token,
        postId,
        { id: makeId(10), message: comment, settings: {} },
        authorType
    );
}

export async function runLinkedInAutoPlugPost(
    integration: IntegrationRecord,
    postId: string,
    fields: { likesAmount: string; post: string },
    authorType: LinkedInAuthorType
): Promise<boolean> {
    const threshold = Number(fields.likesAmount);
    if (!Number.isFinite(threshold) || threshold < 0) return false;

    const totalLikes = await fetchLinkedInPostLikes(integration.token, postId);
    if (totalLikes < threshold) return false;

    await sleepMs(2000);

    const text = fixLinkedInCommentary(htmlToPlainText(fields.post ?? "").trim());
    if (text.length < 3) return false;

    const actor =
        authorType === "personal"
            ? `urn:li:person:${integration.internal_id}`
            : `urn:li:organization:${integration.internal_id}`;

    const res = await fetch(
        `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(postId)}/comments`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${integration.token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                actor,
                object: postId,
                message: { text },
            }),
        }
    );

    if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(json.message ?? `LinkedIn auto plug comment failed (HTTP ${res.status})`);
    }

    return true;
}
