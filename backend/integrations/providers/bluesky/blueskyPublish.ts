import type { PostDetails, PostResponse } from "../../social.integrations.interface";
import type { BlueskyStoredCredentials } from "./blueskyCredentials";
import type { BlueskyMediaItem } from "./blueskyMedia";

import { AtUri, BlobRef, BskyAgent, RichText } from "@atproto/api";
import sharp from "sharp";
import { UploadFactory } from "../../../connections/upload/upload.factory";
import { publicUrlForObjectKey } from "../../../repositories/MediaRepository";
import { storageR2Repository } from "../../../repositories/index";
import { stripComposerBodyForEditor } from "../../../utils/content/stripComposerBodyForEditor.js";
import { mediaExtFromUrlOrKey } from "../tiktok/tiktokPublishValidation";
import { parseBlueskyToken } from "./blueskyCredentials";
import {
    BLUESKY_MAX_LENGTH,
    classifyBlueskyMedia,
    extractBlueskyMediaFromSettings,
    validateBlueskyMediaMix,
} from "./blueskyMedia";

/** Bluesky blob upload limit (~976 KB). */
export const BLUESKY_BLOB_MAX_BYTES = 976_000;
const VIDEO_JOB_TIMEOUT_MS = 6 * 60 * 1000;
const VIDEO_POLL_INTERVAL_MS = 2_000;

export type BlueskyAgentLike = BskyAgent;

export function createBlueskyAgent(service: string): BskyAgent {
    return new BskyAgent({ service });
}

export async function loginBlueskyAgent(
    agent: BskyAgent,
    credentials: BlueskyStoredCredentials
): Promise<void> {
    await agent.login({
        identifier: credentials.identifier,
        password: credentials.password,
    });
}

export async function fetchBlueskyProfileForCredentials(
    credentials: BlueskyStoredCredentials
): Promise<{ id: string; name: string; username: string; picture: string }> {
    const agent = createBlueskyAgent(credentials.service);
    await loginBlueskyAgent(agent, credentials);
    const did = agent.did;
    if (!did) {
        throw new Error("Bluesky login did not return an account id");
    }
    const profileRes = await agent.getProfile({ actor: did });
    const handle = profileRes.data.handle?.trim() || credentials.identifier;
    const display = profileRes.data.displayName?.trim() || handle;
    return {
        id: did,
        name: display,
        username: handle,
        picture: profileRes.data.avatar?.trim() || "",
    };
}

function resolvePublicMediaUrl(path: string): string {
    const raw = path.trim();
    if (!raw) throw new Error("Media path is empty");
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    const url = publicUrlForObjectKey(raw);
    if (!url) {
        throw new Error(
            "Cannot build a public media URL for Bluesky (set STORAGE_R2_PUBLIC_BASE_URL for R2, or use full https:// URLs)"
        );
    }
    return url;
}

async function loadMediaBuffer(path: string): Promise<Buffer> {
    const resolved =
        path.startsWith("http://") || path.startsWith("https://") ? path : resolvePublicMediaUrl(path);
    if (resolved.startsWith("http://") || resolved.startsWith("https://")) {
        const res = await fetch(resolved);
        if (!res.ok) {
            throw new Error(`Failed to download media for Bluesky (HTTP ${res.status})`);
        }
        return Buffer.from(await res.arrayBuffer());
    }
    const upload = UploadFactory.createStorage(storageR2Repository);
    const { buffer } = await upload.downloadObject(path);
    return buffer;
}

async function resizeImageForBlueskyBlob(raw: Buffer, ext: string): Promise<Buffer> {
    let quality = 85;
    let width = 2000;
    let attempt = 0;
    while (attempt < 12) {
        const pipeline = sharp(raw, { animated: ext === "gif" })
            .rotate()
            .resize({ width, withoutEnlargement: true });
        const out =
            ext === "png" ?
                await pipeline.png({ compressionLevel: 9 }).toBuffer()
            :   await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
        if (out.length <= BLUESKY_BLOB_MAX_BYTES) {
            return out;
        }
        if (quality > 50) {
            quality -= 10;
        } else if (width > 800) {
            width = Math.floor(width * 0.85);
            quality = 80;
        } else {
            throw new Error("Bluesky image is too large after resizing");
        }
        attempt += 1;
    }
    throw new Error("Bluesky image is too large after resizing");
}

