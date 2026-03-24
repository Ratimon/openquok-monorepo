import { faker } from "@faker-js/faker";
import { BlogService } from "./BlogService";
import type { BlogRepository } from "../repositories/BlogRepository";
import type {
    PublishedBlogPostsFilterOptions,
    AdminBlogPostsFilterOptions,
    PublishedBlogAuthor,
} from "../data/types/blogTypes";
import type { BlogPostLike } from "../utils/dtos/BlogDTO";
import {
    buildPublishedBlogCacheKey,
    buildAdminBlogCacheKey,
    buildAdminBlogCommentsCacheKey,
    buildAdminBlogActivitiesCacheKey,
} from "../utils/dtos/BlogDTO";
import type {
    BlogPostCreateSchemaType,
    BlogPostUpdateSchemaType,
    BlogTopicCreateSchemaType,
    BlogTopicUpdateSchemaType,
    BlogCommentCreateSchemaType,
    BlogCommentUpdateSchemaType,
} from "../data/schemas/blogSchemas";
import { ValidationError } from "../errors/InfraError";
import { stringToSlug } from "../utils/slug";

const topicId = faker.string.uuid();
const postId = faker.string.uuid();
const userId = faker.string.uuid();
const createdAt = faker.date.past().toISOString();
const title = faker.lorem.sentence(3);
const updatedTitle = faker.lorem.sentence(4);
const description = faker.lorem.paragraph();
const content = faker.lorem.paragraphs(2);
const slugFromTitle = stringToSlug(title);
const slugFromUpdatedTitle = stringToSlug(updatedTitle);

const validCreatePayload: BlogPostCreateSchemaType = {
    title,
    description,
    content,
    topic_id: topicId,
    is_user_published: true,
    is_admin_approved: false,
    is_sponsored: false,
    is_featured: false,
};

const validUpdatePayload: BlogPostUpdateSchemaType = {
    ...validCreatePayload,
    title: updatedTitle,
};

const mockBlogPost: BlogPostLike = {
    id: postId,
    user_id: userId,
    title,
    description,
    slug: slugFromTitle,
    content,
    is_sponsored: false,
    is_featured: false,
    is_admin_approved: false,
    is_user_published: true,
    created_at: createdAt,
    updated_at: null,
    published_at: null,
    topic_id: topicId,
    topic: null,
    author: null,
    hero_image_filename: null,
    reading_time_minutes: null,
    view_count: 0,
    like_count: 0,
};

const mockPublishedAuthor: PublishedBlogAuthor = {
    id: userId,
    full_name: "Jane Doe",
    username: null,
    avatar_url: "https://example.com/avatar.png",
    website: "https://jane.example.com",
    tag_line: "Diver and writer",
    post_count: 3,
};

const topicIdForTopic = faker.string.uuid();
const topicName = faker.lorem.words(2);
const topicSlug = stringToSlug(topicName);
const validTopicCreatePayload: BlogTopicCreateSchemaType = {
    name: topicName,
    description: faker.lorem.sentence(),
    parent_id: undefined,
};
const validTopicUpdatePayload: BlogTopicUpdateSchemaType = {
    ...validTopicCreatePayload,
    name: faker.lorem.words(3),
};

const commentId = faker.string.uuid();
const commentContent = faker.lorem.sentence();
const validCommentCreatePayload: BlogCommentCreateSchemaType = {
    post_id: postId,
    content: commentContent,
};
const validCommentCreatePayloadWithParent: BlogCommentCreateSchemaType = {
    ...validCommentCreatePayload,
    parent_id: faker.string.uuid(),
};
const validCommentUpdatePayload: BlogCommentUpdateSchemaType = {
    content: faker.lorem.sentence(),
};

function createMockBlogRepo(): jest.Mocked<BlogRepository> {
    return {
        findPublishedBlogPosts: jest.fn(),
        findAdminBlogPosts: jest.fn(),
        findPublishedBlogPostBySlug: jest.fn(),
        findBlogPostByBlogId: jest.fn(),
        getPublishedBlogAuthors: jest.fn(),
        createOne: jest.fn(),
        updateOne: jest.fn(),
        findBlogTopics: jest.fn(),
        findActiveBlogTopics: jest.fn(),
        createTopic: jest.fn(),
        updateTopic: jest.fn(),
        createComment: jest.fn(),
        updateComment: jest.fn(),
        findPostComments: jest.fn(),
        findAdminBlogComments: jest.fn(),
        approveComment: jest.fn(),
        insertBlogActivity: jest.fn(),
        findAdminBlogActivities: jest.fn(),
        deleteBlogPost: jest.fn(),
        deleteBlogTopic: jest.fn(),
        deleteComment: jest.fn(),
    } as unknown as jest.Mocked<BlogRepository>;
}

