import type { SupabaseClient } from "@supabase/supabase-js";
import type { PostStateDb, PostTagLike, PostCommentLike, SocialPostLike } from "../utils/dtos/PostDTO";

import { v4 as uuidv4 } from "uuid";
import { DatabaseError } from "../errors/InfraError";

const TABLE_POSTS = "posts";
const TABLE_TAGS = "post_tags";
const TABLE_POSTS_TAGS = "post_tag_assignments";
/** Composer comments on `posts` rows */
const TABLE_COMMENTS = "comments";

export type SocialPostInsert = Omit<SocialPostLike, "id" | "created_at" | "updated_at">;

export class PostsRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    /** New group id for rows composed together. */
    newPostGroup(): string {
        return uuidv4();
    }

    /**
     * `QUEUE` rows in `[fromIso, toIso)` on `publish_date`,
     * with resolvable channels (integration row exists, not disabled, not `refresh_needed`, not in-between steps).
     * Returns one entry per `post_group` (deduped) for re-enqueueing a Flowcraft run.
     */
    async listQueuePostGroupsForMissingPublishRescan(
        fromIso: string,
        toIso: string
    ): Promise<{ organizationId: string; postGroup: string }[]> {
        const { data: posts, error } = await this.supabase
            .from(TABLE_POSTS)
            .select("organization_id, post_group, integration_id")
            .eq("state", "QUEUE")
            .is("parent_post_id", null)
            .is("deleted_at", null)
            .not("integration_id", "is", null)
            .gte("publish_date", fromIso)
            .lt("publish_date", toIso);

        if (error) {
            throw new DatabaseError(`Failed to list posts for rescan: ${error.message}`, {
                cause: error,
                operation: "select",
                resource: { type: "table", name: TABLE_POSTS },
            });
        }
        const rows = (posts ?? []) as { organization_id: string; post_group: string; integration_id: string }[];
        if (rows.length === 0) return [];

        const intIds = [...new Set(rows.map((r) => r.integration_id))];
        const { data: integs, error: intErr } = await this.supabase
            .from("integrations")
            .select("id, refresh_needed, in_between_steps, disabled, deleted_at")
            .in("id", intIds);

        if (intErr) {
            throw new DatabaseError(`Failed to load integrations for rescan: ${intErr.message}`, {
                cause: intErr,
                operation: "select",
                resource: { type: "table", name: "integrations" },
            });
        }

        const intMap = new Map(
            (integs ?? []).map((i: { id: string; refresh_needed: boolean; in_between_steps: boolean; disabled: boolean; deleted_at: string | null }) => [i.id, i])
        );

        const byGroup = new Map<string, { organizationId: string; postGroup: string }>();
        for (const p of rows) {
            const int = intMap.get(p.integration_id);
            if (!int || int.deleted_at) continue;
            if (int.refresh_needed || int.in_between_steps || int.disabled) continue;
            if (!byGroup.has(p.post_group)) {
                byGroup.set(p.post_group, { organizationId: p.organization_id, postGroup: p.post_group });
            }
        }
        return [...byGroup.values()];
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

    /**
     * Creates a new scheduled QUEUE group by duplicating an existing group's rows.
     *
     * Used for "repeat post" scheduling: after a group is published, we schedule the same content
     * again in the future by inserting a new group with a new `publish_date`.
     *
     * - Sets `state` to QUEUE
     * - Clears publish results (release_id / release_url / error)
     * - Sets `parent_post_id` to the source row id for lineage
     * - Copies tag assignments from the source group to the new rows
     */
    async createRepeatGroupFromPostGroup(params: {
        postGroup: string;
        publishDateIso: string;
    }): Promise<{ postGroup: string; posts: SocialPostLike[] }> {
        const { postGroup, publishDateIso } = params;
        const rows = await this.listPostsByGroup(postGroup);
        if (rows.length === 0) {
            throw new DatabaseError("Failed to create repeat group: source post group not found", {
                operation: "select",
                resource: { type: "table", name: TABLE_POSTS },
            });
        }

        const newGroup = this.newPostGroup();

        const toInsert: SocialPostInsert[] = rows
            .filter((r) => !r.deleted_at)
            .map((r) => ({
                state: "QUEUE",
                publish_date: publishDateIso,
                organization_id: r.organization_id,
                integration_id: r.integration_id,
                content: r.content ?? "",
                delay: r.delay ?? 0,
                post_group: newGroup,
                title: r.title ?? null,
                description: r.description ?? null,
                parent_post_id: r.id,
                release_id: null,
                release_url: null,
                settings: r.settings ?? null,
                image: r.image ?? null,
                interval_in_days: r.interval_in_days ?? null,
                error: null,
                deleted_at: null,
                created_by_user_id: r.created_by_user_id ?? null,
            }));

        const inserted = await this.insertPostGroup(toInsert);

        // Copy tags from the source group to the new group.
        const sourceIds = rows.map((r) => r.id);
        const tags = await this.listTagsForPostIds(sourceIds);
        const tagIds = tags.map((t) => t.id).filter(Boolean);
        await this.linkTagsToPosts(
            inserted.map((p) => p.id),
            tagIds
        );

        return { postGroup: newGroup, posts: inserted };
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

    async listPostsByGroup(postGroup: string): Promise<SocialPostLike[]> {
        const { data, error } = await this.supabase
            .from(TABLE_POSTS)
            .select("*")
            .eq("post_group", postGroup)
            .is("deleted_at", null)
            .order("created_at", { ascending: true });

        if (error) {
            throw new DatabaseError(`Failed to load post group: ${error.message}`, {
                cause: error,
                operation: "select",
                resource: { type: "table", name: TABLE_POSTS },
            });
        }
        return (data ?? []) as SocialPostLike[];
    }

    async getPostById(postId: string): Promise<SocialPostLike | null> {
        const { data, error } = await this.supabase
            .from(TABLE_POSTS)
            .select("*")
            .eq("id", postId)
            .is("deleted_at", null)
            .maybeSingle();

        if (error) {
            throw new DatabaseError(`Failed to load post: ${error.message}`, {
                cause: error,
                operation: "select",
                resource: { type: "table", name: TABLE_POSTS },
            });
        }
        return (data as SocialPostLike | null) ?? null;
    }

    /** Lists non-deleted comments for a composer post row (`posts.id`). */
    async listCommentsByPostId(postId: string): Promise<PostCommentLike[]> {
        const { data, error } = await this.supabase
            .from(TABLE_COMMENTS)
            .select("id, post_id, organization_id, user_id, content, created_at, updated_at, deleted_at")
            .eq("post_id", postId)
            .is("deleted_at", null)
            .order("created_at", { ascending: true });

        if (error) {
            throw new DatabaseError(`Failed to load post comments: ${error.message}`, {
                cause: error,
                operation: "select",
                resource: { type: "table", name: TABLE_COMMENTS },
            });
        }
        return (data ?? []) as PostCommentLike[];
    }

    /** Inserts a composer comment on `posts.id`. */
    async insertComposerComment(input: {
        organizationId: string;
        postId: string;
        userId: string;
        content: string;
    }): Promise<PostCommentLike> {
        const now = new Date().toISOString();
        const { data, error } = await this.supabase
            .from(TABLE_COMMENTS)
            .insert({
                organization_id: input.organizationId,
                post_id: input.postId,
                user_id: input.userId,
                content: input.content,
                created_at: now,
                updated_at: now,
                deleted_at: null,
            })
            .select("id, post_id, organization_id, user_id, content, created_at, updated_at, deleted_at")
            .single();

        if (error || !data) {
            throw new DatabaseError(`Failed to insert composer comment: ${error?.message ?? "no row"}`, {
                cause: error ?? undefined,
                operation: "insert",
                resource: { type: "table", name: TABLE_COMMENTS },
            });
        }
        return data as PostCommentLike;
    }

    /** Soft-delete all rows in a post group. Returns ids of rows affected. */
    async softDeletePostsByGroup(postGroup: string): Promise<string[]> {
        const now = new Date().toISOString();
        const { data, error } = await this.supabase
            .from(TABLE_POSTS)
            .update({ deleted_at: now, updated_at: now })
            .eq("post_group", postGroup)
            .is("deleted_at", null)
            .select("id");

        if (error) {
            throw new DatabaseError(`Failed to delete post group: ${error.message}`, {
                cause: error,
                operation: "update",
                resource: { type: "table", name: TABLE_POSTS },
            });
        }
        return (data ?? []).map((r: any) => String(r.id)).filter(Boolean);
    }

    async deleteTagAssignmentsForPostIds(postIds: string[]): Promise<void> {
        if (postIds.length === 0) return;
        const { error } = await this.supabase.from(TABLE_POSTS_TAGS).delete().in("post_id", postIds);
        if (error) {
            throw new DatabaseError(`Failed to delete tag assignments: ${error.message}`, {
                cause: error,
                operation: "delete",
                resource: { type: "table", name: TABLE_POSTS_TAGS },
            });
        }
    }

    /**
     * Worker/orchestrator: set published result for a single `posts` row.
     * Aligned with upstream “updatePost(id, postId, releaseURL)”.
     */
    async updatePostRowPublishResult(
        postId: string,
        input: { state: "PUBLISHED" | "ERROR"; releaseId: string | null; releaseUrl: string | null; error: string | null }
    ): Promise<void> {
        const now = new Date().toISOString();
        const { error } = await this.supabase
            .from(TABLE_POSTS)
            .update({
                state: input.state,
                release_id: input.releaseId,
                release_url: input.releaseUrl,
                error: input.error,
                updated_at: now,
            })
            .eq("id", postId)
            .is("deleted_at", null);
        if (error) {
            throw new DatabaseError(`Failed to update post publish result: ${error.message}`, {
                cause: error,
                operation: "update",
                resource: { type: "table", name: TABLE_POSTS },
            });
        }
    }

    /**
     * Worker: mark a row in ERROR with message (e.g. group of channels when first failure was fatal to cross-post).
     * Pass `message: null` to copy a generic string from server.
     */
    async markPostState(postId: string, state: PostStateDb, errMessage: string | null = null): Promise<void> {
        const now = new Date().toISOString();
        const { error: updateErr } = await this.supabase
            .from(TABLE_POSTS)
            .update({ state, error: errMessage, updated_at: now })
            .eq("id", postId)
            .is("deleted_at", null);
        if (updateErr) {
            throw new DatabaseError(`Failed to set post state: ${updateErr.message}`, {
                cause: updateErr,
                operation: "update",
                resource: { type: "table", name: TABLE_POSTS },
            });
        }
    }

    async listTagsForPostIds(postIds: string[]): Promise<PostTagLike[]> {
        if (postIds.length === 0) return [];
        const { data: links, error: linksErr } = await this.supabase
            .from(TABLE_POSTS_TAGS)
            .select("tag_id")
            .in("post_id", postIds);

        if (linksErr) {
            throw new DatabaseError(`Failed to load tag assignments: ${linksErr.message}`, {
                cause: linksErr,
                operation: "select",
                resource: { type: "table", name: TABLE_POSTS_TAGS },
            });
        }
        const tagIds = [...new Set((links ?? []).map((r: any) => String(r.tag_id)).filter(Boolean))];
        if (tagIds.length === 0) return [];

        const { data: tags, error: tagsErr } = await this.supabase
            .from(TABLE_TAGS)
            .select("id, name, color, org_id, deleted_at, created_at, updated_at")
            .in("id", tagIds)
            .is("deleted_at", null)
            .order("name", { ascending: true });

        if (tagsErr) {
            throw new DatabaseError(`Failed to load tags: ${tagsErr.message}`, {
                cause: tagsErr,
                operation: "select",
                resource: { type: "table", name: TABLE_TAGS },
            });
        }
        return (tags ?? []) as PostTagLike[];
    }
}
