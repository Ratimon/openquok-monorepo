import type { PostDetails, PostResponse } from "../../social.integrations.interface";
import { publicUrlForObjectKey } from "../../../repositories/MediaRepository";
import { stripComposerBodyForEditor } from "../../../utils/content/stripComposerBodyForEditor.js";
import { skoolFetchJson } from "./skoolApi";
import { parseSkoolSessionToken, type SkoolSessionCookies } from "./skoolCredentials";
import { resolveSkoolSettings } from "./resolveSkoolSettings";

type MediaItem = { path: string; bucket?: string };

type SettingsWithMedia = { media?: { items?: MediaItem[] } | MediaItem[] };

function extractMedia(settings: unknown): MediaItem[] {
    if (!settings || typeof settings !== "object") return [];
    const media = (settings as SettingsWithMedia).media;
    if (Array.isArray(media)) {
        return media.filter((m): m is MediaItem => !!m && typeof m.path === "string" && m.path.length > 0);
    }
    const items = media?.items;
    if (Array.isArray(items)) {
        return items.filter((m): m is MediaItem => !!m && typeof m.path === "string" && m.path.length > 0);
    }
    return [];
}

function resolvePublicMediaUrl(path: string): string {
    const raw = path.trim();
    if (!raw) throw new Error("Media path is empty");
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    const url = publicUrlForObjectKey(raw);
    if (!url) {
        throw new Error(
            "Cannot build a public media URL for Skool (set STORAGE_R2_PUBLIC_BASE_URL for R2, or use full https:// URLs)"
        );
    }
    return url;
}

async function uploadMediaToSkool(
    media: MediaItem[],
    userId: string,
    cookies: SkoolSessionCookies
): Promise<string> {
    if (!media.length) return "";

    const fileIds: string[] = [];

    for (const item of media) {
        const mediaUrl = resolvePublicMediaUrl(item.path);
        const headResponse = await fetch(mediaUrl, {
            method: "HEAD",
            headers: { "accept-encoding": "identity" },
            redirect: "follow",
        });
        const contentType = headResponse.headers.get("content-type") || "application/octet-stream";
        const contentLength = Number(headResponse.headers.get("content-length") || 0);
        if (!headResponse.ok || !contentLength) {
            throw new Error("Could not determine the media size for upload");
        }
        const fileName = item.path.split("/").pop() || "file";

        const createFileResponse = await skoolFetchJson<{
            write_url: string;
            content_type: string;
            acl: string;
            file: { id: string };
        }>("/files", cookies, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                file_name: fileName,
                content_type: contentType,
                content_length: contentLength,
                content_disposition: "",
                ref: "",
                owner_id: userId,
                large_thumbnail: false,
            }),
        });

        const fileResponse = await fetch(mediaUrl, {
            headers: { "accept-encoding": "identity" },
            redirect: "follow",
        });
        if (!fileResponse.ok || !fileResponse.body) {
            throw new Error(`Failed to fetch media: ${fileResponse.statusText}`);
        }

        const uploadResponse = await fetch(createFileResponse.write_url, {
            method: "PUT",
            headers: {
                "Content-Type": createFileResponse.content_type,
                "Content-Length": String(contentLength),
                "x-amz-acl": createFileResponse.acl,
            },
            body: fileResponse.body,
            duplex: "half",
        } as RequestInit);

        if (!uploadResponse.ok) {
            const errText = await uploadResponse.text().catch(() => "");
            throw new Error(errText || "Failed to upload the media file");
        }

        fileIds.push(createFileResponse.file.id);
    }

    return fileIds.join(",");
}

function skoolReleaseUrl(postSlug: string): string {
    const slug = postSlug.trim();
    if (!slug) return "https://www.skool.com/";
    if (slug.startsWith("http://") || slug.startsWith("https://")) return slug;
    return `https://www.skool.com/${slug.replace(/^\//, "")}`;
}

