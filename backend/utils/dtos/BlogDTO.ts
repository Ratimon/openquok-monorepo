import type {
    PublishedBlogPostsFilterOptions,
    AdminBlogPostsFilterOptions,
    AdminBlogCommentsFilterOptions,
    AdminBlogActivitiesFilterOptions,
    PublishedBlogAuthor,
    ActiveBlogTopic,
    BlogComment,
    AdminBlogComment,
    AdminBlogActivity,
} from "../../data/types/blogTypes";

/**
 * Raw row shape from Supabase blog_posts select (with topic/author joins).
 * Used as input to BlogDTOMapper; repository returns this type.
 */
export interface BlogPostLike {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    slug: string;
    is_sponsored?: boolean | null;
    is_featured?: boolean | null;
    is_admin_approved?: boolean | null;
    is_user_published?: boolean | null;
    hero_image_filename?: string | null;
    reading_time_minutes?: number | null;
    created_at: string;
    published_at: string | null;
    topic_id: string;
    content: string | null;
    view_count?: number | null;
    like_count?: number | null;
    updated_at?: string | null;
    topic?: { id: string; name: string; slug: string } | { id: string; name: string; slug: string }[] | null;
    author?:
        | {
              id: string;
              full_name?: string | null;
              username?: string | null;
              avatar_url?: string | null;
              website?: string | null;
              tag_line?: string | null;
              /** From join with user_profiles (owner_id -> users.id). */
              user_profiles?: Array<{ avatar_url?: string | null; website_url?: string | null; tag_line?: string | null }> | { avatar_url?: string | null; website_url?: string | null; tag_line?: string | null } | null;
          }
        | Array<{
              id: string;
              full_name?: string | null;
              username?: string | null;
              avatar_url?: string | null;
              website?: string | null;
              tag_line?: string | null;
              user_profiles?: Array<{ avatar_url?: string | null; website_url?: string | null; tag_line?: string | null }> | { avatar_url?: string | null; website_url?: string | null; tag_line?: string | null } | null;
          }>
        | null;
}

/**
 * Blog post DTO for API responses (camelCase).
 * Decouples the API contract from the database shape.
 */
export interface BlogPostDTO {
    id: string;
    userId: string;
    title: string;
    description: string | null;
    slug: string;
    isSponsored: boolean;
    isFeatured: boolean;
    isAdminApproved: boolean;
    isUserPublished: boolean;
    heroImageFilename: string | null;
    readingTimeMinutes: number | null;
    createdAt: string;
    publishedAt: string | null;
    topicId: string;
    content: string | null;
    viewCount: number | null;
    likeCount: number | null;
    updatedAt: string | null;
    topic: { id: string; name: string; slug: string } | null;
    author: {
        id: string;
        fullName: string | null;
        username: string | null;
        avatarUrl: string | null;
        website: string | null;
        tagLine: string | null;
    } | null;
}

/** DTO for a single blog comment (camelCase). Public API: approved comments with author. */
export interface BlogCommentDTO {
    id: string;
    content: string;
    isApproved: boolean;
    createdAt: string;
    updatedAt: string | null;
    parentId: string | null;
    userId: string;
    author: {
        id: string;
        fullName: string | null;
        avatarUrl: string | null;
    } | null;
}

/** DTO for admin blog comment (camelCase, includes postId and optional post ref). */
export interface AdminBlogCommentDTO extends BlogCommentDTO {
    postId: string;
    blogPost: { id: string; title: string; slug: string } | null;
}

/** DTO for admin blog activity (camelCase). Tag: BLOG_ACTIVITIES_CACHE. */
export interface AdminBlogActivityDTO {
    id: string;
    activityType: string;
    createdAt: string;
    userId: string | null;
    postId: string;
    author: { id: string; fullName: string | null; avatarUrl: string | null } | null;
    blogPost: { id: string; title: string; slug: string } | null;
}

/** DTO for published blog authors list (camelCase). From RPC get_published_blog_authors. */
export interface PublishedBlogAuthorDTO {
    id: string;
    fullName: string | null;
    username: string | null;
    avatarUrl: string | null;
    website: string | null;
    tagLine: string | null;
    postCount: number;
}

/** DTO for active blog topic (topics with at least one published post; camelCase). */
export interface ActiveBlogTopicDTO {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    parentId: string | null;
    postCount: number;
}

function normalizeTopic(
    topic: BlogPostLike["topic"]
): { id: string; name: string; slug: string } | null {
    if (!topic) return null;
    const t = Array.isArray(topic) ? topic[0] : topic;
    return t ? { id: t.id, name: t.name, slug: t.slug } : null;
}

type AuthorProfileRow = { avatar_url?: string | null; website_url?: string | null; tag_line?: string | null };

