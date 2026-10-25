import { META_GRAPH_API_VERSION } from "../facebook/metaGraphApiVersion.js";

function normalizeMetaGraphApiVersion(raw: string): string {
    const trimmed = raw.trim();
    if (!trimmed) return "v26.0";
    return trimmed.startsWith("v") ? trimmed : `v${trimmed}`;
}

/** Graph API version segment (e.g. `v26.0`) for Meta Facebook / Instagram Business calls. */
export function metaGraphApiVersion(): string {
    return normalizeMetaGraphApiVersion(META_GRAPH_API_VERSION);
}

/** `https://graph.facebook.com/{version}` */
export function metaFacebookGraphRoot(): string {
    return `https://graph.facebook.com/${metaGraphApiVersion()}`;
}

/** `https://graph.instagram.com/{version}` */
export function metaInstagramGraphRoot(): string {
    return `https://graph.instagram.com/${metaGraphApiVersion()}`;
}

/** Facebook Login OAuth dialog base URL (no query string). */
export function metaFacebookOAuthDialogUrl(): string {
    return `https://www.facebook.com/${metaGraphApiVersion()}/dialog/oauth`;
}