export async function publishSkoolPost(
    accessToken: string,
    internalUserId: string,
    postDetails: PostDetails
): Promise<PostResponse> {
    const cookies = parseSkoolSessionToken(accessToken);
    const resolved = resolveSkoolSettings(postDetails.settings);
    if (!resolved.groupId) {
        throw new Error("Skool group is required");
    }
    if (!resolved.title || resolved.title.length < 1) {
        throw new Error("Skool post title is required");
    }

    const message = stripComposerBodyForEditor("normal", postDetails.message);
    const attachments = await uploadMediaToSkool(extractMedia(postDetails.settings), internalUserId, cookies);

    const created = await skoolFetchJson<{ id: string; name: string }>(
        "/posts?follow=true",
        cookies,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                post_type: "generic",
                group_id: resolved.groupId,
                metadata: {
                    title: resolved.title,
                    content: message,
                    attachments,
                    ...(resolved.labelId ? { labels: resolved.labelId } : {}),
                    action: 0,
                    video_ids: "",
                },
            }),
        }
    );

    const postId = String(created.id);
    return {
        id: postId,
        postId,
        releaseURL: skoolReleaseUrl(created.name),
        status: "success",
    };
}

export async function publishSkoolComment(
    accessToken: string,
    internalUserId: string,
    rootPostId: string,
    parentPostId: string,
    postDetails: PostDetails
): Promise<PostResponse> {
    const cookies = parseSkoolSessionToken(accessToken);
    const resolved = resolveSkoolSettings(postDetails.settings);
    if (!resolved.groupId) {
        throw new Error("Skool group is required");
    }

    const message = stripComposerBodyForEditor("normal", postDetails.message);
    const attachments = await uploadMediaToSkool(extractMedia(postDetails.settings), internalUserId, cookies);

    const created = await skoolFetchJson<{ id: string; name: string }>(
        "/posts?follow=true",
        cookies,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                post_type: "comment",
                group_id: resolved.groupId,
                root_id: rootPostId,
                parent_id: parentPostId,
                metadata: {
                    title: "",
                    content: message,
                    attachments,
                    action: 0,
                    video_ids: "",
                },
            }),
        }
    );

    const postId = String(created.id);
    return {
        id: postId,
        postId,
        releaseURL: skoolReleaseUrl(created.name),
        status: "success",
    };
}

export type SkoolGroupOption = { value: string; label: string };

export async function fetchSkoolGroupOptions(
    cookies: SkoolSessionCookies,
    userId: string
): Promise<SkoolGroupOption[]> {
    const { groups } = await skoolFetchJson<{
        groups?: Array<{ id: string; metadata?: { display_name?: string } }>;
    }>(`/users/${encodeURIComponent(userId)}/groups?offset=0&limit=30`, cookies, { method: "GET" });

    if (!Array.isArray(groups)) return [];
    return groups
        .filter((g) => g?.id)
        .map((g) => ({
            value: String(g.id),
            label: g.metadata?.display_name?.trim() || String(g.id),
        }));
}

export async function fetchSkoolLabelOptions(
    cookies: SkoolSessionCookies,
    groupId: string
): Promise<SkoolGroupOption[]> {
    const { metadata } = await skoolFetchJson<{ metadata?: { labels?: string } }>(
        `/groups/${encodeURIComponent(groupId)}`,
        cookies,
        { method: "GET" }
    );

    const labelsCsv = metadata?.labels?.trim();
    if (!labelsCsv) {
        return [{ value: "none", label: "Default Label" }];
    }

    const labelIds = labelsCsv.split(",").map((s) => s.trim()).filter(Boolean);
    if (!labelIds.length) {
        return [{ value: "none", label: "Default Label" }];
    }

    const labelInformation = await Promise.all(
        labelIds.map((labelId) =>
            skoolFetchJson<{ id: string; metadata?: { display_name?: string } }>(
                `/labels/${encodeURIComponent(labelId)}`,
                cookies,
                { method: "GET" }
            )
        )
    );

    return labelInformation.map((p) => ({
        value: String(p.id),
        label: p.metadata?.display_name?.trim() || String(p.id),
    }));
}