function normalizeAuthor(
    author: BlogPostLike["author"]
): BlogPostDTO["author"] {
    if (!author) return null;
    const a = Array.isArray(author) ? author[0] : author;
    if (!a) return null;
    const raw = a as { user_profiles?: AuthorProfileRow | AuthorProfileRow[] | null };
    const profile: AuthorProfileRow | null = Array.isArray(raw.user_profiles) ? raw.user_profiles[0] ?? null : raw.user_profiles ?? null;
    return {
        id: a.id,
        fullName: (a.full_name ?? null) as string | null,
        username: (a.username ?? null) as string | null,
        avatarUrl: (profile?.avatar_url ?? a.avatar_url ?? null) as string | null,
        website: (profile?.website_url ?? a.website ?? null) as string | null,
        tagLine: (profile?.tag_line ?? a.tag_line ?? null) as string | null,
    };
}

export const BlogDTOMapper = {
    toDTO(row: BlogPostLike | null | undefined): BlogPostDTO | null {
        if (row == null) return null;
        return {
            id: row.id,
            userId: row.user_id,
            title: row.title,
            description: row.description ?? null,
            slug: row.slug,
            isSponsored: !!row.is_sponsored,
            isFeatured: !!row.is_featured,
            isAdminApproved: !!row.is_admin_approved,
            isUserPublished: !!row.is_user_published,
            heroImageFilename: (row.hero_image_filename ?? null) as string | null,
            readingTimeMinutes: (row.reading_time_minutes ?? null) as number | null,
            createdAt: row.created_at,
            publishedAt: row.published_at ?? null,
            topicId: row.topic_id,
            content: row.content ?? null,
            viewCount: (row.view_count ?? null) as number | null,
            likeCount: (row.like_count ?? null) as number | null,
            updatedAt: (row.updated_at ?? null) as string | null,
            topic: normalizeTopic(row.topic),
            author: normalizeAuthor(row.author),
        };
    },

    toDTOCollection(rows: BlogPostLike[]): BlogPostDTO[] {
        if (!Array.isArray(rows)) return [];
        return rows.map((r) => BlogDTOMapper.toDTO(r)!).filter(Boolean);
    },

    toPublishedBlogAuthorDTO(row: PublishedBlogAuthor): PublishedBlogAuthorDTO {
        return {
            id: row.id,
            fullName: row.full_name ?? null,
            username: row.username ?? null,
            avatarUrl: row.avatar_url ?? null,
            website: row.website ?? null,
            tagLine: row.tag_line ?? null,
            postCount: Number(row.post_count) ?? 0,
        };
    },

    toPublishedBlogAuthorDTOCollection(rows: PublishedBlogAuthor[]): PublishedBlogAuthorDTO[] {
        if (!Array.isArray(rows)) return [];
        return rows.map((r) => BlogDTOMapper.toPublishedBlogAuthorDTO(r));
    },

    toActiveBlogTopicDTO(row: ActiveBlogTopic): ActiveBlogTopicDTO {
        return {
            id: row.id,
            name: row.name,
            slug: row.slug,
            description: row.description ?? null,
            parentId: row.parent_id ?? null,
            postCount: Number(row.post_count) ?? 0,
        };
    },

    toActiveBlogTopicDTOCollection(rows: ActiveBlogTopic[]): ActiveBlogTopicDTO[] {
        if (!Array.isArray(rows)) return [];
        return rows.map((r) => BlogDTOMapper.toActiveBlogTopicDTO(r));
    },

    toCommentDTO(row: BlogComment): BlogCommentDTO {
        return {
            id: row.id,
            content: row.content,
            isApproved: row.is_approved,
            createdAt: row.created_at,
            updatedAt: row.updated_at ?? null,
            parentId: row.parent_id ?? null,
            userId: row.user_id,
            author: row.author
                ? {
                    id: row.author.id,
                    fullName: row.author.full_name ?? null,
                    avatarUrl: row.author.avatar_url ?? null,
                }
                : null,
        };
    },

    toCommentDTOCollection(rows: BlogComment[]): BlogCommentDTO[] {
        if (!Array.isArray(rows)) return [];
        return rows.map((r) => BlogDTOMapper.toCommentDTO(r));
    },

    toAdminBlogCommentDTO(row: AdminBlogComment): AdminBlogCommentDTO {
        return {
            ...BlogDTOMapper.toCommentDTO(row),
            postId: row.post_id,
            blogPost: row.blog_post ? { id: row.blog_post.id, title: row.blog_post.title, slug: row.blog_post.slug } : null,
        };
    },

    toAdminBlogCommentDTOCollection(rows: AdminBlogComment[]): AdminBlogCommentDTO[] {
        if (!Array.isArray(rows)) return [];
        return rows.map((r) => BlogDTOMapper.toAdminBlogCommentDTO(r));
    },

    toAdminBlogActivityDTO(row: AdminBlogActivity): AdminBlogActivityDTO {
        return {
            id: row.id,
            activityType: row.activity_type,
            createdAt: row.created_at,
            userId: row.user_id ?? null,
            postId: row.post_id,
            author: row.author
                ? { id: row.author.id, fullName: row.author.full_name ?? null, avatarUrl: row.author.avatar_url ?? null }
                : null,
            blogPost: row.blog_post ? { id: row.blog_post.id, title: row.blog_post.title, slug: row.blog_post.slug } : null,
        };
    },

    toAdminBlogActivityDTOCollection(rows: AdminBlogActivity[]): AdminBlogActivityDTO[] {
        if (!Array.isArray(rows)) return [];
        return rows.map((r) => BlogDTOMapper.toAdminBlogActivityDTO(r));
    },
};

