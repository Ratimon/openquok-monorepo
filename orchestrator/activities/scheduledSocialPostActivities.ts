import type { IntegrationManager } from "backend/integrations/integrationManager.js";
import type { AuthTokenDetails, IntegrationRecord, PostDetails, PostResponse } from "backend/integrations/social.integrations.interface.js";
import type { IntegrationRepository } from "backend/repositories/IntegrationRepository.js";
import type { IntegrationLike } from "backend/utils/dtos/IntegrationDTO.js";
import type { PostThreadReplyLike, SocialPostLike } from "backend/utils/dtos/PostDTO.js";
import type { NotificationService } from "backend/services/NotificationService.js";
import type { NotificationEmailType } from "openquok-common";

import { logger } from "backend/utils/Logger.js";
import { RefreshIntegrationService } from "backend/services/RefreshIntegrationService.js";

export type ScheduledPostsRepository = {
    listPostsByGroup: (postGroup: string) => Promise<SocialPostLike[]>;
    markPostState: (postId: string, state: "QUEUE" | "PUBLISHED" | "ERROR" | "DRAFT", errMessage?: string | null) => Promise<void>;
    updatePostRowPublishResult: (
        postId: string,
        input: { state: "PUBLISHED" | "ERROR"; releaseId: string | null; releaseUrl: string | null; error: string | null }
    ) => Promise<void>;
    createRepeatGroupFromPostGroup: (params: {
        postGroup: string;
        publishDateIso: string;
    }) => Promise<{ postGroup: string; posts: SocialPostLike[] }>;

    // Thread replies (follow-up comments)
    listThreadRepliesByPostId?: (postId: string) => Promise<PostThreadReplyLike[]>;
    updateThreadReplyPublishResult?: (
        replyId: string,
        input: { state: "PUBLISHED" | "ERROR"; releaseId: string | null; releaseUrl: string | null; error: string | null }
    ) => Promise<void>;
};

const PUBLISH_ATTEMPTS = 5;

const META_OPAQUE_MESSAGE = "An unknown error occurred";

type PublishDeps = {
    postsRepository: Pick<
        ScheduledPostsRepository,
        "markPostState" | "updatePostRowPublishResult" | "listThreadRepliesByPostId" | "updateThreadReplyPublishResult"
    >;
    integrationRepository: Pick<IntegrationRepository, "getById">;
    integrationManager: IntegrationManager;
    refreshService: Pick<RefreshIntegrationService, "refresh">;
    notificationService?: Pick<NotificationService, "inAppNotification">;
};

function isNonRefreshablePublishError(message: string): boolean {
    const m = (message || "").toLowerCase();
    // Token refresh cannot fix these: they are configuration / media-public-access issues.
    if (m.includes("cannot build a public media url")) return true;
    if (m.includes("storage_r2_public_base_url")) return true;
    if (m.includes("media url is not publicly reachable")) return true;
    if (m.includes("meta must fetch this url")) return true;
    if (m.includes("bucket policy")) return true;
    // Meta rejection of the media URI (format/content requirements); refresh cannot fix.
    if (m.includes("the media could not be fetched from this uri")) return true;
    if (m.includes("media download has failed")) return true;
    if (m.includes("media uri doesn't meet our requirements")) return true;
    if (m.includes("error_subcode") && m.includes("2207052")) return true;
    return false;
}

/**
 * If the DB only ever shows Meta’s stock message, the process is often loading an outdated `backend/dist`
 * (e.g. worker image built without `pnpm --filter backend build` after changing Threads). Surface that in the row.
 */
