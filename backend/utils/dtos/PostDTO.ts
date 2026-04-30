/** DB enum column `posts.state`. */
export type PostStateDb = "QUEUE" | "PUBLISHED" | "ERROR" | "DRAFT";

/**
 * Raw row shape from Supabase `posts` select.
 * Repository returns this type; controllers map via PostDTOMapper.
 */
export interface SocialPostLike {
    id: string;
    state: PostStateDb;
    publish_date: string;
    organization_id: string;
    integration_id: string | null;
    content: string;
    delay: number;
    post_group: string;
    title: string | null;
    description: string | null;
    parent_post_id: string | null;
    release_id: string | null;
    release_url: string | null;
    settings: string | null;
    image: string | null;
    interval_in_days: number | null;
    error: string | null;
    deleted_at: string | null;
    created_by_user_id: string | null;
    created_at: string;
    updated_at: string;
}

/** Raw row shape from Supabase `post_tags` select. */
export interface PostTagLike {
    id: string;
    name: string;
    color: string;
    org_id: string;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

/** Raw row shape from Supabase `public.comments` (composer posts, not blog_comments). */
export interface PostCommentLike {
    id: string;
    post_id: string;
    organization_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

/** Stored in `posts.settings` JSON (`repeatInterval`). */
export type RepeatIntervalKey =
    | "day"
    | "two_days"
    | "three_days"
    | "four_days"
    | "five_days"
    | "six_days"
    | "week"
    | "two_weeks"
    | "month";

/** Item shape inside `posts.image` JSON (`items`). */
export type PostMediaItemInput = {
    id: string;
    path: string;
};

/** Maps composer repeat key to `posts.interval_in_days`. */
export function repeatIntervalToDays(key: RepeatIntervalKey | null): number | null {
    if (key == null) return null;
    const m: Record<RepeatIntervalKey, number> = {
        day: 1,
        two_days: 2,
        three_days: 3,
        four_days: 4,
        five_days: 5,
        six_days: 6,
        week: 7,
        two_weeks: 14,
        month: 30,
    };
    return m[key] ?? null;
}

/** Parses `posts.settings` JSON column. */
export function parsePostSettingsJson(settings: string | null): {
    isGlobal: boolean;
    repeatInterval: RepeatIntervalKey | null;
} {
    if (!settings) return { isGlobal: true, repeatInterval: null };
    try {
        const o = JSON.parse(settings) as { isGlobal?: unknown; repeatInterval?: unknown };
        const isGlobal = typeof o.isGlobal === "boolean" ? o.isGlobal : true;
        const repeatInterval = (typeof o.repeatInterval === "string" ? (o.repeatInterval as RepeatIntervalKey) : null) ?? null;
        return { isGlobal, repeatInterval };
    } catch {
        return { isGlobal: true, repeatInterval: null };
    }
}

/** Parses `posts.image` JSON column into media items. */
export function parsePostImageColumn(image: string | null): PostMediaItemInput[] {
    if (!image) return [];
    try {
        const o = JSON.parse(image) as { items?: unknown };
        const items = Array.isArray((o as { items?: unknown }).items) ? ((o as { items: unknown[] }).items as unknown[]) : [];
        return items
            .map((x) => ({
                id: typeof (x as { id?: unknown })?.id === "string" ? (x as { id: string }).id : "",
                path: typeof (x as { path?: unknown })?.path === "string" ? (x as { path: string }).path : "",
            }))
            .filter((m) => m.id && m.path);
    } catch {
        return [];
    }
}

/**
 * Social post DTO for API responses (camelCase).
 * Decouples the API contract from the database shape.
 */
export interface SocialPostDTO {
    id: string;
    state: PostStateDb;
    publishDate: string;
    organizationId: string;
    integrationId: string | null;
    content: string;
    delay: number;
    postGroup: string;
    title: string | null;
    description: string | null;
    parentPostId: string | null;
    releaseId: string | null;
    releaseUrl: string | null;
    settings: string | null;
    image: string | null;
    intervalInDays: number | null;
    error: string | null;
    deletedAt: string | null;
    createdByUserId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface PostTagDTO {
    id: string;
    name: string;
    color: string;
    orgId: string;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface PostCommentDTO {
    id: string;
    postId: string;
    organizationId: string;
    userId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

/** Raw row shape from Supabase `public.post_thread_replies` (follow-up thread replies). */
export interface PostThreadReplyLike {
    id: string;
    organization_id: string;
    post_id: string;
    integration_id: string | null;
    content: string;
    delay_seconds: number;
    state: PostStateDb;
    release_id: string | null;
    release_url: string | null;
    error: string | null;
    created_by_user_id: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface PostThreadReplyDTO {
    id: string;
    organizationId: string;
    postId: string;
    integrationId: string | null;
    content: string;
    delaySeconds: number;
    state: PostStateDb;
    releaseId: string | null;
    releaseUrl: string | null;
    error: string | null;
    createdByUserId: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export const PostDTOMapper = {
    toDTO(row: SocialPostLike | null | undefined): SocialPostDTO | null {
        if (row == null) return null;
        return {
            id: row.id,
            state: row.state,
            publishDate: row.publish_date,
            organizationId: row.organization_id,
            integrationId: row.integration_id,
            content: row.content,
            delay: row.delay,
            postGroup: row.post_group,
            title: row.title,
            description: row.description,
            parentPostId: row.parent_post_id,
            releaseId: row.release_id,
            releaseUrl: row.release_url,
            settings: row.settings,
            image: row.image,
            intervalInDays: row.interval_in_days,
            error: row.error,
            deletedAt: row.deleted_at,
            createdByUserId: row.created_by_user_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    },

    toDTOCollection(rows: SocialPostLike[]): SocialPostDTO[] {
        if (!Array.isArray(rows)) return [];
        return rows.map((r) => PostDTOMapper.toDTO(r)!).filter(Boolean);
    },

    toPostTagDTO(row: PostTagLike | null | undefined): PostTagDTO | null {
        if (row == null) return null;
        return {
            id: row.id,
            name: row.name,
            color: row.color,
            orgId: row.org_id,
            deletedAt: row.deleted_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    },

    toPostTagDTOCollection(rows: PostTagLike[]): PostTagDTO[] {
        if (!Array.isArray(rows)) return [];
        return rows.map((r) => PostDTOMapper.toPostTagDTO(r)!).filter(Boolean);
    },

    toPostCommentDTO(row: PostCommentLike | null | undefined): PostCommentDTO | null {
        if (row == null) return null;
        return {
            id: row.id,
            postId: row.post_id,
            organizationId: row.organization_id,
            userId: row.user_id,
            content: row.content,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            deletedAt: row.deleted_at,
        };
    },

    toPostCommentDTOCollection(rows: PostCommentLike[]): PostCommentDTO[] {
        if (!Array.isArray(rows)) return [];
        return rows.map((r) => PostDTOMapper.toPostCommentDTO(r)!).filter(Boolean);
    },

    toPostThreadReplyDTO(row: PostThreadReplyLike | null | undefined): PostThreadReplyDTO | null {
        if (row == null) return null;
        return {
            id: row.id,
            organizationId: row.organization_id,
            postId: row.post_id,
            integrationId: row.integration_id,
            content: row.content,
            delaySeconds: row.delay_seconds,
            state: row.state,
            releaseId: row.release_id,
            releaseUrl: row.release_url,
            error: row.error,
            createdByUserId: row.created_by_user_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            deletedAt: row.deleted_at,
        };
    },

    toPostThreadReplyDTOCollection(rows: PostThreadReplyLike[]): PostThreadReplyDTO[] {
        if (!Array.isArray(rows)) return [];
        return rows.map((r) => PostDTOMapper.toPostThreadReplyDTO(r)!).filter(Boolean);
    },
};
