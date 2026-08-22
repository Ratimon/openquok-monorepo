import { faker } from "@faker-js/faker";
import { ListingTagService } from "./ListingTagService";
import type { ListingTagRepository } from "../repositories/ListingTagRepository";
import type { FullListingTag, ListingTagGroup, PartialListingTag } from "../data/types/listingTagTypes";
import type { ListingTagCreateSchemaType } from "../data/schemas/listingTagSchemas";

const tagId = faker.string.uuid();
const groupId = faker.string.uuid();
const groupName = faker.commerce.department();

const mockPartialTag: PartialListingTag = {
    id: tagId,
    name: "AI Agents",
    slug: "ai-agents",
    listing_tag_groups: [{ id: groupId, name: groupName }],
};

const mockFullTag: FullListingTag = {
    ...mockPartialTag,
    headline: faker.lorem.sentence(),
    description: faker.lorem.sentence(),
    image_url_hero: null,
    image_url_small: null,
    href: null,
    color: null,
    emoji: null,
};

const mockTagGroup: ListingTagGroup = { id: groupId, name: groupName };

function createMockTagRepo(): jest.Mocked<ListingTagRepository> {
    return {
        findActivePartialTags: jest.fn(),
        findActiveFullTags: jest.fn(),
        findAllFullTags: jest.fn(),
        createTag: jest.fn(),
        updateTag: jest.fn(),
        deleteTag: jest.fn(),
        findAllTagGroups: jest.fn(),
        createTagGroup: jest.fn(),
        updateTagGroup: jest.fn(),
        deleteTagGroup: jest.fn(),
    } as unknown as jest.Mocked<ListingTagRepository>;
}

describe("ListingTagService", () => {
    let tagRepo: jest.Mocked<ListingTagRepository>;

    beforeEach(() => {
        tagRepo = createMockTagRepo();
    });

    describe("getActivePartialTags", () => {
        it("returns tags from repository when no cache", async () => {
            tagRepo.findActivePartialTags.mockResolvedValue({ data: [mockPartialTag] });
            const service = new ListingTagService(tagRepo);
            const result = await service.getActivePartialTags();
            expect(result).toEqual([mockPartialTag]);
            expect(tagRepo.findActivePartialTags).toHaveBeenCalled();
        });

        it("uses listing:tags:active:partial cache key when cache provided", async () => {
            const getOrSet = jest.fn().mockResolvedValue([mockPartialTag]);
            const service = new ListingTagService(tagRepo, { getOrSet } as never);
            const result = await service.getActivePartialTags();
            expect(result).toEqual([mockPartialTag]);
            expect(getOrSet).toHaveBeenCalledWith("listing:tags:active:partial", expect.any(Function), 300);
            expect(tagRepo.findActivePartialTags).not.toHaveBeenCalled();
        });
    });

    describe("getAllFullTags", () => {
        it("returns full tags from repository when no cache", async () => {
            tagRepo.findAllFullTags.mockResolvedValue({ data: [mockFullTag] });
            const service = new ListingTagService(tagRepo);
            const result = await service.getAllFullTags();
            expect(result).toEqual([mockFullTag]);
        });
    });

    describe("createTag", () => {
        it("creates a tag and invalidates taxonomy caches", async () => {
            tagRepo.createTag.mockResolvedValue(tagId);
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const service = new ListingTagService(tagRepo, undefined, { invalidatePattern } as never);
            const payload = { name: "AI Agents" } as ListingTagCreateSchemaType;
            const result = await service.createTag(payload, [groupId]);
            expect(result).toEqual({ id: tagId });
            expect(tagRepo.createTag).toHaveBeenCalledWith(payload, [groupId]);
            expect(invalidatePattern).toHaveBeenCalledWith("listing:tags:*");
            expect(invalidatePattern).toHaveBeenCalledWith("listing:published:list:*");
            expect(invalidatePattern).toHaveBeenCalledWith("listing:admin:list:*");
        });
    });

    describe("getAllTagGroups", () => {
        it("returns tag groups from repository when no cache", async () => {
            tagRepo.findAllTagGroups.mockResolvedValue({ data: [mockTagGroup] });
            const service = new ListingTagService(tagRepo);
            const result = await service.getAllTagGroups();
            expect(result).toEqual([mockTagGroup]);
            expect(tagRepo.findAllTagGroups).toHaveBeenCalled();
        });

        it("uses listing:tags:groups cache key when cache provided", async () => {
            const getOrSet = jest.fn().mockResolvedValue([mockTagGroup]);
            const service = new ListingTagService(tagRepo, { getOrSet } as never);
            const result = await service.getAllTagGroups();
            expect(result).toEqual([mockTagGroup]);
            expect(getOrSet).toHaveBeenCalledWith("listing:tags:groups", expect.any(Function), 300);
            expect(tagRepo.findAllTagGroups).not.toHaveBeenCalled();
        });
    });

    describe("createTagGroup", () => {
        it("creates a group, invalidates caches, and returns { id, name }", async () => {
            tagRepo.createTagGroup.mockResolvedValue(mockTagGroup);
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const service = new ListingTagService(tagRepo, undefined, { invalidatePattern } as never);
            const result = await service.createTagGroup(groupName);
            expect(result).toEqual(mockTagGroup);
            expect(tagRepo.createTagGroup).toHaveBeenCalledWith(groupName);
            expect(invalidatePattern).toHaveBeenCalledWith("listing:tags:*");
            expect(invalidatePattern).toHaveBeenCalledWith("listing:published:list:*");
        });
    });

    describe("updateTagGroup", () => {
        it("updates a group name and invalidates caches", async () => {
            const updated = { id: groupId, name: "New Name" };
            tagRepo.updateTagGroup.mockResolvedValue(updated);
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const service = new ListingTagService(tagRepo, undefined, { invalidatePattern } as never);
            const result = await service.updateTagGroup(groupId, "New Name");
            expect(result).toEqual(updated);
            expect(tagRepo.updateTagGroup).toHaveBeenCalledWith(groupId, "New Name");
            expect(invalidatePattern).toHaveBeenCalledWith("listing:tags:*");
        });
    });

    describe("deleteTagGroup", () => {
        it("deletes a group and invalidates caches", async () => {
            tagRepo.deleteTagGroup.mockResolvedValue(undefined);
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const service = new ListingTagService(tagRepo, undefined, { invalidatePattern } as never);
            await service.deleteTagGroup(groupId);
            expect(tagRepo.deleteTagGroup).toHaveBeenCalledWith(groupId);
            expect(invalidatePattern).toHaveBeenCalledWith("listing:tags:*");
            expect(invalidatePattern).toHaveBeenCalledWith("listing:admin:list:*");
        });
    });
});