function postPublishErrorForStorage(err: unknown, max = 4000): string {
    const raw = err instanceof Error ? err.message : String(err);
    const trimmed = raw.trim();
    if (trimmed === META_OPAQUE_MESSAGE) {
        return `Publish failed: ${META_OPAQUE_MESSAGE} (rebuild: run pnpm --filter backend build in the deploy, restart this worker, or check error logs; new backend builds prefix these with Threads...)`.slice(
            0,
            max
        );
    }
    if (typeof raw === "string" && !raw.startsWith("Threads") && /unknown error occurred/i.test(raw)) {
        return `Publish failed: ${raw} (if there is no Threads- prefix, the worker may be on stale backend/dist)`.slice(0, max);
    }
    return `Publish failed: ${raw}`.slice(0, max);
}

function integrationRowToRecord(row: IntegrationLike): IntegrationRecord {
    return {
        id: row.id,
        organization_id: row.organization_id,
        internal_id: row.internal_id,
        name: row.name,
        picture: row.picture,
        provider_identifier: row.provider_identifier,
        type: row.type,
        token: row.token,
        refresh_token: row.refresh_token,
        token_expiration: row.token_expiration,
        root_internal_id: row.root_internal_id,
        in_between_steps: row.in_between_steps,
        refresh_needed: row.refresh_needed,
        deleted_at: row.deleted_at,
    };
}

function postRowToPostDetails(row: SocialPostLike): PostDetails {
    let settings: Record<string, unknown> = {};
    if (row.settings) {
        try {
            const o = JSON.parse(row.settings) as unknown;
            if (o && typeof o === "object") settings = o as Record<string, unknown>;
        } catch {
            /* use empty */
        }
    }
    if (row.image) {
        try {
            const img = JSON.parse(row.image) as { items?: unknown };
            if (img && typeof img === "object" && "items" in img) {
                settings = { ...settings, media: img };
            }
        } catch {
            /* ignore */
        }
    }
    return {
        id: row.id,
        message: row.content ?? "",
        settings,
    };
}

function firstPostResponse(r: PostResponse[] | void): { releaseId: string; releaseUrl: string } {
    const x = (r && r[0]) ?? null;
    if (!x) {
        return { releaseId: "", releaseUrl: "" };
    }
    return { releaseId: x.postId ?? x.id, releaseUrl: x.releaseURL ?? "" };
}

function parseProviderSettingsFromPostRow(row: SocialPostLike): Record<string, unknown> | null {
    if (!row.settings) return null;
    try {
        const o = JSON.parse(row.settings) as { providerSettings?: unknown };
        if (o && typeof o === "object" && o.providerSettings && typeof o.providerSettings === "object") {
            return o.providerSettings as Record<string, unknown>;
        }
        return null;
    } catch {
        return null;
    }
}

function threadsThreadFinisherMessageFromSettings(settings: Record<string, unknown> | null): string | null {
    const s = settings as { threads?: unknown } | null;
    const threads = (s && typeof s.threads === "object" ? (s.threads as any) : null) as
        | { enabled?: unknown; message?: unknown }
        | null;
    if (!threads) return null;
    if (threads.enabled !== true) return null;
    const msg = typeof threads.message === "string" ? threads.message.trim() : "";
    return msg.length > 0 ? msg : null;
}

function capitalizeProvider(id: string): string {
    const t = id.trim();
    if (!t) return t;
    return t[0].toUpperCase() + t.slice(1);
}

/** Notification behavior: best-effort; never fails publishing. */
async function notify(
    service: Pick<NotificationService, "inAppNotification"> | undefined,
    organizationId: string,
    subject: string,
    message: string,
    sendEmail: boolean,
    digest: boolean,
    type: NotificationEmailType
): Promise<void> {
    if (!service) return;
    try {
        logger.info({
            msg: "[Orchestrator] Attempting notification",
            organizationId,
            subject,
            sendEmail,
            digest,
            type,
        });
        await service.inAppNotification(organizationId, subject, message, sendEmail, digest, type);
        logger.info({
            msg: "[Orchestrator] Notification completed",
            organizationId,
            subject,
            sendEmail,
            digest,
            type,
        });
    } catch (err) {
        logger.warn({
            msg: "[Orchestrator] Failed to create or email notification (best-effort)",
            organizationId,
            subject,
            sendEmail,
            digest,
            type,
            error: err instanceof Error ? err.message : String(err),
        });
    }
}

