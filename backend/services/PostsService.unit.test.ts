import type { IntegrationLike } from "../utils/dtos/IntegrationDTO";
import type { PostsRepository } from "../repositories/PostsRepository";
import type { PostTagLike, PostCommentLike, SocialPostLike } from "../utils/dtos/PostDTO";
import type CacheService from "../connections/cache/CacheService";
import type CacheInvalidationService from "../connections/cache/CacheInvalidationService";
import type { IntegrationConnectionService } from "./IntegrationConnectionService";
import type { IntegrationService } from "./IntegrationService";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import { IntegrationManager } from "../integrations/integrationManager";

import { faker } from "@faker-js/faker";
import { PostsService } from "./PostsService";

const orgId = faker.string.uuid();
const authUserId = faker.string.uuid();
const integrationId = faker.string.uuid();
const otherIntegrationId = faker.string.uuid();

function tagRow(overrides: Partial<PostTagLike> = {}): PostTagLike {
    const now = new Date().toISOString();
    return {
        id: faker.string.uuid(),
        name: "alpha",
        color: "#6366f1",
        org_id: orgId,
        deleted_at: null,
        created_at: now,
        updated_at: now,
        ...overrides,
    };
}

function socialPostRow(overrides: Partial<SocialPostLike> = {}): SocialPostLike {
    const now = new Date().toISOString();
    const publish = new Date("2030-06-15T12:00:00.000Z").toISOString();
    return {
        id: faker.string.uuid(),
        state: "DRAFT",
        publish_date: publish,
        organization_id: orgId,
        integration_id: null,
        content: "hello",
        delay: 0,
        post_group: "group-1",
        title: null,
        description: null,
        parent_post_id: null,
        release_id: null,
        release_url: null,
        settings: "{}",
        image: null,
        interval_in_days: null,
        error: null,
        deleted_at: null,
        created_by_user_id: null,
        created_at: now,
        updated_at: now,
        ...overrides,
    };
}

function postCommentRow(overrides: Partial<PostCommentLike> = {}): PostCommentLike {
    const now = new Date().toISOString();
    return {
        id: faker.string.uuid(),
        post_id: faker.string.uuid(),
        organization_id: orgId,
        user_id: faker.string.uuid(),
        content: "comment body",
        created_at: now,
        updated_at: now,
        deleted_at: null,
        ...overrides,
    };
}

type PostsRepoMock = jest.Mocked<
    Pick<
        PostsRepository,
        | "hasQueueSlotTaken"
        | "listTagsByOrganization"
        | "insertTag"
        | "findTagByOrgAndName"
        | "softDeleteTagForOrganization"
        | "newPostGroup"
        | "insertPostGroup"
        | "linkTagsToPosts"
        | "listPostsByGroup"
        | "listTagsForPostIds"
        | "deleteTagAssignmentsForPostIds"
        | "softDeleteThreadRepliesByPostIds"
        | "softDeletePostsByGroup"
        | "insertThreadReplies"
        | "listPostsByOrganizationAndDateRange"
        | "getPostById"
        | "listCommentsByPostId"
        | "insertComposerComment"
    >
>;

function createPostsRepoMock(): PostsRepoMock {
    return {
        hasQueueSlotTaken: jest.fn(),
        listTagsByOrganization: jest.fn(),
        insertTag: jest.fn(),
        findTagByOrgAndName: jest.fn(),
        softDeleteTagForOrganization: jest.fn(),
        newPostGroup: jest.fn(),
        insertPostGroup: jest.fn(),
        linkTagsToPosts: jest.fn(),
        listPostsByGroup: jest.fn(),
        listTagsForPostIds: jest.fn(),
        deleteTagAssignmentsForPostIds: jest.fn(),
        softDeleteThreadRepliesByPostIds: jest.fn().mockResolvedValue(undefined),
        softDeletePostsByGroup: jest.fn(),
        insertThreadReplies: jest.fn().mockResolvedValue([]),
        listPostsByOrganizationAndDateRange: jest.fn(),
        getPostById: jest.fn(),
        listCommentsByPostId: jest.fn(),
        insertComposerComment: jest.fn(),
    };
}

type IntegrationConnectionMock = jest.Mocked<Pick<IntegrationConnectionService, "assertOrganizationMember">>;

function createIntegrationConnectionMock(): IntegrationConnectionMock {
    return {
        assertOrganizationMember: jest.fn().mockResolvedValue(undefined),
    };
}

type IntegrationServiceMock = jest.Mocked<Pick<IntegrationService, "listByOrganization" | "getById">>;

function createIntegrationServiceMock(): IntegrationServiceMock {
    return {
        listByOrganization: jest.fn(),
        getById: jest.fn(),
    };
}

type OrganizationRepoMock = jest.Mocked<Pick<OrganizationRepository, "findUserIdByAuthId">>;

function createOrganizationRepoMock(): OrganizationRepoMock {
    return {
        findUserIdByAuthId: jest.fn().mockResolvedValue({ userId: faker.string.uuid(), error: null }),
    };
}

function asGetOrSet(mock: jest.Mock): CacheService["getOrSet"] {
    return mock as unknown as CacheService["getOrSet"];
}

/** Mirrors PostsService calendar cache key helper for assertions. */
function expectedCalendarCacheKey(params: {
    organizationId: string;
    startIso: string;
    endIso: string;
    integrationIds?: string[] | null;
}): string {
    const integrationKey =
        params.integrationIds != null && params.integrationIds.length > 0
            ? [...params.integrationIds].sort().join(",")
            : "all";
    return `posts:calendar:list:${params.organizationId}:${params.startIso}:${params.endIso}:${integrationKey}`;
}