describe("BlogService", () => {
    let repo: jest.Mocked<BlogRepository>;

    beforeEach(() => {
        repo = createMockBlogRepo();
    });

    describe("getPublishedBlogPosts", () => {
        const defaultOptions: PublishedBlogPostsFilterOptions = {
            limit: 10,
            skip: 0,
            skipId: null,
            searchTerm: null,
            topicId: null,
            sortByKey: "published_at",
            sortByOrder: false,
            range: null,
            authorId: null,
        };

        it("returns postsResult and countResult from repository when no cache", async () => {
            const posts: BlogPostLike[] = [{ ...mockBlogPost }];
            const count = 1;
            repo.findPublishedBlogPosts.mockResolvedValue({ data: posts, count });
            const service = new BlogService(repo);
            const result = await service.getPublishedBlogPosts({ limit: 10 });
            expect(result.postsResult).toEqual(posts);
            expect(result.countResult).toBe(count);
            expect(repo.findPublishedBlogPosts).toHaveBeenCalledWith(
                expect.objectContaining({ limit: 10, skip: 0, sortByKey: "published_at" })
            );
        });

        it("normalizes options with defaults", async () => {
            const posts: BlogPostLike[] = [];
            repo.findPublishedBlogPosts.mockResolvedValue({ data: posts, count: 0 });
            const service = new BlogService(repo);
            await service.getPublishedBlogPosts({});
            expect(repo.findPublishedBlogPosts).toHaveBeenCalledWith(defaultOptions);
        });

        it("uses cache key from buildPublishedBlogCacheKey when cache provided", async () => {
            const payload = { postsResult: [mockBlogPost], countResult: 1 };
            const getOrSet = jest.fn().mockResolvedValue(payload);
            const service = new BlogService(repo, { getOrSet } as never);
            const options: PublishedBlogPostsFilterOptions = {
                limit: 5,
                skip: 0,
                topicId: "topic-1",
                searchTerm: "foo",
            };
            const result = await service.getPublishedBlogPosts(options);
            expect(result).toEqual(payload);
            const expectedKey = buildPublishedBlogCacheKey({
                ...defaultOptions,
                limit: 5,
                topicId: "topic-1",
                searchTerm: "foo",
            });
            expect(getOrSet).toHaveBeenCalledWith(expectedKey, expect.any(Function), 300);
            expect(repo.findPublishedBlogPosts).not.toHaveBeenCalled();
        });

        it("calls repository when cache misses", async () => {
            const posts: BlogPostLike[] = [{ ...mockBlogPost }];
            repo.findPublishedBlogPosts.mockResolvedValue({ data: posts, count: 1 });
            const getOrSet = jest.fn().mockImplementation(async (_key, factory) => factory());
            const service = new BlogService(repo, { getOrSet } as never);
            const result = await service.getPublishedBlogPosts({ limit: 20 });
            expect(result.postsResult).toEqual(posts);
            expect(result.countResult).toBe(1);
            expect(repo.findPublishedBlogPosts).toHaveBeenCalledWith(
                expect.objectContaining({ limit: 20 })
            );
        });
    });

    describe("getAdminBlogPosts", () => {
        const defaultAdminOptions: AdminBlogPostsFilterOptions = {
            limit: 10,
            searchTerm: null,
            topicId: null,
            sortByKey: "created_at",
            sortByOrder: false,
            range: null,
        };

        it("returns postsResult and countResult from repository when no cache", async () => {
            const posts: BlogPostLike[] = [{ ...mockBlogPost }];
            const count = 1;
            repo.findAdminBlogPosts.mockResolvedValue({ data: posts, count });
            const service = new BlogService(repo);
            const result = await service.getAdminBlogPosts({ limit: 10 });
            expect(result.postsResult).toEqual(posts);
            expect(result.countResult).toBe(count);
            expect(repo.findAdminBlogPosts).toHaveBeenCalledWith(
                expect.objectContaining({ limit: 10, sortByKey: "created_at" })
            );
        });

        it("normalizes options with defaults", async () => {
            const posts: BlogPostLike[] = [];
            repo.findAdminBlogPosts.mockResolvedValue({ data: posts, count: 0 });
            const service = new BlogService(repo);
            await service.getAdminBlogPosts({});
            expect(repo.findAdminBlogPosts).toHaveBeenCalledWith(defaultAdminOptions);
        });

        it("uses cache key from buildAdminBlogCacheKey when cache provided", async () => {
            const payload = { postsResult: [mockBlogPost], countResult: 1 };
            const getOrSet = jest.fn().mockResolvedValue(payload);
            const service = new BlogService(repo, { getOrSet } as never);
            const options: AdminBlogPostsFilterOptions = {
                limit: 5,
                topicId: "topic-1",
                searchTerm: "foo",
            };
            const result = await service.getAdminBlogPosts(options);
            expect(result).toEqual(payload);
            const expectedKey = buildAdminBlogCacheKey({
                ...defaultAdminOptions,
                limit: 5,
                topicId: "topic-1",
                searchTerm: "foo",
            });
            expect(getOrSet).toHaveBeenCalledWith(expectedKey, expect.any(Function), 300);
            expect(repo.findAdminBlogPosts).not.toHaveBeenCalled();
        });

        it("calls repository when cache misses", async () => {
            const posts: BlogPostLike[] = [{ ...mockBlogPost }];
            repo.findAdminBlogPosts.mockResolvedValue({ data: posts, count: 1 });
            const getOrSet = jest.fn().mockImplementation(async (_key, factory) => factory());
            const service = new BlogService(repo, { getOrSet } as never);
            const result = await service.getAdminBlogPosts({ limit: 20, sortByKey: "updated_at" });
            expect(result.postsResult).toEqual(posts);
            expect(result.countResult).toBe(1);
            expect(repo.findAdminBlogPosts).toHaveBeenCalledWith(
                expect.objectContaining({ limit: 20, sortByKey: "updated_at" })
            );
        });
    });

    describe("getAdminBlogComments", () => {
        const defaultAdminCommentsOptions = {
            limit: 10,
            searchTerm: null as string | null,
            sortByKey: "created_at" as const,
            sortByOrder: false,
            range: null as { start: number; end: number } | null,
        };
        const adminComments = [
            {
                id: commentId,
                content: commentContent,
                is_approved: false,
                created_at: createdAt,
                updated_at: null,
                parent_id: null,
                user_id: userId,
                post_id: postId,
                author: { id: userId, full_name: "Jane", avatar_url: null },
                blog_post: null,
            },
        ];

        it("returns comments and count from repository when no cache", async () => {
            repo.findAdminBlogComments.mockResolvedValue({ data: adminComments, count: 1 });
            const service = new BlogService(repo);
            const result = await service.getAdminBlogComments({ limit: 10 });
            expect(result.commentsResult).toEqual(adminComments);
            expect(result.countResult).toBe(1);
            expect(repo.findAdminBlogComments).toHaveBeenCalledWith(
                expect.objectContaining({ limit: 10, sortByKey: "created_at" })
            );
        });

        it("uses cache key from buildAdminBlogCommentsCacheKey when cache provided", async () => {
            const payload = { commentsResult: adminComments, countResult: 1 };
            const getOrSet = jest.fn().mockResolvedValue(payload);
            const service = new BlogService(repo, { getOrSet } as never);
            await service.getAdminBlogComments({ limit: 5, searchTerm: "foo" });
            const expectedKey = buildAdminBlogCommentsCacheKey(
                { ...defaultAdminCommentsOptions, limit: 5, searchTerm: "foo" },
                "blog:admin:comments:list"
            );
            expect(getOrSet).toHaveBeenCalledWith(expectedKey, expect.any(Function), 300);
            expect(repo.findAdminBlogComments).not.toHaveBeenCalled();
        });
    });

    describe("getAdminBlogActivities", () => {
        const defaultAdminActivitiesOptions = {
            limit: 10,
            sortByKey: "created_at" as const,
            sortByOrder: false,
            range: null as { start: number; end: number } | null,
            post_id: null as string | null,
            activity_type: null as "view" | "like" | "share" | "comment" | null,
        };
        const adminActivities = [
            {
                id: faker.string.uuid(),
                activity_type: "comment" as const,
                created_at: createdAt,
                user_id: userId,
                post_id: postId,
                author: { id: userId, full_name: "Jane", avatar_url: null },
                blog_post: { id: postId, title, slug: slugFromTitle },
            },
        ];

        it("returns activities and count from repository when no cache", async () => {
            repo.findAdminBlogActivities.mockResolvedValue({ data: adminActivities, count: 1 });
            const service = new BlogService(repo);
            const result = await service.getAdminBlogActivities({ limit: 10 });
            expect(result.activitiesResult).toEqual(adminActivities);
            expect(result.countResult).toBe(1);
            expect(repo.findAdminBlogActivities).toHaveBeenCalledWith(
                expect.objectContaining({ limit: 10, sortByKey: "created_at" })
            );
        });

        it("uses cache key from buildAdminBlogActivitiesCacheKey when cache provided", async () => {
            const payload = { activitiesResult: adminActivities, countResult: 1 };
            const getOrSet = jest.fn().mockResolvedValue(payload);
            const service = new BlogService(repo, { getOrSet } as never);
            await service.getAdminBlogActivities({ limit: 5, post_id: postId });
            const expectedKey = buildAdminBlogActivitiesCacheKey(
                { ...defaultAdminActivitiesOptions, limit: 5, post_id: postId },
                "blog:admin:activities:list"
            );
            expect(getOrSet).toHaveBeenCalledWith(expectedKey, expect.any(Function), 300);
            expect(repo.findAdminBlogActivities).not.toHaveBeenCalled();
        });
    });

    describe("trackBlogActivity", () => {
        it("calls insertBlogActivity and invalidates blog:admin:activities:list:* when cacheInvalidator provided", async () => {
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const service = new BlogService(repo, undefined, { invalidatePattern } as never);
            await service.trackBlogActivity(postId, "comment", userId);
            expect(repo.insertBlogActivity).toHaveBeenCalledWith(postId, "comment", userId);
            expect(invalidatePattern).toHaveBeenCalledWith("blog:admin:activities:list:*");
        });

        it("calls insertBlogActivity with null user_id for anonymous", async () => {
            const service = new BlogService(repo);
            await service.trackBlogActivity(postId, "view", null);
            expect(repo.insertBlogActivity).toHaveBeenCalledWith(postId, "view", null);
        });
    });

    describe("getPublishedBlogPostBySlug", () => {
        const slug = "my-published-post-slug";

        it("returns post from repository when no cache", async () => {
            const publishedPost = { ...mockBlogPost, slug, is_admin_approved: true };
            repo.findPublishedBlogPostBySlug.mockResolvedValue({ data: publishedPost });
            const service = new BlogService(repo);
            const result = await service.getPublishedBlogPostBySlug(slug);
            expect(result).toEqual(publishedPost);
            expect(repo.findPublishedBlogPostBySlug).toHaveBeenCalledWith(slug);
        });

        it("returns null when repository returns null (post not found or not published)", async () => {
            repo.findPublishedBlogPostBySlug.mockResolvedValue({ data: null });
            const service = new BlogService(repo);
            const result = await service.getPublishedBlogPostBySlug(slug);
            expect(result).toBeNull();
            expect(repo.findPublishedBlogPostBySlug).toHaveBeenCalledWith(slug);
        });

        it("uses cache when provided (cache hit)", async () => {
            const publishedPost = { ...mockBlogPost, slug };
            const getOrSet = jest.fn().mockResolvedValue(publishedPost);
            const service = new BlogService(repo, { getOrSet } as never);
            const result = await service.getPublishedBlogPostBySlug(slug);
            expect(result).toEqual(publishedPost);
            expect(getOrSet).toHaveBeenCalledWith(
                `blog:published:bySlug:${slug}`,
                expect.any(Function),
                300
            );
            expect(repo.findPublishedBlogPostBySlug).not.toHaveBeenCalled();
        });

        it("calls repository when cache misses", async () => {
            const publishedPost = { ...mockBlogPost, slug };
            repo.findPublishedBlogPostBySlug.mockResolvedValue({ data: publishedPost });
            const getOrSet = jest.fn().mockImplementation(async (_key, factory) => factory());
            const service = new BlogService(repo, { getOrSet } as never);
            const result = await service.getPublishedBlogPostBySlug(slug);
            expect(result).toEqual(publishedPost);
            expect(getOrSet).toHaveBeenCalledWith(
                `blog:published:bySlug:${slug}`,
                expect.any(Function),
                300
            );
            expect(repo.findPublishedBlogPostBySlug).toHaveBeenCalledWith(slug);
        });
    });

    describe("getBlogPostById", () => {
        it("throws ValidationError for invalid UUID", async () => {
            const service = new BlogService(repo);
            await expect(service.getBlogPostById("not-a-uuid")).rejects.toThrow(
                ValidationError
            );
            expect(repo.findBlogPostByBlogId).not.toHaveBeenCalled();
        });

        it("returns post from repository when no cache", async () => {
            repo.findBlogPostByBlogId.mockResolvedValue({
                data: { ...mockBlogPost },
            });
            const service = new BlogService(repo);
            const result = await service.getBlogPostById(postId);
            expect(result).toEqual(mockBlogPost);
            expect(repo.findBlogPostByBlogId).toHaveBeenCalledWith(postId);
        });

        it("returns post with topic and author (user_profiles) from repository", async () => {
            const topic = { id: topicId, name: "Diving", slug: "diving" };
            const authorWithProfiles = {
                id: userId,
                full_name: "Jane Doe",
                user_profiles: {
                    avatar_url: "https://example.com/avatar.png",
                    website_url: "https://jane.example.com",
                    tag_line: "Diver and writer",
                },
            };
            const postWithTopicAndAuthor: BlogPostLike = {
                ...mockBlogPost,
                topic,
                author: authorWithProfiles,
            };
            repo.findBlogPostByBlogId.mockResolvedValue({ data: postWithTopicAndAuthor });
            const service = new BlogService(repo);
            const result = await service.getBlogPostById(postId);
            expect(result).not.toBeNull();
            expect(result).toMatchObject({
                id: postId,
                topic_id: topicId,
                topic: { id: topic.id, name: topic.name, slug: topic.slug },
                author: {
                    id: userId,
                    full_name: "Jane Doe",
                    user_profiles: {
                        avatar_url: authorWithProfiles.user_profiles.avatar_url,
                        website_url: authorWithProfiles.user_profiles.website_url,
                        tag_line: authorWithProfiles.user_profiles.tag_line,
                    },
                },
            });
            expect(repo.findBlogPostByBlogId).toHaveBeenCalledWith(postId);
        });

        it("uses cache when provided", async () => {
            const getOrSet = jest.fn().mockResolvedValue({ ...mockBlogPost });
            const service = new BlogService(repo, { getOrSet } as never);
            const result = await service.getBlogPostById(postId);
            expect(result).toEqual(mockBlogPost);
            expect(getOrSet).toHaveBeenCalledWith(
                `blog:byBlogId:${postId}`,
                expect.any(Function),
                300
            );
            expect(repo.findBlogPostByBlogId).not.toHaveBeenCalled();
        });

        it("calls repository when cache misses", async () => {
            repo.findBlogPostByBlogId.mockResolvedValue({
                data: { ...mockBlogPost },
            });
            const getOrSet = jest.fn().mockImplementation(async (_key, factory) => factory());
            const service = new BlogService(repo, { getOrSet } as never);
            const result = await service.getBlogPostById(postId);
            expect(result).toEqual(mockBlogPost);
            expect(getOrSet).toHaveBeenCalledWith(
                `blog:byBlogId:${postId}`,
                expect.any(Function),
                300
            );
            expect(repo.findBlogPostByBlogId).toHaveBeenCalledWith(postId);
        });
    });

    describe("createBlogPost", () => {
        it("creates post with isAdminApproved false when not super admin", async () => {
            repo.createOne.mockResolvedValue({
                savedBlogPostId: postId,
                title: validCreatePayload.title,
                slug: slugFromTitle,
                isAdminApproved: false,
                isUserApproved: true,
            });
            repo.findBlogPostByBlogId.mockResolvedValue({
                data: { ...mockBlogPost, id: postId, title: validCreatePayload.title, slug: slugFromTitle },
            });
            const service = new BlogService(repo);
            const result = await service.createBlogPost(
                validCreatePayload,
                userId,
                false
            );
            expect(result.id).toBe(postId);
            expect(result.isAdminApproved).toBe(false);
            expect(result.isUserApproved).toBe(true);
            expect(repo.createOne).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: validCreatePayload.title,
                    is_user_published: true,
                    is_admin_approved: false,
                }),
                userId,
                slugFromTitle,
                false
            );
        });

        it("creates post with isAdminApproved true when super admin and is_user_published", async () => {
            repo.createOne.mockResolvedValue({
                savedBlogPostId: postId,
                title: validCreatePayload.title,
                slug: slugFromTitle,
                isAdminApproved: true,
                isUserApproved: true,
            });
            repo.findBlogPostByBlogId.mockResolvedValue({
                data: { ...mockBlogPost, id: postId, slug: slugFromTitle },
            });
            const service = new BlogService(repo);
            const result = await service.createBlogPost(
                validCreatePayload,
                userId,
                true
            );
            expect(result.isAdminApproved).toBe(true);
            expect(repo.createOne).toHaveBeenCalledWith(
                expect.objectContaining({ is_admin_approved: true }),
                userId,
                slugFromTitle,
                true
            );
        });

        it("calls findBlogPostByBlogId and invalidates cache after create", async () => {
            repo.createOne.mockResolvedValue({
                savedBlogPostId: postId,
                title: validCreatePayload.title,
                slug: slugFromTitle,
                isAdminApproved: false,
                isUserApproved: true,
            });
            repo.findBlogPostByBlogId.mockResolvedValue({
                data: { ...mockBlogPost, id: postId, slug: slugFromTitle },
            });
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const invalidateEntity = jest.fn().mockResolvedValue(undefined);
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const service = new BlogService(repo, undefined, {
                invalidateKey,
                invalidateEntity,
                invalidatePattern,
            } as never);
            await service.createBlogPost(validCreatePayload, userId, false);
            expect(repo.findBlogPostByBlogId).toHaveBeenCalledWith(postId);
            expect(invalidateKey).toHaveBeenCalledWith(`blog:byBlogId:${postId}`);
            expect(invalidateKey).toHaveBeenCalledWith("blog:published:authors");
            expect(invalidateKey).toHaveBeenCalledWith("blog:topics:active");
            expect(invalidateEntity).toHaveBeenCalledWith("blog", postId);
            expect(invalidatePattern).toHaveBeenCalledWith("blog:published:blog:*");
            expect(invalidatePattern).toHaveBeenCalledWith("blog:published:bySlug:*");
            expect(invalidatePattern).toHaveBeenCalledWith("blog:admin:list:*");
        });
    });

    describe("getPublishedBlogAuthors", () => {
        it("returns authors from repository when no cache", async () => {
            const authors: PublishedBlogAuthor[] = [{ ...mockPublishedAuthor }];
            repo.getPublishedBlogAuthors.mockResolvedValue({ data: authors });
            const service = new BlogService(repo);
            const result = await service.getPublishedBlogAuthors();
            expect(result).toEqual(authors);
            expect(repo.getPublishedBlogAuthors).toHaveBeenCalled();
        });

        it("returns empty array when repository returns empty", async () => {
            repo.getPublishedBlogAuthors.mockResolvedValue({ data: [] });
            const service = new BlogService(repo);
            const result = await service.getPublishedBlogAuthors();
            expect(result).toEqual([]);
            expect(repo.getPublishedBlogAuthors).toHaveBeenCalled();
        });

        it("uses cache when provided (cache hit)", async () => {
            const authors: PublishedBlogAuthor[] = [{ ...mockPublishedAuthor }];
            const getOrSet = jest.fn().mockResolvedValue(authors);
            const service = new BlogService(repo, { getOrSet } as never);
            const result = await service.getPublishedBlogAuthors();
            expect(result).toEqual(authors);
            expect(getOrSet).toHaveBeenCalledWith(
                "blog:published:authors",
                expect.any(Function),
                300
            );
            expect(repo.getPublishedBlogAuthors).not.toHaveBeenCalled();
        });

        it("calls repository when cache misses", async () => {
            const authors: PublishedBlogAuthor[] = [{ ...mockPublishedAuthor }];
            repo.getPublishedBlogAuthors.mockResolvedValue({ data: authors });
            const getOrSet = jest.fn().mockImplementation(async (_key, factory) => factory());
            const service = new BlogService(repo, { getOrSet } as never);
            const result = await service.getPublishedBlogAuthors();
            expect(result).toEqual(authors);
            expect(getOrSet).toHaveBeenCalledWith(
                "blog:published:authors",
                expect.any(Function),
                300
            );
            expect(repo.getPublishedBlogAuthors).toHaveBeenCalled();
        });
    });

    describe("updateBlogPost", () => {
        const updatePostId = faker.string.uuid();

        it("updates post and returns saved data", async () => {
            repo.updateOne.mockResolvedValue({
                savedBlogPostId: updatePostId,
                title: validUpdatePayload.title,
                slug: slugFromUpdatedTitle,
                isAdminApproved: false,
                isUserApproved: true,
            });
            repo.findBlogPostByBlogId.mockResolvedValue({
                data: {
                    ...mockBlogPost,
                    id: updatePostId,
                    title: validUpdatePayload.title,
                    slug: slugFromUpdatedTitle,
                },
            });
            const service = new BlogService(repo);
            const result = await service.updateBlogPost(
                { ...validUpdatePayload, id: updatePostId },
                false
            );
            expect(result.id).toBe(updatePostId);
            expect(result.title).toBe(validUpdatePayload.title);
            expect(result.slug).toBe(slugFromUpdatedTitle);
            expect(result.isAdminApproved).toBe(false);
            expect(repo.updateOne).toHaveBeenCalledWith(
                updatePostId,
                expect.objectContaining({
                    title: validUpdatePayload.title,
                    is_admin_approved: false,
                }),
                slugFromUpdatedTitle,
                false,
                expect.any(String)
            );
        });

        it("passes isAdminApproved true when super admin and is_user_published", async () => {
            repo.updateOne.mockResolvedValue({
                savedBlogPostId: updatePostId,
                title: validUpdatePayload.title,
                slug: slugFromUpdatedTitle,
                isAdminApproved: true,
                isUserApproved: true,
            });
            repo.findBlogPostByBlogId.mockResolvedValue({
                data: { ...mockBlogPost, id: updatePostId, slug: slugFromUpdatedTitle },
            });
            const service = new BlogService(repo);
            await service.updateBlogPost(
                { ...validUpdatePayload, is_user_published: true, id: updatePostId },
                true
            );
            expect(repo.updateOne).toHaveBeenCalledWith(
                updatePostId,
                expect.objectContaining({ is_admin_approved: true }),
                slugFromUpdatedTitle,
                true,
                expect.any(String)
            );
        });

        it("calls findBlogPostByBlogId and invalidates cache after update", async () => {
            repo.updateOne.mockResolvedValue({
                savedBlogPostId: updatePostId,
                title: validUpdatePayload.title,
                slug: slugFromUpdatedTitle,
                isAdminApproved: false,
                isUserApproved: true,
            });
            repo.findBlogPostByBlogId.mockResolvedValue({
                data: {
                    ...mockBlogPost,
                    id: updatePostId,
                    title: validUpdatePayload.title,
                    slug: slugFromUpdatedTitle,
                },
            });
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const invalidateEntity = jest.fn().mockResolvedValue(undefined);
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const service = new BlogService(repo, undefined, {
                invalidateKey,
                invalidateEntity,
                invalidatePattern,
            } as never);
            await service.updateBlogPost({ ...validUpdatePayload, id: updatePostId }, false);
            expect(repo.findBlogPostByBlogId).toHaveBeenCalledWith(updatePostId);
            expect(invalidateKey).toHaveBeenCalledWith(`blog:byBlogId:${updatePostId}`);
            expect(invalidateKey).toHaveBeenCalledWith("blog:published:authors");
            expect(invalidateKey).toHaveBeenCalledWith("blog:topics:active");
            expect(invalidateEntity).toHaveBeenCalledWith("blog", updatePostId);
            expect(invalidatePattern).toHaveBeenCalledWith("blog:published:blog:*");
            expect(invalidatePattern).toHaveBeenCalledWith("blog:published:bySlug:*");
            expect(invalidatePattern).toHaveBeenCalledWith("blog:admin:list:*");
        });
    });

    describe("getBlogTopics", () => {
        const otherTopicId = faker.string.uuid();
        const parentTopic = { id: topicIdForTopic, name: topicName, slug: topicSlug, description: "Parent topic desc", parent_id: null, parent: null };
        const childTopic = {
            id: otherTopicId,
            name: "Other Topic",
            slug: "other-topic",
            description: "Child topic desc",
            parent_id: topicIdForTopic,
            parent: { id: topicIdForTopic, name: topicName, slug: topicSlug },
        };
        const mockTopics = [parentTopic, childTopic];

        it("returns topics from repository when no cache", async () => {
            repo.findBlogTopics.mockResolvedValue({ data: mockTopics });
            const service = new BlogService(repo);
            const result = await service.getBlogTopics();
            expect(result).toEqual(mockTopics);
            expect(result).toHaveLength(2);
            expect(result[0]).toMatchObject({ id: topicIdForTopic, name: topicName, slug: topicSlug, description: "Parent topic desc", parent_id: null, parent: null });
            expect(result[1]).toMatchObject({
                id: otherTopicId,
                name: "Other Topic",
                slug: "other-topic",
                description: "Child topic desc",
                parent_id: topicIdForTopic,
                parent: { id: topicIdForTopic, name: topicName, slug: topicSlug },
            });
            expect(repo.findBlogTopics).toHaveBeenCalledTimes(1);
        });

        it("returns empty array when repository returns empty", async () => {
            repo.findBlogTopics.mockResolvedValue({ data: [] });
            const service = new BlogService(repo);
            const result = await service.getBlogTopics();
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
            expect(repo.findBlogTopics).toHaveBeenCalledTimes(1);
        });

        it("uses cache when provided (cache hit)", async () => {
            const getOrSet = jest.fn().mockResolvedValue(mockTopics);
            const service = new BlogService(repo, { getOrSet } as never);
            const result = await service.getBlogTopics();
            expect(result).toEqual(mockTopics);
            expect(result).toHaveLength(2);
            expect(result[1].parent).toMatchObject({ id: topicIdForTopic, name: topicName, slug: topicSlug });
            expect(result[1].parent_id).toBe(topicIdForTopic);
            expect(getOrSet).toHaveBeenCalledWith(
                "blog:topics:list",
                expect.any(Function),
                300
            );
            expect(repo.findBlogTopics).not.toHaveBeenCalled();
        });

        it("calls repository when cache misses", async () => {
            repo.findBlogTopics.mockResolvedValue({ data: mockTopics });
            const getOrSet = jest.fn().mockImplementation(async (_key, factory) => factory());
            const service = new BlogService(repo, { getOrSet } as never);
            const result = await service.getBlogTopics();
            expect(result).toEqual(mockTopics);
            expect(result).toHaveLength(2);
            expect(result[0].description).toBe("Parent topic desc");
            expect(result[0].parent_id).toBeNull();
            expect(result[1].description).toBe("Child topic desc");
            expect(result[1].parent_id).toBe(topicIdForTopic);
            expect(result[1].parent).toMatchObject({ id: topicIdForTopic, name: topicName, slug: topicSlug });
            expect(getOrSet).toHaveBeenCalledWith(
                "blog:topics:list",
                expect.any(Function),
                300
            );
            expect(repo.findBlogTopics).toHaveBeenCalledTimes(1);
        });
    });

    describe("getActiveBlogTopics", () => {
        const activeTopics = [
            { id: topicIdForTopic, name: topicName, slug: topicSlug, description: "Desc", parent_id: null, post_count: 3 },
            { id: faker.string.uuid(), name: "Other", slug: "other", description: null, parent_id: null, post_count: 1 },
        ];

        it("returns active topics from repository when no cache", async () => {
            repo.findActiveBlogTopics.mockResolvedValue({ data: activeTopics });
            const service = new BlogService(repo);
            const result = await service.getActiveBlogTopics();
            expect(result).toEqual(activeTopics);
            expect(repo.findActiveBlogTopics).toHaveBeenCalledTimes(1);
        });

        it("uses cache when provided", async () => {
            repo.findActiveBlogTopics.mockResolvedValue({ data: activeTopics });
            const getOrSet = jest.fn().mockResolvedValue(activeTopics);
            const service = new BlogService(repo, { getOrSet } as never);
            const result = await service.getActiveBlogTopics();
            expect(result).toEqual(activeTopics);
            expect(getOrSet).toHaveBeenCalledWith("blog:topics:active", expect.any(Function), 300);
            expect(repo.findActiveBlogTopics).not.toHaveBeenCalled();
        });
    });

    describe("createBlogTopic", () => {
        it("creates topic and returns id and name from repository", async () => {
            repo.createTopic.mockResolvedValue({ id: topicIdForTopic, name: topicName });
            const service = new BlogService(repo);
            const result = await service.createBlogTopic(validTopicCreatePayload);
            expect(result).toEqual({ id: topicIdForTopic, name: topicName });
            expect(result).toHaveProperty("id", topicIdForTopic);
            expect(result).toHaveProperty("name", topicName);
            expect(Object.keys(result)).toEqual(["id", "name"]);
            expect(repo.createTopic).toHaveBeenCalledTimes(1);
            expect(repo.createTopic).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: validTopicCreatePayload.name,
                    description: validTopicCreatePayload.description,
                })
            );
        });

        it("invalidates topic and post list caches after create", async () => {
            repo.createTopic.mockResolvedValue({ id: topicIdForTopic, name: topicName });
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const service = new BlogService(repo, undefined, {
                invalidateKey,
                invalidatePattern,
            } as never);
            await service.createBlogTopic(validTopicCreatePayload);
            expect(repo.createTopic).toHaveBeenCalledWith(validTopicCreatePayload);
            expect(invalidateKey).toHaveBeenCalledWith("blog:topics:list");
            expect(invalidateKey).toHaveBeenCalledWith("blog:topics:active");
            expect(invalidatePattern).toHaveBeenCalledWith("blog:published:blog:*");
            expect(invalidatePattern).toHaveBeenCalledWith("blog:published:bySlug:*");
            expect(invalidatePattern).toHaveBeenCalledWith("blog:admin:list:*");
        });
    });

    describe("updateBlogTopic", () => {
        const updateTopicId = faker.string.uuid();
        const updatedTopicName = validTopicUpdatePayload.name;

        it("updates topic and returns id and name from repository", async () => {
            repo.updateTopic.mockResolvedValue({
                id: updateTopicId,
                name: updatedTopicName,
            });
            const service = new BlogService(repo);
            const result = await service.updateBlogTopic(
                { ...validTopicUpdatePayload, id: updateTopicId }
            );
            expect(result).toEqual({ id: updateTopicId, name: updatedTopicName });
            expect(result).toHaveProperty("id", updateTopicId);
            expect(result).toHaveProperty("name", updatedTopicName);
            expect(Object.keys(result)).toEqual(["id", "name"]);
            expect(repo.updateTopic).toHaveBeenCalledTimes(1);
            expect(repo.updateTopic).toHaveBeenCalledWith(
                updateTopicId,
                expect.objectContaining({
                    name: validTopicUpdatePayload.name,
                    description: validTopicUpdatePayload.description,
                })
            );
        });

        it("invalidates topic and post list caches after update", async () => {
            repo.updateTopic.mockResolvedValue({
                id: updateTopicId,
                name: updatedTopicName,
            });
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const service = new BlogService(repo, undefined, {
                invalidateKey,
                invalidatePattern,
            } as never);
            await service.updateBlogTopic({ ...validTopicUpdatePayload, id: updateTopicId });
            expect(repo.updateTopic).toHaveBeenCalledWith(
                updateTopicId,
                expect.objectContaining(validTopicUpdatePayload)
            );
            expect(invalidateKey).toHaveBeenCalledWith("blog:topics:list");
            expect(invalidateKey).toHaveBeenCalledWith("blog:topics:active");
            expect(invalidatePattern).toHaveBeenCalledWith("blog:published:blog:*");
            expect(invalidatePattern).toHaveBeenCalledWith("blog:published:bySlug:*");
            expect(invalidatePattern).toHaveBeenCalledWith("blog:admin:list:*");
        });
    });

    describe("createBlogComment", () => {
        it("creates comment and returns id from repository", async () => {
            repo.createComment.mockResolvedValue({ id: commentId });
            const service = new BlogService(repo);
            const result = await service.createBlogComment(validCommentCreatePayload, userId);
            expect(result).toEqual({ id: commentId });
            expect(result.id).toBe(commentId);
            expect(repo.createComment).toHaveBeenCalledTimes(1);
            expect(repo.createComment).toHaveBeenCalledWith(
                {
                    post_id: validCommentCreatePayload.post_id,
                    parent_id: undefined,
                    content: validCommentCreatePayload.content,
                },
                userId
            );
        });

        it("creates comment with parent_id when provided", async () => {
            repo.createComment.mockResolvedValue({ id: commentId });
            const service = new BlogService(repo);
            const result = await service.createBlogComment(validCommentCreatePayloadWithParent, userId);
            expect(result.id).toBe(commentId);
            expect(repo.createComment).toHaveBeenCalledWith(
                {
                    post_id: validCommentCreatePayloadWithParent.post_id,
                    parent_id: validCommentCreatePayloadWithParent.parent_id,
                    content: validCommentCreatePayloadWithParent.content,
                },
                userId
            );
        });

        it("invalidates post, comments, admin comments list, and tracks comment activity (BLOG_ACTIVITIES_CACHE)", async () => {
            repo.createComment.mockResolvedValue({ id: commentId });
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const service = new BlogService(repo, undefined, { invalidateKey, invalidatePattern } as never);
            await service.createBlogComment(validCommentCreatePayload, userId);
            expect(invalidateKey).toHaveBeenCalledWith(`blog:byBlogId:${postId}`);
            expect(invalidateKey).toHaveBeenCalledWith(`blog:comments:byPostId:${postId}`);
            expect(invalidatePattern).toHaveBeenCalledWith("blog:admin:comments:list:*");
            expect(repo.insertBlogActivity).toHaveBeenCalledWith(postId, "comment", userId);
            expect(invalidatePattern).toHaveBeenCalledWith("blog:admin:activities:list:*");
        });
    });

    describe("getPostComments", () => {
        const mockComments = [
            {
                id: commentId,
                content: commentContent,
                is_approved: true,
                created_at: createdAt,
                updated_at: null,
                parent_id: null,
                user_id: userId,
                author: { id: userId, full_name: "Jane", avatar_url: "https://example.com/av.png" },
            },
        ];

        it("returns comments from repository when no cache", async () => {
            repo.findPostComments.mockResolvedValue({ data: mockComments });
            const service = new BlogService(repo);
            const result = await service.getPostComments(postId);
            expect(result).toEqual(mockComments);
            expect(repo.findPostComments).toHaveBeenCalledWith(postId);
        });

        it("uses cache when provided", async () => {
            repo.findPostComments.mockResolvedValue({ data: mockComments });
            const getOrSet = jest.fn().mockResolvedValue(mockComments);
            const service = new BlogService(repo, { getOrSet } as never);
            const result = await service.getPostComments(postId);
            expect(result).toEqual(mockComments);
            expect(getOrSet).toHaveBeenCalledWith(
                `blog:comments:byPostId:${postId}`,
                expect.any(Function),
                300
            );
            expect(repo.findPostComments).not.toHaveBeenCalled();
        });
    });

    describe("approveBlogComment", () => {
        it("approves comment and invalidates post, comments, and admin comments list cache", async () => {
            repo.approveComment.mockResolvedValue({ id: commentId, post_id: postId });
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const service = new BlogService(repo, undefined, { invalidateKey, invalidatePattern } as never);
            const result = await service.approveBlogComment(commentId);
            expect(result).toEqual({ id: commentId });
            expect(repo.approveComment).toHaveBeenCalledWith(commentId);
            expect(invalidateKey).toHaveBeenCalledWith(`blog:byBlogId:${postId}`);
            expect(invalidateKey).toHaveBeenCalledWith(`blog:comments:byPostId:${postId}`);
            expect(invalidatePattern).toHaveBeenCalledWith("blog:admin:comments:list:*");
        });
    });

    describe("deleteBlogPost", () => {
        it("calls repo and invalidates post mutation caches plus admin comments and activities lists", async () => {
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const invalidateEntity = jest.fn().mockResolvedValue(undefined);
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const service = new BlogService(repo, undefined, {
                invalidateKey,
                invalidateEntity,
                invalidatePattern,
            } as never);
            await service.deleteBlogPost(postId);
            expect(repo.deleteBlogPost).toHaveBeenCalledWith(postId);
            expect(invalidateKey).toHaveBeenCalledWith(`blog:byBlogId:${postId}`);
            expect(invalidateEntity).toHaveBeenCalledWith("blog", postId);
            expect(invalidateKey).toHaveBeenCalledWith("blog:published:authors");
            expect(invalidateKey).toHaveBeenCalledWith("blog:topics:active");
            expect(invalidatePattern).toHaveBeenCalledWith("blog:published:blog:*");
            expect(invalidatePattern).toHaveBeenCalledWith("blog:admin:list:*");
            expect(invalidatePattern).toHaveBeenCalledWith("blog:admin:comments:list:*");
            expect(invalidatePattern).toHaveBeenCalledWith("blog:admin:activities:list:*");
        });
    });

    describe("deleteBlogTopic", () => {
        it("calls repo and invalidates topic-related caches", async () => {
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const service = new BlogService(repo, undefined, { invalidateKey, invalidatePattern } as never);
            await service.deleteBlogTopic(topicId);
            expect(repo.deleteBlogTopic).toHaveBeenCalledWith(topicId);
            expect(invalidateKey).toHaveBeenCalledWith("blog:topics:list");
            expect(invalidateKey).toHaveBeenCalledWith("blog:topics:active");
            expect(invalidatePattern).toHaveBeenCalledWith("blog:published:blog:*");
            expect(invalidatePattern).toHaveBeenCalledWith("blog:admin:list:*");
        });
    });

    describe("deleteBlogComment", () => {
        it("calls repo deleteComment and invalidates post comments and admin comments list", async () => {
            repo.deleteComment.mockResolvedValue({ post_id: postId });
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const service = new BlogService(repo, undefined, { invalidateKey, invalidatePattern } as never);
            await service.deleteBlogComment(commentId);
            expect(repo.deleteComment).toHaveBeenCalledWith(commentId);
            expect(invalidateKey).toHaveBeenCalledWith(`blog:byBlogId:${postId}`);
            expect(invalidateKey).toHaveBeenCalledWith(`blog:comments:byPostId:${postId}`);
            expect(invalidatePattern).toHaveBeenCalledWith("blog:admin:comments:list:*");
        });
    });

    describe("updateBlogComment", () => {
        it("updates comment and returns id from repository", async () => {
            repo.updateComment.mockResolvedValue({ id: commentId, post_id: postId });
            const service = new BlogService(repo);
            const result = await service.updateBlogComment(
                { ...validCommentUpdatePayload, id: commentId },
                userId
            );
            expect(result).toEqual({ id: commentId });
            expect(result.id).toBe(commentId);
            expect(repo.updateComment).toHaveBeenCalledTimes(1);
            expect(repo.updateComment).toHaveBeenCalledWith(
                commentId,
                userId,
                { content: validCommentUpdatePayload.content }
            );
        });

        it("invalidates post, comments, and admin comments list cache when cacheInvalidator provided and repo returns post_id", async () => {
            repo.updateComment.mockResolvedValue({ id: commentId, post_id: postId });
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const service = new BlogService(repo, undefined, { invalidateKey, invalidatePattern } as never);
            await service.updateBlogComment(
                { ...validCommentUpdatePayload, id: commentId },
                userId
            );
            expect(invalidateKey).toHaveBeenCalledWith(`blog:byBlogId:${postId}`);
            expect(invalidateKey).toHaveBeenCalledWith(`blog:comments:byPostId:${postId}`);
            expect(invalidatePattern).toHaveBeenCalledWith("blog:admin:comments:list:*");
        });

        it("calls repository with comment id, userId, and content", async () => {
            const updateId = faker.string.uuid();
            const updateContent = faker.lorem.paragraph();
            repo.updateComment.mockResolvedValue({ id: updateId, post_id: postId });
            const service = new BlogService(repo);
            await service.updateBlogComment(
                { id: updateId, content: updateContent },
                userId
            );
            expect(repo.updateComment).toHaveBeenCalledWith(updateId, userId, { content: updateContent });
        });
    });
});
