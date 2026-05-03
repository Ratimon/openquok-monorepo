import type { IntegrationManager } from "backend/integrations/integrationManager.js";
import type { AuthTokenDetails, IntegrationRecord, PostDetails, PostResponse } from "backend/integrations/social.integrations.interface.js";
import type { IntegrationRepository } from "backend/repositories/IntegrationRepository.js";
import type { PlugRepository } from "backend/repositories/PlugRepository.js";
import type { IntegrationLike } from "backend/utils/dtos/IntegrationDTO.js";
import type { PostThreadReplyLike, SocialPostLike } from "backend/utils/dtos/PostDTO.js";
import type { NotificationService } from "backend/services/NotificationService.js";
import type { NotificationEmailType } from "openquok-common";

import { ProviderAccessTokenExpiredError } from "backend/errors/ProviderIntegrationErrors.js";
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

/** Dependencies for post-publish plug pipeline (Threads internal + global threshold plugs). */
export type ScheduledSocialPostPlugPipelineDeps = {
    plugRepository: Pick<PlugRepository, "listActivatedPlugsByIntegration" | "getPlugRowById">;
    integrationRepository: Pick<IntegrationRepository, "getById">;
    integrationManager: IntegrationManager;
    refreshService: Pick<RefreshIntegrationService, "refresh">;
};

