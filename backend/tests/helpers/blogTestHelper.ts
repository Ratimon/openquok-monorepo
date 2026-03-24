import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { config } from "../../config/GlobalConfig";

const supabaseConfig = config.supabase as { supabaseUrl: string; supabaseServiceRoleKey?: string };

/** Default topic ID used for blog post integration tests when using ensureTopicExists. */
export const DEFAULT_BLOG_TOPIC_ID = "d5f7a000-0000-4000-a000-000000000004";

const DEFAULT_TOPIC = {
    id: DEFAULT_BLOG_TOPIC_ID,
    name: "Social Media",
    slug: "social-media",
    description: "Social media marketing tips",
};

export class BlogTestHelper {
    private adminSupabase: SupabaseClient;

    /** Post IDs created during tests; cleared after cleanTrackedBlogData(). */
    public createdPostIds: string[] = [];

    /** Topic IDs created during tests; cleared after cleanTrackedBlogData(). */
    public createdTopicIds: string[] = [];

    constructor(adminSupabase?: SupabaseClient) {
        if (adminSupabase) {
            this.adminSupabase = adminSupabase;
        } else {
            const url = supabaseConfig.supabaseUrl;
            const key = supabaseConfig.supabaseServiceRoleKey;
            if (!url || !key) {
                throw new Error("Supabase URL and service role key required for BlogTestHelper");
            }
            this.adminSupabase = createClient(url, key);
        }
    }

    trackPost(postId: string): void {
        this.createdPostIds.push(postId);
    }

    trackTopic(topicId: string): void {
        this.createdTopicIds.push(topicId);
    }

    /**
     * Delete all tracked blog_posts and blog_topics (in that order, FK safe), then clear tracked ids.
     * Use in afterAll of blog integration tests so the DB is left clean.
     */
    async cleanTrackedBlogData(): Promise<void> {
        if (this.createdPostIds.length > 0) {
            try {
                await this.adminSupabase.from("blog_posts").delete().in("id", this.createdPostIds);
            } catch {
                // ignore cleanup errors
            }
            this.createdPostIds = [];
        }
        if (this.createdTopicIds.length > 0) {
            try {
                await this.adminSupabase.from("blog_topics").delete().in("id", this.createdTopicIds);
            } catch {
                // ignore cleanup errors
            }
            this.createdTopicIds = [];
        }
    }

    /**
     * Ensure a blog topic exists so create-post tests don't fail with FK (e.g. when seed not run).
     * Call in beforeAll of blog integration tests when not using topic API to create topics.
     */
    async ensureTopicExists(
        topic: { id: string; name: string; slug: string; description?: string } = DEFAULT_TOPIC
    ): Promise<void> {
        await this.adminSupabase.from("blog_topics").upsert(
            {
                id: topic.id,
                name: topic.name,
                slug: topic.slug,
                description: topic.description ?? null,
            },
            { onConflict: "id" }
        );
    }

    /**
     * Delete a blog topic by id. Prefer cleanTrackedBlogData() for test cleanup.
     */
    async deleteTopic(topicId: string = DEFAULT_BLOG_TOPIC_ID): Promise<void> {
        try {
            await this.adminSupabase.from("blog_topics").delete().eq("id", topicId);
        } catch {
            // ignore cleanup errors
        }
    }
}
