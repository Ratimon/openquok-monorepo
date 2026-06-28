import { faker } from "@faker-js/faker";
import { ListingService } from "./ListingService";
import type { ListingRepository } from "../repositories/ListingRepository";
import type { ListingCategoryRepository } from "../repositories/ListingCategoryRepository";
import type { ListingTagRepository } from "../repositories/ListingTagRepository";
import type { ConfigRepository } from "../repositories/ConfigRepository";
import type { PublishedListingsFilterOptions, AdminListingsFilterOptions } from "../data/types/listingTypes";
import type {
    ListingCreateBodySchemaType,
    ListingUpdateBodySchemaType,
} from "../data/schemas/listingSchemas";
import {
    buildPublishedListingCacheKey,
    buildAdminListingCacheKey,
    type ListingLike,
} from "../utils/dtos/ListingDTO";
import { ValidationError } from "../errors/InfraError";
import { stringToSlug } from "../utils/blog/slug";
import { SubscriptionSection } from "openquok-common";
import type { SubscriptionGuardService } from "../guards/subscription/SubscriptionGuardService";

const ownerId = faker.string.uuid();
const userId = faker.string.uuid();
const listingId = faker.string.uuid();
const secondListingId = faker.string.uuid();
const categoryId = faker.string.uuid();
const createdAt = faker.date.past().toISOString();
const title = faker.lorem.words(3);
const updatedTitle = faker.lorem.words(4);
const slugFromTitle = stringToSlug(title);
const slugFromUpdatedTitle = stringToSlug(updatedTitle);
const skillContent = "# Skill\n\nInstall instructions here.";

const mockListing: ListingLike = {
    id: listingId,
    owner_id: ownerId,
    title,
    slug: slugFromTitle,
    description: faker.lorem.sentence(),
    excerpt: faker.lorem.sentence(),
    content: skillContent,
    listing_kind: "extension",
    extension_type: "skills",
    is_user_published: true,
    is_admin_published: false,
    likes: 0,
    views: 0,
    clicks: 0,
    bookmark_count: 0,
    average_rating: 0,
    ratings_count: 0,
    created_at: createdAt,
};

const validCreateBody: ListingCreateBodySchemaType = {
    listingData: {
        title,
        description: mockListing.description ?? undefined,
        content: skillContent,
        listing_kind: "extension",
        extension_type: "skills",
        is_official: false,
        is_user_published: true,
        is_admin_published: false,
        listing_category_id: categoryId,
    },
    listingTagsData: [],
};

const validUpdateBody: ListingUpdateBodySchemaType = {
    listingData: {
        id: listingId,
        title: updatedTitle,
        description: mockListing.description ?? undefined,
        content: skillContent,
        listing_kind: "extension",
        extension_type: "skills",
        is_official: false,
        is_user_published: true,
        is_admin_published: true,
        listing_category_id: categoryId,
    },
    listingTagsData: [],
};

function createMockListingRepo(): jest.Mocked<ListingRepository> {
    return {
        findListingById: jest.fn(),
        findPublishedListingBySlug: jest.fn(),
        findPublishedListings: jest.fn(),
        findAdminListings: jest.fn(),
        getListingCreators: jest.fn(),
        findListingsByOwnerUsername: jest.fn(),
        incrementStatCounter: jest.fn(),
        insertListingActivity: jest.fn(),
        createListing: jest.fn(),
        updateListing: jest.fn(),
        deleteListing: jest.fn(),
        getSkillMarkdownContent: jest.fn(),
        addBookmark: jest.fn(),
        removeBookmark: jest.fn(),
        findBookmarkedListingsByUserId: jest.fn(),
    } as unknown as jest.Mocked<ListingRepository>;
}

function createMockCategoryRepo(): jest.Mocked<ListingCategoryRepository> {
    return {
        findActivePartialCategories: jest.fn(),
        findActiveFullCategories: jest.fn(),
        findAllPartialCategories: jest.fn(),
        findAllFullCategories: jest.fn(),
        createCategory: jest.fn(),
        updateCategory: jest.fn(),
        deleteCategory: jest.fn(),
        findAllCategoryGroups: jest.fn(),
    } as unknown as jest.Mocked<ListingCategoryRepository>;
}

