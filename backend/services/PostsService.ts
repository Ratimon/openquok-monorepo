import type { IntegrationService } from "./IntegrationService";
import type { IntegrationManager } from "../integrations/integrationManager";
import type { IntegrationConnectionService } from "./IntegrationConnectionService";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import type { PostsRepository, SocialPostInsert } from "../repositories/PostsRepository";
import type CacheService from "../connections/cache/CacheService";
import type CacheInvalidationService from "../connections/cache/CacheInvalidationService";
import type {
    PostMediaItemInput,
    PostStateDb,
    RepeatIntervalKey,
    PostCommentLike,
    PostThreadReplyLike,
    SocialPostLike,
} from "../utils/dtos/PostDTO";
import type { AnalyticsData, SocialProvider } from "../integrations/social.integrations.interface";
import type { RefreshIntegrationService } from "./RefreshIntegrationService";
import type { IntegrationLike } from "../utils/dtos/IntegrationDTO";
import dayjs from "dayjs";
import {
    parsePostImageColumn,
    parsePostSettingsJson,
    parseProviderThreadsPreviewFromPostSettings,
    repeatIntervalToDays,
} from "../utils/dtos/PostDTO";

import { AppError } from "../errors/AppError";
import { ProviderAccessTokenExpiredError } from "../errors/ProviderIntegrationErrors";
import { config } from "../config/GlobalConfig";
import { logger } from "../utils/Logger";

const DEFAULT_TAG_COLOR = "#6366f1";

/** Prefix for {@link PostsService.listPostsForCalendar} cache keys (`posts:calendar:list:${organizationId}:…`). */
export const POSTS_CALENDAR_LIST_CACHE_PREFIX = "posts:calendar:list";

/** Domain-scoped cache key prefixes (social posts / calendar / tags). */
const CACHE_KEYS = {
    POSTS: "posts",
    /** Full key = `${POSTS_GROUP}:${postGroup}` */
    POSTS_GROUP: "posts:group",
    /** Full key = `${POSTS_TAGS_LIST}:${organizationId}` */
    POSTS_TAGS_LIST: "posts:tags:list",
    /**
     * Full key = `${POSTS_CALENDAR_LIST}:${organizationId}:${startIso}:${endIso}:${integrationKey}`.
     * `integrationKey` is sorted ids or `all` when no filter.
     */
    POSTS_CALENDAR_LIST: POSTS_CALENDAR_LIST_CACHE_PREFIX,
    /** Full key = `${POSTS_PREVIEW}:${postId}` (public preview with share=true). */
    POSTS_PREVIEW: "posts:preview",
};

const POSTS_CACHE_TTL_SEC = 300;

/** Same TTL strategy as {@link IntegrationService} analytics cache (short in dev). */
const POST_ANALYTICS_CACHE_TTL_SEC =
    !process.env.NODE_ENV || process.env.NODE_ENV === "development" ? 1 : 3600;

