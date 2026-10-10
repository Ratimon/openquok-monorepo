import type { IntegrationRecord, PostResponse } from "backend/integrations/social.integrations.interface.js";
import type { IntegrationLike } from "backend/utils/dtos/IntegrationDTO.js";
import type { SocialPostLike } from "backend/utils/dtos/PostDTO.js";
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

function firstPostResponse(r: PostResponse[] | void): { releaseId: string; releaseUrl: string } {
    const x = (r && r[0]) ?? null;
    if (!x) {
        return { releaseId: "", releaseUrl: "" };
    }
    return { releaseId: x.postId ?? x.id, releaseUrl: x.releaseURL ?? "" };
}

export async function publishThreadFinisherIfConfigured(params: {
    post: SocialPostLike;
    integration: IntegrationLike;
    record: IntegrationRecord;
    social: { comment?: (...args: unknown[]) => Promise<PostResponse[]> };
    publishedPostId: string;
    replyParentId: string;
    notify: NotifyFn;
}): Promise<string> {
    const { post, integration, record, social, publishedPostId, replyParentId, notify } = params;
    const hooks = resolveScheduledPublishHooks(integration.provider_identifier);
    if (!hooks.supportsThreadFinisher) return replyParentId;
    if (typeof social.comment !== "function") return replyParentId;
    if (!publishedPostId) return replyParentId;

    const providerSettings = parseProviderSettingsFromPostRow(post);
    const finisher = hooks.threadFinisherMessage?.(providerSettings) ?? null;
    if (!finisher) return replyParentId;

    const organizationId = post.organization_id;
    const postId = post.id;
    const networkLabel = providerDisplayName(integration.provider_identifier);

    try {
        const res = await social.comment(
            integration.internal_id,
            publishedPostId,
            replyParentId,
            integration.token,
            [{ id: postId, message: finisher, settings: {} }],
            record
        );
        const nextId = firstPostResponse(res).releaseId?.trim();
        logger.info({
            msg: "[Orchestrator] thread-finisher comment published",
            postId,
            organizationId,
            provider: integration.provider_identifier,
        });
        return nextId || replyParentId;
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.warn({
            msg: "[Orchestrator] thread-finisher comment failed (best-effort)",
            postId,
            organizationId,
            provider: integration.provider_identifier,
            error: msg,
        });
        await notify(
            organizationId,
            `We published your post, but the ${networkLabel} thread finisher failed`,
            `Your ${networkLabel} post was published, but the closing thread message could not be posted. ${msg}`,
            true,
            false,
            "info"
        );
        return replyParentId;
    }
}
