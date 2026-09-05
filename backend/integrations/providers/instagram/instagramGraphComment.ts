import { throwIfMetaGraphInvalidAccessToken } from "../../../errors/metaGraphTokenError";
import { stripComposerBodyForEditor } from "../../../utils/content/stripComposerBodyForEditor.js";
import { humanizeInstagramGraphError } from "./instagramGraphErrors";

export type InstagramGraphHost = "graph.instagram.com" | "graph.facebook.com";

type GraphJson = {
    id?: string;
    permalink?: string;
    error?: { message?: string; code?: number; error_subcode?: number };
};

async function graphPostForm(url: string, params: Record<string, string>): Promise<GraphJson> {
    const body = new URLSearchParams(params);
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
    });
    const json = (await res.json()) as GraphJson;
    throwIfMetaGraphInvalidAccessToken(json);
    return json;
}

async function graphGet(url: string): Promise<GraphJson> {
    const res = await fetch(url);
    const json = (await res.json()) as GraphJson;
    throwIfMetaGraphInvalidAccessToken(json);
    return json;
}

function graphErrorMessage(json: GraphJson, fallback: string): string {
    const raw = json.error?.message?.trim();
    if (!raw) return fallback;
    return humanizeInstagramGraphError(raw);
}

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
    const msg = stripComposerBodyForEditor("normal", params.message ?? "");
    if (!msg.length) {
        throw new Error("Instagram comment message is empty");
    }
    const mediaId = params.mediaId.trim();
    if (!mediaId) {
        throw new Error("Instagram media id is required to publish a comment");
    }
    const accessToken = params.accessToken.trim();
    if (!accessToken) {
        throw new Error("Instagram access token is required to publish a comment");
    }

    const base = `https://${params.graphHost}/${params.apiVersion}`;
    const last = (params.lastCommentId ?? "").trim();
    const parentIsMedia = !last || last === mediaId;

    const createPath = parentIsMedia
        ? `${base}/${encodeURIComponent(mediaId)}/comments`
        : `${base}/${encodeURIComponent(last)}/replies`;

    const createBody = await graphPostForm(createPath, {
        message: msg,
        access_token: accessToken,
    });
    if (!createBody.id) {
        throw new Error(graphErrorMessage(createBody, "Instagram comment failed"));
    }

    const permJson = await graphGet(
        `${base}/${encodeURIComponent(mediaId)}?fields=permalink&access_token=${encodeURIComponent(accessToken)}`
    );
    if (permJson.error?.message && !permJson.permalink) {
        // Comment succeeded; permalink is best-effort for releaseURL.
        return { commentId: createBody.id, mediaPermalink: "" };
    }

    return {
        commentId: createBody.id,
        mediaPermalink: typeof permJson.permalink === "string" ? permJson.permalink : "",
    };
}
