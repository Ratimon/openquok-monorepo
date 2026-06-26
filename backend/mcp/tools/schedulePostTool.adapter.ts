import type { CreatePostProgrammaticInput } from "../../services/PostsService";
import type { PostMediaItemInput } from "../../utils/dtos/PostDTO";
import { replyChainBucketForProvider } from "../../utils/dtos/PostDTO";
import { makeId } from "../../utils/ids/makeId";

export type SchedulePostType = "draft" | "schedule" | "now";

export type SchedulePostSocialPostInput = {
    integration: string;
    postsAndComments?: string[];
    settings?: Record<string, unknown>;
    attachments?: string[];
};

export type SchedulePostToolInput = {
    type: SchedulePostType;
    /** ISO-8601 publish time when `type` is `schedule`. */
    date?: string;
    socialPost: SchedulePostSocialPostInput[];
};

export type MappedSchedulePostInput = {
    createInput: Omit<CreatePostProgrammaticInput, "organizationId">;
    integrationIdentifiers: Record<string, string>;
};

const THREAD_STYLE_PROVIDERS = new Set(["threads", "x"]);

function isThreadStyleProvider(providerIdentifier: string): boolean {
    return THREAD_STYLE_PROVIDERS.has(providerIdentifier.trim().toLowerCase());
}

export function mapSchedulePostType(
    type: SchedulePostType,
    date?: string
): { status: "draft" | "scheduled"; scheduledAtIso: string } {
    if (type === "draft") {
        return { status: "draft", scheduledAtIso: new Date().toISOString() };
    }
    if (type === "now") {
        return { status: "scheduled", scheduledAtIso: new Date().toISOString() };
    }
    const scheduledAtIso = (date ?? "").trim();
    if (!scheduledAtIso) {
        throw new Error("`date` is required when type is `schedule`");
    }
    const parsed = new Date(scheduledAtIso);
    if (Number.isNaN(parsed.getTime())) {
        throw new Error("Invalid `date` for scheduled post");
    }
    return { status: "scheduled", scheduledAtIso: parsed.toISOString() };
}

export function mapPostsAndCommentsForIntegration(params: {
    postsAndComments: string[];
    providerIdentifier: string;
}): {
    body: string;
    providerSettings: Record<string, unknown>;
} {
    const texts = params.postsAndComments.map((s) => String(s ?? "").trim()).filter(Boolean);
    if (texts.length === 0) {
        return { body: "", providerSettings: {} };
    }

    const providerId = params.providerIdentifier.trim().toLowerCase();
    const [first, ...rest] = texts;
    const body = first ?? "";

    if (rest.length === 0) {
        return { body, providerSettings: {} };
    }

    const bucket = replyChainBucketForProvider(providerId);
    const replies = rest.map((message) => ({
        id: makeId(12),
        message,
        delaySeconds: 0,
    }));

    if (isThreadStyleProvider(providerId)) {
        return {
            body,
            providerSettings: {
                [bucket]: { replies },
            },
        };
    }

    return {
        body,
        providerSettings: {
            [bucket]: { replies },
        },
    };
}

export function mergeProviderSettings(
    base: Record<string, unknown> | undefined,
    fromComments: Record<string, unknown>
): Record<string, unknown> {
    const out: Record<string, unknown> = { ...(base ?? {}) };
    for (const [key, value] of Object.entries(fromComments)) {
        const existing = out[key];
        if (existing && typeof existing === "object" && !Array.isArray(existing) && typeof value === "object" && value) {
            out[key] = { ...(existing as Record<string, unknown>), ...(value as Record<string, unknown>) };
        } else {
            out[key] = value;
        }
    }
    return out;
}

export function mapSchedulePostToolInput(params: {
    input: SchedulePostToolInput;
    integrationProviderById: Record<string, string>;
    mediaByIntegrationId: Record<string, PostMediaItemInput[]>;
}): MappedSchedulePostInput {
    const { type, date, socialPost } = params.input;
    if (!Array.isArray(socialPost) || socialPost.length === 0) {
        throw new Error("At least one socialPost entry is required");
    }

    const { status, scheduledAtIso } = mapSchedulePostType(type, date);
    const integrationIds: string[] = [];
    const bodiesByIntegrationId: Record<string, string> = {};
    const providerSettingsByIntegrationId: Record<string, Record<string, unknown>> = {};
    const integrationIdentifiers: Record<string, string> = {};
    const media: PostMediaItemInput[] = [];

    for (const entry of socialPost) {
        const integrationId = String(entry.integration ?? "").trim();
        if (!integrationId) {
            throw new Error("Each socialPost entry requires `integration` (channel id)");
        }
        const providerIdentifier = params.integrationProviderById[integrationId];
        if (!providerIdentifier) {
            throw new Error(`Unknown integration id: ${integrationId}`);
        }

        integrationIds.push(integrationId);
        integrationIdentifiers[integrationId] = providerIdentifier;

        const mapped = mapPostsAndCommentsForIntegration({
            postsAndComments: entry.postsAndComments ?? [],
            providerIdentifier,
        });
        bodiesByIntegrationId[integrationId] = mapped.body;
        providerSettingsByIntegrationId[integrationId] = mergeProviderSettings(entry.settings, mapped.providerSettings);

        const attachments = params.mediaByIntegrationId[integrationId] ?? [];
        for (const item of attachments) {
            media.push(item);
        }
        if (entry.attachments?.length && attachments.length === 0) {
            throw new Error(`Attachments for integration ${integrationId} were not uploaded`);
        }
    }

    const uniqueIntegrationIds = [...new Set(integrationIds)];
    const primaryBody = bodiesByIntegrationId[uniqueIntegrationIds[0]!] ?? "";

    return {
        integrationIdentifiers,
        createInput: {
            body: primaryBody,
            bodiesByIntegrationId,
            providerSettingsByIntegrationId,
            media: media.length > 0 ? media : null,
            integrationIds: uniqueIntegrationIds,
            isGlobal: uniqueIntegrationIds.length > 1,
            scheduledAtIso,
            repeatInterval: null,
            tagNames: [],
            status,
            isAgent: true,
        },
    };
}

export function formatSchedulePostToolOutput(
    posts: Array<{ id: string; integration_id: string | null }>,
    integrationIdentifiers: Record<string, string>
): { output: Array<{ postId: string; integration: string }> } {
    return {
        output: posts.map((post) => ({
            postId: post.id,
            integration: post.integration_id
                ? (integrationIdentifiers[post.integration_id] ?? post.integration_id)
                : "",
        })),
    };
}