function createMockTagRepo(): jest.Mocked<ListingTagRepository> {
    return {
        findActivePartialTags: jest.fn(),
        findActiveFullTags: jest.fn(),
        findAllFullTags: jest.fn(),
        createTag: jest.fn(),
        updateTag: jest.fn(),
        deleteTag: jest.fn(),
        findAllTagGroups: jest.fn(),
    } as unknown as jest.Mocked<ListingTagRepository>;
}

function createMockConfigRepo(
    config: Record<string, string> = {
        PRE_ADMIN_APPROVE_NEW_LISTINGS: "false",
        PRE_ADMIN_APPROVE_UPDATED_LISTINGS: "true",
    }
): jest.Mocked<ConfigRepository> {
    return {
        getConfigByModuleNameAndProperties: jest.fn().mockResolvedValue({ result: config, error: null }),
    } as unknown as jest.Mocked<ConfigRepository>;
}

describe("ListingService", () => {
    let listingRepo: jest.Mocked<ListingRepository>;
    let categoryRepo: jest.Mocked<ListingCategoryRepository>;
    let tagRepo: jest.Mocked<ListingTagRepository>;
    let configRepo: jest.Mocked<ConfigRepository>;

    beforeEach(() => {
        listingRepo = createMockListingRepo();
        categoryRepo = createMockCategoryRepo();
        tagRepo = createMockTagRepo();
        configRepo = createMockConfigRepo();
    });

    describe("getPublishedListings", () => {
        const defaultOptions: PublishedListingsFilterOptions = {
            limit: 10,
            skipId: null,
            skip: 0,
            searchTerm: null,
            tagSlugs: null,
            categorySlug: null,
            extensionType: null,
            listingKind: "extension",
            sortByKey: "created_at",
            sortByOrder: false,
            range: null,
            ownerId: null,
        };

        it("returns listingsResult and countResult from repository when no cache", async () => {
            const listings: ListingLike[] = [{ ...mockListing }];
            listingRepo.findPublishedListings.mockResolvedValue({ data: listings, count: 1 });
            const service = new ListingService(listingRepo, categoryRepo, tagRepo);
            const result = await service.getPublishedListings({ limit: 10 });
            expect(result.listingsResult).toEqual(listings);
            expect(result.countResult).toBe(1);
            expect(listingRepo.findPublishedListings).toHaveBeenCalledWith(
                expect.objectContaining({ limit: 10, listingKind: "extension" })
            );
        });

        it("normalizes options with defaults", async () => {
            listingRepo.findPublishedListings.mockResolvedValue({ data: [], count: 0 });
            const service = new ListingService(listingRepo, categoryRepo, tagRepo);
            await service.getPublishedListings({});
            expect(listingRepo.findPublishedListings).toHaveBeenCalledWith(defaultOptions);
        });

        it("uses cache key from buildPublishedListingCacheKey when cache provided", async () => {
            const payload = { listingsResult: [mockListing], countResult: 1 };
            const getOrSet = jest.fn().mockResolvedValue(payload);
            const service = new ListingService(listingRepo, categoryRepo, tagRepo, { getOrSet } as never);
            const options: PublishedListingsFilterOptions = {
                limit: 5,
                categorySlug: "ai-agents",
                searchTerm: "notes",
            };
            const result = await service.getPublishedListings(options);
            expect(result).toEqual(payload);
            const expectedKey = buildPublishedListingCacheKey(
                {
                    ...defaultOptions,
                    limit: 5,
                    categorySlug: "ai-agents",
                    searchTerm: "notes",
                },
                "listing:published:list"
            );
            expect(getOrSet).toHaveBeenCalledWith(expectedKey, expect.any(Function), 300);
            expect(listingRepo.findPublishedListings).not.toHaveBeenCalled();
        });
    });

    describe("getAdminListings", () => {
        const defaultAdminOptions: AdminListingsFilterOptions = {
            limit: 10,
            searchTerm: null,
            listingKind: null,
            sortByKey: "created_at",
            sortByOrder: false,
            range: null,
        };

        it("returns admin listings from repository", async () => {
            listingRepo.findAdminListings.mockResolvedValue({ data: [mockListing], count: 1 });
            const service = new ListingService(listingRepo, categoryRepo, tagRepo);
            const result = await service.getAdminListings({ limit: 10 });
            expect(result.listingsResult).toEqual([mockListing]);
            expect(result.countResult).toBe(1);
        });

        it("uses cache key from buildAdminListingCacheKey when cache provided", async () => {
            const payload = { listingsResult: [mockListing], countResult: 1 };
            const getOrSet = jest.fn().mockResolvedValue(payload);
            const service = new ListingService(listingRepo, categoryRepo, tagRepo, { getOrSet } as never);
            await service.getAdminListings({ limit: 5, listingKind: "stack" });
            const expectedKey = buildAdminListingCacheKey(
                { ...defaultAdminOptions, limit: 5, listingKind: "stack" },
                "listing:admin:list"
            );
            expect(getOrSet).toHaveBeenCalledWith(expectedKey, expect.any(Function), 300);
            expect(listingRepo.findAdminListings).not.toHaveBeenCalled();
        });
    });

    describe("getListingById", () => {
        it("throws ValidationError for invalid UUID", async () => {
            const service = new ListingService(listingRepo, categoryRepo, tagRepo);
            await expect(service.getListingById("not-a-uuid")).rejects.toThrow(ValidationError);
            expect(listingRepo.findListingById).not.toHaveBeenCalled();
        });

        it("returns listing from repository when no cache", async () => {
            listingRepo.findListingById.mockResolvedValue({ data: mockListing });
            const service = new ListingService(listingRepo, categoryRepo, tagRepo);
            const result = await service.getListingById(listingId);
            expect(result).toEqual(mockListing);
            expect(listingRepo.findListingById).toHaveBeenCalledWith(listingId);
        });
    });

    describe("getPublishedListingBySlug", () => {
        it("uses extension cache prefix by default", async () => {
            listingRepo.findPublishedListingBySlug.mockResolvedValue({ data: mockListing });
            const getOrSet = jest.fn().mockImplementation(async (_key, factory) => factory());
            const service = new ListingService(listingRepo, categoryRepo, tagRepo, { getOrSet } as never);
            await service.getPublishedListingBySlug(slugFromTitle);
            expect(getOrSet).toHaveBeenCalledWith(
                `listing:published:bySlug:${slugFromTitle}`,
                expect.any(Function),
                300
            );
            expect(listingRepo.findPublishedListingBySlug).toHaveBeenCalledWith(slugFromTitle, "extension");
        });

        it("uses stack cache prefix for stack kind", async () => {
            listingRepo.findPublishedListingBySlug.mockResolvedValue({ data: { ...mockListing, listing_kind: "stack" } });
            const getOrSet = jest.fn().mockImplementation(async (_key, factory) => factory());
            const service = new ListingService(listingRepo, categoryRepo, tagRepo, { getOrSet } as never);
            await service.getPublishedListingBySlug("my-stack", "stack");
            expect(getOrSet).toHaveBeenCalledWith(
                "listing:stack:bySlug:my-stack",
                expect.any(Function),
                300
            );
        });
    });

    describe("createListing", () => {
        it("creates listing with isAdminApproved false when editor and config disallows auto-approve", async () => {
            listingRepo.createListing.mockResolvedValue({
                savedListingId: listingId,
                isAdminApproved: false,
                isUserApproved: true,
            });
            const service = new ListingService(listingRepo, categoryRepo, tagRepo, undefined, undefined, configRepo);
            const result = await service.createListing(validCreateBody, ownerId, false);
            expect(result.id).toBe(listingId);
            expect(result.isAdminApproved).toBe(false);
            expect(result.isUserApproved).toBe(true);
            expect(listingRepo.createListing).toHaveBeenCalledWith(
                validCreateBody.listingData,
                validCreateBody.listingTagsData,
                ownerId,
                false
            );
        });

        it("creates listing with isAdminApproved true when platform admin sets is_admin_published", async () => {
            listingRepo.createListing.mockResolvedValue({
                savedListingId: listingId,
                isAdminApproved: true,
                isUserApproved: true,
            });
            const service = new ListingService(listingRepo, categoryRepo, tagRepo, undefined, undefined, configRepo);
            const body: ListingCreateBodySchemaType = {
                ...validCreateBody,
                listingData: { ...validCreateBody.listingData, is_admin_published: true },
            };
            const result = await service.createListing(body, ownerId, true);
            expect(result.isAdminApproved).toBe(true);
            expect(listingRepo.createListing).toHaveBeenCalledWith(
                expect.objectContaining({ is_admin_published: true }),
                body.listingTagsData,
                ownerId,
                true
            );
        });

        it("auto-approves when PRE_ADMIN_APPROVE_NEW_LISTINGS is true", async () => {
            configRepo.getConfigByModuleNameAndProperties.mockResolvedValue({
                result: { PRE_ADMIN_APPROVE_NEW_LISTINGS: "true", PRE_ADMIN_APPROVE_UPDATED_LISTINGS: "true" },
                error: null,
            });
            listingRepo.createListing.mockResolvedValue({
                savedListingId: listingId,
                isAdminApproved: true,
                isUserApproved: true,
            });
            const service = new ListingService(listingRepo, categoryRepo, tagRepo, undefined, undefined, configRepo);
            await service.createListing(validCreateBody, ownerId, false);
            expect(listingRepo.createListing).toHaveBeenCalledWith(
                validCreateBody.listingData,
                validCreateBody.listingTagsData,
                ownerId,
                true
            );
        });

        it("invalidates listing caches after create", async () => {
            listingRepo.createListing.mockResolvedValue({
                savedListingId: listingId,
                isAdminApproved: false,
                isUserApproved: true,
            });
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const service = new ListingService(listingRepo, categoryRepo, tagRepo, undefined, {
                invalidateKey,
                invalidatePattern,
            } as never, configRepo);
            await service.createListing(validCreateBody, ownerId, false);
            expect(invalidateKey).toHaveBeenCalledWith(`listing:byId:${listingId}`);
            expect(invalidatePattern).toHaveBeenCalledWith("listing:published:list:*");
            expect(invalidatePattern).toHaveBeenCalledWith("listing:published:bySlug:*");
            expect(invalidateKey).toHaveBeenCalledWith("listing:creators");
        });
    });

    describe("updateListing", () => {
        it("allows platform admin to explicitly approve pending listing", async () => {
            listingRepo.findListingById.mockResolvedValue({
                data: { ...mockListing, is_admin_published: false },
            });
            listingRepo.updateListing.mockResolvedValue({
                savedListingId: listingId,
                isAdminApproved: true,
                isUserApproved: true,
            });
            const service = new ListingService(listingRepo, categoryRepo, tagRepo, undefined, undefined, configRepo);
            const result = await service.updateListing(validUpdateBody, ownerId, true);
            expect(result.isAdminApproved).toBe(true);
            expect(listingRepo.updateListing).toHaveBeenCalledWith(
                validUpdateBody.listingData,
                validUpdateBody.listingTagsData,
                ownerId,
                true
            );
        });

        it("clears admin published when user unpublishes", async () => {
            listingRepo.findListingById.mockResolvedValue({
                data: { ...mockListing, is_admin_published: true },
            });
            listingRepo.updateListing.mockResolvedValue({
                savedListingId: listingId,
                isAdminApproved: false,
                isUserApproved: false,
            });
            const service = new ListingService(listingRepo, categoryRepo, tagRepo, undefined, undefined, configRepo);
            const body: ListingUpdateBodySchemaType = {
                ...validUpdateBody,
                listingData: { ...validUpdateBody.listingData, is_user_published: false },
            };
            await service.updateListing(body, ownerId, false);
            expect(listingRepo.updateListing).toHaveBeenCalledWith(
                expect.objectContaining({ is_user_published: false }),
                body.listingTagsData,
                ownerId,
                false
            );
        });
    });

    describe("incrementStatCounter", () => {
        it("increments counter, records activity, and invalidates stat caches", async () => {
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const service = new ListingService(listingRepo, categoryRepo, tagRepo, undefined, {
                invalidateKey,
                invalidatePattern,
            } as never);
            await service.incrementStatCounter(listingId, "views", ownerId);
            expect(listingRepo.incrementStatCounter).toHaveBeenCalledWith(listingId, "views");
            expect(listingRepo.insertListingActivity).toHaveBeenCalledWith(listingId, "views", ownerId);
            expect(invalidateKey).toHaveBeenCalledWith(`listing:byId:${listingId}`);
            expect(invalidatePattern).toHaveBeenCalledWith("listing:published:list:*");
        });
    });

    describe("getSkillMarkdown", () => {
        it("delegates to repository getSkillMarkdownContent", async () => {
            listingRepo.getSkillMarkdownContent.mockResolvedValue(skillContent);
            const service = new ListingService(listingRepo, categoryRepo, tagRepo);
            const result = await service.getSkillMarkdown(slugFromTitle);
            expect(result).toBe(skillContent);
            expect(listingRepo.getSkillMarkdownContent).toHaveBeenCalledWith(slugFromTitle);
        });
    });

    describe("getListingInformation", () => {
        it("loads module config from config repository", async () => {
            configRepo.getConfigByModuleNameAndProperties.mockResolvedValue({
                result: {
                    EXTENSIONS_META_TITLE: "Extensions Hub",
                    EXTENSIONS_META_DESCRIPTION: "Browse extensions",
                },
                error: null,
            });
            const service = new ListingService(listingRepo, categoryRepo, tagRepo, undefined, undefined, configRepo);
            const result = await service.getListingInformation();
            expect(result.EXTENSIONS_META_TITLE).toBe("Extensions Hub");
            expect(configRepo.getConfigByModuleNameAndProperties).toHaveBeenCalledWith({
                moduleName: "listings",
                properties: ["EXTENSIONS_META_TITLE", "EXTENSIONS_META_DESCRIPTION", "LISTING_SCHEMA_TYPE"],
            });
        });
    });

    describe("bookmarks", () => {
        const secondListing: ListingLike = {
            ...mockListing,
            id: secondListingId,
            title: "Second extension",
            slug: "second-extension",
        };

        function createMockSubscriptionGuard(): jest.Mocked<SubscriptionGuardService> {
            return {
                assert: jest.fn().mockResolvedValue(undefined),
            } as unknown as jest.Mocked<SubscriptionGuardService>;
        }

        it("returns both bookmarked listings for the user dashboard", async () => {
            listingRepo.findBookmarkedListingsByUserId.mockResolvedValue({
                data: [mockListing, secondListing],
            });
            const service = new ListingService(listingRepo, categoryRepo, tagRepo);
            const result = await service.getUserBookmarks(userId);
            expect(result).toHaveLength(2);
            expect(result.map((listing) => listing.id)).toEqual([listingId, secondListingId]);
            expect(listingRepo.findBookmarkedListingsByUserId).toHaveBeenCalledWith(userId);
        });

        it("returns a single listing after one of two bookmarks is removed", async () => {
            listingRepo.findBookmarkedListingsByUserId.mockResolvedValue({
                data: [secondListing],
            });
            const service = new ListingService(listingRepo, categoryRepo, tagRepo);
            await service.removeBookmark(listingId, userId);
            const result = await service.getUserBookmarks(userId);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(secondListingId);
            expect(listingRepo.removeBookmark).toHaveBeenCalledWith(userId, listingId);
        });

        it("adds bookmark, records activity, and invalidates user bookmark cache", async () => {
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const service = new ListingService(listingRepo, categoryRepo, tagRepo, undefined, {
                invalidateKey,
                invalidatePattern,
            } as never);
            await service.addBookmark(listingId, userId);
            expect(listingRepo.addBookmark).toHaveBeenCalledWith(userId, listingId);
            expect(listingRepo.insertListingActivity).toHaveBeenCalledWith(listingId, "bookmark", userId);
            expect(invalidateKey).toHaveBeenCalledWith(`listing:bookmarks:user:${userId}`);
            expect(invalidateKey).toHaveBeenCalledWith(`listing:byId:${listingId}`);
        });

        it("uses per-user cache key for getUserBookmarks when cache provided", async () => {
            const bookmarks = [mockListing, secondListing];
            const getOrSet = jest.fn().mockResolvedValue(bookmarks);
            const service = new ListingService(listingRepo, categoryRepo, tagRepo, { getOrSet } as never);
            const result = await service.getUserBookmarks(userId);
            expect(result).toEqual(bookmarks);
            expect(getOrSet).toHaveBeenCalledWith(
                `listing:bookmarks:user:${userId}`,
                expect.any(Function),
                300
            );
            expect(listingRepo.findBookmarkedListingsByUserId).not.toHaveBeenCalled();
        });

        it("asserts community_features when subscription guard and auth user id are provided", async () => {
            const subscriptionGuard = createMockSubscriptionGuard();
            listingRepo.findBookmarkedListingsByUserId.mockResolvedValue({ data: [mockListing] });
            const service = new ListingService(
                listingRepo,
                categoryRepo,
                tagRepo,
                undefined,
                undefined,
                undefined,
                subscriptionGuard
            );
            await service.getUserBookmarks(userId, userId);
            expect(subscriptionGuard.assert).toHaveBeenCalledWith(SubscriptionSection.COMMUNITY_FEATURES, {
                scope: "account",
                authUserId: userId,
            });
        });
    });
});
