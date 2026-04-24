import type { IntegrationManager } from "backend/integrations/integrationManager.js";
import type { AuthTokenDetails, IntegrationRecord, PostDetails, PostResponse } from "backend/integrations/social.integrations.interface.js";
import type { IntegrationRepository, IntegrationRow } from "backend/repositories/IntegrationRepository.js";
import type { PostsRepository } from "backend/repositories/PostsRepository.js";
import type { SocialPostLike } from "backend/utils/dtos/PostDTO.js";

import { logger } from "backend/utils/Logger.js";
import { RefreshIntegrationService } from "backend/services/RefreshIntegrationService.js";

const PUBLISH_ATTEMPTS = 5;

const META_OPAQUE_MESSAGE = "An unknown error occurred";

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

/**
 * Runs one scheduled `post_group`: each QUEUE row with a channel is posted to the network.
 */
export function createPublishScheduledGroupHandler(deps: {
    postsRepository: PostsRepository;
    integrationRepository: Pick<IntegrationRepository, "getById">;
    integrationManager: IntegrationManager;
    refreshService: Pick<RefreshIntegrationService, "refresh">;
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
    }
): Promise<void> {
    const organizationId = post.organization_id;
    const integrationId = post.integration_id;
    const postId = post.id;
    const provider = await deps.integrationRepository.getById(organizationId, integrationId);
    if (!provider) {
        await deps.postsRepository.markPostState(postId, "ERROR", "Channel not found for this workspace");
        return;
    }
    if (provider.deleted_at) {
        await deps.postsRepository.markPostState(postId, "ERROR", "That channel is no longer connected");
        return;
    }
    if (provider.refresh_needed) {
        await deps.postsRepository.markPostState(postId, "ERROR", "Reconnect the channel, then try again");
        return;
    }
    if (provider.disabled) {
        await deps.postsRepository.markPostState(postId, "ERROR", "That channel is disabled");
        return;
    }

    const social = deps.integrationManager.getSocialIntegration(provider.provider_identifier);
    if (!social) {
        await deps.postsRepository.markPostState(postId, "ERROR", `No integration handler for ${provider.provider_identifier}`);
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
            if (attempt >= PUBLISH_ATTEMPTS - 1) {
                await deps.postsRepository.markPostState(
                    postId,
                    "ERROR",
                    postPublishErrorForStorage(err, 4000)
                );
                return;
            }
            const refreshed: false | AuthTokenDetails = await deps.refreshService.refresh(intRow);
            if (!refreshed) {
                await deps.postsRepository.markPostState(
                    postId,
                    "ERROR",
                    `Could not publish (${message}) and token refresh did not complete`
                );
                return;
            }
            const reloaded = await deps.integrationRepository.getById(organizationId, intRow.id);
            if (!reloaded || reloaded.deleted_at) {
                await deps.postsRepository.markPostState(postId, "ERROR", "Channel was removed or no longer available");
                return;
            }
            intRow = reloaded;
        }
    }
}
