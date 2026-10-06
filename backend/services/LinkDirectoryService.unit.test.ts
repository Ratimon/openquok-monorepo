import { LinkDirectoryService } from "./LinkDirectoryService";
import type { LinkDirectoryRepository } from "../repositories/LinkDirectoryRepository";
import type { LinkDirectoryCategoryRepository } from "../repositories/LinkDirectoryCategoryRepository";
import type { LinkDirectoryTagRepository } from "../repositories/LinkDirectoryTagRepository";
import type { InternalOpsEmailService } from "./InternalOpsEmailService";
import type { LinkDirectorySiteRow } from "../data/types/linkDirectoryTypes";
import type {
    LinkDirectoryOpportunityUpdateSchemaType,
    LinkDirectorySiteUpdateSchemaType,
} from "../data/schemas/linkDirectorySchemas";
import { ValidationError } from "../errors/InfraError";

const siteId = "aaaaaaaa-bbbb-cccc-dddd-000000000001";
const siteSlug = "example-site";
const previousSiteSlug = "old-example-site";
const opportunityId = "bbbbbbbb-bbbb-bbbb-bbbb-000000000002";

const mockPublishedSite = {
    id: siteId,
    slug: siteSlug,
    title: "Example",
    site_url: "https://example.com",
} as LinkDirectorySiteRow;

function createMockInternalOpsEmailService(): jest.Mocked<
    Pick<
        InternalOpsEmailService,
        "notifyLinkDirectorySubmissionCreated" | "notifyLinkDirectorySiteCommentCreated"
    >
> {
    return {
        notifyLinkDirectorySubmissionCreated: jest.fn(),
        notifyLinkDirectorySiteCommentCreated: jest.fn(),
    };
}

function createLinkDirectoryService(
    linkDirectoryRepository: LinkDirectoryRepository,
    cache?: { getOrSet: jest.Mock },
    cacheInvalidator?: { invalidateKey: jest.Mock; invalidatePattern: jest.Mock }
): LinkDirectoryService {
    return new LinkDirectoryService(
        linkDirectoryRepository,
        {} as LinkDirectoryCategoryRepository,
        {} as LinkDirectoryTagRepository,
        undefined,
        createMockInternalOpsEmailService() as unknown as InternalOpsEmailService,
        cache as never,
        cacheInvalidator as never
    );
}

function expectPublishedCatalogInvalidation(invalidateKey: jest.Mock, invalidatePattern: jest.Mock): void {
    expect(invalidatePattern).toHaveBeenCalledWith("linkDirectory:published:list:*");
    expect(invalidatePattern).toHaveBeenCalledWith("linkDirectory:admin:sites:list:*");
    expect(invalidatePattern).toHaveBeenCalledWith("linkDirectory:published:bySlug:*");
    expect(invalidateKey).toHaveBeenCalledWith("linkDirectory:published:hubStats");
}

function createMockLinkDirectoryRepository(): jest.Mocked<
    Pick<
        LinkDirectoryRepository,
        | "setUserSavedSiteOutreachCompleted"
        | "assertPublishedSiteIds"
        | "replaceUserSavedSites"
        | "reorderUserSavedSites"
        | "findUserSavedSites"
    >
> {
    return {
        setUserSavedSiteOutreachCompleted: jest.fn(),
        assertPublishedSiteIds: jest.fn(),
        replaceUserSavedSites: jest.fn(),
        reorderUserSavedSites: jest.fn(),
        findUserSavedSites: jest.fn(),
    };
}