async function resolveIntegrationOrFail(
    post: SocialPostLike & { integration_id: string },
    deps: PublishDeps
): Promise<{ ok: true; integration: IntegrationLike } | { ok: false }> {
    const organizationId = post.organization_id;
    const postId = post.id;
    const ns = deps.notificationService;

    const integrationId = post.integration_id;
    const provider = await deps.integrationRepository.getById(organizationId, integrationId);
    if (!provider) {
        await deps.postsRepository.markPostState(postId, "ERROR", "Channel not found for this workspace");
        await notify(
            ns,
            organizationId,
            "We couldn't publish your post",
            "The selected channel for this post was not found. Choose a valid channel and try again.",
            true,
            false,
            "fail"
        );
        return { ok: false };
    }
    if (provider.deleted_at) {
        await deps.postsRepository.markPostState(postId, "ERROR", "That channel is no longer connected");
        const label = capitalizeProvider(provider.provider_identifier);
        const chName = provider.name || "channel";
        await notify(
            ns,
            organizationId,
            `We couldn't post to ${label} for ${chName}`,
            `We couldn't post to ${label} for ${chName} because that connection is no longer available. Reconnect the channel and try again.`,
            true,
            false,
            "info"
        );
        return { ok: false };
    }
    if (provider.refresh_needed) {
        await deps.postsRepository.markPostState(postId, "ERROR", "Reconnect the channel, then try again");
        const label = capitalizeProvider(provider.provider_identifier);
        const chName = provider.name || "channel";
        await notify(
            ns,
            organizationId,
            `We couldn't post to ${label} for ${chName}`,
            `We couldn't post to ${label} for ${chName} because you need to reconnect it. Reconnect the channel and try again.`,
            true,
            false,
            "info"
        );
        return { ok: false };
    }
    if (provider.disabled) {
        await deps.postsRepository.markPostState(postId, "ERROR", "That channel is disabled");
        const label = capitalizeProvider(provider.provider_identifier);
        const chName = provider.name || "channel";
        await notify(
            ns,
            organizationId,
            `We couldn't post to ${label} for ${chName}`,
            `We couldn't post to ${label} for ${chName} because it's disabled. Enable it in channel settings and try again.`,
            true,
            false,
            "info"
        );
        return { ok: false };
    }

    return { ok: true, integration: provider };
}

async function resolveSocialProviderOrFail(
    input: { organizationId: string; postId: string; providerIdentifier: string },
    deps: PublishDeps
): Promise<{ ok: true; social: any } | { ok: false }> {
    const ns = deps.notificationService;
    const social = deps.integrationManager.getSocialIntegration(input.providerIdentifier);
    if (!social) {
        await deps.postsRepository.markPostState(input.postId, "ERROR", `No integration handler for ${input.providerIdentifier}`);
        await notify(
            ns,
            input.organizationId,
            "We couldn't publish your post",
            `No integration handler is registered for ${capitalizeProvider(input.providerIdentifier)}.`,
            true,
            false,
            "fail"
        );
        return { ok: false };
    }
    return { ok: true, social };
}

type ThreadsReplySettings = { id: string; message: string; delaySeconds: number };