describe("PostsService", () => {
    let postsRepo: PostsRepoMock;
    let integrationConnection: IntegrationConnectionMock;
    let integrationService: IntegrationServiceMock;
    let organizationRepo: OrganizationRepoMock;

    beforeEach(() => {
        postsRepo = createPostsRepoMock();
        integrationConnection = createIntegrationConnectionMock();
        integrationService = createIntegrationServiceMock();
        organizationRepo = createOrganizationRepoMock();
    });

    function service(
        cache?: { getOrSet?: CacheService["getOrSet"] },
        cacheInvalidator?: Partial<
            jest.Mocked<Pick<CacheInvalidationService, "invalidateKey" | "invalidatePattern" | "invalidateEntity">>
        >
    ): PostsService {
        return new PostsService(
            postsRepo as unknown as PostsRepository,
            integrationConnection as unknown as IntegrationConnectionService,
            integrationService as unknown as IntegrationService,
            organizationRepo as unknown as OrganizationRepository,
            new IntegrationManager(),
            cache as never,
            cacheInvalidator as never
        );
    }

    describe("findFreeSlot", () => {
        it("returns first free slot ISO when repository reports slot not taken", async () => {
            integrationService.listByOrganization.mockResolvedValue([
                { id: faker.string.uuid(), posting_times: JSON.stringify([{ time: 60 }]) },
            ] as any);
            postsRepo.hasQueueSlotTaken.mockResolvedValue(false);
            const iso = await service().findFreeSlot(orgId, authUserId);
            expect(integrationConnection.assertOrganizationMember).toHaveBeenCalledWith(authUserId, orgId);
            expect(postsRepo.hasQueueSlotTaken).toHaveBeenCalledWith(orgId, iso);
            expect(new Date(iso).getTime()).toBeGreaterThan(0);
        });

        it("advances over posting-time slots until a slot is free", async () => {
            jest.useFakeTimers();
            // Freeze time at UTC midnight so posting-time slots advance deterministically.
            jest.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
            integrationService.listByOrganization.mockResolvedValue([
                {
                    id: faker.string.uuid(),
                    posting_times: JSON.stringify([{ time: 60 }, { time: 120 }, { time: 180 }]),
                },
            ] as any);
            postsRepo.hasQueueSlotTaken
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(false);
            try {
                await service().findFreeSlot(orgId, authUserId);
                expect(postsRepo.hasQueueSlotTaken).toHaveBeenCalledTimes(3);
                const first = postsRepo.hasQueueSlotTaken.mock.calls[0][1];
                const third = postsRepo.hasQueueSlotTaken.mock.calls[2][1];
                expect(new Date(third).getTime() - new Date(first).getTime()).toBe(2 * 60 * 60 * 1000);
            } finally {
                jest.useRealTimers();
            }
        });
    });

    describe("listTags", () => {
        it("asserts membership then returns repository tags", async () => {
            const tags = [tagRow({ name: "t1" })];
            postsRepo.listTagsByOrganization.mockResolvedValue(tags);
            const out = await service().listTags(orgId, authUserId);
            expect(integrationConnection.assertOrganizationMember).toHaveBeenCalledWith(authUserId, orgId);
            expect(postsRepo.listTagsByOrganization).toHaveBeenCalledWith(orgId);
            expect(out).toEqual(tags);
        });

        it("uses getOrSet with tags list key and TTL 300 when cache provided", async () => {
            const tags = [tagRow({ name: "t1" })];
            postsRepo.listTagsByOrganization.mockResolvedValue(tags);
            const getOrSet = jest.fn().mockResolvedValue(tags);
            const out = await service({ getOrSet }).listTags(orgId, authUserId);
            expect(out).toEqual(tags);
            expect(getOrSet).toHaveBeenCalledWith(`posts:tags:list:${orgId}`, expect.any(Function), 300);
        });

        it("calls repository once when getOrSet remembers (second request hits cache)", async () => {
            const tags = [tagRow({ name: "cached" })];
            postsRepo.listTagsByOrganization.mockResolvedValue(tags);
            const memory = new Map<string, unknown>();
            const getOrSet = jest.fn(async (key: string, factory: () => Promise<unknown>) => {
                if (memory.has(key)) return memory.get(key);
                const value = await factory();
                memory.set(key, value);
                return value;
            });

            const s = service({ getOrSet: asGetOrSet(getOrSet) });
            await s.listTags(orgId, authUserId);
            await s.listTags(orgId, authUserId);

            expect(postsRepo.listTagsByOrganization).toHaveBeenCalledTimes(1);
            expect(getOrSet).toHaveBeenCalledWith(`posts:tags:list:${orgId}`, expect.any(Function), 300);
        });
    });

    describe("createTag", () => {
        it("throws 400 when name is empty after trim", async () => {
            await expect(service().createTag(orgId, authUserId, "   ")).rejects.toMatchObject({
                name: "AppError",
                statusCode: 400,
            });
            expect(postsRepo.insertTag).not.toHaveBeenCalled();
        });

        it("throws 400 when name exceeds 120 characters", async () => {
            await expect(service().createTag(orgId, authUserId, "x".repeat(121))).rejects.toMatchObject({
                statusCode: 400,
            });
        });

        it("inserts tag with default color when color omitted", async () => {
            const created = tagRow({ name: "new" });
            postsRepo.insertTag.mockResolvedValue(created);
            const out = await service().createTag(orgId, authUserId, "  new  ");
            expect(postsRepo.insertTag).toHaveBeenCalledWith(orgId, "new", "#6366f1");
            expect(out).toEqual(created);
        });

        it("returns existing tag when insert fails and findTagByOrgAndName finds a row", async () => {
            const existing = tagRow({ name: "dup" });
            postsRepo.insertTag.mockRejectedValue(new Error("unique"));
            postsRepo.findTagByOrgAndName.mockResolvedValue(existing);
            const out = await service().createTag(orgId, authUserId, "dup");
            expect(out).toEqual(existing);
        });

        it("invalidates tags list and calendar pattern when cacheInvalidator provided (insert succeeds)", async () => {
            postsRepo.insertTag.mockResolvedValue(tagRow({ name: "new" }));
            const invalidateKey = jest.fn().mockResolvedValue(true);
            const invalidatePattern = jest.fn().mockResolvedValue(true);

            await service(undefined, { invalidateKey, invalidatePattern }).createTag(orgId, authUserId, "fresh");

            expect(invalidateKey).toHaveBeenCalledWith(`posts:tags:list:${orgId}`);
            expect(invalidatePattern).toHaveBeenCalledWith(`posts:calendar:list:${orgId}:*`);
        });

        it("invalidates tags list and calendar pattern when cacheInvalidator provided (duplicate race)", async () => {
            const existing = tagRow({ name: "dup" });
            postsRepo.insertTag.mockRejectedValue(new Error("unique"));
            postsRepo.findTagByOrgAndName.mockResolvedValue(existing);
            const invalidateKey = jest.fn().mockResolvedValue(true);
            const invalidatePattern = jest.fn().mockResolvedValue(true);

            await service(undefined, { invalidateKey, invalidatePattern }).createTag(orgId, authUserId, "dup");

            expect(invalidateKey).toHaveBeenCalledWith(`posts:tags:list:${orgId}`);
            expect(invalidatePattern).toHaveBeenCalledWith(`posts:calendar:list:${orgId}:*`);
        });

        it("throws 500 when insert fails and no existing tag", async () => {
            postsRepo.insertTag.mockRejectedValue(new Error("db"));
            postsRepo.findTagByOrgAndName.mockResolvedValue(null);
            await expect(service().createTag(orgId, authUserId, "missing")).rejects.toMatchObject({
                statusCode: 500,
                message: "Could not save tag",
            });
        });
    });

    describe("deleteTag", () => {
        const tagId = faker.string.uuid();

        it("asserts membership then soft-deletes when repository reports success", async () => {
            postsRepo.softDeleteTagForOrganization.mockResolvedValue(true);
            await service().deleteTag(orgId, authUserId, tagId);
            expect(integrationConnection.assertOrganizationMember).toHaveBeenCalledWith(authUserId, orgId);
            expect(postsRepo.softDeleteTagForOrganization).toHaveBeenCalledWith(orgId, tagId);
        });

        it("throws 404 when no tag row was updated", async () => {
            postsRepo.softDeleteTagForOrganization.mockResolvedValue(false);
            await expect(service().deleteTag(orgId, authUserId, tagId)).rejects.toMatchObject({
                statusCode: 404,
                message: "Tag not found",
            });
        });

        it("invalidates tags list and calendar pattern when cacheInvalidator provided", async () => {
            postsRepo.softDeleteTagForOrganization.mockResolvedValue(true);
            const invalidateKey = jest.fn().mockResolvedValue(true);
            const invalidatePattern = jest.fn().mockResolvedValue(true);

            await service(undefined, { invalidateKey, invalidatePattern }).deleteTag(orgId, authUserId, tagId);

            expect(invalidateKey).toHaveBeenCalledWith(`posts:tags:list:${orgId}`);
            expect(invalidatePattern).toHaveBeenCalledWith(`posts:calendar:list:${orgId}:*`);
        });
    });

    describe("createPost", () => {
        const scheduledIso = "2030-06-15T12:07:33.000Z";

        beforeEach(() => {
            integrationService.listByOrganization.mockResolvedValue([
                { id: integrationId, deleted_at: null, provider_identifier: "threads" } as unknown as IntegrationLike,
            ]);
            postsRepo.newPostGroup.mockReturnValue("post-group-uuid");
            postsRepo.hasQueueSlotTaken.mockResolvedValue(false);
            postsRepo.findTagByOrgAndName.mockResolvedValue(null);
            postsRepo.insertTag.mockImplementation(async (_org, name) => tagRow({ name }));
        });

        it("throws when integration id is not in workspace", async () => {
            await expect(
                service().createPost({
                    organizationId: orgId,
                    authUserId,
                    body: "x",
                    integrationIds: [faker.string.uuid()],
                    isGlobal: true,
                    scheduledAtIso: scheduledIso,
                    repeatInterval: null,
                    tagNames: [],
                    status: "draft",
                })
            ).rejects.toMatchObject({
                statusCode: 400,
                message: "One or more channels are not in this workspace",
            });
        });

        it("throws when status is scheduled and no channels selected", async () => {
            await expect(
                service().createPost({
                    organizationId: orgId,
                    authUserId,
                    body: "x",
                    integrationIds: [],
                    isGlobal: true,
                    scheduledAtIso: scheduledIso,
                    repeatInterval: null,
                    tagNames: [],
                    status: "scheduled",
                })
            ).rejects.toMatchObject({
                statusCode: 400,
                message: "Select at least one channel to schedule",
            });
        });

        it("throws when schedule time is invalid", async () => {
            await expect(
                service().createPost({
                    organizationId: orgId,
                    authUserId,
                    body: "x",
                    integrationIds: [integrationId],
                    isGlobal: true,
                    scheduledAtIso: "not-a-date",
                    repeatInterval: null,
                    tagNames: [],
                    status: "draft",
                })
            ).rejects.toMatchObject({
                statusCode: 400,
                message: "Invalid schedule time",
            });
        });

        it("throws 409 when scheduled slot is already taken", async () => {
            postsRepo.hasQueueSlotTaken.mockResolvedValue(true);
            await expect(
                service().createPost({
                    organizationId: orgId,
                    authUserId,
                    body: "x",
                    integrationIds: [integrationId],
                    isGlobal: true,
                    scheduledAtIso: scheduledIso,
                    repeatInterval: null,
                    tagNames: [],
                    status: "scheduled",
                })
            ).rejects.toMatchObject({
                statusCode: 409,
                message: "That time slot is already taken; pick another.",
            });
        });

        it("throws 400 when scheduling an Instagram post without media", async () => {
            integrationService.listByOrganization.mockResolvedValue([
                {
                    id: integrationId,
                    deleted_at: null,
                    provider_identifier: "instagram-business",
                } as unknown as IntegrationLike,
            ]);
            await expect(
                service().createPost({
                    organizationId: orgId,
                    authUserId,
                    body: "caption only",
                    integrationIds: [integrationId],
                    isGlobal: true,
                    scheduledAtIso: scheduledIso,
                    repeatInterval: null,
                    tagNames: [],
                    status: "scheduled",
                    media: null,
                })
            ).rejects.toMatchObject({
                statusCode: 400,
                message: "Instagram should have at least one attachment",
            });
        });

        it("creates a single draft row with null integration when no channels", async () => {
            const inserted = [socialPostRow({ state: "DRAFT", integration_id: null })];
            postsRepo.insertPostGroup.mockResolvedValue(inserted);
            const out = await service().createPost({
                organizationId: orgId,
                authUserId,
                body: "draft body",
                integrationIds: [],
                isGlobal: false,
                scheduledAtIso: scheduledIso,
                repeatInterval: "week",
                tagNames: [],
                status: "draft",
            });
            expect(postsRepo.hasQueueSlotTaken).not.toHaveBeenCalled();
            expect(postsRepo.insertPostGroup).toHaveBeenCalledTimes(1);
            const rows = postsRepo.insertPostGroup.mock.calls[0][0];
            expect(rows).toHaveLength(1);
            expect(rows[0].integration_id).toBeNull();
            expect(rows[0].state).toBe("DRAFT");
            expect(rows[0].interval_in_days).toBe(7);
            expect(rows[0].settings).toBe(JSON.stringify({ isGlobal: false, repeatInterval: "week" }));
            expect(out.postGroup).toBe("post-group-uuid");
            expect(out.posts).toEqual(inserted);
            expect(postsRepo.linkTagsToPosts).toHaveBeenCalledWith(
                inserted.map((p) => p.id),
                []
            );
        });

        it("creates one row per selected integration for scheduled post", async () => {
            integrationService.listByOrganization.mockResolvedValue([
                { id: integrationId, deleted_at: null, provider_identifier: "threads" } as unknown as IntegrationLike,
                { id: otherIntegrationId, deleted_at: null, provider_identifier: "threads" } as unknown as IntegrationLike,
            ]);
            const inserted = [
                socialPostRow({ integration_id: integrationId, state: "QUEUE" }),
                socialPostRow({ integration_id: otherIntegrationId, state: "QUEUE" }),
            ];
            postsRepo.insertPostGroup.mockResolvedValue(inserted);
            await service().createPost({
                organizationId: orgId,
                authUserId,
                body: "hi",
                integrationIds: [integrationId, otherIntegrationId],
                isGlobal: true,
                scheduledAtIso: scheduledIso,
                repeatInterval: null,
                tagNames: ["a", "a"],
                status: "scheduled",
            });
            expect(postsRepo.hasQueueSlotTaken).toHaveBeenCalledTimes(1);
            const rows = postsRepo.insertPostGroup.mock.calls[0][0];
            expect(rows).toHaveLength(2);
            expect(rows.every((r) => r.state === "QUEUE")).toBe(true);
            const ids = new Set(rows.map((r) => r.integration_id));
            expect(ids.has(integrationId)).toBe(true);
            expect(ids.has(otherIntegrationId)).toBe(true);
            expect(postsRepo.findTagByOrgAndName).toHaveBeenCalled();
            expect(postsRepo.linkTagsToPosts).toHaveBeenCalled();
        });

        it("applies bodiesByIntegrationId overrides per channel when provided", async () => {
            integrationService.listByOrganization.mockResolvedValue([
                { id: integrationId, deleted_at: null, provider_identifier: "threads" } as unknown as IntegrationLike,
                { id: otherIntegrationId, deleted_at: null, provider_identifier: "threads" } as unknown as IntegrationLike,
            ]);
            postsRepo.insertPostGroup.mockResolvedValue([
                socialPostRow({ integration_id: integrationId, state: "QUEUE" }),
                socialPostRow({ integration_id: otherIntegrationId, state: "QUEUE" }),
            ]);
            await service().createPost({
                organizationId: orgId,
                authUserId,
                body: "global",
                bodiesByIntegrationId: {
                    [integrationId]: "body-a",
                    [otherIntegrationId]: "body-b",
                },
                integrationIds: [integrationId, otherIntegrationId],
                isGlobal: false,
                scheduledAtIso: scheduledIso,
                repeatInterval: null,
                tagNames: [],
                status: "scheduled",
            });
            const rows = postsRepo.insertPostGroup.mock.calls[0][0];
            const byIntegration = new Map(rows.map((r) => [r.integration_id, r.content]));
            expect(byIntegration.get(integrationId)).toBe("body-a");
            expect(byIntegration.get(otherIntegrationId)).toBe("body-b");
        });

        it("ignores deleted integrations when validating channel ids", async () => {
            integrationService.listByOrganization.mockResolvedValue([
                {
                    id: integrationId,
                    deleted_at: new Date().toISOString(),
                    provider_identifier: "threads",
                } as unknown as IntegrationLike,
            ]);
            await expect(
                service().createPost({
                    organizationId: orgId,
                    authUserId,
                    body: "x",
                    integrationIds: [integrationId],
                    isGlobal: true,
                    scheduledAtIso: scheduledIso,
                    repeatInterval: null,
                    tagNames: [],
                    status: "draft",
                })
            ).rejects.toMatchObject({
                statusCode: 400,
            });
        });

        it("passes created_by_user_id from organization repository", async () => {
            const dbUserId = faker.string.uuid();
            organizationRepo.findUserIdByAuthId.mockResolvedValue({ userId: dbUserId, error: null });
            postsRepo.insertPostGroup.mockResolvedValue([socialPostRow()]);
            await service().createPost({
                organizationId: orgId,
                authUserId,
                body: "b",
                integrationIds: [],
                isGlobal: true,
                scheduledAtIso: scheduledIso,
                repeatInterval: null,
                tagNames: [],
                status: "draft",
            });
            expect(postsRepo.insertPostGroup.mock.calls[0][0][0].created_by_user_id).toBe(dbUserId);
        });

        it("uses null created_by_user_id when organization has no user mapping", async () => {
            organizationRepo.findUserIdByAuthId.mockResolvedValue({ userId: null, error: null });
            postsRepo.insertPostGroup.mockResolvedValue([socialPostRow()]);
            await service().createPost({
                organizationId: orgId,
                authUserId,
                body: "b",
                integrationIds: [],
                isGlobal: true,
                scheduledAtIso: scheduledIso,
                repeatInterval: null,
                tagNames: [],
                status: "draft",
            });
            expect(postsRepo.insertPostGroup.mock.calls[0][0][0].created_by_user_id).toBeNull();
        });

        it("invalidates group, previews, calendar, tags list, and entity when cacheInvalidator provided", async () => {
            const postGroup = "post-group-uuid";
            const rowId = faker.string.uuid();
            postsRepo.newPostGroup.mockReturnValue(postGroup);
            postsRepo.insertPostGroup.mockResolvedValue([socialPostRow({ id: rowId })]);
            postsRepo.linkTagsToPosts.mockResolvedValue(undefined);

            const invalidateKey = jest.fn().mockResolvedValue(true);
            const invalidatePattern = jest.fn().mockResolvedValue(true);
            const invalidateEntity = jest.fn().mockResolvedValue(true);

            await service(undefined, { invalidateKey, invalidatePattern, invalidateEntity }).createPost({
                organizationId: orgId,
                authUserId,
                body: "draft body",
                integrationIds: [],
                isGlobal: false,
                scheduledAtIso: scheduledIso,
                repeatInterval: null,
                tagNames: [],
                status: "draft",
            });

            expect(invalidateKey).toHaveBeenCalledWith(`posts:group:${postGroup}`);
            expect(invalidateKey).toHaveBeenCalledWith(`posts:preview:${rowId}`);
            expect(invalidateKey).toHaveBeenCalledWith(`posts:tags:list:${orgId}`);
            expect(invalidatePattern).toHaveBeenCalledWith(`posts:calendar:list:${orgId}:*`);
            expect(invalidateEntity).toHaveBeenCalledWith("posts", postGroup);
        });

        it("does not call insertThreadReplies when providerSettingsByIntegrationId is omitted", async () => {
            postsRepo.insertPostGroup.mockResolvedValue([socialPostRow({ integration_id: integrationId, state: "QUEUE" })]);
            await service().createPost({
                organizationId: orgId,
                authUserId,
                body: "hi",
                integrationIds: [integrationId],
                isGlobal: true,
                scheduledAtIso: scheduledIso,
                repeatInterval: null,
                tagNames: [],
                status: "scheduled",
            });
            expect(postsRepo.insertThreadReplies).not.toHaveBeenCalled();
        });

        it("persists threads.replies via insertThreadReplies per scheduled post row", async () => {
            integrationService.listByOrganization.mockResolvedValue([
                { id: integrationId, deleted_at: null, provider_identifier: "threads" } as unknown as IntegrationLike,
                { id: otherIntegrationId, deleted_at: null, provider_identifier: "threads" } as unknown as IntegrationLike,
            ]);
            const postA = faker.string.uuid();
            const postB = faker.string.uuid();
            const inserted = [
                socialPostRow({ id: postA, integration_id: integrationId, state: "QUEUE" }),
                socialPostRow({ id: postB, integration_id: otherIntegrationId, state: "QUEUE" }),
            ];
            postsRepo.insertPostGroup.mockResolvedValue(inserted);
            const dbUserId = faker.string.uuid();
            organizationRepo.findUserIdByAuthId.mockResolvedValue({ userId: dbUserId, error: null });

            await service().createPost({
                organizationId: orgId,
                authUserId,
                body: "hi",
                integrationIds: [integrationId, otherIntegrationId],
                isGlobal: true,
                scheduledAtIso: scheduledIso,
                repeatInterval: null,
                tagNames: [],
                status: "scheduled",
                providerSettingsByIntegrationId: {
                    [integrationId]: {
                        threads: {
                            replies: [
                                { id: "r1", message: " first ", delaySeconds: 5 },
                                { id: "r2", message: "", delaySeconds: 99 },
                                { id: "r3", message: "after-blank", delaySeconds: NaN },
                            ],
                        },
                    },
                    [otherIntegrationId]: {
                        threads: {
                            replies: [{ id: "x", message: "other", delaySeconds: 0 }],
                        },
                    },
                },
            });

            expect(postsRepo.insertThreadReplies).toHaveBeenCalledTimes(1);
            const rows = postsRepo.insertThreadReplies.mock.calls[0][0] as Record<string, unknown>[];
            expect(rows).toHaveLength(3);
            expect(rows[0]).toMatchObject({
                organization_id: orgId,
                post_id: postA,
                integration_id: integrationId,
                content: "first",
                delay_seconds: 5,
                state: "QUEUE",
                created_by_user_id: dbUserId,
            });
            expect(rows[1]).toMatchObject({
                post_id: postA,
                content: "after-blank",
                delay_seconds: 0,
            });
            expect(rows[2]).toMatchObject({
                post_id: postB,
                integration_id: otherIntegrationId,
                content: "other",
                delay_seconds: 0,
            });
        });
    });

    describe("listPostsForCalendar", () => {
        it("asserts membership then returns repository rows", async () => {
            const rows = [socialPostRow({ integration_id: integrationId, state: "QUEUE" })];
            postsRepo.listPostsByOrganizationAndDateRange.mockResolvedValue(rows);

            const out = await service().listPostsForCalendar({
                organizationId: orgId,
                authUserId,
                startIso: "2030-06-01T00:00:00.000Z",
                endIso: "2030-06-30T23:59:59.999Z",
                integrationIds: [integrationId],
            });

            expect(integrationConnection.assertOrganizationMember).toHaveBeenCalledWith(authUserId, orgId);
            expect(postsRepo.listPostsByOrganizationAndDateRange).toHaveBeenCalledWith({
                organizationId: orgId,
                startIso: new Date("2030-06-01T00:00:00.000Z").toISOString(),
                endIso: new Date("2030-06-30T23:59:59.999Z").toISOString(),
                integrationIds: [integrationId],
            });
            expect(out).toEqual(rows);
        });

        it("normalizes integrationIds to null when omitted", async () => {
            postsRepo.listPostsByOrganizationAndDateRange.mockResolvedValue([]);

            await service().listPostsForCalendar({
                organizationId: orgId,
                authUserId,
                startIso: "2030-06-01T00:00:00.000Z",
                endIso: "2030-06-02T00:00:00.000Z",
            });

            expect(postsRepo.listPostsByOrganizationAndDateRange).toHaveBeenCalledWith({
                organizationId: orgId,
                startIso: new Date("2030-06-01T00:00:00.000Z").toISOString(),
                endIso: new Date("2030-06-02T00:00:00.000Z").toISOString(),
                integrationIds: null,
            });
        });

        it("throws 400 when date range is invalid", async () => {
            await expect(
                service().listPostsForCalendar({
                    organizationId: orgId,
                    authUserId,
                    startIso: "not-a-date",
                    endIso: "2030-06-02T00:00:00.000Z",
                })
            ).rejects.toMatchObject({
                name: "AppError",
                statusCode: 400,
                message: "Invalid date range",
            });
            expect(postsRepo.listPostsByOrganizationAndDateRange).not.toHaveBeenCalled();
        });

        it("throws 400 when start is after end", async () => {
            await expect(
                service().listPostsForCalendar({
                    organizationId: orgId,
                    authUserId,
                    startIso: "2030-06-03T00:00:00.000Z",
                    endIso: "2030-06-02T00:00:00.000Z",
                })
            ).rejects.toMatchObject({
                name: "AppError",
                statusCode: 400,
                message: "Start must be before end",
            });
            expect(postsRepo.listPostsByOrganizationAndDateRange).not.toHaveBeenCalled();
        });

        it("uses getOrSet with calendar key and TTL 300 when cache provided", async () => {
            const rows = [socialPostRow()];
            postsRepo.listPostsByOrganizationAndDateRange.mockResolvedValue(rows);
            const startIso = new Date("2030-06-01T00:00:00.000Z").toISOString();
            const endIso = new Date("2030-06-30T23:59:59.999Z").toISOString();
            const getOrSet = jest.fn().mockResolvedValue(rows);

            const out = await service({ getOrSet }).listPostsForCalendar({
                organizationId: orgId,
                authUserId,
                startIso: "2030-06-01T00:00:00.000Z",
                endIso: "2030-06-30T23:59:59.999Z",
                integrationIds: [integrationId],
            });

            expect(out).toEqual(rows);
            expect(getOrSet).toHaveBeenCalledWith(
                expectedCalendarCacheKey({
                    organizationId: orgId,
                    startIso,
                    endIso,
                    integrationIds: [integrationId],
                }),
                expect.any(Function),
                300
            );
        });

        it("calls repository once when getOrSet remembers", async () => {
            postsRepo.listPostsByOrganizationAndDateRange.mockResolvedValue([]);
            const memory = new Map<string, unknown>();
            const getOrSet = jest.fn(async (key: string, factory: () => Promise<unknown>) => {
                if (memory.has(key)) return memory.get(key);
                const value = await factory();
                memory.set(key, value);
                return value;
            });

            const args = {
                organizationId: orgId,
                authUserId,
                startIso: "2030-06-01T00:00:00.000Z",
                endIso: "2030-06-02T00:00:00.000Z",
            };
            const s = service({ getOrSet: asGetOrSet(getOrSet) });
            await s.listPostsForCalendar(args);
            await s.listPostsForCalendar(args);

            expect(postsRepo.listPostsByOrganizationAndDateRange).toHaveBeenCalledTimes(1);
        });
    });

    describe("getPostGroup", () => {
        it("throws 404 when group has no posts", async () => {
            postsRepo.listPostsByGroup.mockResolvedValue([]);
            await expect(service().getPostGroup(faker.string.uuid(), authUserId)).rejects.toMatchObject({
                name: "AppError",
                statusCode: 404,
            });
        });

        it("asserts membership and returns composer-friendly details", async () => {
            const postGroup = faker.string.uuid();
            const publishDateIso = new Date("2030-06-15T12:00:00.000Z").toISOString();
            const image = JSON.stringify({ items: [{ id: "m1", path: "/x.png" }] });
            const settings = JSON.stringify({ isGlobal: false, repeatInterval: "week" });

            postsRepo.listPostsByGroup.mockResolvedValue([
                socialPostRow({
                    id: faker.string.uuid(),
                    organization_id: orgId,
                    post_group: postGroup,
                    integration_id: integrationId,
                    state: "QUEUE",
                    publish_date: publishDateIso,
                    content: "body-a",
                    image,
                    settings,
                }),
                socialPostRow({
                    id: faker.string.uuid(),
                    organization_id: orgId,
                    post_group: postGroup,
                    integration_id: otherIntegrationId,
                    state: "QUEUE",
                    publish_date: publishDateIso,
                    content: "body-b",
                    image,
                    settings,
                }),
            ]);
            postsRepo.listTagsForPostIds.mockResolvedValue([tagRow({ name: "tag-1" }), tagRow({ name: "tag-2" })]);

            const out = await service().getPostGroup(postGroup, authUserId);

            expect(integrationConnection.assertOrganizationMember).toHaveBeenCalledWith(authUserId, orgId);
            expect(postsRepo.listTagsForPostIds).toHaveBeenCalledWith(expect.arrayContaining([expect.any(String)]));
            expect(out).toMatchObject({
                postGroup,
                organizationId: orgId,
                isGlobal: false,
                repeatInterval: "week",
                publishDateIso,
                status: "scheduled",
                integrationIds: expect.arrayContaining([integrationId, otherIntegrationId]),
                bodiesByIntegrationId: {
                    [integrationId]: "body-a",
                    [otherIntegrationId]: "body-b",
                },
                media: [{ id: "m1", path: "/x.png" }],
                tagNames: expect.arrayContaining(["tag-1", "tag-2"]),
            });
        });

        it("uses getOrSet with posts:group key and TTL 300 when cache provided", async () => {
            const postGroup = faker.string.uuid();
            const publishDateIso = new Date("2030-06-15T12:00:00.000Z").toISOString();
            const rows = [
                socialPostRow({
                    organization_id: orgId,
                    post_group: postGroup,
                    integration_id: integrationId,
                    state: "QUEUE",
                    publish_date: publishDateIso,
                    content: "body-a",
                    settings: "{}",
                }),
            ];
            postsRepo.listPostsByGroup.mockResolvedValue(rows);
            postsRepo.listTagsForPostIds.mockResolvedValue([]);
            const getOrSet = jest.fn().mockImplementation(async (_key: string, factory: () => Promise<unknown>) =>
                factory()
            );

            await service({ getOrSet }).getPostGroup(postGroup, authUserId);

            expect(getOrSet).toHaveBeenCalledWith(`posts:group:${postGroup}`, expect.any(Function), 300);
        });

        it("calls listTagsForPostIds once when group details are cached on second request", async () => {
            const postGroup = faker.string.uuid();
            const publishDateIso = new Date("2030-06-15T12:00:00.000Z").toISOString();
            const rows = [
                socialPostRow({
                    organization_id: orgId,
                    post_group: postGroup,
                    integration_id: integrationId,
                    state: "QUEUE",
                    publish_date: publishDateIso,
                    content: "body-a",
                    settings: "{}",
                }),
            ];
            postsRepo.listPostsByGroup.mockResolvedValue(rows);
            postsRepo.listTagsForPostIds.mockResolvedValue([tagRow({ name: "t" })]);

            const memory = new Map<string, unknown>();
            const getOrSet = jest.fn(async (key: string, factory: () => Promise<unknown>) => {
                if (memory.has(key)) return memory.get(key);
                const value = await factory();
                memory.set(key, value);
                return value;
            });

            const s = service({ getOrSet: asGetOrSet(getOrSet) });
            await s.getPostGroup(postGroup, authUserId);
            await s.getPostGroup(postGroup, authUserId);

            expect(postsRepo.listPostsByGroup).toHaveBeenCalledTimes(2);
            expect(postsRepo.listTagsForPostIds).toHaveBeenCalledTimes(1);
            expect(getOrSet).toHaveBeenCalledWith(`posts:group:${postGroup}`, expect.any(Function), 300);
        });
    });

    describe("getPostPreview", () => {
        const postId = faker.string.uuid();

        it("throws 403 when share is not exactly \"true\"", async () => {
            await expect(service().getPostPreview(postId, null)).rejects.toMatchObject({
                statusCode: 403,
                message: "Forbidden",
            });
            await expect(service().getPostPreview(postId, "false")).rejects.toMatchObject({ statusCode: 403 });
            expect(postsRepo.getPostById).not.toHaveBeenCalled();
        });

        it("throws 404 when post does not exist", async () => {
            postsRepo.getPostById.mockResolvedValue(null);
            await expect(service().getPostPreview(postId, "true")).rejects.toMatchObject({
                statusCode: 404,
                message: "Post not found",
            });
            expect(postsRepo.getPostById).toHaveBeenCalledWith(postId);
        });

        it("returns preview with empty media and null platform when post has no integration", async () => {
            const row = socialPostRow({
                id: postId,
                integration_id: null,
                content: "preview body",
                image: null,
            });
            postsRepo.getPostById.mockResolvedValue(row);

            const out = await service().getPostPreview(postId, "true");

            expect(integrationService.getById).not.toHaveBeenCalled();
            expect(out).toEqual({
                id: postId,
                postGroup: row.post_group,
                organizationId: orgId,
                publishDateIso: row.publish_date,
                content: "preview body",
                media: [],
                socialPlatformLabel: null,
            });
        });

        it("parses media JSON and resolves platform label when post has integration", async () => {
            const image = JSON.stringify({ v: 1, items: [{ id: "img1", path: "/a.jpg" }] });
            const row = socialPostRow({
                id: postId,
                integration_id: integrationId,
                content: "caption",
                image,
            });
            postsRepo.getPostById.mockResolvedValue(row);
            integrationService.getById.mockResolvedValue({
                provider_identifier: "threads",
            } as unknown as IntegrationLike);

            const out = await service().getPostPreview(postId, "true");

            expect(integrationService.getById).toHaveBeenCalledWith(orgId, integrationId);
            expect(out).toEqual({
                id: postId,
                postGroup: row.post_group,
                organizationId: orgId,
                publishDateIso: row.publish_date,
                content: "caption",
                media: [{ id: "img1", path: "/a.jpg" }],
                socialPlatformLabel: "Threads",
            });
        });

        it("uses getOrSet with preview key and TTL 300 when cache provided", async () => {
            const row = socialPostRow({
                id: postId,
                integration_id: null,
                content: "x",
                image: null,
            });
            postsRepo.getPostById.mockResolvedValue(row);
            const expected = {
                id: postId,
                postGroup: row.post_group,
                organizationId: orgId,
                publishDateIso: row.publish_date,
                content: "x",
                media: [],
                socialPlatformLabel: null,
            };
            const getOrSet = jest.fn().mockResolvedValue(expected);

            const out = await service({ getOrSet }).getPostPreview(postId, "true");

            expect(out).toEqual(expected);
            expect(getOrSet).toHaveBeenCalledWith(`posts:preview:${postId}`, expect.any(Function), 300);
        });

        it("calls getPostById once when preview is cached on second request", async () => {
            const row = socialPostRow({
                id: postId,
                integration_id: null,
                content: "cached",
                image: null,
            });
            postsRepo.getPostById.mockResolvedValue(row);

            const memory = new Map<string, unknown>();
            const getOrSet = jest.fn(async (key: string, factory: () => Promise<unknown>) => {
                if (memory.has(key)) return memory.get(key);
                const value = await factory();
                memory.set(key, value);
                return value;
            });

            const s = service({ getOrSet: asGetOrSet(getOrSet) });
            await s.getPostPreview(postId, "true");
            await s.getPostPreview(postId, "true");

            expect(postsRepo.getPostById).toHaveBeenCalledTimes(1);
        });
    });

    describe("getPublicComments", () => {
        const postId = faker.string.uuid();

        it("loads comments by post id only — no org gate=", async () => {
            const comments = [
                postCommentRow({ post_id: postId, organization_id: orgId, content: "first" }),
                postCommentRow({ post_id: postId, organization_id: orgId, content: "second" }),
            ];
            postsRepo.listCommentsByPostId.mockResolvedValue(comments);

            await expect(service().getPublicComments(postId)).resolves.toEqual(comments);
            expect(postsRepo.listCommentsByPostId).toHaveBeenCalledWith(postId);
            expect(postsRepo.getPostById).not.toHaveBeenCalled();
        });
    });

    describe("createComposerComment", () => {
        const postId = faker.string.uuid();
        const dbUserId = faker.string.uuid();

        it("creates a comment when post belongs to the workspace", async () => {
            postsRepo.getPostById.mockResolvedValue(socialPostRow({ id: postId, organization_id: orgId }));
            organizationRepo.findUserIdByAuthId.mockResolvedValue({ userId: dbUserId, error: null });
            const created = postCommentRow({ post_id: postId, organization_id: orgId, user_id: dbUserId });
            postsRepo.insertComposerComment.mockResolvedValue(created);

            await expect(
                service().createComposerComment({
                    organizationId: orgId,
                    authUserId,
                    postId,
                    comment: " Hello ",
                })
            ).resolves.toEqual(created);

            expect(integrationConnection.assertOrganizationMember).toHaveBeenCalledWith(authUserId, orgId);
            expect(postsRepo.insertComposerComment).toHaveBeenCalledWith({
                organizationId: orgId,
                postId,
                userId: dbUserId,
                content: "Hello",
            });
        });

        it("throws 404 when post is missing or not in workspace", async () => {
            postsRepo.getPostById.mockResolvedValue(null);
            await expect(
                service().createComposerComment({
                    organizationId: orgId,
                    authUserId,
                    postId,
                    comment: "x",
                })
            ).rejects.toMatchObject({ statusCode: 404 });

            postsRepo.getPostById.mockResolvedValue(socialPostRow({ id: postId, organization_id: faker.string.uuid() }));
            await expect(
                service().createComposerComment({
                    organizationId: orgId,
                    authUserId,
                    postId,
                    comment: "x",
                })
            ).rejects.toMatchObject({ statusCode: 404 });
            expect(postsRepo.insertComposerComment).not.toHaveBeenCalled();
        });

        it("throws 400 when workspace user row cannot be resolved", async () => {
            postsRepo.getPostById.mockResolvedValue(socialPostRow({ id: postId, organization_id: orgId }));
            organizationRepo.findUserIdByAuthId.mockResolvedValue({ userId: null, error: null });

            await expect(
                service().createComposerComment({
                    organizationId: orgId,
                    authUserId,
                    postId,
                    comment: "note",
                })
            ).rejects.toMatchObject({ statusCode: 400 });
            expect(postsRepo.insertComposerComment).not.toHaveBeenCalled();
        });
    });

    describe("deletePostGroup", () => {
        it("throws 404 when group has no posts", async () => {
            postsRepo.listPostsByGroup.mockResolvedValue([]);
            await expect(service().deletePostGroup(faker.string.uuid(), authUserId, orgId)).rejects.toMatchObject({
                statusCode: 404,
            });
        });

        it("throws 400 when group does not belong to provided workspace", async () => {
            const postGroup = faker.string.uuid();
            postsRepo.listPostsByGroup.mockResolvedValue([socialPostRow({ post_group: postGroup, organization_id: orgId })]);
            await expect(service().deletePostGroup(postGroup, authUserId, faker.string.uuid())).rejects.toMatchObject({
                statusCode: 400,
            });
        });

        it("deletes tag assignments then soft-deletes group posts", async () => {
            const postGroup = faker.string.uuid();
            const a = socialPostRow({ id: faker.string.uuid(), post_group: postGroup, organization_id: orgId });
            const b = socialPostRow({ id: faker.string.uuid(), post_group: postGroup, organization_id: orgId });
            postsRepo.listPostsByGroup.mockResolvedValue([a, b]);
            postsRepo.deleteTagAssignmentsForPostIds.mockResolvedValue(undefined);
            postsRepo.softDeletePostsByGroup.mockResolvedValue([]);

            await service().deletePostGroup(postGroup, authUserId, orgId);

            expect(integrationConnection.assertOrganizationMember).toHaveBeenCalledWith(authUserId, orgId);
            expect(postsRepo.deleteTagAssignmentsForPostIds).toHaveBeenCalledWith([a.id, b.id]);
            expect(postsRepo.softDeletePostsByGroup).toHaveBeenCalledWith(postGroup);
        });

        it("invalidates mutation caches when cacheInvalidator provided", async () => {
            const postGroup = faker.string.uuid();
            const a = socialPostRow({ id: faker.string.uuid(), post_group: postGroup, organization_id: orgId });
            const b = socialPostRow({ id: faker.string.uuid(), post_group: postGroup, organization_id: orgId });
            postsRepo.listPostsByGroup.mockResolvedValue([a, b]);
            postsRepo.deleteTagAssignmentsForPostIds.mockResolvedValue(undefined);
            postsRepo.softDeletePostsByGroup.mockResolvedValue([]);

            const invalidateKey = jest.fn().mockResolvedValue(true);
            const invalidatePattern = jest.fn().mockResolvedValue(true);
            const invalidateEntity = jest.fn().mockResolvedValue(true);

            await service(undefined, { invalidateKey, invalidatePattern, invalidateEntity }).deletePostGroup(
                postGroup,
                authUserId,
                orgId
            );

            expect(invalidateKey).toHaveBeenCalledWith(`posts:group:${postGroup}`);
            expect(invalidateKey).toHaveBeenCalledWith(`posts:preview:${a.id}`);
            expect(invalidateKey).toHaveBeenCalledWith(`posts:preview:${b.id}`);
            expect(invalidateKey).toHaveBeenCalledWith(`posts:tags:list:${orgId}`);
            expect(invalidatePattern).toHaveBeenCalledWith(`posts:calendar:list:${orgId}:*`);
            expect(invalidateEntity).toHaveBeenCalledWith("posts", postGroup);
        });
    });

    describe("updatePostGroup", () => {
        it("throws 404 when group has no posts", async () => {
            postsRepo.listPostsByGroup.mockResolvedValue([]);
            await expect(
                service().updatePostGroup({
                    postGroup: faker.string.uuid(),
                    organizationId: orgId,
                    authUserId,
                    body: "x",
                    integrationIds: [integrationId],
                    isGlobal: true,
                    scheduledAtIso: new Date().toISOString(),
                    repeatInterval: null,
                    tagNames: [],
                    status: "draft",
                })
            ).rejects.toMatchObject({ statusCode: 404 });
        });

        it("throws 400 when group does not belong to provided workspace", async () => {
            const postGroup = faker.string.uuid();
            postsRepo.listPostsByGroup.mockResolvedValue([socialPostRow({ post_group: postGroup, organization_id: orgId })]);
            await expect(
                service().updatePostGroup({
                    postGroup,
                    organizationId: faker.string.uuid(),
                    authUserId,
                    body: "x",
                    integrationIds: [integrationId],
                    isGlobal: true,
                    scheduledAtIso: new Date().toISOString(),
                    repeatInterval: null,
                    tagNames: [],
                    status: "draft",
                })
            ).rejects.toMatchObject({ statusCode: 400 });
        });

        it("allows keeping the same scheduled slot even if repository would report it as taken", async () => {
            const postGroup = faker.string.uuid();
            const scheduledAtIso = new Date("2030-06-15T12:00:00.000Z").toISOString();
            const dbFormattedPublishDate = "2030-06-15T12:00:00+00:00";
            const existingA = socialPostRow({
                id: faker.string.uuid(),
                post_group: postGroup,
                organization_id: orgId,
                integration_id: integrationId,
                state: "QUEUE",
                publish_date: dbFormattedPublishDate,
            });
            postsRepo.listPostsByGroup.mockResolvedValue([existingA]);

            // Would normally throw 409 if checked; update should skip check when not moving slots.
            postsRepo.hasQueueSlotTaken.mockResolvedValue(true);

            integrationService.listByOrganization.mockResolvedValue([
                { id: integrationId, deleted_at: null, provider_identifier: "threads" } as unknown as IntegrationLike,
            ]);
            postsRepo.findTagByOrgAndName.mockResolvedValue(null);
            postsRepo.insertTag.mockImplementation(async (_org, name) => tagRow({ name }));

            const insertedRow = socialPostRow({
                id: faker.string.uuid(),
                post_group: postGroup,
                organization_id: orgId,
                integration_id: integrationId,
                state: "QUEUE",
                publish_date: scheduledAtIso,
            });
            postsRepo.insertPostGroup.mockResolvedValue([insertedRow]);
            postsRepo.linkTagsToPosts.mockResolvedValue(undefined);
            postsRepo.deleteTagAssignmentsForPostIds.mockResolvedValue(undefined);
            postsRepo.softDeletePostsByGroup.mockResolvedValue([]);

            const out = await service().updatePostGroup({
                postGroup,
                organizationId: orgId,
                authUserId,
                body: faker.lorem.sentence(),
                integrationIds: [integrationId],
                isGlobal: true,
                scheduledAtIso,
                repeatInterval: null,
                tagNames: ["t1"],
                status: "scheduled",
            });

            expect(postsRepo.hasQueueSlotTaken).not.toHaveBeenCalled();
            expect(postsRepo.deleteTagAssignmentsForPostIds).toHaveBeenCalledWith([existingA.id]);
            expect(postsRepo.softDeleteThreadRepliesByPostIds).toHaveBeenCalledWith([existingA.id]);
            expect(postsRepo.softDeletePostsByGroup).toHaveBeenCalledWith(postGroup);
            expect(postsRepo.insertPostGroup).toHaveBeenCalled();
            expect(out).toEqual({ postGroup, posts: [insertedRow] });
        });

        it("invalidates previews for old and new row ids when cacheInvalidator provided", async () => {
            const postGroup = faker.string.uuid();
            const scheduledAtIso = new Date("2030-06-15T12:00:00.000Z").toISOString();
            const dbFormattedPublishDate = "2030-06-15T12:00:00+00:00";
            const existingA = socialPostRow({
                id: faker.string.uuid(),
                post_group: postGroup,
                organization_id: orgId,
                integration_id: integrationId,
                state: "QUEUE",
                publish_date: dbFormattedPublishDate,
            });
            postsRepo.listPostsByGroup.mockResolvedValue([existingA]);

            postsRepo.hasQueueSlotTaken.mockResolvedValue(true);

            integrationService.listByOrganization.mockResolvedValue([
                { id: integrationId, deleted_at: null, provider_identifier: "threads" } as unknown as IntegrationLike,
            ]);
            postsRepo.findTagByOrgAndName.mockResolvedValue(null);
            postsRepo.insertTag.mockImplementation(async (_org, name) => tagRow({ name }));

            const insertedRow = socialPostRow({
                id: faker.string.uuid(),
                post_group: postGroup,
                organization_id: orgId,
                integration_id: integrationId,
                state: "QUEUE",
                publish_date: scheduledAtIso,
            });
            postsRepo.insertPostGroup.mockResolvedValue([insertedRow]);
            postsRepo.linkTagsToPosts.mockResolvedValue(undefined);
            postsRepo.deleteTagAssignmentsForPostIds.mockResolvedValue(undefined);
            postsRepo.softDeleteThreadRepliesByPostIds.mockResolvedValue(undefined);
            postsRepo.softDeletePostsByGroup.mockResolvedValue([]);

            const invalidateKey = jest.fn().mockResolvedValue(true);
            const invalidatePattern = jest.fn().mockResolvedValue(true);
            const invalidateEntity = jest.fn().mockResolvedValue(true);

            await service(undefined, { invalidateKey, invalidatePattern, invalidateEntity }).updatePostGroup({
                postGroup,
                organizationId: orgId,
                authUserId,
                body: faker.lorem.sentence(),
                integrationIds: [integrationId],
                isGlobal: true,
                scheduledAtIso,
                repeatInterval: null,
                tagNames: ["t1"],
                status: "scheduled",
            });

            expect(postsRepo.softDeleteThreadRepliesByPostIds).toHaveBeenCalledWith([existingA.id]);
            expect(invalidateKey).toHaveBeenCalledWith(`posts:preview:${existingA.id}`);
            expect(invalidateKey).toHaveBeenCalledWith(`posts:preview:${insertedRow.id}`);
            expect(invalidateEntity).toHaveBeenCalledWith("posts", postGroup);
        });
    });
});
