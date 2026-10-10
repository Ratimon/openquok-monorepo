import type { PostMediaItemInput } from "backend/utils/dtos/PostDTO.js";

const FOLLOW_UP_COMMENT_MEDIA_PROVIDER_IDS = new Set([
    "threads",
    "x",
    "facebook",
    "skool",
    "bluesky",
]);

export function followUpCommentMediaAllowed(providerIdentifier: string): boolean {
    return FOLLOW_UP_COMMENT_MEDIA_PROVIDER_IDS.has(providerIdentifier.trim().toLowerCase());
}

export function attachFollowUpCommentMedia(
    settings: Record<string, unknown>,
    media: PostMediaItemInput[] | undefined,
    providerIdentifier: string
): Record<string, unknown> {
    if (!followUpCommentMediaAllowed(providerIdentifier) || !media?.length) {
        return settings;
    }
    return { ...settings, media: { items: media } };
}
