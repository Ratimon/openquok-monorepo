import { LinkDirectoryService } from "./LinkDirectoryService";
import type { LinkDirectoryRepository } from "../repositories/LinkDirectoryRepository";
import type { LinkDirectoryCategoryRepository } from "../repositories/LinkDirectoryCategoryRepository";
import type { LinkDirectoryTagRepository } from "../repositories/LinkDirectoryTagRepository";

function createMockLinkDirectoryRepository(): jest.Mocked<
    Pick<LinkDirectoryRepository, "setUserSavedSiteOutreachCompleted">
> {
    return {
        setUserSavedSiteOutreachCompleted: jest.fn(),
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
