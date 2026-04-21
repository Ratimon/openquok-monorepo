import type { IntegrationRow } from "../repositories/IntegrationRepository";
import type { PostsRepository } from "../repositories/PostsRepository";
import type { PostTagLike, SocialPostLike } from "../utils/dtos/PostDTO";
import type { IntegrationConnectionService } from "./IntegrationConnectionService";
import type { IntegrationService } from "./IntegrationService";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";

import { faker } from "@faker-js/faker";
import { PostsService } from "./PostsService";

const orgId = faker.string.uuid();
const authUserId = faker.string.uuid();
const integrationId = faker.string.uuid();
const otherIntegrationId = faker.string.uuid();

// to do : remove this when we have DTOs & Getter
function integrationRow(overrides: Partial<IntegrationRow> = {}): IntegrationRow {
    const now = new Date().toISOString();
    return {
        id: integrationId,
        organization_id: orgId,
        internal_id: "int-1",
        name: "Channel",
        picture: null,
        provider_identifier: "threads",
        type: "social",
        token: "t",
        disabled: false,
        token_expiration: null,
        refresh_token: null,
        profile: null,
        deleted_at: null,
        in_between_steps: false,
        refresh_needed: false,
        posting_times: "[]",
        custom_instance_details: null,
        additional_settings: "[]",
        customer_id: null,
        root_internal_id: null,
        created_at: now,
        updated_at: now,
        ...overrides,
    };
}

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
        | "listPostsByOrganizationAndDateRange"
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
        listPostsByOrganizationAndDateRange: jest.fn(),
    };
}

type IntegrationConnectionMock = jest.Mocked<Pick<IntegrationConnectionService, "assertOrganizationMember">>;

function createIntegrationConnectionMock(): IntegrationConnectionMock {
    return {
        assertOrganizationMember: jest.fn().mockResolvedValue(undefined),
    };
}

type IntegrationServiceMock = jest.Mocked<Pick<IntegrationService, "listByOrganization">>;

function createIntegrationServiceMock(): IntegrationServiceMock {
    return {
        listByOrganization: jest.fn(),
    };
}

type OrganizationRepoMock = jest.Mocked<Pick<OrganizationRepository, "findUserIdByAuthId">>;

function createOrganizationRepoMock(): OrganizationRepoMock {
    return {
        findUserIdByAuthId: jest.fn().mockResolvedValue({ userId: faker.string.uuid(), error: null }),
    };
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

    function service(): PostsService {
        return new PostsService(
            postsRepo as unknown as PostsRepository,
            integrationConnection as unknown as IntegrationConnectionService,
            integrationService as unknown as IntegrationService,
            organizationRepo as unknown as OrganizationRepository
        );
    }

    describe("findFreeSlot", () => {
        it("returns first free slot ISO when repository reports slot not taken", async () => {
            postsRepo.hasQueueSlotTaken.mockResolvedValue(false);
            const iso = await service().findFreeSlot(orgId, authUserId);
            expect(integrationConnection.assertOrganizationMember).toHaveBeenCalledWith(authUserId, orgId);
            expect(postsRepo.hasQueueSlotTaken).toHaveBeenCalledWith(orgId, iso);
            expect(new Date(iso).getTime()).toBeGreaterThan(0);
        });

        it("advances in 15-minute steps until a slot is free", async () => {
            postsRepo.hasQueueSlotTaken
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(false);
            await service().findFreeSlot(orgId, authUserId);
            expect(postsRepo.hasQueueSlotTaken).toHaveBeenCalledTimes(3);
            const first = postsRepo.hasQueueSlotTaken.mock.calls[0][1];
            const third = postsRepo.hasQueueSlotTaken.mock.calls[2][1];
            expect(new Date(third).getTime() - new Date(first).getTime()).toBe(2 * 15 * 60 * 1000);
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
    });

    describe("createPost", () => {
        const scheduledIso = "2030-06-15T12:07:33.000Z";

        beforeEach(() => {
            integrationService.listByOrganization.mockResolvedValue([integrationRow({ id: integrationId })]);
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
                integrationRow({ id: integrationId }),
                integrationRow({ id: otherIntegrationId }),
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
                integrationRow({ id: integrationId }),
                integrationRow({ id: otherIntegrationId }),
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
                integrationRow({ id: integrationId, deleted_at: new Date().toISOString() }),
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
    });
});
