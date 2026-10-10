import type { IntegrationRecord, PostResponse } from "backend/integrations/social.integrations.interface.js";
import type { IntegrationLike } from "backend/utils/dtos/IntegrationDTO.js";
import type { FollowUpReplyDraft, PostThreadReplyLike, SocialPostLike } from "backend/utils/dtos/PostDTO.js";
import { extractFollowUpRepliesFromProviderSettingsObject } from "backend/utils/dtos/PostDTO.js";
import type { NotificationEmailType } from "openquok-common";
import { logger } from "backend/utils/Logger.js";

import { parseProviderSettingsFromPostRow } from "./postRowSettings.js";
import { providerDisplayName, resolveScheduledPublishHooks } from "./registry.js";

type NotifyFn = (
    organizationId: string,
    subject: string,
    message: string,
    sendEmail: boolean,
    digest: boolean,
    type: NotificationEmailType
) => Promise<void>;

type FollowUpPostsRepository = {
    listThreadRepliesByPostId?: (postId: string) => Promise<PostThreadReplyLike[]>;
    updateThreadReplyPublishResult?: (
        replyId: string,
        input: { state: "PUBLISHED" | "ERROR"; releaseId: string | null; releaseUrl: string | null; error: string | null }
    ) => Promise<void>;
};

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function firstPostResponse(r: PostResponse[] | void): { releaseId: string; releaseUrl: string } {
    const x = (r && r[0]) ?? null;
    if (!x) {
        return { releaseId: "", releaseUrl: "" };
    }
    return { releaseId: x.postId ?? x.id, releaseUrl: x.releaseURL ?? "" };
}

