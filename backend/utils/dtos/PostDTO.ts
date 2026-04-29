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
};
