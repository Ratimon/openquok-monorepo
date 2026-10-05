import { LinkDirectoryService } from "./LinkDirectoryService";
import type { LinkDirectoryRepository } from "../repositories/LinkDirectoryRepository";
import type { LinkDirectoryCategoryRepository } from "../repositories/LinkDirectoryCategoryRepository";
import type { LinkDirectoryTagRepository } from "../repositories/LinkDirectoryTagRepository";
import { ValidationError } from "../errors/InfraError";

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
        const service = new LinkDirectoryService(
            linkDirectoryRepository as unknown as LinkDirectoryRepository,
            {} as LinkDirectoryCategoryRepository,
            {} as LinkDirectoryTagRepository
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
        const service = new LinkDirectoryService(
            linkDirectoryRepository as unknown as LinkDirectoryRepository,
            {} as LinkDirectoryCategoryRepository,
            {} as LinkDirectoryTagRepository
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
        const service = new LinkDirectoryService(
            linkDirectoryRepository as unknown as LinkDirectoryRepository,
            {} as LinkDirectoryCategoryRepository,
            {} as LinkDirectoryTagRepository
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
        const service = new LinkDirectoryService(
            linkDirectoryRepository as unknown as LinkDirectoryRepository,
            {} as LinkDirectoryCategoryRepository,
            {} as LinkDirectoryTagRepository
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
        const service = new LinkDirectoryService(
            linkDirectoryRepository as unknown as LinkDirectoryRepository,
            {} as LinkDirectoryCategoryRepository,
            {} as LinkDirectoryTagRepository
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
        const service = new LinkDirectoryService(
            linkDirectoryRepository as unknown as LinkDirectoryRepository,
            {} as LinkDirectoryCategoryRepository,
            {} as LinkDirectoryTagRepository
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
        const service = new LinkDirectoryService(
            linkDirectoryRepository as unknown as LinkDirectoryRepository,
            {} as LinkDirectoryCategoryRepository,
            {} as LinkDirectoryTagRepository
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
        const service = new LinkDirectoryService(
            linkDirectoryRepository as unknown as LinkDirectoryRepository,
            {} as LinkDirectoryCategoryRepository,
            {} as LinkDirectoryTagRepository
        );

        const rows = await service.getUserSavedSites("user-1");

        expect(rows[0].site).toBeNull();
        expect(rows[1].site?.id).toBe("site-b");
    });
});
