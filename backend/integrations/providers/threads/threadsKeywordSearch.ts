import { throwIfMetaGraphInvalidAccessToken } from "../../../errors/metaGraphTokenError.js";
import { stripComposerBodyForEditor } from "../../../utils/content/stripComposerBodyForEditor.js";

const GRAPH = "https://graph.threads.net/v1.0";
const KEYWORD_SEARCH_MAX_QUERY_LENGTH = 80;

export type ThreadsKeywordSearchHit = {
    id: string;
    text?: string;
    permalink?: string;
    username?: string;
};

function hasSearchableCharacters(text: string): boolean {
    return /[\p{L}\p{N}]/u.test(text);
}

/**
 * Build a keyword-search query from the publisher's root post body.
 * Meta requires interacting only with media recently found via keyword search.
 */
export function buildThreadsKeywordSearchQuery(plainText: string): string {
    const stripped = stripComposerBodyForEditor("normal", plainText ?? "");
    const lines = stripped.split(/\r?\n/);

    let candidate = "";
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length > 0) {
            candidate = trimmed;
            break;
        }
    }

    if (!candidate.length) {
        throw new Error(
            "Threads keyword search requires text in the root post. Add a caption with searchable words for cross-account comments."
        );
    }

    if (!hasSearchableCharacters(candidate)) {
        throw new Error(
            "Threads keyword search requires searchable text in the root post, not emoji-only captions."
        );
    }

    if (candidate.length > KEYWORD_SEARCH_MAX_QUERY_LENGTH) {
        const slice = candidate.slice(0, KEYWORD_SEARCH_MAX_QUERY_LENGTH);
        const lastSpace = slice.lastIndexOf(" ");
        candidate = lastSpace > 20 ? slice.slice(0, lastSpace) : slice;
    }

    return candidate;
}

/**
 * Search public Threads media by keyword (`threads_keyword_search`).
 *
 * @see https://developers.facebook.com/docs/threads/keyword-search/
 */
export async function threadsKeywordSearch(
    accessToken: string,
    query: string
): Promise<ThreadsKeywordSearchHit[]> {
    const q = query.trim();
    if (!q.length) {
        throw new Error("Threads keyword search query is empty");
    }
    const token = accessToken.trim();
    if (!token.length) {
        throw new Error("Threads access token is required for keyword search");
    }

    const params = new URLSearchParams({
        q,
        search_type: "TOP",
        fields: "id,text,permalink,username",
        access_token: token,
    });
    const url = `${GRAPH}/keyword_search?${params.toString()}`;

    const res = await fetch(url);
    const json = (await res.json()) as {
        data?: Array<{ id?: string; text?: string; permalink?: string; username?: string }>;
        error?: { message?: string; code?: number; error_subcode?: number };
    };
    throwIfMetaGraphInvalidAccessToken(json);

    if (!res.ok || json.error) {
        const msg = json.error?.message?.trim() || `HTTP ${res.status}`;
        throw new Error(`Threads keyword search failed: ${msg}`);
    }

    return (json.data ?? [])
        .filter(
            (row): row is { id: string; text?: string; permalink?: string; username?: string } =>
                typeof row?.id === "string" && row.id.length > 0
        )
        .map((row) => ({
            id: row.id,
            text: row.text,
            permalink: row.permalink,
            username: row.username,
        }));
}

/**
 * Verify the target thread appears in keyword search before a cross-account reply.
 */
export async function assertThreadDiscoverableViaKeywordSearch(
    accessToken: string,
    query: string,
    expectedThreadId: string
): Promise<void> {
    const threadId = expectedThreadId.trim();
    if (!threadId.length) {
        throw new Error("Threads thread id is required for keyword search verification");
    }

    const hits = await threadsKeywordSearch(accessToken, query);
    if (hits.some((hit) => hit.id === threadId)) {
        return;
    }

    throw new Error(
        `Threads cross-account reply requires the root post to appear in keyword search before commenting. ` +
            `Thread ${threadId} was not found for query "${query.trim()}". ` +
            `Try increasing the plug delay (for example 60 seconds or more) so Meta can index the post, use a distinctive caption with searchable text, ` +
            `or submit App Review for Advanced Access on threads_keyword_search to search other users' public posts.`
    );
}