async function uploadImageBlob(agent: BskyAgent, item: BlueskyMediaItem) {
    const ext = mediaExtFromUrlOrKey(item.path) || "jpeg";
    const raw = await loadMediaBuffer(item.path);
    const body = await resizeImageForBlueskyBlob(raw, ext);
    const encoding = ext === "png" ? "image/png" : "image/jpeg";
    const uploaded = await agent.uploadBlob(body, { encoding });
    const alt = typeof item.alt === "string" ? item.alt.trim() : "";
    return { blob: uploaded.data.blob, alt };
}

async function waitForVideoBlob(agent: BskyAgent, jobId: string): Promise<BlobRef> {
    const deadline = Date.now() + VIDEO_JOB_TIMEOUT_MS;
    while (Date.now() < deadline) {
        const status = await agent.app.bsky.video.getJobStatus({ jobId });
        const job = status.data.jobStatus;
        if (job.state === "JOB_STATE_FAILED") {
            throw new Error(job.error || job.message || "Bluesky video processing failed");
        }
        if (job.state === "JOB_STATE_COMPLETED" && job.blob) {
            return job.blob;
        }
        await new Promise((r) => setTimeout(r, VIDEO_POLL_INTERVAL_MS));
    }
    throw new Error("Bluesky video processing timed out after six minutes");
}

async function uploadVideoEmbed(agent: BskyAgent, item: BlueskyMediaItem) {
    const raw = await loadMediaBuffer(item.path);
    const upload = await agent.app.bsky.video.uploadVideo(raw, { encoding: "video/mp4" });
    const blob = await waitForVideoBlob(agent, upload.data.jobStatus.jobId);
    const alt = typeof item.alt === "string" ? item.alt.trim() : "";
    return { blob, alt };
}

async function buildRichTextRecord(agent: BskyAgent, message: string) {
    const text = stripComposerBodyForEditor("normal", message);
    const rt = new RichText({ text });
    await rt.detectFacets(agent);
    if (rt.length > BLUESKY_MAX_LENGTH) {
        throw new Error(`Bluesky text exceeds the ${BLUESKY_MAX_LENGTH} character limit.`);
    }
    return {
        text: rt.text,
        facets: rt.facets,
    };
}

async function buildPostEmbed(agent: BskyAgent, media: BlueskyMediaItem[]) {
    const mixError = validateBlueskyMediaMix(media);
    if (mixError) throw new Error(mixError);
    const kind = classifyBlueskyMedia(media);
    if (kind === "empty") return undefined;
    if (kind === "video") {
        const video = await uploadVideoEmbed(agent, media[0]!);
        return {
            $type: "app.bsky.embed.video",
            video: video.blob,
            ...(video.alt ? { alt: video.alt } : {}),
        };
    }
    const images = await Promise.all(media.map((m) => uploadImageBlob(agent, m)));
    return {
        $type: "app.bsky.embed.images",
        images: images.map((img) => ({
            image: img.blob,
            ...(img.alt ? { alt: img.alt } : {}),
        })),
    };
}

export function blueskyReleaseUrl(handle: string, uri: string): string {
    const at = new AtUri(uri);
    const safeHandle = handle.replace(/^@/, "").trim();
    return `https://bsky.app/profile/${encodeURIComponent(safeHandle)}/post/${at.rkey}`;
}

async function resolveStrongRef(agent: BskyAgent, uriOrRef: string): Promise<{ uri: string; cid: string }> {
    const trimmed = uriOrRef.trim();
    if (!trimmed) {
        throw new Error("Bluesky post reference is required");
    }
    if (trimmed.includes("://")) {
        const res = await agent.getPosts({ uris: [trimmed] });
        const post = res.data.posts?.[0];
        if (!post?.uri || !post.cid) {
            throw new Error("Bluesky could not resolve the post to reply to");
        }
        return { uri: post.uri, cid: post.cid };
    }
    throw new Error("Bluesky post reference must be an AT Protocol URI");
}