export async function publishFollowUpRepliesIfConfigured(params: {
    post: SocialPostLike;
    integration: IntegrationLike;
    record: IntegrationRecord;
    social: { comment?: (...args: unknown[]) => Promise<PostResponse[]> };
    publishedPostId: string;
    postsRepository: FollowUpPostsRepository;
    notify: NotifyFn;
}): Promise<string> {
    const { post, integration, record, social, publishedPostId, postsRepository, notify } = params;
    const hooks = resolveScheduledPublishHooks(integration.provider_identifier);
    if (!hooks.supportsFollowUpComments) return publishedPostId;
    if (typeof social.comment !== "function") return publishedPostId;
    if (!publishedPostId) return publishedPostId;

    const providerSettings = parseProviderSettingsFromPostRow(post);
    const skip = hooks.shouldSkipFollowUpComments?.(providerSettings);
    if (skip?.skip) {
        logger.info({
            msg: skip.logMessage.startsWith("[Orchestrator]")
                ? skip.logMessage
                : `[Orchestrator] ${skip.logMessage}`,
            postId: post.id,
            organizationId: post.organization_id,
            provider: integration.provider_identifier,
        });
        return publishedPostId;
    }

    const fromSettings = extractFollowUpRepliesFromProviderSettingsObject(
        providerSettings,
        integration.provider_identifier
    );

    let fromDb: FollowUpReplyDraft[] = [];
    if (typeof postsRepository.listThreadRepliesByPostId === "function") {
        try {
            const rows = await postsRepository.listThreadRepliesByPostId(post.id);
            fromDb = (rows ?? [])
                .filter((r: PostThreadReplyLike) => !r.deleted_at && r.state === "QUEUE")
                .map((r: PostThreadReplyLike) => ({
                    id: r.id,
                    message: typeof r.content === "string" ? r.content : "",
                    delaySeconds: r.delay_seconds ?? 0,
                }))
                .filter((r) => r.message.trim().length > 0);
        } catch {
            fromDb = [];
        }
    }

    let replies: FollowUpReplyDraft[];
    if (fromSettings.length > 0) {
        if (fromDb.length === fromSettings.length) {
            replies = fromSettings.map((s, i) => ({
                ...s,
                id: typeof fromDb[i]?.id === "string" && fromDb[i]!.id.trim() ? fromDb[i]!.id : s.id,
            }));
        } else {
            replies = fromSettings;
        }
    } else {
        replies = fromDb;
    }

    if (replies.length === 0) {
        logger.info({
            msg: "[Orchestrator] no follow-up replies to publish for channel",
            postId: post.id,
            organizationId: post.organization_id,
            provider: integration.provider_identifier,
            settingsDraftCount: fromSettings.length,
            dbQueueReplyCount: fromDb.length,
        });
        return publishedPostId;
    }

    logger.info({
        msg: "[Orchestrator] publishing scheduled follow-up replies",
        postId: post.id,
        organizationId: post.organization_id,
        provider: integration.provider_identifier,
        replyCount: replies.length,
        source:
            fromSettings.length > 0
                ? fromDb.length === fromSettings.length
                    ? "posts.settings+post_thread_replies_ids"
                    : "posts.settings"
                : "post_thread_replies",
    });

    if (hooks.followUpCommentSettleMs && hooks.followUpCommentSettleMs > 0) {
        await sleep(hooks.followUpCommentSettleMs);
    }

    const organizationId = post.organization_id;
    const postId = post.id;
    const networkLabel = providerDisplayName(integration.provider_identifier);
    const buildSettings =
        hooks.buildFollowUpCommentSettings ??
        (() => ({} as Record<string, unknown>));

    let lastCommentId: string | undefined = publishedPostId;
    for (const r of replies) {
        const delayMs = Math.max(0, Math.floor((r.delaySeconds ?? 0) * 1000));
        if (delayMs > 0) {
            await sleep(delayMs);
        }
        try {
            const res = await social.comment(
                integration.internal_id,
                publishedPostId,
                lastCommentId,
                integration.token,
                [
                    {
                        id: postId,
                        message: r.message,
                        settings: buildSettings({
                            media: r.media,
                            rootProviderSettings: providerSettings,
                        }),
                    },
                ],
                record
            );
            const next = firstPostResponse(res).releaseId;
            lastCommentId = next || lastCommentId;
            if (typeof postsRepository.updateThreadReplyPublishResult === "function") {
                try {
                    const { releaseId, releaseUrl } = firstPostResponse(res);
                    await postsRepository.updateThreadReplyPublishResult(r.id, {
                        state: "PUBLISHED",
                        releaseId: releaseId || null,
                        releaseUrl: releaseUrl || null,
                        error: null,
                    });
                } catch (dbErr) {
                    const dbMsg = dbErr instanceof Error ? dbErr.message : String(dbErr);
                    logger.warn({
                        msg: "[Orchestrator] updateThreadReplyPublishResult failed after successful comment",
                        postId,
                        organizationId,
                        replyId: r.id,
                        error: dbMsg,
                    });
                }
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            logger.warn({
                msg: "[Orchestrator] follow-up comment failed (best-effort)",
                postId,
                organizationId,
                provider: integration.provider_identifier,
                error: msg,
            });
            if (typeof postsRepository.updateThreadReplyPublishResult === "function") {
                try {
                    await postsRepository.updateThreadReplyPublishResult(r.id, {
                        state: "ERROR",
                        releaseId: null,
                        releaseUrl: null,
                        error: msg.slice(0, 4000),
                    });
                } catch (dbErr) {
                    const dbMsg = dbErr instanceof Error ? dbErr.message : String(dbErr);
                    logger.warn({
                        msg: "[Orchestrator] updateThreadReplyPublishResult failed while recording comment error",
                        postId,
                        organizationId,
                        replyId: r.id,
                        error: dbMsg,
                    });
                }
            }
            await notify(
                organizationId,
                `We published your post, but a ${networkLabel} follow-up failed`,
                `Your ${networkLabel} post was published, but one of the scheduled follow-up comments could not be posted. ${msg}`,
                true,
                false,
                "info"
            );
        }
    }

    return lastCommentId ?? publishedPostId;
}
