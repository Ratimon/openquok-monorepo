import type { SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { DatabaseError } from "../errors/InfraError";
import type { PostTagLike, SocialPostLike } from "../utils/dtos/PostDTO";

const TABLE_POSTS = "posts";
const TABLE_TAGS = "post_tags";
const TABLE_POSTS_TAGS = "post_tag_assignments";

export type SocialPostInsert = Omit<SocialPostLike, "id" | "created_at" | "updated_at">;

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

    async listTagsByOrganization(organizationId: string): Promise<PostTagLike[]> {
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
        return (data ?? []) as PostTagLike[];
    }

    async insertTag(organizationId: string, nameTrimmed: string, color: string): Promise<PostTagLike> {
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
        return data as PostTagLike;
    }

    async findTagByOrgAndName(organizationId: string, name: string): Promise<PostTagLike | null> {
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
        return data as PostTagLike | null;
    }

    /** Soft-delete a workspace tag. Returns true when a row was updated. */
    async softDeleteTagForOrganization(organizationId: string, tagId: string): Promise<boolean> {
        const now = new Date().toISOString();
        const { data, error } = await this.supabase
            .from(TABLE_TAGS)
            .update({ deleted_at: now, updated_at: now })
            .eq("id", tagId)
            .eq("org_id", organizationId)
            .is("deleted_at", null)
            .select("id")
            .maybeSingle();

        if (error) {
            throw new DatabaseError(`Failed to delete tag: ${error.message}`, {
                cause: error,
                operation: "update",
                resource: { type: "table", name: TABLE_TAGS },
            });
        }
        return data != null;
    }

    async insertPostGroup(rows: SocialPostInsert[]): Promise<SocialPostLike[]> {
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
        return data as SocialPostLike[];
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

    async listPostsByOrganizationAndDateRange({
        organizationId,
        startIso,
        endIso,
        integrationIds,
    }: {
        organizationId: string;
        startIso: string;
        endIso: string;
        integrationIds?: string[] | null;
    }): Promise<SocialPostLike[]> {
        let q = this.supabase
            .from(TABLE_POSTS)
            .select("*")
            .eq("organization_id", organizationId)
            .is("deleted_at", null)
            .gte("publish_date", startIso)
            .lte("publish_date", endIso)
            .order("publish_date", { ascending: true });

        if (integrationIds && integrationIds.length > 0) {
            q = q.in("integration_id", integrationIds);
        }

        const { data, error } = await q;
        if (error) {
            throw new DatabaseError(`Failed to list posts: ${error.message}`, {
                cause: error,
                operation: "select",
                resource: { type: "table", name: TABLE_POSTS },
            });
        }
        return (data ?? []) as SocialPostLike[];
    }
}
