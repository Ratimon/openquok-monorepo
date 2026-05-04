import { htmlToPlainText } from "../../utils/htmlToPlain";

export type InstagramGraphHost = "graph.instagram.com" | "graph.facebook.com";

/**
 * Publish a top-level comment on an Instagram media object, or a reply under an existing comment.
 *
 * @see https://developers.facebook.com/docs/instagram-api/reference/ig-media/comments
 * @see https://developers.facebook.com/docs/instagram-api/reference/ig-comment/replies
 */
export async function publishInstagramGraphComment(params: {
    graphHost: InstagramGraphHost;
    apiVersion: string;
    /** Published Instagram media id (`release_id` after main post). */
    mediaId: string;
    /**
     * Tip of the comment chain. When omitted or equal to `mediaId`, creates a top-level comment on the media.
     * Otherwise creates a reply under that comment id.
     */
    lastCommentId: string | undefined;
    message: string;
    accessToken: string;
}): Promise<{ commentId: string; mediaPermalink: string }> {
    const msg = htmlToPlainText(params.message ?? "").trim();
    if (!msg.length) {
        throw new Error("Instagram comment message is empty");
    }
    const mediaId = params.mediaId.trim();
    if (!mediaId) {
        throw new Error("Instagram media id is required to publish a comment");
    }

    const base = `https://${params.graphHost}/${params.apiVersion}`;
    const token = encodeURIComponent(params.accessToken);
    const last = (params.lastCommentId ?? "").trim();
    const parentIsMedia = !last || last === mediaId;

    const createUrl = parentIsMedia
        ? `${base}/${encodeURIComponent(mediaId)}/comments?message=${encodeURIComponent(msg)}&access_token=${token}`
        : `${base}/${encodeURIComponent(last)}/replies?message=${encodeURIComponent(msg)}&access_token=${token}`;

    const createRes = await fetch(createUrl, { method: "POST" });
    const createBody = (await createRes.json()) as { id?: string; error?: { message?: string } };
    if (!createBody.id) {
        throw new Error(createBody.error?.message ?? "Instagram comment failed");
    }

    const permRes = await fetch(
        `${base}/${encodeURIComponent(mediaId)}?fields=permalink&access_token=${token}`
    );
    const permJson = (await permRes.json()) as { permalink?: string; error?: { message?: string } };
    if (permJson.error?.message && !permJson.permalink) {
        // Comment succeeded; permalink is best-effort for releaseURL.
        return { commentId: createBody.id, mediaPermalink: "" };
    }

    return { commentId: createBody.id, mediaPermalink: typeof permJson.permalink === "string" ? permJson.permalink : "" };
}
