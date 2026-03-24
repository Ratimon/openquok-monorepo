-- ---------------------------
-- MODULE NAME: Blog System Tables
-- MODULE DATE: 20260313
-- MODULE SCOPE: Tables
-- ---------------------------

BEGIN;

-- ---------------------------
-- Blog Topics Table
-- ---------------------------
CREATE TABLE IF NOT EXISTS public.blog_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES public.blog_topics(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- ---------------------------
-- Blog Posts Table
-- ---------------------------
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.blog_topics(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    hero_image_filename TEXT,
    is_sponsored BOOLEAN NOT NULL DEFAULT false,
    is_admin_approved BOOLEAN NOT NULL DEFAULT false,
    is_user_published BOOLEAN NOT NULL DEFAULT false,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    view_count INTEGER NOT NULL DEFAULT 0,
    like_count INTEGER NOT NULL DEFAULT 0,
    reading_time_minutes INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ
);

-- ---------------------------
-- Blog Comments Table
-- ---------------------------
CREATE TABLE IF NOT EXISTS public.blog_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- ---------------------------
-- Blog Activities Table
-- ---------------------------
CREATE TABLE IF NOT EXISTS public.blog_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('view', 'like', 'share', 'comment')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------
-- End of File
-- ---------------------------

COMMIT;

