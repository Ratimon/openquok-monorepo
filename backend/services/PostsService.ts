import type { IntegrationService } from "./IntegrationService";
import type { IntegrationManager } from "../integrations/integrationManager";
import type { IntegrationConnectionService } from "./IntegrationConnectionService";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import type { PostsRepository, SocialPostInsert } from "../repositories/PostsRepository";
import type { PostStateDb, SocialPostLike } from "../utils/dtos/PostDTO";
import { AppError } from "../errors/AppError";

const SLOT_STEP_MS = 15 * 60 * 1000;
const MAX_SLOT_TRIES = 200;
const DEFAULT_TAG_COLOR = "#6366f1";

function roundUpToNextSlot(d: Date): Date {
    const ms = d.getTime();
    const rounded = Math.ceil(ms / SLOT_STEP_MS) * SLOT_STEP_MS;
    return new Date(rounded);
}

function alignToFifteenMinuteUtc(d: Date): Date {
    return new Date(Math.round(d.getTime() / SLOT_STEP_MS) * SLOT_STEP_MS);
}

function addMs(d: Date, ms: number): Date {
    return new Date(d.getTime() + ms);
}

export type RepeatIntervalKey =
    | "day"
    | "two_days"
    | "three_days"
    | "four_days"
    | "five_days"
    | "six_days"
    | "week"
    | "two_weeks"
    | "month";

function repeatIntervalToDays(key: RepeatIntervalKey | null): number | null {
    if (key == null) return null;
    const m: Record<RepeatIntervalKey, number> = {
        day: 1,
        two_days: 2,
        three_days: 3,
        four_days: 4,
        five_days: 5,
        six_days: 6,
        week: 7,
        two_weeks: 14,
        month: 30,
    };
    return m[key] ?? null;
}

export type PostMediaItemInput = {
    id: string;
    path: string;
};

export type CreatePostInput = {
    organizationId: string;
    authUserId: string;
    body: string;
    /** Optional per-integration body overrides. */
    bodiesByIntegrationId?: Record<string, string> | null;
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
};

function parseSettingsJson(settings: string | null): { isGlobal: boolean; repeatInterval: RepeatIntervalKey | null } {
    if (!settings) return { isGlobal: true, repeatInterval: null };
    try {
        const o = JSON.parse(settings) as { isGlobal?: unknown; repeatInterval?: unknown };
        const isGlobal = typeof o.isGlobal === "boolean" ? o.isGlobal : true;
        const repeatInterval = (typeof o.repeatInterval === "string" ? (o.repeatInterval as RepeatIntervalKey) : null) ?? null;
        return { isGlobal, repeatInterval };
    } catch {
        return { isGlobal: true, repeatInterval: null };
    }
}

function parseImageColumn(image: string | null): PostMediaItemInput[] {
    if (!image) return [];
    try {
        const o = JSON.parse(image) as { items?: unknown };
        const items = Array.isArray((o as any).items) ? ((o as any).items as any[]) : [];
        return items
            .map((x) => ({
                id: typeof x?.id === "string" ? x.id : "",
                path: typeof x?.path === "string" ? x.path : "",
            }))
            .filter((m) => m.id && m.path);
    } catch {
        return [];
    }
}

export class PostsService {
    constructor(
        private readonly postsRepository: PostsRepository,
        private readonly integrationConnectionService: IntegrationConnectionService,
        private readonly integrationService: IntegrationService,
        private readonly organizationRepository: OrganizationRepository,
        private readonly integrationManager: IntegrationManager
    ) {}

    async findFreeSlot(organizationId: string, authUserId: string): Promise<string> {
        await this.integrationConnectionService.assertOrganizationMember(authUserId, organizationId);

        let candidate = roundUpToNextSlot(new Date());
        for (let i = 0; i < MAX_SLOT_TRIES; i++) {
            const iso = candidate.toISOString();
            const taken = await this.postsRepository.hasQueueSlotTaken(organizationId, iso);
            if (!taken) {
                return iso;
            }
            candidate = addMs(candidate, SLOT_STEP_MS);
        }
        return candidate.toISOString();
    }

    async listTags(organizationId: string, authUserId: string) {
        await this.integrationConnectionService.assertOrganizationMember(authUserId, organizationId);
        return this.postsRepository.listTagsByOrganization(organizationId);
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
            return await this.postsRepository.insertTag(organizationId, trimmed, c);
        } catch {
            const existing = await this.postsRepository.findTagByOrgAndName(organizationId, trimmed);
            if (existing) return existing;
            throw new AppError("Could not save tag", 500);
        }
    }

    async deleteTag(organizationId: string, authUserId: string, tagId: string): Promise<void> {
        await this.integrationConnectionService.assertOrganizationMember(authUserId, organizationId);
        const deleted = await this.postsRepository.softDeleteTagForOrganization(organizationId, tagId);
        if (!deleted) {
            throw new AppError("Tag not found", 404);
        }
    }

    private async buildPostGroupInsert(input: {
        organizationId: string;
        authUserId: string;
        postGroup: string;
        body: string;
        bodiesByIntegrationId?: Record<string, string> | null;
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

        const alignedScheduled = alignToFifteenMinuteUtc(scheduledDate);
        const publishIso = alignedScheduled.toISOString();

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

        const settingsJson = JSON.stringify({ isGlobal, repeatInterval: repeatInterval ?? null });
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
            settings: settingsJson,
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
        return { postGroup, posts: inserted };
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

        return this.postsRepository.listPostsByOrganizationAndDateRange({
            organizationId,
            startIso: start.toISOString(),
            endIso: end.toISOString(),
            integrationIds: integrationIds ?? null,
        });
    }

    async getPostGroup(postGroup: string, authUserId: string): Promise<PostGroupDetails> {
        const rows = await this.postsRepository.listPostsByGroup(postGroup);
        if (!rows.length) {
            throw new AppError("Post group not found", 404);
        }

        const organizationId = rows[0]!.organization_id;
        await this.integrationConnectionService.assertOrganizationMember(authUserId, organizationId);

        const { isGlobal, repeatInterval } = parseSettingsJson(rows[0]!.settings);
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

        const media = parseImageColumn(rows[0]!.image);
        const tags = await this.postsRepository.listTagsForPostIds(rows.map((r) => r.id));
        const tagNames = tags.map((t) => t.name).filter(Boolean);

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
        };
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
        const alignedNext = alignToFifteenMinuteUtc(new Date(scheduledAtIso));
        const nextPublishIso = Number.isNaN(alignedNext.getTime()) ? null : alignedNext.toISOString();
        const alreadyAtThatSlot = nextPublishIso != null && existing[0]!.publish_date === nextPublishIso;
        const allowTakenSlot = status === "scheduled" && alreadyAtThatSlot;

        // Validate + build insert payload first (may throw on membership / provider rules / slot taken).
        const { toInsert, tagIds } = await this.buildPostGroupInsert({
            organizationId,
            authUserId,
            postGroup,
            body,
            bodiesByIntegrationId,
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
        await this.postsRepository.softDeletePostsByGroup(postGroup);

        const inserted = await this.postsRepository.insertPostGroup(toInsert);
        await this.postsRepository.linkTagsToPosts(inserted.map((p) => p.id), tagIds);
        return { postGroup, posts: inserted };
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
}