describe("LinkDirectoryService saved site outreach completion", () => {
    it("sets outreach_completed_at when marking done", async () => {
        const linkDirectoryRepository = createMockLinkDirectoryRepository();
        const service = createLinkDirectoryService(
            linkDirectoryRepository as unknown as LinkDirectoryRepository
        );

        await service.setUserSavedSiteOutreachCompleted("user-1", "site-1", true);

        expect(linkDirectoryRepository.setUserSavedSiteOutreachCompleted).toHaveBeenCalledWith(
            "user-1",
            "site-1",
            expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/)
        );
    });

    it("clears outreach_completed_at when marking not done", async () => {
        const linkDirectoryRepository = createMockLinkDirectoryRepository();
        const service = createLinkDirectoryService(
            linkDirectoryRepository as unknown as LinkDirectoryRepository
        );

        await service.setUserSavedSiteOutreachCompleted("user-1", "site-1", false);

        expect(linkDirectoryRepository.setUserSavedSiteOutreachCompleted).toHaveBeenCalledWith(
            "user-1",
            "site-1",
            null
        );
    });
});

describe("LinkDirectoryService saved sites", () => {
    it("replaceUserSavedSites dedupes ids and validates published sites", async () => {
        const linkDirectoryRepository = createMockLinkDirectoryRepository();
        const service = createLinkDirectoryService(
            linkDirectoryRepository as unknown as LinkDirectoryRepository
        );

        await service.replaceUserSavedSites("user-1", ["site-a", "site-a", "site-b"]);

        expect(linkDirectoryRepository.assertPublishedSiteIds).toHaveBeenCalledWith([
            "site-a",
            "site-b",
        ]);
        expect(linkDirectoryRepository.replaceUserSavedSites).toHaveBeenCalledWith("user-1", [
            "site-a",
            "site-b",
        ]);
    });

    it("replaceUserSavedSites does not persist when published validation fails", async () => {
        const linkDirectoryRepository = createMockLinkDirectoryRepository();
        linkDirectoryRepository.assertPublishedSiteIds.mockRejectedValue(
            new ValidationError("not published")
        );
        const service = createLinkDirectoryService(
            linkDirectoryRepository as unknown as LinkDirectoryRepository
        );

        await expect(service.replaceUserSavedSites("user-1", ["site-a"])).rejects.toThrow(
            ValidationError
        );
        expect(linkDirectoryRepository.replaceUserSavedSites).not.toHaveBeenCalled();
    });

    it("reorderUserSavedSites requires the full saved set and published sites", async () => {
        const linkDirectoryRepository = createMockLinkDirectoryRepository();
        linkDirectoryRepository.findUserSavedSites.mockResolvedValue({
            data: [
                { id: "row-1", user_id: "user-1", site_id: "site-b", sort_order: 0, created_at: "", outreach_completed_at: null },
                { id: "row-2", user_id: "user-1", site_id: "site-a", sort_order: 1, created_at: "", outreach_completed_at: null },
            ],
        });
        const service = createLinkDirectoryService(
            linkDirectoryRepository as unknown as LinkDirectoryRepository
        );

        await service.reorderUserSavedSites("user-1", ["site-a", "site-b"]);

        expect(linkDirectoryRepository.assertPublishedSiteIds).toHaveBeenCalledWith([
            "site-a",
            "site-b",
        ]);
        expect(linkDirectoryRepository.reorderUserSavedSites).toHaveBeenCalledWith("user-1", [
            "site-a",
            "site-b",
        ]);
    });

    it("reorderUserSavedSites rejects when the ordered set does not match saved rows", async () => {
        const linkDirectoryRepository = createMockLinkDirectoryRepository();
        linkDirectoryRepository.findUserSavedSites.mockResolvedValue({
            data: [
                { id: "row-1", user_id: "user-1", site_id: "site-a", sort_order: 0, created_at: "", outreach_completed_at: null },
            ],
        });
        const service = createLinkDirectoryService(
            linkDirectoryRepository as unknown as LinkDirectoryRepository
        );

        await expect(service.reorderUserSavedSites("user-1", ["site-a", "site-b"])).rejects.toThrow(
            ValidationError
        );
        expect(linkDirectoryRepository.assertPublishedSiteIds).not.toHaveBeenCalled();
        expect(linkDirectoryRepository.reorderUserSavedSites).not.toHaveBeenCalled();
    });

    it("reorderUserSavedSites does not persist when published validation fails", async () => {
        const linkDirectoryRepository = createMockLinkDirectoryRepository();
        linkDirectoryRepository.findUserSavedSites.mockResolvedValue({
            data: [
                { id: "row-1", user_id: "user-1", site_id: "site-a", sort_order: 0, created_at: "", outreach_completed_at: null },
            ],
        });
        linkDirectoryRepository.assertPublishedSiteIds.mockRejectedValue(
            new ValidationError("unknown or unpublished site ids")
        );
        const service = createLinkDirectoryService(
            linkDirectoryRepository as unknown as LinkDirectoryRepository
        );

        await expect(service.reorderUserSavedSites("user-1", ["site-a"])).rejects.toThrow(
            ValidationError
        );
        expect(linkDirectoryRepository.assertPublishedSiteIds).toHaveBeenCalledWith(["site-a"]);
        expect(linkDirectoryRepository.reorderUserSavedSites).not.toHaveBeenCalled();
    });

    it("getUserSavedSites omits unpublished site embeds", async () => {
        const linkDirectoryRepository = createMockLinkDirectoryRepository();
        linkDirectoryRepository.findUserSavedSites.mockResolvedValue({
            data: [
                {
                    id: "row-1",
                    user_id: "user-1",
                    site_id: "site-a",
                    sort_order: 0,
                    created_at: "",
                    outreach_completed_at: null,
                    site: { id: "site-a", is_admin_published: false } as never,
                },
                {
                    id: "row-2",
                    user_id: "user-1",
                    site_id: "site-b",
                    sort_order: 1,
                    created_at: "",
                    outreach_completed_at: null,
                    site: { id: "site-b", is_admin_published: true } as never,
                },
            ],
        });
        const service = createLinkDirectoryService(
            linkDirectoryRepository as unknown as LinkDirectoryRepository
        );

        const rows = await service.getUserSavedSites("user-1");

        expect(rows[0].site).toBeNull();
        expect(rows[1].site?.id).toBe("site-b");
    });
});