function sleepMs(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function tagsListCacheKey(organizationId: string): string {
    return `${CACHE_KEYS.POSTS_TAGS_LIST}:${organizationId}`;
}

function calendarPostsCacheKey(params: {
    organizationId: string;
    startIso: string;
    endIso: string;
    integrationIds?: string[] | null;
}): string {
    const integrationKey =
        params.integrationIds != null && params.integrationIds.length > 0
            ? [...params.integrationIds].sort().join(",")
            : "all";
    return `${CACHE_KEYS.POSTS_CALENDAR_LIST}:${params.organizationId}:${params.startIso}:${params.endIso}:${integrationKey}`;
}

/**
 * Drops cached calendar ranges for a workspace (API reads via {@link PostsService.listPostsForCalendar}).
 * Used by {@link PostsService} on mutations and by the scheduled-publish worker (repository updates bypass the service).
 */
export async function invalidatePostsCalendarListCachesForOrganization(
    organizationId: string,
    cacheInvalidator?: CacheInvalidationService,
    cache?: CacheService
): Promise<void> {
    const pattern = `${POSTS_CALENDAR_LIST_CACHE_PREFIX}:${organizationId}:*`;
    if (cacheInvalidator) {
        try {
            await cacheInvalidator.invalidatePattern(pattern);
            return;
        } catch (error) {
            logger.error({
                msg: "Error invalidating posts calendar list cache pattern",
                organizationId,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    if (cache) {
        try {
            await cache.delPattern(pattern);
        } catch (error) {
            logger.error({
                msg: "Error deleting posts calendar list cache pattern (fallback)",
                organizationId,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
}

function dayStartUtcIso(d: Date): string {
    const x = new Date(d.getTime());
    x.setUTCHours(0, 0, 0, 0);
    return x.toISOString();
}

function addMinutes(d: Date, minutes: number): Date {
    return new Date(d.getTime() + minutes * 60 * 1000);
}

function parsePostingTimesMinutes(postingTimesJson: string | null | undefined): number[] {
    if (!postingTimesJson) return [];
    try {
        const raw = JSON.parse(postingTimesJson) as unknown;
        const arr = Array.isArray(raw) ? raw : [];
        const minutes = arr
            .map((x: any) => (typeof x?.time === "number" ? x.time : Number.NaN))
            .filter((n) => Number.isFinite(n) && n >= 0 && n < 24 * 60) as number[];
        return minutes;
    } catch {
        return [];
    }
}

/** Human-readable platform label for SEO / previews from `integrations.provider_identifier`. */
function socialPlatformLabelFromProviderIdentifier(
    integrationManager: IntegrationManager,
    providerIdentifier: string | null | undefined
): string | null {
    const id = (providerIdentifier ?? "").trim().toLowerCase();
    if (!id) return null;

    const FALLBACK: Record<string, string> = {
        facebook: "Facebook",
        instagram: "Instagram",
        "instagram-business": "Instagram",
        "instagram-standalone": "Instagram",
        youtube: "YouTube",
        tiktok: "TikTok",
        x: "X",
        threads: "Threads",
    };
    if (FALLBACK[id]) return FALLBACK[id];

    const registered = integrationManager.getSocialIntegration(id);
    if (registered?.name) return registered.name;

    return id
        .split("-")
        .map((w) => (w.length > 0 ? w[0]!.toUpperCase() + w.slice(1).toLowerCase() : ""))
        .join(" ");
}

export type CreatePostInput = {
    organizationId: string;
    authUserId: string;
    body: string;
    /** Optional per-integration body overrides. */
    bodiesByIntegrationId?: Record<string, string> | null;
    /** Optional per-integration provider settings (e.g. Threads thread finisher). */
    providerSettingsByIntegrationId?: Record<string, Record<string, unknown>> | null;
    /** Image attachments; stored as JSON in `posts.image`. */
    media?: PostMediaItemInput[] | null;
    integrationIds: string[];
    isGlobal: boolean;
    scheduledAtIso: string;
    repeatInterval: RepeatIntervalKey | null;
    tagNames: string[];
    status: "draft" | "scheduled";
};

export type PostGroupDetails = {
    postGroup: string;
    organizationId: string;
    isGlobal: boolean;
    repeatInterval: RepeatIntervalKey | null;
    publishDateIso: string;
    status: "draft" | "scheduled";
    integrationIds: string[];
    /** Canonical global body best-effort for edit mode. */
    body: string;
    /** Always provided for edit mode; includes all selected integrations (even if equal to body). */
    bodiesByIntegrationId: Record<string, string>;
    media: PostMediaItemInput[];
    tagNames: string[];
    /** All post row ids in this group (for preview/debug tooling). */
    postIds?: string[];
    /**
     * Per-integration provider payload from each post row (`settings.providerSettings`),
     * with `threads.replies` refreshed from `post_thread_replies` when rows exist (edit mode parity with public preview).
     */
    providerSettingsByIntegrationId?: Record<string, Record<string, unknown>>;
};

export type { PostMediaItemInput, RepeatIntervalKey } from "../utils/dtos/PostDTO";

export class PostsService {
    constructor(
        private readonly postsRepository: PostsRepository,
        private readonly integrationConnectionService: IntegrationConnectionService,
        private readonly integrationService: IntegrationService,
        private readonly organizationRepository: OrganizationRepository,
        private readonly integrationManager: IntegrationManager,
        private readonly refreshIntegrationService: RefreshIntegrationService,
        private readonly cache?: CacheService,
        private readonly cacheInvalidator?: CacheInvalidationService
    ) {}

    async findFreeSlot(organizationId: string, authUserId: string): Promise<string> {
        await this.integrationConnectionService.assertOrganizationMember(authUserId, organizationId);

        const integrations = await this.integrationService.listByOrganization(organizationId);
        const minutes = [
            ...new Set(
                integrations
                    .flatMap((i) => parsePostingTimesMinutes((i as any).posting_times))
                    .filter((n) => Number.isFinite(n))
            ),
        ].sort((a, b) => a - b);

        // Fallback: if no posting times exist, suggest "now" (exact datetime), like a generic scheduler.
        if (minutes.length === 0) {
            return new Date().toISOString();
        }

        const now = Date.now();
        // search day-by-day for the first posting-time slot that is in the future and not taken.
        for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
            const dayStart = new Date(dayStartUtcIso(new Date(now + dayOffset * 24 * 60 * 60 * 1000)));
            for (const m of minutes) {
                const candidate = addMinutes(dayStart, m);
                if (candidate.getTime() <= now + 60 * 1000) continue;
                const iso = candidate.toISOString();
                const taken = await this.postsRepository.hasQueueSlotTaken(organizationId, iso);
                if (!taken) return iso;
            }
        }

        // Worst case: return first slot tomorrow at first posting time.
        const tomorrowStart = new Date(dayStartUtcIso(new Date(now + 24 * 60 * 60 * 1000)));
        return addMinutes(tomorrowStart, minutes[0]!).toISOString();
    }

    async listTags(organizationId: string, authUserId: string) {
        await this.integrationConnectionService.assertOrganizationMember(authUserId, organizationId);
        const cacheKey = tagsListCacheKey(organizationId);
        const factory = async () => this.postsRepository.listTagsByOrganization(organizationId);
        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, POSTS_CACHE_TTL_SEC);
        }
        return factory();
    }

    async createTag(organizationId: string, authUserId: string, name: string, color?: string) {
        await this.integrationConnectionService.assertOrganizationMember(authUserId, organizationId);
        const trimmed = name.trim();
        if (!trimmed.length) {
            throw new AppError("Tag name is required", 400);
        }
        if (trimmed.length > 120) {
            throw new AppError("Tag name is too long", 400);
        }
        const c = color?.trim() || DEFAULT_TAG_COLOR;
        try {
            const created = await this.postsRepository.insertTag(organizationId, trimmed, c);
            await this._invalidateOrganizationPostsListCaches({ organizationId });
            return created;
        } catch {
            const existing = await this.postsRepository.findTagByOrgAndName(organizationId, trimmed);
            if (existing) {
                await this._invalidateOrganizationPostsListCaches({ organizationId });
                return existing;
            }
            throw new AppError("Could not save tag", 500);
        }
    }

    async deleteTag(organizationId: string, authUserId: string, tagId: string): Promise<void> {
        await this.integrationConnectionService.assertOrganizationMember(authUserId, organizationId);
        const deleted = await this.postsRepository.softDeleteTagForOrganization(organizationId, tagId);
        if (!deleted) {
            throw new AppError("Tag not found", 404);
        }
        await this._invalidateOrganizationPostsListCaches({ organizationId });
    }

    private async buildPostGroupInsert(input: {
        organizationId: string;
        authUserId: string;
        postGroup: string;
        body: string;
        bodiesByIntegrationId?: Record<string, string> | null;
        providerSettingsByIntegrationId?: Record<string, Record<string, unknown>> | null;
        media?: PostMediaItemInput[] | null;
        integrationIds: string[];
        isGlobal: boolean;
        scheduledAtIso: string;
        repeatInterval: RepeatIntervalKey | null;
        tagNames: string[];
        status: "draft" | "scheduled";
        /** When scheduling and this flag is true, skip the "slot taken" check. */
        allowTakenSlot?: boolean;
    }): Promise<{ postGroup: string; toInsert: SocialPostInsert[]; tagIds: string[] }> {
        const {
            organizationId,
            authUserId,
            postGroup,
            body,
            bodiesByIntegrationId,
            providerSettingsByIntegrationId,
            media,
            integrationIds,
            isGlobal,
            scheduledAtIso,
            repeatInterval,
            tagNames,
            status,
            allowTakenSlot = false,
        } = input;

        await this.integrationConnectionService.assertOrganizationMember(authUserId, organizationId);

        const rows = await this.integrationService.listByOrganization(organizationId);
        const allowed = new Set(rows.filter((r) => r.deleted_at == null).map((r) => r.id));
        const providerByIntegrationId = new Map(rows.map((r) => [r.id, (r.provider_identifier ?? "").toLowerCase()]));

        const uniqueIds = [...new Set(integrationIds)];
        for (const id of uniqueIds) {
            if (!allowed.has(id)) {
                throw new AppError("One or more channels are not in this workspace", 400);
            }
        }

        if (status === "scheduled" && uniqueIds.length === 0) {
            throw new AppError("Select at least one channel to schedule", 400);
        }

        const mediaCount = Array.isArray(media) ? media.length : 0;
        for (const integrationId of uniqueIds) {
            const providerIdentifier = providerByIntegrationId.get(integrationId) ?? "";
            if (!providerIdentifier) continue;
            const provider = this.integrationManager.getSocialIntegration(providerIdentifier);
            const message = provider?.validateCreatePost?.({ status, mediaCount });
            if (typeof message === "string" && message.trim().length > 0) {
                throw new AppError(message, 400);
            }
        }

        const scheduledDate = new Date(scheduledAtIso);
        if (Number.isNaN(scheduledDate.getTime())) {
            throw new AppError("Invalid schedule time", 400);
        }

        const publishIso = scheduledDate.toISOString();

        if (status === "scheduled" && !allowTakenSlot) {
            const taken = await this.postsRepository.hasQueueSlotTaken(organizationId, publishIso);
            if (taken) {
                throw new AppError("That time slot is already taken; pick another.", 409);
            }
        }

        const normalizedTagNames = [...new Set(tagNames.map((t) => t.trim()).filter(Boolean))].slice(0, 50);
        const tagIds = await this.resolveTagIds(organizationId, normalizedTagNames);

        const { userId } = await this.organizationRepository.findUserIdByAuthId(authUserId);
        const createdByUserId = userId ?? null;

        const baseSettings = { isGlobal, repeatInterval: repeatInterval ?? null };
        const intervalDays = repeatIntervalToDays(repeatInterval);

        const state: PostStateDb = status === "draft" ? "DRAFT" : "QUEUE";

        const imageColumn =
            media && media.length > 0
                ? JSON.stringify({ v: 1, items: media })
                : null;

        const baseRow: Omit<SocialPostInsert, "integration_id"> = {
            state,
            publish_date: publishIso,
            organization_id: organizationId,
            content: body,
            delay: 0,
            post_group: postGroup,
            title: null,
            description: null,
            parent_post_id: null,
            release_id: null,
            release_url: null,
            settings: JSON.stringify(baseSettings),
            image: imageColumn,
            interval_in_days: intervalDays,
            error: null,
            deleted_at: null,
            created_by_user_id: createdByUserId,
        };

        let toInsert: SocialPostInsert[];
        if (uniqueIds.length === 0) {
            toInsert = [{ ...baseRow, integration_id: null }];
        } else {
            toInsert = uniqueIds.map((integrationId) => ({
                ...baseRow,
                integration_id: integrationId,
                content:
                    bodiesByIntegrationId && typeof bodiesByIntegrationId[integrationId] === "string"
                        ? bodiesByIntegrationId[integrationId]!
                        : baseRow.content,
                settings: JSON.stringify({
                    ...baseSettings,
                    providerSettings: providerSettingsByIntegrationId?.[integrationId] ?? null,
                }),
            }));
        }

        return { postGroup, toInsert, tagIds };
    }

    async createPost(input: CreatePostInput): Promise<{
        postGroup: string;
        posts: SocialPostLike[];
    }> {
        const postGroup = this.postsRepository.newPostGroup();
        const { toInsert, tagIds } = await this.buildPostGroupInsert({ ...input, postGroup });
        const inserted = await this.postsRepository.insertPostGroup(toInsert);
        await this.postsRepository.linkTagsToPosts(inserted.map((p) => p.id), tagIds);
        await this.persistThreadRepliesFromProviderSettings({
            organizationId: input.organizationId,
            authUserId: input.authUserId,
            posts: inserted,
            providerSettingsByIntegrationId: input.providerSettingsByIntegrationId ?? null,
        });
        const out = { postGroup, posts: inserted };
        void this.maybeEnqueueScheduledSocialPostOrchestration(input.organizationId, out.posts, input.status);
        await this._invalidatePostMutationCaches({
            organizationId: input.organizationId,
            postGroup,
            postIds: inserted.map((p) => p.id),
        });
        return out;
    }

    async listPostsForCalendar({
        organizationId,
        authUserId,
        startIso,
        endIso,
        integrationIds,
    }: {
        organizationId: string;
        authUserId: string;
        startIso: string;
        endIso: string;
        integrationIds?: string[] | null;
    }): Promise<SocialPostLike[]> {
        await this.integrationConnectionService.assertOrganizationMember(authUserId, organizationId);

        const start = new Date(startIso);
        const end = new Date(endIso);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            throw new AppError("Invalid date range", 400);
        }
        if (start.getTime() > end.getTime()) {
            throw new AppError("Start must be before end", 400);
        }

        const startIsoNorm = start.toISOString();
        const endIsoNorm = end.toISOString();
        const integrationIdsNorm = integrationIds ?? null;

        const cacheKey = calendarPostsCacheKey({
            organizationId,
            startIso: startIsoNorm,
            endIso: endIsoNorm,
            integrationIds: integrationIdsNorm,
        });

        const factory = async (): Promise<SocialPostLike[]> =>
            this.postsRepository.listPostsByOrganizationAndDateRange({
                organizationId,
                startIso: startIsoNorm,
                endIso: endIsoNorm,
                integrationIds: integrationIdsNorm,
            });

        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, POSTS_CACHE_TTL_SEC);
        }
        return factory();
    }

    async getPostGroup(postGroup: string, authUserId: string): Promise<PostGroupDetails> {
        const rows = await this.postsRepository.listPostsByGroup(postGroup);
        if (!rows.length) {
            throw new AppError("Post group not found", 404);
        }

        const organizationId = rows[0]!.organization_id;
        await this.integrationConnectionService.assertOrganizationMember(authUserId, organizationId);

        const cacheKey = `${CACHE_KEYS.POSTS_GROUP}:${postGroup}`;
        const factory = async (): Promise<PostGroupDetails> => this.buildPostGroupDetails(postGroup, rows);

        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, POSTS_CACHE_TTL_SEC);
        }
        return factory();
    }

    private async buildPostGroupDetails(postGroup: string, rows: SocialPostLike[]): Promise<PostGroupDetails> {
        const organizationId = rows[0]!.organization_id;

        const { isGlobal, repeatInterval } = parsePostSettingsJson(rows[0]!.settings);
        const publishDateIso = rows[0]!.publish_date;
        const status: "draft" | "scheduled" = rows.every((r) => r.state === "DRAFT") ? "draft" : "scheduled";

        const integrationIds = rows.map((r) => r.integration_id).filter((x): x is string => Boolean(x));

        // Best-effort global body: if global editing was used, all bodies are the same.
        // If custom mode, choose the first integration's body as a baseline.
        const body = rows.find((r) => r.integration_id != null)?.content ?? rows[0]!.content ?? "";
        const bodiesByIntegrationId: Record<string, string> = {};
        for (const r of rows) {
            if (!r.integration_id) continue;
            bodiesByIntegrationId[r.integration_id] = r.content ?? "";
        }

        const media = parsePostImageColumn(rows[0]!.image);
        const tags = await this.postsRepository.listTagsForPostIds(rows.map((r) => r.id));
        const tagNames = tags.map((t) => t.name).filter(Boolean);

        const providerSettingsByIntegrationId: Record<string, Record<string, unknown>> = {};
        for (const r of rows) {
            if (!r.integration_id) continue;
            const parsed = this.parsePostRowProviderSettings(r.settings);
            const merged = await this.augmentComposerProviderSettingsFromDb(r.id, parsed);
            if (merged && typeof merged === "object" && Object.keys(merged).length > 0) {
                providerSettingsByIntegrationId[r.integration_id] = merged;
            }
        }

        return {
            postGroup,
            organizationId,
            isGlobal,
            repeatInterval,
            publishDateIso,
            status,
            integrationIds,
            body,
            bodiesByIntegrationId,
            media,
            tagNames,
            postIds: rows.map((r) => r.id),
            ...(Object.keys(providerSettingsByIntegrationId).length > 0 ? { providerSettingsByIntegrationId } : {}),
        };
    }

    private parsePostRowProviderSettings(settings: string | null): Record<string, unknown> | null {
        if (!settings?.trim()) return null;
        try {
            const o = JSON.parse(settings) as { providerSettings?: unknown };
            if (!o || typeof o !== "object") return null;
            const ps = o.providerSettings;
            if (!ps || typeof ps !== "object") return null;
            return { ...(ps as Record<string, unknown>) };
        } catch {
            return null;
        }
    }

    /** Prefer DB-backed thread replies when editing (published QUEUE→PUBLISHED rows stay in sync). */
    private async augmentComposerProviderSettingsFromDb(
        postId: string,
        base: Record<string, unknown> | null
    ): Promise<Record<string, unknown>> {
        const merged: Record<string, unknown> =
            base && typeof base === "object" ? { ...base } : {};
        let dbRows: PostThreadReplyLike[] = [];
        try {
            dbRows = await this.postsRepository.listThreadRepliesByPostId(postId);
        } catch {
            return merged;
        }
        if (!dbRows.length) return merged;

        const threads =
            merged.threads && typeof merged.threads === "object"
                ? { ...(merged.threads as Record<string, unknown>) }
                : {};
        threads.replies = dbRows.map((r) => ({
            id: r.id,
            message: r.content ?? "",
            delaySeconds: Math.max(0, Math.floor(Number(r.delay_seconds) || 0)),
        }));
        merged.threads = threads;
        return merged;
    }

    /**
     * Debug endpoint to export a post group's raw rows + derived group details.
     * Intended for support/debugging; not a stable public contract.
     */
    async debugExportPostGroup(
        postGroup: string,
        authUserId: string
    ): Promise<{
        postGroup: string;
        organizationId: string;
        group: PostGroupDetails;
        posts: SocialPostLike[];
    }> {
        const rows = await this.postsRepository.listPostsByGroup(postGroup);
        if (!rows.length) {
            throw new AppError("Post group not found", 404);
        }
        const organizationId = rows[0]!.organization_id;
        await this.integrationConnectionService.assertOrganizationMember(authUserId, organizationId);

        const group = await this.getPostGroup(postGroup, authUserId);
        return {
            postGroup,
            organizationId,
            group,
            posts: rows,
        };
    }

    async getPostPreview(postId: string, share: string | null): Promise<{
        id: string;
        postGroup: string;
        organizationId: string;
        publishDateIso: string;
        content: string;
        media: PostMediaItemInput[];
        /** Set when the post row is tied to an integration (channel). */
        socialPlatformLabel: string | null;
        integrationId: string | null;
        /** Lowercase provider id from `integrations.provider_identifier` (e.g. `threads`, `instagram`). */
        providerIdentifier: string | null;
        channelName: string | null;
        channelPictureUrl: string | null;
        /** Scheduled thread follow-ups (`post_thread_replies` or legacy `settings` JSON). */
        threadReplies: { id: string; message: string; delaySeconds: number }[];
        /** Threads-style finisher when enabled in composer settings. */
        threadFinisher: { enabled: boolean; message: string } | null;
        /** Threads same-account delayed engagement plug (`threads.internalEngagementPlug`) when enabled. */
        delayedEngagementReply: { message: string; delaySeconds: number } | null;
    }> {
        if (share !== "true") {
            throw new AppError("Forbidden", 403);
        }

        const cacheKey = `${CACHE_KEYS.POSTS_PREVIEW}:${postId}`;
        const factory = async (): Promise<{
            id: string;
            postGroup: string;
            organizationId: string;
            publishDateIso: string;
            content: string;
            media: PostMediaItemInput[];
            socialPlatformLabel: string | null;
            integrationId: string | null;
            providerIdentifier: string | null;
            channelName: string | null;
            channelPictureUrl: string | null;
            threadReplies: { id: string; message: string; delaySeconds: number }[];
            threadFinisher: { enabled: boolean; message: string } | null;
            delayedEngagementReply: { message: string; delaySeconds: number } | null;
        }> => {
            const row = await this.postsRepository.getPostById(postId);
            if (!row) {
                throw new AppError("Post not found", 404);
            }

            const media = parsePostImageColumn(row.image ?? null);

            let socialPlatformLabel: string | null = null;
            let integrationId: string | null = row.integration_id;
            let providerIdentifier: string | null = null;
            let channelName: string | null = null;
            let channelPictureUrl: string | null = null;
            if (row.integration_id) {
                const integration = await this.integrationService.getById(row.organization_id, row.integration_id);
                providerIdentifier = (integration?.provider_identifier ?? "").trim().toLowerCase() || null;
                channelName = integration?.name?.trim() ? integration.name.trim() : null;
                channelPictureUrl = integration?.picture?.trim() ? integration.picture.trim() : null;
                socialPlatformLabel = socialPlatformLabelFromProviderIdentifier(
                    this.integrationManager,
                    integration?.provider_identifier
                );
            }

            const fromSettings = parseProviderThreadsPreviewFromPostSettings(row.settings ?? null);
            const threadFinisher = fromSettings.finisher;
            const delayedEngagementReply = fromSettings.delayedEngagementReply;

            let threadReplies: { id: string; message: string; delaySeconds: number }[] = [];
            try {
                const dbReplies = await this.postsRepository.listThreadRepliesByPostId(postId);
                if (dbReplies.length > 0) {
                    threadReplies = dbReplies.map((r) => ({
                        id: r.id,
                        message: r.content ?? "",
                        delaySeconds: Math.max(0, Math.floor(Number(r.delay_seconds) || 0)),
                    }));
                }
            } catch {
                threadReplies = [];
            }

            if (threadReplies.length === 0 && fromSettings.replies.length > 0) {
                threadReplies = fromSettings.replies.map((r, i) => ({
                    id: `settings-${i}`,
                    message: r.content,
                    delaySeconds: r.delaySeconds,
                }));
            }

            return {
                id: row.id,
                postGroup: row.post_group,
                organizationId: row.organization_id,
                publishDateIso: row.publish_date,
                content: row.content ?? "",
                media,
                socialPlatformLabel,
                integrationId,
                providerIdentifier,
                channelName,
                channelPictureUrl,
                threadReplies,
                threadFinisher,
                delayedEngagementReply,
            };
        };

        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, POSTS_CACHE_TTL_SEC);
        }
        return factory();
    }

    /** Public `GET /public/posts/:postId/comments` — no API key; comments keyed by post id only. */
    async getPublicComments(postId: string): Promise<PostCommentLike[]> {
        return this.postsRepository.listCommentsByPostId(postId);
    }

    /** Workspace `POST /posts/:postId/comments` — authenticated composer comment on a post row. */
    async createComposerComment(params: {
        organizationId: string;
        authUserId: string;
        postId: string;
        comment: string;
    }): Promise<PostCommentLike> {
        const { organizationId, authUserId, postId, comment } = params;

        await this.integrationConnectionService.assertOrganizationMember(authUserId, organizationId);

        const trimmed = comment.trim();
        if (!trimmed.length) {
            throw new AppError("Comment is required", 400);
        }

        const post = await this.postsRepository.getPostById(postId);
        if (!post || post.organization_id !== organizationId) {
            throw new AppError("Post not found", 404);
        }

        const { userId } = await this.organizationRepository.findUserIdByAuthId(authUserId);
        if (!userId) {
            throw new AppError("User not found", 400);
        }

        const row = await this.postsRepository.insertComposerComment({
            organizationId,
            postId,
            userId,
            content: trimmed,
        });

        await this._invalidatePostPreviewCaches([postId]);

        return row;
    }

    /**
     * Loads provider-native insights for one published post (`posts.release_id`).
     * Returns `{ missing: true }` when the worker could not map the live network object (`release_id === "missing"`).
     */
    async checkPostAnalytics(params: {
        authUserId: string;
        organizationId: string;
        postId: string;
        dateWindowDays: number;
    }): Promise<AnalyticsData[] | { missing: true }> {
        const { authUserId, organizationId, postId, dateWindowDays } = params;

        await this.integrationConnectionService.assertOrganizationMember(authUserId, organizationId);

        const post = await this.postsRepository.getPostById(postId);
        if (!post || post.organization_id !== organizationId) {
            throw new AppError("Post not found", 404);
        }

        if (!post.release_id) {
            return [];
        }
        if (post.release_id === "missing") {
            return { missing: true };
        }
        if (!post.integration_id) {
            return [];
        }

        const integrationRow = await this.integrationService.getById(organizationId, post.integration_id);
        if (!integrationRow || (integrationRow.type ?? "").toLowerCase() !== "social") {
            return [];
        }

        const provider = this.integrationManager.getSocialIntegration(integrationRow.provider_identifier);
        if (!provider?.postAnalytics) {
            return [];
        }
        const postAnalyticsFn = provider.postAnalytics;

        const cacheKeyId = `post:${postId}`;
        const cached = await this.integrationService.getCachedIntegrationPayload(
            organizationId,
            cacheKeyId,
            String(dateWindowDays)
        );
        if (cached != null) {
            return cached as AnalyticsData[];
        }

        const runPostAnalytics = async (forceRefresh: boolean): Promise<AnalyticsData[]> => {
            const row = await this.ensureFreshSocialToken(integrationRow, organizationId, {
                force: forceRefresh,
                provider,
            });
            if (!row) {
                return [];
            }
            return postAnalyticsFn(row.internal_id, row.token, post.release_id!, dateWindowDays);
        };

        try {
            const data = await runPostAnalytics(false);
            await this.integrationService.setCachedIntegrationPayload(
                organizationId,
                cacheKeyId,
                String(dateWindowDays),
                data as unknown[],
                POST_ANALYTICS_CACHE_TTL_SEC
            );
            return data;
        } catch (e) {
            if (e instanceof ProviderAccessTokenExpiredError) {
                try {
                    const data = await runPostAnalytics(true);
                    await this.integrationService.setCachedIntegrationPayload(
                        organizationId,
                        cacheKeyId,
                        String(dateWindowDays),
                        data as unknown[],
                        POST_ANALYTICS_CACHE_TTL_SEC
                    );
                    return data;
                } catch {
                    return [];
                }
            }
            return [];
        }
    }

    /** Candidate thumbnails when analytics cannot map until the user picks the matching published asset. */
    async getMissingPublishCandidates(params: {
        authUserId: string;
        organizationId: string;
        postId: string;
    }): Promise<{ id: string; url: string }[]> {
        const { authUserId, organizationId, postId } = params;

        await this.integrationConnectionService.assertOrganizationMember(authUserId, organizationId);

        const post = await this.postsRepository.getPostById(postId);
        if (!post || post.organization_id !== organizationId) {
            throw new AppError("Post not found", 404);
        }
        if (!post.integration_id || post.release_id !== "missing") {
            return [];
        }

        const integrationRow = await this.integrationService.getById(organizationId, post.integration_id);
        if (!integrationRow) {
            return [];
        }

        const provider = this.integrationManager.getSocialIntegration(integrationRow.provider_identifier);
        if (!provider?.missing) {
            return [];
        }
        const missingFn = provider.missing;

        const runMissing = async (forceRefresh: boolean): Promise<{ id: string; url: string }[]> => {
            const row = await this.ensureFreshSocialToken(integrationRow, organizationId, {
                force: forceRefresh,
                provider,
            });
            if (!row) {
                return [];
            }
            return missingFn(row.internal_id, row.token);
        };

        try {
            return await runMissing(false);
        } catch (e) {
            if (e instanceof ProviderAccessTokenExpiredError) {
                try {
                    return await runMissing(true);
                } catch {
                    return [];
                }
            }
            return [];
        }
    }

    async updatePostReleaseId(params: {
        authUserId: string;
        organizationId: string;
        postId: string;
        releaseId: string;
    }): Promise<void> {
        const { authUserId, organizationId, postId, releaseId } = params;

        await this.integrationConnectionService.assertOrganizationMember(authUserId, organizationId);

        const post = await this.postsRepository.getPostById(postId);
        if (!post || post.organization_id !== organizationId) {
            throw new AppError("Post not found", 404);
        }

        const trimmed = releaseId.trim();
        if (!trimmed.length) {
            throw new AppError("releaseId is required", 400);
        }

        const updated = await this.postsRepository.updateReleaseIdIfMissing(postId, organizationId, trimmed);
        if (!updated) {
            throw new AppError("Post cannot be linked", 400);
        }

        await this._invalidatePostAnalyticsCaches(organizationId, postId);

        await this._invalidatePostMutationCaches({
            organizationId,
            postGroup: post.post_group,
            postIds: [postId],
        });
    }

    /** Invalidate cached post-level analytics for all date windows for this row. */
    private async _invalidatePostAnalyticsCaches(organizationId: string, postId: string): Promise<void> {
        if (!this.cacheInvalidator) return;
        const pattern = `integration:${organizationId}:post:${postId}:*`;
        await this.cacheInvalidator.invalidatePattern(pattern);
    }

    /**
     * Ensures a valid access token before calling Graph-backed provider methods.
     * On failed refresh, soft-deletes the channel.
     */
    private async ensureFreshSocialToken(
        integrationRow: IntegrationLike,
        organizationId: string,
        options?: { force?: boolean; provider?: SocialProvider | null }
    ): Promise<IntegrationLike | null> {
        const exp = integrationRow.token_expiration ? dayjs(integrationRow.token_expiration) : null;
        const expired = !exp || !exp.isValid() || exp.isBefore(dayjs());
        const provider =
            options?.provider ?? this.integrationManager.getSocialIntegration(integrationRow.provider_identifier);

        if (options?.force || expired) {
            const refreshed = await this.refreshIntegrationService.refresh(integrationRow);
            if (!refreshed || !refreshed.accessToken) {
                const removed = await this.integrationService.softDeleteChannel(
                    organizationId,
                    integrationRow.id,
                    integrationRow.internal_id
                );
                if (removed) {
                    logger.warn({
                        msg: "[PostsService] Removed channel after failed token refresh",
                        organizationId,
                        integrationId: integrationRow.id,
                    });
                }
                return null;
            }
            integrationRow.token = refreshed.accessToken;

            if (provider?.refreshWait) {
                await sleepMs(10_000);
            }
        }

        return integrationRow;
    }

    async deletePostGroup(postGroup: string, authUserId: string, organizationId?: string | null): Promise<void> {
        const rows = await this.postsRepository.listPostsByGroup(postGroup);
        if (!rows.length) {
            throw new AppError("Post group not found", 404);
        }
        const orgId = rows[0]!.organization_id;
        if (organizationId && organizationId !== orgId) {
            throw new AppError("Post group does not belong to that workspace", 400);
        }
        await this.integrationConnectionService.assertOrganizationMember(authUserId, orgId);
        const ids = rows.map((r) => r.id);
        await this.postsRepository.deleteTagAssignmentsForPostIds(ids);
        await this.postsRepository.softDeletePostsByGroup(postGroup);
        await this._invalidatePostMutationCaches({
            organizationId: orgId,
            postGroup,
            postIds: ids,
        });
    }

    async updatePostGroup(input: Omit<CreatePostInput, "organizationId"> & { postGroup: string; organizationId?: string | null }): Promise<{
        postGroup: string;
        posts: SocialPostLike[];
    }> {
        const {
            postGroup,
            authUserId,
            body,
            bodiesByIntegrationId,
            media,
            integrationIds,
            isGlobal,
            scheduledAtIso,
            repeatInterval,
            tagNames,
            status,
        } = input;

        const existing = await this.postsRepository.listPostsByGroup(postGroup);
        if (!existing.length) throw new AppError("Post group not found", 404);
        const organizationId = existing[0]!.organization_id;
        if (input.organizationId && input.organizationId !== organizationId) {
            throw new AppError("Post group does not belong to that workspace", 400);
        }

        // If this group is already scheduled at the same slot, allow "taken slot" when updating without moving.
        const alignedNext = new Date(scheduledAtIso);
        const nextPublishIso = Number.isNaN(alignedNext.getTime()) ? null : alignedNext.toISOString();
        // `publish_date` formatting can vary (`.000Z` vs `+00:00`, etc.). Compare instants, not strings.
        const alreadyAtThatSlot =
            nextPublishIso != null &&
            new Date(existing[0]!.publish_date).getTime() === new Date(nextPublishIso).getTime();
        const allowTakenSlot = status === "scheduled" && alreadyAtThatSlot;

        // Validate + build insert payload first (may throw on membership / provider rules / slot taken).
        const { toInsert, tagIds } = await this.buildPostGroupInsert({
            organizationId,
            authUserId,
            postGroup,
            body,
            bodiesByIntegrationId,
            providerSettingsByIntegrationId: input.providerSettingsByIntegrationId ?? null,
            media,
            integrationIds,
            isGlobal,
            scheduledAtIso,
            repeatInterval,
            tagNames,
            status,
            allowTakenSlot,
        });

        // Delete old tag links & rows; then reinsert with the same group id.
        const oldIds = existing.map((r) => r.id);
        await this.postsRepository.deleteTagAssignmentsForPostIds(oldIds);
        await this.postsRepository.softDeleteThreadRepliesByPostIds(oldIds);
        await this.postsRepository.softDeletePostsByGroup(postGroup);

        const inserted = await this.postsRepository.insertPostGroup(toInsert);
        await this.postsRepository.linkTagsToPosts(inserted.map((p) => p.id), tagIds);
        await this.persistThreadRepliesFromProviderSettings({
            organizationId,
            authUserId,
            posts: inserted,
            providerSettingsByIntegrationId: input.providerSettingsByIntegrationId ?? null,
        });
        const out = { postGroup, posts: inserted };
        void this.maybeEnqueueScheduledSocialPostOrchestration(organizationId, out.posts, status);
        await this._invalidatePostMutationCaches({
            organizationId,
            postGroup,
            postIds: [...new Set([...oldIds, ...inserted.map((p) => p.id)])],
        });
        return out;
    }

    /**
     * Invalidate tags list + calendar lists for an organization (tag CRUD or indirect tag changes).
     */
    private async _invalidateOrganizationPostsListCaches(params: { organizationId: string }): Promise<void> {
        const { organizationId } = params;
        const invalidateWithInvalidator = async () => {
            await this.cacheInvalidator!.invalidateKey(tagsListCacheKey(organizationId));
            await invalidatePostsCalendarListCachesForOrganization(
                organizationId,
                this.cacheInvalidator,
                undefined
            );
            logger.debug({ msg: "Invalidated organization posts list caches", organizationId });
        };

        if (this.cacheInvalidator) {
            try {
                await invalidateWithInvalidator();
            } catch (error) {
                logger.error({
                    msg: "Error invalidating organization posts list caches",
                    organizationId,
                    error: String(error),
                });
            }
            return;
        }

        if (this.cache) {
            try {
                await this.cache.del(tagsListCacheKey(organizationId));
                await invalidatePostsCalendarListCachesForOrganization(organizationId, undefined, this.cache);
            } catch (error) {
                logger.error({
                    msg: "Error deleting organization posts list cache keys",
                    organizationId,
                    error: String(error),
                });
            }
        }
    }

    /** Invalidate public preview caches for given post row ids (e.g. after composer comment insert). */
    private async _invalidatePostPreviewCaches(postIds: string[]): Promise<void> {
        if (postIds.length === 0) return;

        const invalidateWithInvalidator = async () => {
            for (const id of postIds) {
                await this.cacheInvalidator!.invalidateKey(`${CACHE_KEYS.POSTS_PREVIEW}:${id}`);
            }
        };

        if (this.cacheInvalidator) {
            try {
                await invalidateWithInvalidator();
            } catch (error) {
                logger.error({
                    msg: "Error invalidating post preview caches",
                    postIdsCount: postIds.length,
                    error: String(error),
                });
            }
            return;
        }

        if (this.cache) {
            try {
                for (const id of postIds) {
                    await this.cache.del(`${CACHE_KEYS.POSTS_PREVIEW}:${id}`);
                }
            } catch (error) {
                logger.error({
                    msg: "Error deleting post preview cache keys",
                    postIdsCount: postIds.length,
                    error: String(error),
                });
            }
        }
    }

    /**
     * Invalidate group detail, previews, calendar, and tags list after post create/update/delete.
     */
    private async _invalidatePostMutationCaches(params: {
        organizationId: string;
        postGroup: string;
        postIds: string[];
    }): Promise<void> {
        const { organizationId, postGroup, postIds } = params;

        const invalidateWithInvalidator = async () => {
            await this.cacheInvalidator!.invalidateKey(`${CACHE_KEYS.POSTS_GROUP}:${postGroup}`);
            for (const id of postIds) {
                await this.cacheInvalidator!.invalidateKey(`${CACHE_KEYS.POSTS_PREVIEW}:${id}`);
            }
            await invalidatePostsCalendarListCachesForOrganization(
                organizationId,
                this.cacheInvalidator,
                undefined
            );
            await this.cacheInvalidator!.invalidateKey(tagsListCacheKey(organizationId));
            await this.cacheInvalidator!.invalidateEntity(CACHE_KEYS.POSTS, postGroup);
            logger.debug({
                msg: "Invalidated post mutation caches",
                organizationId,
                postGroup,
                postIdsCount: postIds.length,
            });
        };

        if (this.cacheInvalidator) {
            try {
                await invalidateWithInvalidator();
            } catch (error) {
                logger.error({
                    msg: "Error invalidating post mutation caches",
                    organizationId,
                    postGroup,
                    error: String(error),
                });
            }
            return;
        }

        if (this.cache) {
            try {
                await this.cache.del(`${CACHE_KEYS.POSTS_GROUP}:${postGroup}`);
                for (const id of postIds) {
                    await this.cache.del(`${CACHE_KEYS.POSTS_PREVIEW}:${id}`);
                }
                await invalidatePostsCalendarListCachesForOrganization(organizationId, undefined, this.cache);
                await this.cache.del(tagsListCacheKey(organizationId));
            } catch (error) {
                logger.error({
                    msg: "Error deleting post mutation cache keys",
                    organizationId,
                    postGroup,
                    error: String(error),
                });
            }
        }
    }

    /**
     * When `scheduledSocialPost` uses BullMQ, enqueue a delayed Flowcraft run for this group ).
     */
    private async maybeEnqueueScheduledSocialPostOrchestration(
        organizationId: string,
        posts: SocialPostLike[],
        status: "draft" | "scheduled"
    ): Promise<void> {
        if (status !== "scheduled") return;
        const soc = (config as { bullmq?: { scheduledSocialPost?: { transport?: string; enabled?: boolean } } }).bullmq
            ?.scheduledSocialPost;
        if (!soc?.enabled || soc?.transport !== "bullmq") return;
        const first = posts.find((p) => p.state === "QUEUE" && p.integration_id);
        if (!first) return;

        // Supabase/Postgres can return timestamptz with a space separator and short offsets (e.g. `2026-04-23 13:03:00+00`).
        // Normalize to a JS-parseable ISO-ish string before computing delay.
        const normalizeTimestamptz = (raw: string): string => {
            let s = String(raw ?? "").trim();
            if (!s) return s;
            // Replace first space between date/time with `T`.
            s = s.replace(" ", "T");
            // Convert "+0000" → "+00:00"
            s = s.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
            // Convert "+00" → "+00:00"
            s = s.replace(/([+-]\d{2})$/, "$1:00");
            return s;
        };

        const publishMs = new Date(normalizeTimestamptz(first.publish_date)).getTime();
        if (Number.isNaN(publishMs)) {
            logger.warn({
                msg: "[PostsService] Could not parse publish_date for scheduled post enqueue; skipping",
                publish_date: first.publish_date,
                postGroup: first.post_group,
                organizationId,
            });
            return;
        }
        const delayMs = Math.max(0, publishMs - Date.now());
        const mod = (await import("openquok-orchestrator")) as any;
        const runScheduledSocialPostOrchestration =
            mod?.runScheduledSocialPostOrchestration ?? mod?.default?.runScheduledSocialPostOrchestration;
        if (typeof runScheduledSocialPostOrchestration !== "function") {
            throw new TypeError("runScheduledSocialPostOrchestration is not a function");
        }
        const ok = await runScheduledSocialPostOrchestration({
            organizationId,
            postGroup: first.post_group,
            delayMs,
        });
        if (!ok) {
            logger.warn({
                msg: "[PostsService] Failed to enqueue scheduled social post workflow (BullMQ)",
                organizationId,
                postGroup: first.post_group,
                delayMs,
            });
        }
    }

    private async resolveTagIds(organizationId: string, names: string[]): Promise<string[]> {
        const ids: string[] = [];
        for (const name of names) {
            const existing = await this.postsRepository.findTagByOrgAndName(organizationId, name);
            if (existing) {
                ids.push(existing.id);
                continue;
            }
            try {
                const created = await this.postsRepository.insertTag(organizationId, name, DEFAULT_TAG_COLOR);
                ids.push(created.id);
            } catch {
                const again = await this.postsRepository.findTagByOrgAndName(organizationId, name);
                if (again) ids.push(again.id);
            }
        }
        return ids;
    }

    private async persistThreadRepliesFromProviderSettings(params: {
        organizationId: string;
        authUserId: string;
        posts: SocialPostLike[];
        providerSettingsByIntegrationId: Record<string, Record<string, unknown>> | null;
    }): Promise<void> {
        const { organizationId, authUserId, posts, providerSettingsByIntegrationId } = params;
        if (!providerSettingsByIntegrationId) return;

        const { userId } = await this.organizationRepository.findUserIdByAuthId(authUserId);
        const createdByUserId = userId ?? null;

        const rows: any[] = [];
        for (const post of posts) {
            const integrationId = post.integration_id;
            if (!integrationId) continue;
            const settings = providerSettingsByIntegrationId[integrationId];
            if (!settings) continue;
            const threads = (settings as any).threads;
            const replies = Array.isArray(threads?.replies) ? threads.replies : [];
            for (const r of replies) {
                const content = typeof r?.message === "string" ? r.message.trim() : "";
                if (!content) continue;
                const delaySeconds = Number.isFinite(Number(r?.delaySeconds)) ? Number(r.delaySeconds) : 0;
                rows.push({
                    organization_id: organizationId,
                    post_id: post.id,
                    integration_id: integrationId,
                    content,
                    delay_seconds: Math.max(0, Math.floor(delaySeconds)),
                    state: "QUEUE",
                    release_id: null,
                    release_url: null,
                    error: null,
                    deleted_at: null,
                    created_by_user_id: createdByUserId,
                });
            }
        }
        if (rows.length === 0) return;
        await this.postsRepository.insertThreadReplies(rows);
    }
}