/**
 * Builds a stable cache key for published blog posts from filter options.
 * Prefix should match BlogService CACHE_KEYS.BLOG_PUBLISHED when called from the service.
 */
export function buildPublishedBlogCacheKey(
    options: PublishedBlogPostsFilterOptions,
    prefix: string = "blog:published:blog"
): string {
    const limit = options.limit ?? 10;
    const skipId = options.skipId ?? "none";
    const skip = options.skip ?? 0;
    const searchTerm = options.searchTerm ?? "none";
    const topicId = options.topicId ?? "none";
    const sortBy = options.sortByKey ?? "default";
    const sortOrder = options.sortByOrder ? "asc" : "desc";
    const range = options.range
        ? `start:${options.range.start}:end:${options.range.end}`
        : "none";
    const authorId = options.authorId ?? "none";
    return [
        prefix,
        `limit:${limit}`,
        `skipId:${skipId}`,
        `skip:${skip}`,
        `searchTerm:${searchTerm}`,
        `topicId:${topicId}`,
        `sortBy:${sortBy}`,
        `sortOrder:${sortOrder}`,
        `range:${range}`,
        `authorId:${authorId}`,
    ].join(":");
}

/**
 * Builds a stable cache key for admin blog posts list from filter options.
 * Prefix should match BlogService CACHE_KEYS.BLOG_ADMIN_LIST when called from the service.
 */
export function buildAdminBlogCacheKey(
    options: AdminBlogPostsFilterOptions,
    prefix: string = "blog:admin:list"
): string {
    const limit = options.limit ?? 10;
    const searchTerm = options.searchTerm ?? "none";
    const topicId = options.topicId ?? "none";
    const sortBy = options.sortByKey ?? "default";
    const sortOrder = options.sortByOrder ? "asc" : "desc";
    const range = options.range
        ? `start:${options.range.start}:end:${options.range.end}`
        : "none";
    return [
        prefix,
        `limit:${limit}`,
        `searchTerm:${searchTerm}`,
        `topicId:${topicId}`,
        `sortBy:${sortBy}`,
        `sortOrder:${sortOrder}`,
        `range:${range}`,
    ].join(":");
}

/**
 * Builds a stable cache key for admin blog comments list from filter options.
 * Prefix should match BlogService CACHE_KEYS.BLOG_ADMIN_COMMENTS_LIST when called from the service.
 */
export function buildAdminBlogCommentsCacheKey(
    options: AdminBlogCommentsFilterOptions,
    prefix: string = "blog:admin:comments:list"
): string {
    const limit = options.limit ?? 10;
    const searchTerm = options.searchTerm ?? "none";
    const sortBy = options.sortByKey ?? "default";
    const sortOrder = options.sortByOrder ? "asc" : "desc";
    const range = options.range
        ? `start:${options.range.start}:end:${options.range.end}`
        : "none";
    return [
        prefix,
        `limit:${limit}`,
        `searchTerm:${searchTerm}`,
        `sortBy:${sortBy}`,
        `sortOrder:${sortOrder}`,
        `range:${range}`,
    ].join(":");
}

/**
 * Builds a stable cache key for admin blog activities list from filter options.
 * Prefix should match BlogService CACHE_KEYS.BLOG_ADMIN_ACTIVITIES_LIST (tag: BLOG_ACTIVITIES_CACHE).
 */
export function buildAdminBlogActivitiesCacheKey(
    options: AdminBlogActivitiesFilterOptions,
    prefix: string = "blog:admin:activities:list"
): string {
    const limit = options.limit ?? 10;
    const sortBy = options.sortByKey ?? "default";
    const sortOrder = options.sortByOrder ? "asc" : "desc";
    const range = options.range
        ? `start:${options.range.start}:end:${options.range.end}`
        : "none";
    const postId = options.post_id ?? "none";
    const activityType = options.activity_type ?? "none";
    return [
        prefix,
        `limit:${limit}`,
        `sortBy:${sortBy}`,
        `sortOrder:${sortOrder}`,
        `range:${range}`,
        `postId:${postId}`,
        `activityType:${activityType}`,
    ].join(":");
}