describe("LinkDirectoryService ops email alerts", () => {
    it("notifyLinkDirectorySubmissionCreated after successful createSubmission", async () => {
        const internalOpsEmailService = createMockInternalOpsEmailService();
        const linkDirectoryRepository = {
            createSubmission: jest.fn().mockResolvedValue("sub-1"),
        } as unknown as LinkDirectoryRepository;
        const service = new LinkDirectoryService(
            linkDirectoryRepository,
            {} as LinkDirectoryCategoryRepository,
            {} as LinkDirectoryTagRepository,
            undefined,
            internalOpsEmailService as unknown as InternalOpsEmailService
        );

        const payload = {
            email: "submitter@example.com",
            site_url: "https://example.com",
            proposed_title: "Example",
            notes: "Please add",
        };

        const id = await service.createSubmission(payload, "user-public-1");

        expect(id).toBe("sub-1");
        expect(internalOpsEmailService.notifyLinkDirectorySubmissionCreated).toHaveBeenCalledWith({
            submissionId: "sub-1",
            siteUrl: payload.site_url,
            email: payload.email,
            proposedTitle: payload.proposed_title,
            notes: payload.notes,
            userId: "user-public-1",
        });
    });

    it("does not notify when createSubmission insert fails", async () => {
        const internalOpsEmailService = createMockInternalOpsEmailService();
        const linkDirectoryRepository = {
            createSubmission: jest.fn().mockRejectedValue(new Error("db error")),
        } as unknown as LinkDirectoryRepository;
        const service = new LinkDirectoryService(
            linkDirectoryRepository,
            {} as LinkDirectoryCategoryRepository,
            {} as LinkDirectoryTagRepository,
            undefined,
            internalOpsEmailService as unknown as InternalOpsEmailService
        );

        await expect(
            service.createSubmission(
                { email: "a@b.com", site_url: "https://example.com" },
                null
            )
        ).rejects.toThrow("db error");

        expect(internalOpsEmailService.notifyLinkDirectorySubmissionCreated).not.toHaveBeenCalled();
    });

    it("notifyLinkDirectorySiteCommentCreated after successful createSiteComment", async () => {
        const internalOpsEmailService = createMockInternalOpsEmailService();
        const linkDirectoryRepository = {
            assertPublishedSiteIds: jest.fn(),
            createSiteComment: jest.fn().mockResolvedValue({ id: "comment-1" }),
            findSiteById: jest.fn().mockResolvedValue({
                data: { id: "site-1", slug: "my-site", title: "My Site" },
            }),
        } as unknown as LinkDirectoryRepository;
        const service = new LinkDirectoryService(
            linkDirectoryRepository,
            {} as LinkDirectoryCategoryRepository,
            {} as LinkDirectoryTagRepository,
            undefined,
            internalOpsEmailService as unknown as InternalOpsEmailService
        );

        const result = await service.createSiteComment(
            "site-1",
            { content: "Great resource", parentId: null },
            "user-public-1",
            undefined,
            "user@example.com"
        );

        expect(result).toEqual({ id: "comment-1" });
        expect(internalOpsEmailService.notifyLinkDirectorySiteCommentCreated).toHaveBeenCalledWith({
            commentId: "comment-1",
            siteId: "site-1",
            siteSlug: "my-site",
            siteTitle: "My Site",
            content: "Great resource",
            userId: "user-public-1",
            userEmail: "user@example.com",
            parentId: null,
        });
    });

    it("does not notify when createSiteComment insert fails", async () => {
        const internalOpsEmailService = createMockInternalOpsEmailService();
        const linkDirectoryRepository = {
            assertPublishedSiteIds: jest.fn(),
            createSiteComment: jest.fn().mockRejectedValue(new Error("db error")),
        } as unknown as LinkDirectoryRepository;
        const service = new LinkDirectoryService(
            linkDirectoryRepository,
            {} as LinkDirectoryCategoryRepository,
            {} as LinkDirectoryTagRepository,
            undefined,
            internalOpsEmailService as unknown as InternalOpsEmailService
        );

        await expect(
            service.createSiteComment(
                "site-1",
                { content: "Hi" },
                "user-public-1",
                undefined,
                "user@example.com"
            )
        ).rejects.toThrow("db error");

        expect(internalOpsEmailService.notifyLinkDirectorySiteCommentCreated).not.toHaveBeenCalled();
    });
});

