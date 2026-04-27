import type { IntegrationManager } from "backend/integrations/integrationManager.js";
import type { AuthTokenDetails, IntegrationRecord, PostDetails, PostResponse } from "backend/integrations/social.integrations.interface.js";
import type { IntegrationRepository, IntegrationRow } from "backend/repositories/IntegrationRepository.js";
import type { PostsRepository } from "backend/repositories/PostsRepository.js";
import type { NotificationService } from "backend/services/NotificationService.js";
import type { SocialPostLike } from "backend/utils/dtos/PostDTO.js";
import type { NotificationEmailType } from "openquok-common";

import { logger } from "backend/utils/Logger.js";
import { RefreshIntegrationService } from "backend/services/RefreshIntegrationService.js";

const PUBLISH_ATTEMPTS = 5;

const META_OPAQUE_MESSAGE = "An unknown error occurred";

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

function integrationRowToRecord(row: IntegrationRow): IntegrationRecord {
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

function capitalizeProvider(id: string): string {
    const t = id.trim();
    if (!t) return t;
    return t[0].toUpperCase() + t.slice(1);
}

/**` notification behaviour: best-effort; never fails publishing. */
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

/**
 * Runs one scheduled `post_group`: each QUEUE row with a channel is posted to the network.
 */
export function createPublishScheduledGroupHandler(deps: {
    postsRepository: PostsRepository;
    integrationRepository: Pick<IntegrationRepository, "getById">;
    integrationManager: IntegrationManager;
    refreshService: Pick<RefreshIntegrationService, "refresh">;
    /** When set (BullMQ worker), mirrors OpenQuok: email for publish, digest batching, and preflight/ errors. */
    notificationService?: Pick<NotificationService, "inAppNotification">;
}): (input: { organizationId: string; postGroup: string }) => Promise<void> {
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
    };
}

async function publishOneRow(
    post: SocialPostLike & { integration_id: string },
    deps: {
        postsRepository: PostsRepository;
        integrationRepository: Pick<IntegrationRepository, "getById">;
        integrationManager: IntegrationManager;
        refreshService: Pick<RefreshIntegrationService, "refresh">;
        notificationService?: Pick<NotificationService, "inAppNotification">;
    }
): Promise<void> {
    const organizationId = post.organization_id;
    const integrationId = post.integration_id;
    const postId = post.id;
    const ns = deps.notificationService;
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
        return;
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
        return;
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
        return;
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
        return;
    }

    const social = deps.integrationManager.getSocialIntegration(provider.provider_identifier);
    if (!social) {
        await deps.postsRepository.markPostState(postId, "ERROR", `No integration handler for ${provider.provider_identifier}`);
        await notify(
            ns,
            organizationId,
            "We couldn't publish your post",
            `No integration handler is registered for ${capitalizeProvider(provider.provider_identifier)}.`,
            true,
            false,
            "fail"
        );
        return;
    }

    let intRow: IntegrationRow = provider;
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
