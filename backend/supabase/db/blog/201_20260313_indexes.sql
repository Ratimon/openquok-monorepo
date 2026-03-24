-- ---------------------------
-- MODULE NAME: Blog System Indexes
-- MODULE DATE: 20260313
-- MODULE SCOPE: Indexes
-- ---------------------------

BEGIN;

-- ---------------------------
-- Blog Posts Indexes
-- ---------------------------
CREATE INDEX IF NOT EXISTS idx_blog_posts_user_id ON public.blog_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_topic_id ON public.blog_posts(topic_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON public.blog_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_featured ON public.blog_posts(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_sponsored ON public.blog_posts(is_sponsored) WHERE is_sponsored = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(is_admin_approved, is_user_published);

-- ---------------------------
-- Blog Topics Indexes
-- ---------------------------
CREATE INDEX IF NOT EXISTS idx_blog_topics_slug ON public.blog_topics(slug);
CREATE INDEX IF NOT EXISTS idx_blog_topics_parent_id ON public.blog_topics(parent_id);

-- ---------------------------
-- Blog Comments Indexes
-- ---------------------------
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON public.blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_user_id ON public.blog_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent_id ON public.blog_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_created_at ON public.blog_comments(created_at);

-- ---------------------------
-- Blog Activities Indexes
-- ---------------------------
CREATE INDEX IF NOT EXISTS idx_blog_activities_post_id ON public.blog_activities(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_activities_user_id ON public.blog_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_activities_type ON public.blog_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_blog_activities_created_at ON public.blog_activities(created_at);

COMMIT;