export async function publishBlueskyPost(
    token: string,
    postDetails: PostDetails,
    deps?: { createAgent?: (service: string) => BskyAgent }
): Promise<PostResponse> {
    const credentials = parseBlueskyToken(token);
    const createAgent = deps?.createAgent ?? createBlueskyAgent;
    const agent = createAgent(credentials.service);
    await loginBlueskyAgent(agent, credentials);

    const media = extractBlueskyMediaFromSettings(postDetails.settings);
    const mixError = validateBlueskyMediaMix(media);
    if (mixError) throw new Error(mixError);

    const message = postDetails.message ?? "";
    if (!message.trim() && media.length === 0) {
        throw new Error("Bluesky requires text or at least one image or video.");
    }

    const rich = await buildRichTextRecord(agent, message);
    const embed = await buildPostEmbed(agent, media);

    const created = await agent.post({
        text: rich.text,
        ...(rich.facets?.length ? { facets: rich.facets } : {}),
        ...(embed ? { embed } : {}),
    });

    const handle =
        (await agent.getProfile({ actor: agent.did! }).catch(() => null))?.data.handle?.trim() ||
        credentials.identifier;

    return {
        id: postDetails.id,
        postId: created.uri,
        status: "success",
        releaseURL: blueskyReleaseUrl(handle, created.uri),
    };
}

export async function publishBlueskyReply(
    token: string,
    rootPostId: string,
    parentPostId: string,
    postDetails: PostDetails,
    deps?: { createAgent?: (service: string) => BskyAgent }
): Promise<PostResponse> {
    const credentials = parseBlueskyToken(token);
    const createAgent = deps?.createAgent ?? createBlueskyAgent;
    const agent = createAgent(credentials.service);
    await loginBlueskyAgent(agent, credentials);

    const media = extractBlueskyMediaFromSettings(postDetails.settings);
    const mixError = validateBlueskyMediaMix(media);
    if (mixError) throw new Error(mixError);

    const message = postDetails.message ?? "";
    if (!message.trim() && media.length === 0) {
        throw new Error("Bluesky reply text or media is required");
    }

    const root = await resolveStrongRef(agent, rootPostId);
    const parent = await resolveStrongRef(agent, parentPostId);

    const rich = await buildRichTextRecord(agent, message);
    const embed = await buildPostEmbed(agent, media);

    const created = await agent.post({
        text: rich.text,
        ...(rich.facets?.length ? { facets: rich.facets } : {}),
        ...(embed ? { embed } : {}),
        reply: {
            root,
            parent,
        },
    });

    const handle =
        (await agent.getProfile({ actor: agent.did! }).catch(() => null))?.data.handle?.trim() ||
        credentials.identifier;

    return {
        id: postDetails.id,
        postId: created.uri,
        status: "success",
        releaseURL: blueskyReleaseUrl(handle, created.uri),
    };
}

export async function searchBlueskyActors(
    token: string,
    query: string,
    deps?: { createAgent?: (service: string) => BskyAgent }
): Promise<{ id: string; label: string; image: string }[] | { none: true }> {
    const q = query.trim().replace(/^@/, "");
    if (!q) return { none: true };

    const credentials = parseBlueskyToken(token);
    const createAgent = deps?.createAgent ?? createBlueskyAgent;
    const agent = createAgent(credentials.service);
    await loginBlueskyAgent(agent, credentials);

    const res = await agent.searchActors({ q, limit: 10 });
    const actors = res.data.actors ?? [];
    if (!actors.length) return { none: true };

    return actors.map((actor) => ({
        id: actor.handle || actor.did,
        label: actor.displayName ? `${actor.displayName} (@${actor.handle})` : `@${actor.handle}`,
        image: actor.avatar?.trim() || "",
    }));
}