describe("LinkDirectoryService cache", () => {
    describe("getPublishedSiteBySlug", () => {
        it("loads from repository when cache is not configured", async () => {
            const linkDirectoryRepository = {
                findPublishedSiteBySlug: jest.fn().mockResolvedValue({ data: mockPublishedSite }),
            } as unknown as LinkDirectoryRepository;
            const service = createLinkDirectoryService(linkDirectoryRepository);

            const result = await service.getPublishedSiteBySlug(siteSlug);

            expect(result).toEqual(mockPublishedSite);
            expect(linkDirectoryRepository.findPublishedSiteBySlug).toHaveBeenCalledWith(siteSlug);
        });

        it("uses cache.getOrSet with slug key and TTL when cache is configured", async () => {
            const linkDirectoryRepository = {
                findPublishedSiteBySlug: jest.fn(),
            } as unknown as LinkDirectoryRepository;
            const getOrSet = jest.fn().mockResolvedValue(mockPublishedSite);
            const service = createLinkDirectoryService(linkDirectoryRepository, { getOrSet });

            const result = await service.getPublishedSiteBySlug(siteSlug);

            expect(result).toEqual(mockPublishedSite);
            expect(getOrSet).toHaveBeenCalledWith(
                `linkDirectory:published:bySlug:${siteSlug}`,
                expect.any(Function),
                300
            );
            expect(linkDirectoryRepository.findPublishedSiteBySlug).not.toHaveBeenCalled();
        });

        it("runs repository factory when getOrSet invokes the factory", async () => {
            const linkDirectoryRepository = {
                findPublishedSiteBySlug: jest.fn().mockResolvedValue({ data: mockPublishedSite }),
            } as unknown as LinkDirectoryRepository;
            const getOrSet = jest.fn().mockImplementation(async (_key, factory) => factory());
            const service = createLinkDirectoryService(linkDirectoryRepository, { getOrSet });

            await service.getPublishedSiteBySlug(siteSlug);

            expect(getOrSet).toHaveBeenCalledWith(
                `linkDirectory:published:bySlug:${siteSlug}`,
                expect.any(Function),
                300
            );
            expect(linkDirectoryRepository.findPublishedSiteBySlug).toHaveBeenCalledWith(siteSlug);
        });
    });

    describe("updateSite", () => {
        const updatePayload: LinkDirectorySiteUpdateSchemaType = {
            id: siteId,
            slug: siteSlug,
            title: "Example",
            site_url: "https://example.com",
        };

        it("invalidates published catalog caches after a successful update", async () => {
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const linkDirectoryRepository = {
                findSiteById: jest.fn().mockResolvedValue({ data: mockPublishedSite }),
                updateSite: jest.fn().mockResolvedValue(siteId),
            } as unknown as LinkDirectoryRepository;
            const service = createLinkDirectoryService(linkDirectoryRepository, undefined, {
                invalidateKey,
                invalidatePattern,
            });

            await service.updateSite(updatePayload);

            expect(linkDirectoryRepository.updateSite).toHaveBeenCalledWith(updatePayload, undefined);
            expectPublishedCatalogInvalidation(invalidateKey, invalidatePattern);
            expect(invalidateKey).toHaveBeenCalledWith(`linkDirectory:published:bySlug:${siteSlug}`);
        });

        it("invalidates previous slug when the site slug changes", async () => {
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const linkDirectoryRepository = {
                findSiteById: jest.fn().mockResolvedValue({
                    data: { ...mockPublishedSite, slug: previousSiteSlug },
                }),
                updateSite: jest.fn().mockResolvedValue(siteId),
            } as unknown as LinkDirectoryRepository;
            const service = createLinkDirectoryService(linkDirectoryRepository, undefined, {
                invalidateKey,
                invalidatePattern,
            });

            await service.updateSite(updatePayload);

            expect(invalidateKey).toHaveBeenCalledWith(`linkDirectory:published:bySlug:${siteSlug}`);
            expect(invalidateKey).toHaveBeenCalledWith(
                `linkDirectory:published:bySlug:${previousSiteSlug}`
            );
        });
    });

    describe("updateOpportunity", () => {
        const updatePayload: LinkDirectoryOpportunityUpdateSchemaType = {
            id: opportunityId,
            slug: "guest-post",
            title: "Guest post",
            opportunity_type_id: "cccccccc-cccc-cccc-cccc-000000000003",
            effort: "easy",
            approval_mode: "instant",
            dofollow: "dofollow",
            cost_tier: "free",
            steps: [{ order: 1, title: "Step", body: "Do the thing" }],
        };

        it("invalidates published catalog caches for the parent site after update", async () => {
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const linkDirectoryRepository = {
                findOpportunityById: jest.fn().mockResolvedValue({
                    data: { id: opportunityId, site_id: siteId },
                }),
                findSiteById: jest.fn().mockResolvedValue({ data: mockPublishedSite }),
                updateOpportunity: jest.fn().mockResolvedValue(opportunityId),
            } as unknown as LinkDirectoryRepository;
            const service = createLinkDirectoryService(linkDirectoryRepository, undefined, {
                invalidateKey,
                invalidatePattern,
            });

            await service.updateOpportunity(updatePayload);

            expect(linkDirectoryRepository.updateOpportunity).toHaveBeenCalledWith(updatePayload);
            expectPublishedCatalogInvalidation(invalidateKey, invalidatePattern);
            expect(invalidateKey).toHaveBeenCalledWith(`linkDirectory:published:bySlug:${siteSlug}`);
        });
    });
});
