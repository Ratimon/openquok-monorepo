import type { SupabaseClient } from "@supabase/supabase-js";

export type SeedScheduledSocialPostsOptions = {
    count: number;
    /** Defaults to `QUEUE`. Use `PUBLISHED` when testing published rows toward the cap. */
    state?: "QUEUE" | "PUBLISHED";
    /** ISO publish time applied to every row (defaults to one hour ahead). */
    publishDateIso?: string;
    /** Prefix for `post_group` values (`{prefix}-0` …). */
    postGroupPrefix?: string;
};

/**
 * Inserts minimal `posts` rows that count toward `posts_per_month` (active `QUEUE` or `PUBLISHED`).
 * Uses service-role Supabase client.
 */
export async function seedScheduledSocialPosts(
    adminSupabase: SupabaseClient,
    organizationId: string,
    options: SeedScheduledSocialPostsOptions
): Promise<{ postGroups: string[] }> {
    const prefix = options.postGroupPrefix ?? "test-posts-cap";
    const state = options.state ?? "QUEUE";
    const publishDateIso = options.publishDateIso ?? new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();
    const postGroups = Array.from({ length: options.count }, (_, i) => `${prefix}-${i}`);
    const rows = postGroups.map((postGroup) => ({
        state,
        publish_date: publishDateIso,
        organization_id: organizationId,
        integration_id: null,
        content: "cap-test",
        delay: 0,
        post_group: postGroup,
        title: null,
        description: null,
        parent_post_id: null,
        release_id: null,
        release_url: null,
        settings: "{}",
        image: null,
        interval_in_days: null,
        error: null,
        deleted_at: null,
        created_at: now,
        updated_at: now,
    }));

    const chunkSize = 100;
    for (let offset = 0; offset < rows.length; offset += chunkSize) {
        const chunk = rows.slice(offset, offset + chunkSize);
        const { error } = await adminSupabase.from("posts").insert(chunk);
        if (error) {
            throw new Error(`seedScheduledSocialPosts failed: ${error.message}`);
        }
    }
    return { postGroups };
}
