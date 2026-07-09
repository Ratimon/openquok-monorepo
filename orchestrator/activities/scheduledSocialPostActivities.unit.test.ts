/// <reference types="jest" />

import { faker } from "@faker-js/faker";
import type { IntegrationLike } from "backend/utils/dtos/IntegrationDTO.js";
import type { SocialPostLike } from "backend/utils/dtos/PostDTO.js";
import type { IntegrationRepository } from "backend/repositories/IntegrationRepository.js";
import type { PlugRepository } from "backend/repositories/PlugRepository.js";
import { IntegrationManager } from "backend/integrations/integrationManager.js";
import type { RefreshIntegrationService } from "backend/services/RefreshIntegrationService.js";
import { logger } from "backend/utils/Logger.js";

import {
    createPublishScheduledGroupHandler,
    type ScheduledPostsRepository,
    type ScheduledSocialPostPlugPipelineDeps,
} from "./scheduledSocialPostActivities.js";

const orgId = faker.string.uuid();
const postGroup = faker.string.uuid();
const postId = faker.string.uuid();
const integrationId = faker.string.uuid();

function minimalIntegration(overrides: Partial<IntegrationLike> = {}): IntegrationLike {
    const now = new Date().toISOString();
    return {
        id: integrationId,
        organization_id: orgId,
        internal_id: "int-internal",
        name: "Channel",
        picture: null,
        provider_identifier: "threads",
        type: "social",
        token: "tok",
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

function minimalPost(overrides: Partial<SocialPostLike> = {}): SocialPostLike & { integration_id: string } {
    const now = new Date().toISOString();
    const row = {
        id: postId,
        state: "QUEUE" as const,
        publish_date: now,
        organization_id: orgId,
        integration_id: integrationId,
        content: "hello",
        delay: 0,
        post_group: postGroup,
        title: null,
        description: null,
        parent_post_id: null,
        release_id: null,
        release_url: null,
        settings: null,
        image: null,
        interval_in_days: null,
        error: null,
        deleted_at: null,
        created_by_user_id: null,
        created_at: now,
        updated_at: now,
        ...overrides,
    };
    return row as SocialPostLike & { integration_id: string };
}

function createIntegrationRepoMock(): jest.Mocked<Pick<IntegrationRepository, "getById">> {
    return {
        getById: jest.fn(),
    };
}

function createPlugRepoMock(): jest.Mocked<Pick<PlugRepository, "listActivatedPlugsByIntegration" | "getPlugRowById">> {
    return {
        listActivatedPlugsByIntegration: jest.fn().mockResolvedValue([]),
        getPlugRowById: jest.fn(),
    };
}

/** Mock {@link SocialProvider} instances per identifier + real plug catalog delegation from {@link IntegrationManager}. */
function createPlugAwareIntegrationManager(mockSocialByIdentifier: Record<string, unknown>): IntegrationManager {
    const live = new IntegrationManager();
    return {
        getSocialIntegration: jest.fn((id: string) => {
            const mock = mockSocialByIdentifier[id];
            return mock !== undefined ? mock : live.getSocialIntegration(id);
        }),
        getInternalPlugDefinitionsForProvider: (providerIdentifier: string) =>
            live.getInternalPlugDefinitionsForProvider(providerIdentifier),
        findGlobalPlugDefinition: (providerIdentifier: string, methodName: string) =>
            live.findGlobalPlugDefinition(providerIdentifier, methodName),
    } as unknown as IntegrationManager;
}

describe("scheduledSocialPostActivities / plugPipeline", () => {
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
        warnSpy = jest.spyOn(logger, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
        warnSpy.mockRestore();
    });

    function basePostsRepo(post: SocialPostLike & { integration_id: string }): jest.Mocked<
        Pick<
            ScheduledPostsRepository,
            | "listPostsByGroup"
            | "markPostState"
            | "updatePostRowPublishResult"
            | "createRepeatGroupFromPostGroup"
        >
    > {
        return {
            listPostsByGroup: jest.fn().mockResolvedValue([post]),
            markPostState: jest.fn(),
            updatePostRowPublishResult: jest.fn(),
            createRepeatGroupFromPostGroup: jest.fn(),
        };
    }

    it("does not query activated plugs when plugPipeline is omitted", async () => {
        const integrationRepo = createIntegrationRepoMock();
        integrationRepo.getById.mockResolvedValue(minimalIntegration());

        const threadsInternalFollowUp = jest.fn().mockResolvedValue(undefined);
        const manager = {
            getSocialIntegration: jest.fn(() => ({
                post: jest.fn().mockResolvedValue([{ postId: "release-1" }]),
                threadsInternalFollowUp,
            })),
        } as unknown as IntegrationManager;

        const refreshService: Pick<RefreshIntegrationService, "refresh"> = { refresh: jest.fn().mockResolvedValue(false) };

        const publish = createPublishScheduledGroupHandler({
            postsRepository: basePostsRepo(minimalPost()) as unknown as ScheduledPostsRepository,
            integrationRepository: integrationRepo,
            integrationManager: manager,
            refreshService,
        });

        await publish({ organizationId: orgId, postGroup });

        expect(threadsInternalFollowUp).not.toHaveBeenCalled();
    });

    it("does not list activated plugs after publish when provider does not support plugs", async () => {
        const integrationRepo = createIntegrationRepoMock();
        const plugRepo = createPlugRepoMock();
        integrationRepo.getById.mockResolvedValue(minimalIntegration({ provider_identifier: "instagram-business" }));

        const manager = createPlugAwareIntegrationManager({
            "instagram-business": {
                post: jest.fn().mockResolvedValue([{ postId: "release-ig" }]),
            },
        });

        const refreshService: Pick<RefreshIntegrationService, "refresh"> = { refresh: jest.fn().mockResolvedValue(false) };

        const plugPipeline: ScheduledSocialPostPlugPipelineDeps = {
            plugRepository: plugRepo,
            integrationRepository: integrationRepo,
            integrationManager: manager,
            refreshService,
        };

        const publish = createPublishScheduledGroupHandler({
            postsRepository: basePostsRepo(
                minimalPost({ integration_id: integrationId })
            ) as unknown as ScheduledPostsRepository,
            integrationRepository: integrationRepo,
            integrationManager: manager,
            refreshService,
            plugPipeline,
        });

        await publish({ organizationId: orgId, postGroup });

        expect(plugRepo.listActivatedPlugsByIntegration).not.toHaveBeenCalled();
    });

    it("lists activated plugs once after Threads publish when plugPipeline is set", async () => {
        const integrationRepo = createIntegrationRepoMock();
        const plugRepo = createPlugRepoMock();
        integrationRepo.getById.mockResolvedValue(minimalIntegration());

        const manager = createPlugAwareIntegrationManager({
            threads: {
                post: jest.fn().mockResolvedValue([{ postId: "release-main" }]),
            },
        });

        const refreshService: Pick<RefreshIntegrationService, "refresh"> = { refresh: jest.fn().mockResolvedValue(false) };

        const plugPipeline: ScheduledSocialPostPlugPipelineDeps = {
            plugRepository: plugRepo,
            integrationRepository: integrationRepo,
            integrationManager: manager,
            refreshService,
        };

        const publish = createPublishScheduledGroupHandler({
            postsRepository: basePostsRepo(minimalPost()) as unknown as ScheduledPostsRepository,
            integrationRepository: integrationRepo,
            integrationManager: manager,
            refreshService,
            plugPipeline,
        });

        await publish({ organizationId: orgId, postGroup });

        expect(plugRepo.listActivatedPlugsByIntegration).toHaveBeenCalledTimes(1);
        expect(plugRepo.listActivatedPlugsByIntegration).toHaveBeenCalledWith(orgId, integrationId);
    });

    it("runs Threads internal engagement plug when settings enable it", async () => {
        const integrationRepo = createIntegrationRepoMock();
        const plugRepo = createPlugRepoMock();
        integrationRepo.getById.mockResolvedValue(minimalIntegration());

        const threadsInternalFollowUp = jest.fn().mockResolvedValue(undefined);
        const manager = createPlugAwareIntegrationManager({
            threads: {
                post: jest.fn().mockResolvedValue([{ postId: "release-main" }]),
                threadsInternalFollowUp,
            },
        });

        const refreshService: Pick<RefreshIntegrationService, "refresh"> = { refresh: jest.fn().mockResolvedValue(false) };

        const plugPipeline: ScheduledSocialPostPlugPipelineDeps = {
            plugRepository: plugRepo,
            integrationRepository: integrationRepo,
            integrationManager: manager,
            refreshService,
        };

        const settingsJson = JSON.stringify({
            providerSettings: {
                threads: {
                    internalEngagementPlug: {
                        enabled: true,
                        message: "Thanks for reading!",
                        delaySeconds: 0,
                        plugName: "threads-internal-follow-up",
                    },
                },
            },
        });

        const publish = createPublishScheduledGroupHandler({
            postsRepository: basePostsRepo(minimalPost({ settings: settingsJson })) as unknown as ScheduledPostsRepository,
            integrationRepository: integrationRepo,
            integrationManager: manager,
            refreshService,
            plugPipeline,
        });

        await publish({ organizationId: orgId, postGroup });

        expect(threadsInternalFollowUp).toHaveBeenCalledTimes(1);
        const call = threadsInternalFollowUp.mock.calls[0]!;
        expect(call[2]).toBe("release-main");
        expect(call[3]).toEqual(
            expect.objectContaining({
                message: "Thanks for reading!",
                replyToParentId: "release-main",
            })
        );
    });

    it("runs Threads cross-account comment plug for other channel integrations", async () => {
        const otherIntegrationId = faker.string.uuid();
        const integrationRepo = createIntegrationRepoMock();
        const plugRepo = createPlugRepoMock();
        integrationRepo.getById.mockImplementation(async (_org, id) => {
            if (id === integrationId) return minimalIntegration();
            if (id === otherIntegrationId) {
                return minimalIntegration({ id: otherIntegrationId, name: "Other Threads" });
            }
            return null;
        });

        const threadsCrossAccountComment = jest.fn().mockResolvedValue(undefined);
        const manager = createPlugAwareIntegrationManager({
            threads: {
                post: jest.fn().mockResolvedValue([{ postId: "release-main" }]),
                threadsCrossAccountComment,
            },
        });

        const refreshService: Pick<RefreshIntegrationService, "refresh"> = { refresh: jest.fn().mockResolvedValue(false) };

        const plugPipeline: ScheduledSocialPostPlugPipelineDeps = {
            plugRepository: plugRepo,
            integrationRepository: integrationRepo,
            integrationManager: manager,
            refreshService,
        };

        const settingsJson = JSON.stringify({
            providerSettings: {
                threads: {
                    crossAccountPlugs: [
                        {
                            plugName: "threads-cross-account-comment",
                            enabled: true,
                            delayMs: 0,
                            integrationIds: [otherIntegrationId, integrationId],
                            fields: { comment: "Nice thread!" },
                        },
                    ],
                },
            },
        });

        const publish = createPublishScheduledGroupHandler({
            postsRepository: basePostsRepo(minimalPost({ settings: settingsJson })) as unknown as ScheduledPostsRepository,
            integrationRepository: integrationRepo,
            integrationManager: manager,
            refreshService,
            plugPipeline,
        });

        await publish({ organizationId: orgId, postGroup });

        expect(threadsCrossAccountComment).toHaveBeenCalledTimes(1);
        const call = threadsCrossAccountComment.mock.calls[0]!;
        expect(call[0]?.id).toBe(otherIntegrationId);
        expect(call[1]?.id).toBe(integrationId);
        expect(call[2]).toBe("release-main");
        expect(call[3]).toEqual(
            expect.objectContaining({
                comment: "Nice thread!",
                replyToParentId: "release-main",
            })
        );
    });

    it("runs X cross-account repost plug for other channel integrations", async () => {
        const otherIntegrationId = faker.string.uuid();
        const integrationRepo = createIntegrationRepoMock();
        const plugRepo = createPlugRepoMock();
        integrationRepo.getById.mockImplementation(async (_org, id) => {
            if (id === integrationId) {
                return minimalIntegration({ provider_identifier: "x" });
            }
            if (id === otherIntegrationId) {
                return minimalIntegration({ id: otherIntegrationId, provider_identifier: "x", name: "Other X" });
            }
            return null;
        });

        const repostPostUsers = jest.fn().mockResolvedValue(undefined);
        const manager = createPlugAwareIntegrationManager({
            x: {
                post: jest.fn().mockResolvedValue([{ postId: "tweet-main" }]),
                repostPostUsers,
            },
        });

        const refreshService: Pick<RefreshIntegrationService, "refresh"> = { refresh: jest.fn().mockResolvedValue(false) };

        const plugPipeline: ScheduledSocialPostPlugPipelineDeps = {
            plugRepository: plugRepo,
            integrationRepository: integrationRepo,
            integrationManager: manager,
            refreshService,
        };

        const settingsJson = JSON.stringify({
            providerSettings: {
                x: {
                    crossAccountPlugs: [
                        {
                            plugName: "x-repost-post-users",
                            enabled: true,
                            delayMs: 0,
                            integrationIds: [otherIntegrationId],
                            fields: {},
                        },
                    ],
                },
            },
        });

        const publish = createPublishScheduledGroupHandler({
            postsRepository: basePostsRepo(
                minimalPost({
                    integration_id: integrationId,
                    settings: settingsJson,
                })
            ) as unknown as ScheduledPostsRepository,
            integrationRepository: integrationRepo,
            integrationManager: manager,
            refreshService,
            plugPipeline,
        });

        await publish({ organizationId: orgId, postGroup });

        expect(repostPostUsers).toHaveBeenCalledTimes(1);
        const call = repostPostUsers.mock.calls[0]!;
        expect(call[0]?.id).toBe(otherIntegrationId);
        expect(call[1]?.id).toBe(integrationId);
        expect(call[2]).toBe("tweet-main");
    });

    it("skips disabled or invalid cross-account plug configs", async () => {
        const otherIntegrationId = faker.string.uuid();
        const integrationRepo = createIntegrationRepoMock();
        const plugRepo = createPlugRepoMock();
        integrationRepo.getById.mockImplementation(async (_org, id) => {
            if (id === integrationId) {
                return minimalIntegration({ provider_identifier: "x" });
            }
            if (id === otherIntegrationId) {
                return minimalIntegration({ id: otherIntegrationId, provider_identifier: "x" });
            }
            return null;
        });

        const repostPostUsers = jest.fn().mockResolvedValue(undefined);
        const manager = createPlugAwareIntegrationManager({
            x: {
                post: jest.fn().mockResolvedValue([{ postId: "tweet-main" }]),
                repostPostUsers,
            },
        });

        const refreshService: Pick<RefreshIntegrationService, "refresh"> = { refresh: jest.fn().mockResolvedValue(false) };

        const plugPipeline: ScheduledSocialPostPlugPipelineDeps = {
            plugRepository: plugRepo,
            integrationRepository: integrationRepo,
            integrationManager: manager,
            refreshService,
        };

        const settingsJson = JSON.stringify({
            providerSettings: {
                x: {
                    crossAccountPlugs: [
                        {
                            plugName: "x-repost-post-users",
                            enabled: false,
                            integrationIds: [otherIntegrationId],
                        },
                        {
                            plugName: "",
                            enabled: true,
                            integrationIds: [otherIntegrationId],
                        },
                        {
                            plugName: "x-repost-post-users",
                            enabled: true,
                            integrationIds: [],
                        },
                        {
                            plugName: "unknown-plug",
                            enabled: true,
                            integrationIds: [otherIntegrationId],
                        },
                    ],
                },
            },
        });

        const publish = createPublishScheduledGroupHandler({
            postsRepository: basePostsRepo(
                minimalPost({
                    integration_id: integrationId,
                    settings: settingsJson,
                })
            ) as unknown as ScheduledPostsRepository,
            integrationRepository: integrationRepo,
            integrationManager: manager,
            refreshService,
            plugPipeline,
        });

        await publish({ organizationId: orgId, postGroup });

        expect(repostPostUsers).not.toHaveBeenCalled();
    });

    it("runs LinkedIn cross-account comment plug (regression)", async () => {
        const otherIntegrationId = faker.string.uuid();
        const integrationRepo = createIntegrationRepoMock();
        const plugRepo = createPlugRepoMock();
        integrationRepo.getById.mockImplementation(async (_org, id) => {
            if (id === integrationId) {
                return minimalIntegration({ provider_identifier: "linkedin" });
            }
            if (id === otherIntegrationId) {
                return minimalIntegration({
                    id: otherIntegrationId,
                    provider_identifier: "linkedin",
                    name: "Other LinkedIn",
                });
            }
            return null;
        });

        const addComment = jest.fn().mockResolvedValue(undefined);
        const manager = createPlugAwareIntegrationManager({
            linkedin: {
                post: jest.fn().mockResolvedValue([{ postId: "li-main" }]),
                addComment,
            },
        });

        const refreshService: Pick<RefreshIntegrationService, "refresh"> = { refresh: jest.fn().mockResolvedValue(false) };

        const plugPipeline: ScheduledSocialPostPlugPipelineDeps = {
            plugRepository: plugRepo,
            integrationRepository: integrationRepo,
            integrationManager: manager,
            refreshService,
        };

        const settingsJson = JSON.stringify({
            providerSettings: {
                linkedin: {
                    crossAccountPlugs: [
                        {
                            plugName: "linkedin-add-comment",
                            enabled: true,
                            delayMs: 0,
                            integrationIds: [otherIntegrationId],
                            fields: { comment: "Great post!" },
                        },
                    ],
                },
            },
        });

        const publish = createPublishScheduledGroupHandler({
            postsRepository: basePostsRepo(
                minimalPost({
                    integration_id: integrationId,
                    settings: settingsJson,
                })
            ) as unknown as ScheduledPostsRepository,
            integrationRepository: integrationRepo,
            integrationManager: manager,
            refreshService,
            plugPipeline,
        });

        await publish({ organizationId: orgId, postGroup });

        expect(addComment).toHaveBeenCalledTimes(1);
        const call = addComment.mock.calls[0]!;
        expect(call[0]?.id).toBe(otherIntegrationId);
        expect(call[1]?.id).toBe(integrationId);
        expect(call[2]).toBe("li-main");
        expect(call[3]).toEqual(expect.objectContaining({ comment: "Great post!" }));
    });
});
