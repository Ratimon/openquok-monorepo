import { resolveExtensionPublishMode, type ExtensionPublishMode } from "openquok-common";
import type { SocialProvider } from "../../integrations/social.integrations.interface";
import type { IntegrationLike } from "../dtos/IntegrationDTO";
import { parsePostImageColumn, type PostMediaItemInput, type PostStateDb, type SocialPostLike } from "../dtos/PostDTO";
import { stripComposerBodyForEditor } from "../content/stripComposerBodyForEditor";
import { resolveRedditSettings } from "../../integrations/providers/reddit/resolveRedditSettings";
import { AppError } from "../../errors/AppError";
import { publicUrlForObjectKey } from "../../repositories/MediaRepository";

export type MemberBrowserHandoffMediaItemDto = {
    id: string;
    fileName: string;
};

export type MemberBrowserHandoffDto = {
    postId: string;
    providerIdentifier: string;
    title: string;
    body: string;
    subreddit: string;
    /** @deprecated Prefer `mediaItems` + authenticated download; public URLs may 404 when storage is private. */
    mediaUrls: string[];
    mediaItems: MemberBrowserHandoffMediaItemDto[];
};

function isValidHttpUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

export function resolveProviderExtensionPublishMode(provider: SocialProvider): ExtensionPublishMode | undefined {
    return resolveExtensionPublishMode({
        identifier: provider.identifier,
        isChromeExtension: provider.isChromeExtension,
        extensionPublishMode: provider.extensionPublishMode,
    });
}

export function isMemberBrowserHandoffProvider(provider: SocialProvider): boolean {
    return resolveProviderExtensionPublishMode(provider) === "member_browser_handoff";
}

export function assertMemberBrowserHandoffPost(
    post: SocialPostLike,
    organizationId: string,
    integration: IntegrationLike | null,
    provider: SocialProvider | undefined
): void {
    if (!post || post.organization_id !== organizationId) {
        throw new AppError("Post not found", 404);
    }
    if (!integration || integration.deleted_at) {
        throw new AppError("Channel not found for this post", 404);
    }
    if (!provider || !isMemberBrowserHandoffProvider(provider)) {
        throw new AppError("This post does not use member browser handoff", 400);
    }
    if (post.integration_id !== integration.id) {
        throw new AppError("Channel does not match this post", 400);
    }
}

function parsePostSettingsObject(settings: string | null): Record<string, unknown> {
    if (!settings?.trim()) return {};
    try {
        const parsed = JSON.parse(settings) as unknown;
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            return parsed as Record<string, unknown>;
        }
    } catch {
        return {};
    }
    return {};
}

function resolveMediaDownloadUrl(path: string): string | null {
    const trimmed = path.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
    }
    return publicUrlForObjectKey(trimmed);
}

function mediaUrlsFromPostImage(image: string | null): string[] {
    const items = parsePostImageColumn(image);
    const urls: string[] = [];
    for (const item of items) {
        const resolved = resolveMediaDownloadUrl(item.path ?? "");
        if (resolved) urls.push(resolved);
    }
    return urls;
}

export function fileNameFromMediaPath(path: string): string {
    const trimmed = path.trim();
    if (!trimmed) return "media";
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        try {
            const segment = new URL(trimmed).pathname.split("/").filter(Boolean).pop();
            if (segment) return decodeURIComponent(segment);
        } catch {
            // fall through
        }
        return "media";
    }
    const segment = trimmed.split("/").filter(Boolean).pop();
    return segment ? decodeURIComponent(segment) : "media";
}

function handoffMediaItemsFromPostImage(image: string | null): MemberBrowserHandoffMediaItemDto[] {
    return parsePostImageColumn(image).map((item) => ({
        id: item.id,
        fileName: fileNameFromMediaPath(item.path),
    }));
}

export function handoffMediaItemAtIndex(image: string | null, mediaIndex: number): PostMediaItemInput | null {
    if (!Number.isInteger(mediaIndex) || mediaIndex < 0) return null;
    const items = parsePostImageColumn(image);
    return items[mediaIndex] ?? null;
}

/**
 * Extension handoff payload for member-browser publish (Reddit v1).
 */
export function buildMemberBrowserHandoffDto(
    post: SocialPostLike,
    provider: SocialProvider
): MemberBrowserHandoffDto {
    const editor = provider.editor ?? "normal";
    const body = stripComposerBodyForEditor(editor, post.content ?? "").trim();
    const reddit = resolveRedditSettings(parsePostSettingsObject(post.settings));
    return {
        postId: post.id,
        providerIdentifier: provider.identifier,
        title: reddit.title,
        body,
        subreddit: reddit.subreddit,
        mediaUrls: mediaUrlsFromPostImage(post.image),
        mediaItems: handoffMediaItemsFromPostImage(post.image),
    };
}

export function assertHandoffReadableState(state: PostStateDb): void {
    if (state !== "AWAITING_MEMBER") {
        throw new AppError("Post is not awaiting member browser completion", 400);
    }
}

export function parseReleaseFieldsFromHandoffUrl(
    providerIdentifier: string,
    releaseUrlInput: string | undefined | null
): { releaseId: string | null; releaseUrl: string | null } {
    const releaseUrl = releaseUrlInput?.trim() ?? "";
    if (!releaseUrl) {
        return { releaseId: null, releaseUrl: null };
    }
    if (!isValidHttpUrl(releaseUrl)) {
        throw new AppError("releaseUrl must be a valid http or https URL", 400);
    }

    const id = providerIdentifier.trim().toLowerCase();
    if (id === "reddit") {
        const match = releaseUrl.match(/\/comments\/([a-z0-9]+)\//i);
        return { releaseId: match?.[1] ?? null, releaseUrl };
    }

    return { releaseId: null, releaseUrl };
}
