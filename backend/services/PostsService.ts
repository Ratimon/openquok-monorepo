import type { IntegrationService } from "./IntegrationService";
import type { IntegrationConnectionService } from "./IntegrationConnectionService";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import type { PostStateDb, PostsRepository, SocialPostInsert, SocialPostRow } from "../repositories/PostsRepository";
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

export type CreatePostInput = {
    organizationId: string;
    authUserId: string;
    body: string;
    /** Optional per-integration body overrides. */
    bodiesByIntegrationId?: Record<string, string> | null;
    integrationIds: string[];
    isGlobal: boolean;
    scheduledAtIso: string;
    repeatInterval: RepeatIntervalKey | null;
    tagNames: string[];
    status: "draft" | "scheduled";
};

export class PostsService {
    constructor(
        private readonly postsRepository: PostsRepository,
        private readonly integrationConnectionService: IntegrationConnectionService,
        private readonly integrationService: IntegrationService,
        private readonly organizationRepository: OrganizationRepository
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

    async createPost(input: CreatePostInput): Promise<{
        postGroup: string;
        posts: SocialPostRow[];
    }> {
        const {
            organizationId,
            authUserId,
            body,
            bodiesByIntegrationId,
            integrationIds,
            isGlobal,
            scheduledAtIso,
            repeatInterval,
            tagNames,
            status,
        } = input;

        await this.integrationConnectionService.assertOrganizationMember(authUserId, organizationId);

        const rows = await this.integrationService.listByOrganization(organizationId);
        const allowed = new Set(rows.filter((r) => r.deleted_at == null).map((r) => r.id));

        const uniqueIds = [...new Set(integrationIds)];
        for (const id of uniqueIds) {
            if (!allowed.has(id)) {
                throw new AppError("One or more channels are not in this workspace", 400);
            }
        }

        if (status === "scheduled" && uniqueIds.length === 0) {
            throw new AppError("Select at least one channel to schedule", 400);
        }

        const scheduledDate = new Date(scheduledAtIso);
        if (Number.isNaN(scheduledDate.getTime())) {
            throw new AppError("Invalid schedule time", 400);
        }

        const alignedScheduled = alignToFifteenMinuteUtc(scheduledDate);
        const publishIso = alignedScheduled.toISOString();

        if (status === "scheduled") {
            const taken = await this.postsRepository.hasQueueSlotTaken(organizationId, publishIso);
            if (taken) {
                throw new AppError("That time slot is already taken; pick another.", 409);
            }
        }

        const normalizedTagNames = [...new Set(tagNames.map((t) => t.trim()).filter(Boolean))].slice(0, 50);
        const tagIds = await this.resolveTagIds(organizationId, normalizedTagNames);

        const { userId } = await this.organizationRepository.findUserIdByAuthId(authUserId);
        const createdByUserId = userId ?? null;

        const postGroup = this.postsRepository.newPostGroup();
        const settingsJson = JSON.stringify({ isGlobal, repeatInterval: repeatInterval ?? null });
        const intervalDays = repeatIntervalToDays(repeatInterval);

        const state: PostStateDb = status === "draft" ? "DRAFT" : "QUEUE";

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
            image: null,
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

        const inserted = await this.postsRepository.insertPostGroup(toInsert);

        const postIds = inserted.map((p) => p.id);
        await this.postsRepository.linkTagsToPosts(postIds, tagIds);

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
