export interface BlogAuthor {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    website: string | null;
    tag_line: string | null;
}

/** Raw shape from RPC get_published_blog_authors (snake_case). */
export interface PublishedBlogAuthor {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    website: string | null;
    tag_line: string | null;
    post_count: number;
}

export interface BlogTopic {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    parent_id?: string | null;
    parent?: Pick<BlogTopic, "id" | "name" | "slug"> | null;
}

/** Result of RPC get_active_blog_topics: topics that have at least one published post, with post_count. */
export interface ActiveBlogTopic {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    parent_id: string | null;
    post_count: number;
}

export interface BlogPost {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    slug: string;
    is_sponsored: boolean;
    is_featured: boolean;
    is_admin_approved: boolean;
    is_user_published: boolean;
    hero_image_filename: string | null;
    reading_time_minutes: number | null;
    created_at: string;
    published_at: string | null;
    topic_id: string;
    content: string | null;
    view_count: number | null;
    like_count: number | null;
    updated_at: string | null;
    topic: BlogTopic | null;
    author: BlogAuthor | null;
}

export interface PublishedBlogPostsFilterOptions {
    limit?: number;
    skipId?: string | null;
    skip?: number;
    searchTerm?: string | null;
    topicId?: string | null;
    sortByKey?: keyof BlogPost | string | null;
    sortByOrder?: boolean | null;
    range?: { start: number; end: number } | null;
    authorId?: string | null;
}

/** Filter options for admin blog posts list (all posts, no published/approved filter). */
export interface AdminBlogPostsFilterOptions {
    limit?: number;
    searchTerm?: string | null;
    topicId?: string | null;
    sortByKey?: keyof BlogPost | string | null;
    sortByOrder?: boolean | null;
    range?: { start: number; end: number } | null;
}

/** Filter options for admin blog comments list (all comments, no approved filter). */
export interface AdminBlogCommentsFilterOptions {
    limit?: number;
    searchTerm?: string | null;
    sortByKey?: string | null;
    sortByOrder?: boolean | null;
    range?: { start: number; end: number } | null;
}

/** Author shape for a blog comment (from users join). */
export interface BlogCommentAuthor {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
}

/** Comment row as returned from repository (approved only, with author). */
export interface BlogComment {
    id: string;
    content: string;
    is_approved: boolean;
    created_at: string;
    updated_at: string | null;
    parent_id: string | null;
    user_id: string;
    author: BlogCommentAuthor | null;
}

/** Comment row for admin list (includes post_id and optional joined post ref). */
export interface AdminBlogComment extends BlogComment {
    post_id: string;
    blog_post: BlogActivityPostRef | null;
}

/** Allowed activity_type values for blog_activities. */
export type BlogActivityType = "view" | "like" | "share" | "comment";

/** Filter options for admin blog activities list. */
export interface AdminBlogActivitiesFilterOptions {
    limit?: number;
    sortByKey?: string | null;
    sortByOrder?: boolean | null;
    range?: { start: number; end: number } | null;
    post_id?: string | null;
    activity_type?: BlogActivityType | null;
}

/** Author shape for a blog activity (from users join). */
export interface BlogActivityAuthor {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
}

/** Minimal blog post ref for activity (from post_id join). */
export interface BlogActivityPostRef {
    id: string;
    title: string;
    slug: string;
}

/** Activity row as returned from repository (admin list with user and post refs). */
export interface AdminBlogActivity {
    id: string;
    activity_type: BlogActivityType;
    created_at: string;
    user_id: string | null;
    post_id: string;
    author: BlogActivityAuthor | null;
    blog_post: BlogActivityPostRef | null;
}