type PublishDeps = {
    postsRepository: Pick<
        ScheduledPostsRepository,
        "markPostState" | "updatePostRowPublishResult" | "listThreadRepliesByPostId" | "updateThreadReplyPublishResult"
    >;
    integrationRepository: Pick<IntegrationRepository, "getById">;
    integrationManager: IntegrationManager;
    refreshService: Pick<RefreshIntegrationService, "refresh">;
    notificationService?: Pick<NotificationService, "inAppNotification">;
    plugPipeline?: ScheduledSocialPostPlugPipelineDeps;
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

function sleepMs(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

type PlugTodo =
    | {
          kind: "internal";
          delayMs: number;
          plugName: string;
          integrationId: string;
          originalIntegrationId: string;
          information: Record<string, unknown>;
      }
    | {
          kind: "global";
          delayMs: number;
          plugId: string;
          plugFunction: string;
          totalRuns: number;
          currentRun: number;
      };

function collectInternalTodosFromThreadsSettings(
    integrationManager: IntegrationManager,
    params: {
        postIntegrationId: string;
        providerSettings: Record<string, unknown> | null;
    }
): PlugTodo[] {
    const root = params.providerSettings as { threads?: unknown } | null;
    const threads = root?.threads && typeof root.threads === "object" ? (root.threads as Record<string, unknown>) : null;
    if (!threads) return [];

    const ig = threads.internalEngagementPlug;
    if (!ig || typeof ig !== "object") return [];
    const plugObj = ig as Record<string, unknown>;
    if (plugObj.enabled !== true) return [];

    const msg = typeof plugObj.message === "string" ? plugObj.message.trim() : "";
    if (!msg.length) return [];

    const delaySeconds = Number.isFinite(Number(plugObj.delaySeconds)) ? Number(plugObj.delaySeconds) : 0;
    const plugName =
        typeof plugObj.plugName === "string" && plugObj.plugName.trim().length > 0
            ? plugObj.plugName.trim()
            : "threads-internal-follow-up";

    const integrationId =
        typeof plugObj.integrationId === "string" && plugObj.integrationId.trim().length > 0
            ? plugObj.integrationId.trim()
            : params.postIntegrationId;

    if (integrationId !== params.postIntegrationId) {
        logger.warn({
            msg: "[Plugs] Internal plug skipped — only the publishing channel is supported for Threads today",
            integrationId,
            postIntegrationId: params.postIntegrationId,
        });
        return [];
    }

    const defs = integrationManager.getInternalPlugDefinitionsForProvider("threads");
    if (!defs.some((d) => d.identifier === plugName)) return [];

    return [
        {
            kind: "internal",
            delayMs: Math.max(0, Math.floor(delaySeconds * 1000)),
            plugName,
            integrationId,
            originalIntegrationId: params.postIntegrationId,
            information: { message: msg },
        },
    ];
}

async function collectGlobalPlugTodos(
    deps: ScheduledSocialPostPlugPipelineDeps,
    organizationId: string,
    integrationId: string,
    providerIdentifier: string
): Promise<PlugTodo[]> {
    const rows = await deps.plugRepository.listActivatedPlugsByIntegration(organizationId, integrationId);
    const out: PlugTodo[] = [];
    for (const row of rows) {
        const def = deps.integrationManager.findGlobalPlugDefinition(providerIdentifier, row.plug_function);
        if (!def) continue;
        for (let i = 1; i <= def.totalRuns; i++) {
            out.push({
                kind: "global",
                delayMs: def.runEveryMilliseconds * i,
                plugId: row.id,
                plugFunction: row.plug_function,
                totalRuns: def.totalRuns,
                currentRun: i,
            });
        }
    }
    return out;
}

async function processInternalPlug(
    deps: ScheduledSocialPostPlugPipelineDeps,
    input: {
        organizationId: string;
        networkPostId: string;
        plugName: string;
        integrationId: string;
        originalIntegrationId: string;
        information: Record<string, unknown>;
        /** Network id the internal reply should attach under (linear thread after replies + finisher). */
        threadsReplyParentId: string;
    }
): Promise<void> {
    const acting = await deps.integrationRepository.getById(input.organizationId, input.integrationId);
    const original = await deps.integrationRepository.getById(input.organizationId, input.originalIntegrationId);
    if (!acting || acting.deleted_at || !original || original.deleted_at) return;

    const defs = deps.integrationManager.getInternalPlugDefinitionsForProvider(acting.provider_identifier);
    const meta = defs.find((d) => d.identifier === input.plugName);
    if (!meta) return;

    const social = deps.integrationManager.getSocialIntegration(acting.provider_identifier);
    if (!social) return;

    const fn = (social as unknown as Record<string, unknown>)[meta.methodName];
    if (typeof fn !== "function") return;

    await (fn as (this: typeof social, ...args: unknown[]) => Promise<unknown>).call(
        social,
        integrationRowToRecord(acting),
        integrationRowToRecord(original),
        input.networkPostId,
        {
            ...input.information,
            replyToParentId: input.threadsReplyParentId,
        }
    );
}

async function processGlobalPlug(
    deps: ScheduledSocialPostPlugPipelineDeps,
    input: {
        plugId: string;
        networkPostId: string;
        totalRuns: number;
        currentRun: number;
    }
): Promise<boolean> {
    const plugRow = await deps.plugRepository.getPlugRowById(input.plugId);
    if (!plugRow || !plugRow.activated) return true;

    const integration = await deps.integrationRepository.getById(plugRow.organization_id, plugRow.integration_id);
    if (!integration || integration.deleted_at) return true;

    const social = deps.integrationManager.getSocialIntegration(integration.provider_identifier);
    if (!social) return true;

    const method = (social as unknown as Record<string, unknown>)[plugRow.plug_function];
    if (typeof method !== "function") return true;

    let fieldsParsed: { name: string; value: string }[] = [];
    try {
        const raw = JSON.parse(plugRow.data) as unknown;
        fieldsParsed = Array.isArray(raw) ? (raw as { name: string; value: string }[]) : [];
    } catch {
        fieldsParsed = [];
    }

    const fieldsObj = fieldsParsed.reduce<Record<string, string>>((acc, cur) => {
        acc[cur.name] = cur.value;
        return acc;
    }, {});

    const record = integrationRowToRecord(integration);

    const run = async (): Promise<boolean> => {
        const result = await (method as (this: typeof social, ...args: unknown[]) => Promise<unknown>).call(
            social,
            record,
            input.networkPostId,
            fieldsObj
        );
        return result === true;
    };

    try {
        return await run();
    } catch (err) {
        if (err instanceof ProviderAccessTokenExpiredError) {
            const refreshed = await deps.refreshService.refresh(integration);
            if (!refreshed) return input.totalRuns === input.currentRun;
            const reloaded = await deps.integrationRepository.getById(plugRow.organization_id, plugRow.integration_id);
            if (!reloaded || reloaded.deleted_at) return true;
            try {
                const retry = await (method as (this: typeof social, ...args: unknown[]) => Promise<unknown>).call(
                    social,
                    integrationRowToRecord(reloaded),
                    input.networkPostId,
                    fieldsObj
                );
                return retry === true;
            } catch {
                return input.totalRuns === input.currentRun;
            }
        }
        logger.warn({
            msg: "[Plugs] Global plug run failed",
            plugId: input.plugId,
            error: err instanceof Error ? err.message : String(err),
        });
        return input.totalRuns === input.currentRun;
    }
}

/**
 * Runs internal + global plug todos sorted by delay (ms from publish completion).
 */
async function runPostPublishPlugPipeline(
    deps: ScheduledSocialPostPlugPipelineDeps,
    params: {
        organizationId: string;
        networkPostId: string;
        providerIdentifier: string;
        postIntegrationId: string;
        providerSettings: Record<string, unknown> | null;
        /** Latest published Threads id (root, last reply, or finisher) for `reply_to_id` on internal plug. */
        threadsInternalReplyParentId: string;
    }
): Promise<void> {
    if (params.providerIdentifier !== "threads") return;

    const internal = collectInternalTodosFromThreadsSettings(deps.integrationManager, {
        postIntegrationId: params.postIntegrationId,
        providerSettings: params.providerSettings,
    });
    const global = await collectGlobalPlugTodos(deps, params.organizationId, params.postIntegrationId, params.providerIdentifier);

    const sorted = [...internal, ...global].sort((a, b) => a.delayMs - b.delayMs);
    let elapsedMs = 0;

    while (sorted.length > 0) {
        const todo = sorted.shift()!;
        const waitMs = Math.max(0, todo.delayMs - elapsedMs);
        await sleepMs(waitMs);
        elapsedMs += waitMs;

        if (todo.kind === "internal") {
            try {
                await processInternalPlug(deps, {
                    organizationId: params.organizationId,
                    networkPostId: params.networkPostId,
                    plugName: todo.plugName,
                    integrationId: todo.integrationId,
                    originalIntegrationId: todo.originalIntegrationId,
                    information: todo.information,
                    threadsReplyParentId: params.threadsInternalReplyParentId,
                });
            } catch (err) {
                logger.warn({
                    msg: "[Plugs] Internal plug failed (best-effort)",
                    plugName: todo.plugName,
                    error: err instanceof Error ? err.message : String(err),
                });
            }
            continue;
        }

        try {
            const done = await processGlobalPlug(deps, {
                plugId: todo.plugId,
                networkPostId: params.networkPostId,
                totalRuns: todo.totalRuns,
                currentRun: todo.currentRun,
            });
            if (done) {
                for (let i = sorted.length - 1; i >= 0; i--) {
                    const t = sorted[i]!;
                    if (t.kind === "global" && t.plugId === todo.plugId) {
                        sorted.splice(i, 1);
                    }
                }
            }
        } catch (err) {
            logger.warn({
                msg: "[Plugs] Global plug iteration failed (best-effort)",
                plugId: todo.plugId,
                error: err instanceof Error ? err.message : String(err),
            });
        }
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
    /** Root Threads id (same as orchestrator passes to replies). */
    publishedPostId: string;
    /** Tip of the reply chain — finisher publishes under this id (not the root). */
    replyParentId: string;
    deps: PublishDeps;
}): Promise<string> {
    const { post, integration, record, social, publishedPostId, replyParentId, deps } = params;
    if (integration.provider_identifier !== "threads") return replyParentId;
    if (typeof social.comment !== "function") return replyParentId;
    if (!publishedPostId) return replyParentId;

    const providerSettings = parseProviderSettingsFromPostRow(post);
    const finisher = threadsThreadFinisherMessageFromSettings(providerSettings);
    if (!finisher) return replyParentId;

    const organizationId = post.organization_id;
    const postId = post.id;
    const ns = deps.notificationService;

    try {
        const res: PostResponse[] = await social.comment(
            integration.internal_id,
            publishedPostId,
            replyParentId,
            integration.token,
            [{ id: postId, message: finisher, settings: {} }],
            record
        );
        const nextId = firstPostResponse(res).releaseId?.trim();
        logger.info({
            msg: "[Orchestrator] threads thread-finisher comment published",
            postId,
            organizationId,
        });
        return nextId || replyParentId;
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
        return replyParentId;
    }
}

async function maybePublishThreadsReplies(params: {
    post: SocialPostLike;
    integration: IntegrationLike;
    record: IntegrationRecord;
    social: any;
    publishedPostId: string;
    deps: PublishDeps;
}): Promise<string> {
    const { post, integration, record, social, publishedPostId, deps } = params;
    if (integration.provider_identifier !== "threads") return publishedPostId;
    if (typeof social.comment !== "function") return publishedPostId;
    if (!publishedPostId) return publishedPostId;

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
    if (replies.length === 0) return publishedPostId;

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

    return lastCommentId ?? publishedPostId;
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
    /** When set (e.g. BullMQ worker), runs Threads internal + global plugs after publish. */
    plugPipeline?: ScheduledSocialPostPlugPipelineDeps;
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

            // Thread replies → finisher → internal plug share one linear chain (reply_to last published id).
            let threadsLeafId = releaseId;
            threadsLeafId = await maybePublishThreadsReplies({
                post,
                integration: intRow,
                record,
                social,
                publishedPostId: releaseId,
                deps,
            });
            threadsLeafId = await maybePublishThreadsThreadFinisher({
                post,
                integration: intRow,
                record,
                social,
                publishedPostId: releaseId,
                replyParentId: threadsLeafId,
                deps,
            });

            if (deps.plugPipeline && releaseId) {
                const providerSettings = parseProviderSettingsFromPostRow(post);
                await runPostPublishPlugPipeline(deps.plugPipeline, {
                    organizationId,
                    networkPostId: releaseId,
                    providerIdentifier: intRow.provider_identifier,
                    postIntegrationId: post.integration_id,
                    providerSettings,
                    threadsInternalReplyParentId: threadsLeafId,
                });
            }

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