function threadsRepliesFromSettings(settings: Record<string, unknown> | null): ThreadsReplySettings[] {
    const s = settings as { threads?: unknown } | null;
    const threads = (s && typeof s.threads === "object" ? (s.threads as any) : null) as { replies?: unknown } | null;
    const raw = threads?.replies;
    if (!Array.isArray(raw)) return [];
    return raw
        .map((r) => ({
            id: typeof (r as any)?.id === "string" ? (r as any).id : "",
            message: typeof (r as any)?.message === "string" ? (r as any).message : "",
            delaySeconds: Number.isFinite(Number((r as any)?.delaySeconds)) ? Number((r as any).delaySeconds) : 0,
        }))
        .filter((r) => r.id && r.message.trim().length > 0)
        .slice(0, 25);
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function maybePublishThreadsThreadFinisher(params: {
    post: SocialPostLike;
    integration: IntegrationLike;
    record: IntegrationRecord;
    social: any;
    publishedPostId: string;
    deps: PublishDeps;
}): Promise<void> {
    const { post, integration, record, social, publishedPostId, deps } = params;
    if (integration.provider_identifier !== "threads") return;
    if (typeof social.comment !== "function") return;
    if (!publishedPostId) return;

    const providerSettings = parseProviderSettingsFromPostRow(post);
    const finisher = threadsThreadFinisherMessageFromSettings(providerSettings);
    if (!finisher) return;

    const organizationId = post.organization_id;
    const postId = post.id;
    const ns = deps.notificationService;

    try {
        await social.comment(
            integration.internal_id,
            publishedPostId,
            undefined,
            integration.token,
            [{ id: postId, message: finisher, settings: {} }],
            record
        );
        logger.info({
            msg: "[Orchestrator] threads thread-finisher comment published",
            postId,
            organizationId,
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.warn({
            msg: "[Orchestrator] threads thread-finisher comment failed (best-effort)",
            postId,
            organizationId,
            error: msg,
        });
        await notify(
            ns,
            organizationId,
            "We published your post, but the follow-up comment failed",
            `Your Threads post was published, but the follow-up comment (“thread finisher”) could not be posted. ${msg}`,
            true,
            false,
            "info"
        );
    }
}

async function maybePublishThreadsReplies(params: {
    post: SocialPostLike;
    integration: IntegrationLike;
    record: IntegrationRecord;
    social: any;
    publishedPostId: string;
    deps: PublishDeps;
}): Promise<void> {
    const { post, integration, record, social, publishedPostId, deps } = params;
    if (integration.provider_identifier !== "threads") return;
    if (typeof social.comment !== "function") return;
    if (!publishedPostId) return;

    // Fallback to old settings JSON for backwards compatibility.
    let replies: ThreadsReplySettings[] = [];
    if (typeof deps.postsRepository.listThreadRepliesByPostId === "function") {
        try {
            const rows = await deps.postsRepository.listThreadRepliesByPostId(post.id);
            replies = (rows ?? [])
                .filter((r: PostThreadReplyLike) => !r.deleted_at && r.state === "QUEUE")
                .map((r: PostThreadReplyLike) => ({
                    id: r.id,
                    message: r.content,
                    delaySeconds: r.delay_seconds ?? 0,
                }));
        } catch {
            replies = [];
        }
    }
    if (replies.length === 0) {
        const providerSettings = parseProviderSettingsFromPostRow(post);
        replies = threadsRepliesFromSettings(providerSettings);
    }
    if (replies.length === 0) return;

    const organizationId = post.organization_id;
    const postId = post.id;
    const ns = deps.notificationService;

    let lastCommentId: string | undefined = publishedPostId;
    for (const r of replies) {
        const delayMs = Math.max(0, Math.floor((r.delaySeconds ?? 0) * 1000));
        if (delayMs > 0) {
            await sleep(delayMs);
        }
        try {
            const res: PostResponse[] = await social.comment(
                integration.internal_id,
                publishedPostId,
                lastCommentId,
                integration.token,
                [{ id: postId, message: r.message, settings: {} }],
                record
            );
            const next = firstPostResponse(res).releaseId;
            lastCommentId = next || lastCommentId;
            if (typeof deps.postsRepository.updateThreadReplyPublishResult === "function") {
                const { releaseId, releaseUrl } = firstPostResponse(res);
                await deps.postsRepository.updateThreadReplyPublishResult(r.id, {
                    state: "PUBLISHED",
                    releaseId: releaseId || null,
                    releaseUrl: releaseUrl || null,
                    error: null,
                });
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            logger.warn({
                msg: "[Orchestrator] threads thread reply failed (best-effort)",
                postId,
                organizationId,
                error: msg,
            });
            if (typeof deps.postsRepository.updateThreadReplyPublishResult === "function") {
                await deps.postsRepository.updateThreadReplyPublishResult(r.id, {
                    state: "ERROR",
                    releaseId: null,
                    releaseUrl: null,
                    error: msg.slice(0, 4000),
                });
            }
            await notify(
                ns,
                organizationId,
                "We published your post, but a thread reply failed",
                `Your Threads post was published, but one of the scheduled thread replies could not be posted. ${msg}`,
                true,
                false,
                "info"
            );
            // Keep going to attempt later replies and finisher.
        }
    }
}

/**
 * Runs one scheduled `post_group`: each QUEUE row with a channel is posted to the network.
 */
export function createPublishScheduledGroupHandler(deps: {
    postsRepository: ScheduledPostsRepository;
    integrationRepository: Pick<IntegrationRepository, "getById">;
    integrationManager: IntegrationManager;
    refreshService: Pick<RefreshIntegrationService, "refresh">;
    /** When set (BullMQ worker), mirrors OpenQuok: email for publish, digest batching, and preflight/ errors. */
    notificationService?: Pick<NotificationService, "inAppNotification">;
}): (input: { organizationId: string; postGroup: string }) => Promise<void | { todos?: { type: "repeat-post"; postGroup: string; delayMs?: number }[] }> {
    return async (input) => {
        const { organizationId, postGroup } = input;
        const rows = await deps.postsRepository.listPostsByGroup(postGroup);
        if (!rows.length) {
            logger.info({ msg: "[Orchestrator] scheduled post: empty group, skipping", postGroup, organizationId });
            return;
        }

        const toPublish = rows.filter(
            (r) => r.state === "QUEUE" && r.integration_id && !r.deleted_at
        ) as (SocialPostLike & { integration_id: string })[];
        if (toPublish.length === 0) {
            logger.info({
                msg: "[Orchestrator] scheduled post: nothing in QUEUE with channel, skipping",
                postGroup,
                organizationId,
            });
            return;
        }

        for (const post of toPublish) {
            await publishOneRow(post, deps);
        }

        // Repeat scheduling : if this group is configured with a repeat cadence,
        // create a new QUEUE group scheduled in the future and enqueue it via a repeat-post todo.
        const intervalDays = rows[0]?.interval_in_days ?? null;
        if (typeof intervalDays === "number" && Number.isFinite(intervalDays) && intervalDays > 0) {
            const delayMs = Math.floor(intervalDays * 24 * 60 * 60 * 1000);
            const publishDateIso = new Date(Date.now() + delayMs).toISOString();
            const repeat = await deps.postsRepository.createRepeatGroupFromPostGroup({
                postGroup,
                publishDateIso,
            });
            return {
                todos: [
                    {
                        type: "repeat-post",
                        postGroup: repeat.postGroup,
                        delayMs,
                    },
                ],
            };
        }
    };
}

async function publishOneRow(
    post: SocialPostLike & { integration_id: string },
    deps: PublishDeps
): Promise<void> {
    const organizationId = post.organization_id;
    const postId = post.id;
    const ns = deps.notificationService;
    const providerRes = await resolveIntegrationOrFail(post, deps);
    if (!providerRes.ok) return;
    const provider = providerRes.integration;

    const socialRes = await resolveSocialProviderOrFail(
        { organizationId, postId, providerIdentifier: provider.provider_identifier },
        deps
    );
    if (!socialRes.ok) return;
    const social = socialRes.social;

    let intRow: IntegrationLike = provider;
    const postDetails: PostDetails[] = [postRowToPostDetails(post)];

    for (let attempt = 0; attempt < PUBLISH_ATTEMPTS; attempt++) {
        const record = integrationRowToRecord(intRow);
        try {
            const results: PostResponse[] = await social.post(
                intRow.internal_id,
                intRow.token,
                postDetails,
                record
            );
            const { releaseId, releaseUrl } = firstPostResponse(results);
            await deps.postsRepository.updatePostRowPublishResult(postId, {
                state: "PUBLISHED",
                releaseId: releaseId || null,
                releaseUrl: releaseUrl || null,
                error: null,
            });
            {
                const label = capitalizeProvider(intRow.provider_identifier);
                const atUrl = releaseUrl?.trim() ? ` at ${releaseUrl}` : "";
                const subject = `Your post has been published on ${label}`;
                const message = `Your post has been published on ${label}${atUrl}`;
                await notify(ns, organizationId, subject, message, true, true, "success");
            }
            logger.info({
                msg: "[Orchestrator] post published to provider",
                postId,
                organizationId,
                provider: intRow.provider_identifier,
            });

            // Optional scheduled follow-up comment (thread finisher) for providers that support replies.
            await maybePublishThreadsReplies({
                post,
                integration: intRow,
                record,
                social,
                publishedPostId: releaseId,
                deps,
            });
            await maybePublishThreadsThreadFinisher({
                post,
                integration: intRow,
                record,
                social,
                publishedPostId: releaseId,
                deps,
            });

            return;
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            if (err instanceof Error && err.stack) {
                logger.error({
                    msg: "[Orchestrator] post attempt failed, may retry with refresh",
                    postId,
                    attempt,
                    message,
                    stack: err.stack,
                });
            } else {
                logger.error({
                    msg: "[Orchestrator] post attempt failed, may retry with refresh",
                    postId,
                    attempt,
                    message,
                });
            }
            if (isNonRefreshablePublishError(message)) {
                const errText = `Could not publish (${message})`;
                await deps.postsRepository.markPostState(postId, "ERROR", errText);
                const label = capitalizeProvider(intRow.provider_identifier);
                const chName = intRow.name || "channel";
                await notify(
                    ns,
                    organizationId,
                    `We couldn't post to ${label} for ${chName}`,
                    `We couldn't post to ${label} for ${chName}. ${message}`,
                    true,
                    false,
                    "fail"
                );
                return;
            }
            if (attempt >= PUBLISH_ATTEMPTS - 1) {
                const stored = postPublishErrorForStorage(err, 4000);
                await deps.postsRepository.markPostState(postId, "ERROR", stored);
                const label = capitalizeProvider(intRow.provider_identifier);
                const chName = intRow.name || "channel";
                await notify(
                    ns,
                    organizationId,
                    `Error posting on ${intRow.provider_identifier} for ${chName}`,
                    `An error occurred while posting on ${label} for ${chName}${message ? `: ${message}` : "."}`,
                    true,
                    false,
                    "fail"
                );
                return;
            }
            const refreshed: false | AuthTokenDetails = await deps.refreshService.refresh(intRow);
            if (!refreshed) {
                const errText = `Could not publish (${message}) and token refresh did not complete`;
                await deps.postsRepository.markPostState(postId, "ERROR", errText);
                const label = capitalizeProvider(intRow.provider_identifier);
                const chName = intRow.name || "channel";
                await notify(
                    ns,
                    organizationId,
                    `We couldn't post to ${label} for ${chName}`,
                    `We couldn't post to ${label} for ${chName} and the access token could not be refreshed. Reconnect the channel and try again. (${errText})`,
                    true,
                    false,
                    "fail"
                );
                return;
            }
            const reloaded = await deps.integrationRepository.getById(organizationId, intRow.id);
            if (!reloaded || reloaded.deleted_at) {
                await deps.postsRepository.markPostState(postId, "ERROR", "Channel was removed or no longer available");
                await notify(
                    ns,
                    organizationId,
                    "We couldn't publish your post",
                    "The channel was removed or is no longer available after token refresh. Reconnect a valid channel and try again.",
                    true,
                    false,
                    "fail"
                );
                return;
            }
            intRow = reloaded;
        }
    }
}
