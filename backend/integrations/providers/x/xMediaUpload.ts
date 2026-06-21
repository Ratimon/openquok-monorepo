import type { TwitterApi } from "twitter-api-v2";

import { UploadFactory } from "../../../connections/upload/upload.factory";
import { storageR2Repository } from "../../../repositories/index";
import { publicUrlForObjectKey } from "../../../repositories/MediaRepository";

type MediaItem = { path: string; bucket?: string };

type SettingsWithMedia = { media?: { items?: MediaItem[] } | MediaItem[] };

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mediaExtFromPath(path: string): string {
    const raw = String(path || "").trim();
    if (!raw) return "";
    try {
        const u = new URL(raw);
        return (u.pathname.split(".").pop() ?? "").toLowerCase();
    } catch {
        return (raw.split("?")[0]?.split("#")[0]?.split(".").pop() ?? "").toLowerCase();
    }
}

function isVideoPath(path: string): boolean {
    const ext = mediaExtFromPath(path);
    return ext === "mp4" || ext === "mov" || ext === "m4v" || path.toLowerCase().includes("video");
}

async function loadMediaBuffer(path: string): Promise<Buffer> {
    const resolved =
        path.startsWith("http://") || path.startsWith("https://") ? path : publicUrlForObjectKey(path);
    if (!resolved) {
        throw new Error("Media path could not be resolved to a public URL");
    }
    if (resolved.startsWith("http://") || resolved.startsWith("https://")) {
        const res = await fetch(resolved);
        if (!res.ok) {
            throw new Error(`Failed to download media for X (HTTP ${res.status})`);
        }
        return Buffer.from(await res.arrayBuffer());
    }
    const upload = UploadFactory.createStorage(storageR2Repository);
    const { buffer } = await upload.downloadObject(path);
    return buffer;
}

function mimeFromPath(path: string): string {
    const ext = mediaExtFromPath(path);
    if (ext === "gif") return "image/gif";
    if (ext === "png") return "image/png";
    if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
    if (ext === "mp4" || ext === "mov" || ext === "m4v") return "video/mp4";
    return "application/octet-stream";
}

async function prepareImageBuffer(raw: Buffer, path: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const ext = mediaExtFromPath(path);
    if (ext === "gif") {
        return { buffer: raw, mimeType: "image/gif" };
    }

    const sharp = (await import("sharp")).default;
    const jpeg = await sharp(raw, { animated: ext === "gif" }).jpeg().resize({ width: 1000 }).toBuffer();
    return { buffer: jpeg, mimeType: "image/jpeg" };
}

export function extractXMedia(settings: unknown): MediaItem[] {
    if (!isPlainObject(settings)) return [];

    const media = settings.media;
    if (Array.isArray(media)) {
        return media.filter((m): m is MediaItem => !!m && typeof m.path === "string" && m.path.length > 0);
    }

    if (isPlainObject(media) && Array.isArray(media.items)) {
        return media.items.filter(
            (m): m is MediaItem => !!m && typeof m.path === "string" && m.path.length > 0
        );
    }

    return [];
}

export async function uploadXMediaForSettings(client: TwitterApi, settings: unknown): Promise<string[]> {
    const media = extractXMedia(settings);
    if (media.length === 0) return [];

    const hasVideo = media.some((m) => isVideoPath(m.path));
    if (hasVideo && media.length > 1) {
        throw new Error("X allows one video or up to four images per post, not both.");
    }
    if (media.length > 4) {
        throw new Error("X allows up to four images per post.");
    }

    const mediaIds: string[] = [];

    for (const item of media) {
        const raw = await loadMediaBuffer(item.path);
        if (isVideoPath(item.path)) {
            const mimeType = mimeFromPath(item.path);
            const mediaId = await client.v1.uploadMedia(raw, { mimeType, target: "tweet" });
            mediaIds.push(mediaId);
            continue;
        }

        const { buffer, mimeType } = await prepareImageBuffer(raw, item.path);
        const mediaId = await client.v1.uploadMedia(buffer, { mimeType, target: "tweet" });
        mediaIds.push(mediaId);
    }

    return mediaIds;
}
