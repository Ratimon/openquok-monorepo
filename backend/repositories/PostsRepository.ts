import type { SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { DatabaseError } from "../errors/InfraError";

const TABLE_POSTS = "posts";
const TABLE_TAGS = "post_tags";
const TABLE_POSTS_TAGS = "posts_tags";

export type PostStateDb = "QUEUE" | "PUBLISHED" | "ERROR" | "DRAFT";

export type SocialPostInsert = {
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
};

export type SocialPostRow = SocialPostInsert & {
    id: string;
    created_at: string;
    updated_at: string;
};

export type PostTagRow = {
    id: string;
    name: string;
    color: string;
    org_id: string;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
};

export class PostsRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    /** New group id for rows composed together (Prisma `Post.group`). */
    newPostGroup(): string {
        return uuidv4();
    }

    async hasQueueSlotTaken(organizationId: string, publishDateIso: string): Promise<boolean> {
        const { data, error } = await this.supabase
            .from(TABLE_POSTS)
            .select("id")
            .eq("organization_id", organizationId)
            .eq("state", "QUEUE")
            .eq("publish_date", publishDateIso)
            .is("deleted_at", null)
            .limit(1)
            .maybeSingle();

        if (error) {
            throw new DatabaseError(`Failed to check schedule slot: ${error.message}`, {
                cause: error,
                operation: "select",
                resource: { type: "table", name: TABLE_POSTS },
            });
        }
        return data != null;
    }

    async listTagsByOrganization(organizationId: string): Promise<PostTagRow[]> {
        const { data, error } = await this.supabase
            .from(TABLE_TAGS)
            .select("id, name, color, org_id, deleted_at, created_at, updated_at")
            .eq("org_id", organizationId)
            .is("deleted_at", null)
            .order("name", { ascending: true });

        if (error) {
            throw new DatabaseError(`Failed to list tags: ${error.message}`, {
                cause: error,
                operation: "select",
                resource: { type: "table", name: TABLE_TAGS },
            });
        }
        return (data ?? []) as PostTagRow[];
    }

    async insertTag(organizationId: string, nameTrimmed: string, color: string): Promise<PostTagRow> {
        const now = new Date().toISOString();
        const { data, error } = await this.supabase
            .from(TABLE_TAGS)
            .insert({
                org_id: organizationId,
                name: nameTrimmed,
                color,
                created_at: now,
                updated_at: now,
            })
            .select("id, name, color, org_id, deleted_at, created_at, updated_at")
            .single();

        if (error || !data) {
            throw new DatabaseError(`Failed to insert tag: ${error?.message ?? "no row"}`, {
                cause: error,
                operation: "insert",
                resource: { type: "table", name: TABLE_TAGS },
            });
        }
        return data as PostTagRow;
    }

    async findTagByOrgAndName(organizationId: string, name: string): Promise<PostTagRow | null> {
        const { data, error } = await this.supabase
            .from(TABLE_TAGS)
            .select("id, name, color, org_id, deleted_at, created_at, updated_at")
            .eq("org_id", organizationId)
            .eq("name", name)
            .is("deleted_at", null)
            .maybeSingle();

        if (error) {
            throw new DatabaseError(`Failed to find tag: ${error.message}`, {
                cause: error,
                operation: "select",
                resource: { type: "table", name: TABLE_TAGS },
            });
        }
        return data as PostTagRow | null;
    }

    async insertPostGroup(rows: SocialPostInsert[]): Promise<SocialPostRow[]> {
        if (rows.length === 0) {
            return [];
        }
        const now = new Date().toISOString();
        const payload = rows.map((r) => ({
            ...r,
            created_at: now,
            updated_at: now,
        }));
        const { data, error } = await this.supabase.from(TABLE_POSTS).insert(payload).select("*");

        if (error || !data?.length) {
            throw new DatabaseError(`Failed to create posts: ${error?.message ?? "no rows"}`, {
                cause: error ?? undefined,
                operation: "insert",
                resource: { type: "table", name: TABLE_POSTS },
            });
        }
        return data as SocialPostRow[];
    }

    async linkTagsToPosts(postIds: string[], tagIds: string[]): Promise<void> {
        if (postIds.length === 0 || tagIds.length === 0) return;
        const now = new Date().toISOString();
        const rows: { post_id: string; tag_id: string; created_at: string; updated_at: string }[] = [];
        for (const postId of postIds) {
            for (const tagId of tagIds) {
                rows.push({ post_id: postId, tag_id: tagId, created_at: now, updated_at: now });
            }
        }
        const { error } = await this.supabase.from(TABLE_POSTS_TAGS).insert(rows);
        if (error) {
            throw new DatabaseError(`Failed to link tags: ${error.message}`, {
                cause: error,
                operation: "insert",
                resource: { type: "table", name: TABLE_POSTS_TAGS },
            });
        }
    }
}
