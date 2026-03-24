-- ---------------------------
-- MODULE NAME: Blog System Seed Data
-- MODULE DATE: 20260313
-- MODULE SCOPE: Initial Data
-- ---------------------------

BEGIN;

-- ---------------------------
-- Create Blog Images Bucket
-- ---------------------------
INSERT INTO storage.buckets (
    id, 
    name,
    public,
    avif_autodetection,
    file_size_limit,
    allowed_mime_types
) VALUES (
    'blog_images',
    'blog_images',
    TRUE,
    FALSE,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------
-- Seed Blog Topics
-- ---------------------------
-- Main Topics
INSERT INTO public.blog_topics (id, name, description) VALUES
    ('d5f7a000-0000-4000-a000-000000000001', 'Customer Success & Social Proof', 'Real-world customer outcomes and credibility-building stories'),
    ('d5f7a000-0000-4000-a000-000000000002', 'Education & Enablement', 'Practical learning content to help users succeed with the product'),
    ('d5f7a000-0000-4000-a000-000000000003', 'Product Communication', 'Feature updates, roadmap direction, and adoption guidance'),
    ('d5f7a000-0000-4000-a000-000000000004', 'Competitive Evaluation & Buyer Guidance', 'Decision-support content for product comparisons and buying choices')
ON CONFLICT (id) DO NOTHING;

-- Customer Success & Social Proof Subtopics
INSERT INTO public.blog_topics (id, name, description, parent_id) VALUES
    ('d5f7a000-0000-4000-a000-000000000101', 'Customer Success Stories', 'Narratives showing how customers solved key problems and reached measurable outcomes', 'd5f7a000-0000-4000-a000-000000000001'),
    ('d5f7a000-0000-4000-a000-000000000102', 'Case Studies', 'Structured deep-dives into implementation, impact, and lessons learned', 'd5f7a000-0000-4000-a000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Education & Enablement Subtopics
INSERT INTO public.blog_topics (id, name, description, parent_id) VALUES
    ('d5f7a000-0000-4000-a000-000000000201', 'Educational Guides', 'Foundational explainers and actionable guidance for target use cases', 'd5f7a000-0000-4000-a000-000000000002'),
    ('d5f7a000-0000-4000-a000-000000000202', 'How-to Tutorials', 'Step-by-step walkthroughs for completing specific jobs in the product', 'd5f7a000-0000-4000-a000-000000000002'),
    ('d5f7a000-0000-4000-a000-000000000203', 'Feature Walkthroughs by Use Case', 'Practical examples of feature usage across roles and scenarios', 'd5f7a000-0000-4000-a000-000000000002'),
    ('d5f7a000-0000-4000-a000-000000000204', 'Common Mistakes & Troubleshooting', 'Frequent pitfalls, root causes, and guided fixes', 'd5f7a000-0000-4000-a000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- Product Communication Subtopics
INSERT INTO public.blog_topics (id, name, description, parent_id) VALUES
    ('d5f7a000-0000-4000-a000-000000000301', 'Product Updates', 'Release-focused updates framed around customer benefits and outcomes', 'd5f7a000-0000-4000-a000-000000000003'),
    ('d5f7a000-0000-4000-a000-000000000302', 'Roadmap Previews', 'Forward-looking posts that explain upcoming direction and priorities', 'd5f7a000-0000-4000-a000-000000000003'),
    ('d5f7a000-0000-4000-a000-000000000303', 'Adoption Announcements & Migration Tips', 'Enablement content for rollout, onboarding, and transition planning', 'd5f7a000-0000-4000-a000-000000000003')
ON CONFLICT (id) DO NOTHING;

-- Competitive Evaluation & Buyer Guidance Subtopics
INSERT INTO public.blog_topics (id, name, description, parent_id) VALUES
    ('d5f7a000-0000-4000-a000-000000000401', 'Versus Comparison Posts', 'Head-to-head comparisons that clarify key differences and fit', 'd5f7a000-0000-4000-a000-000000000004'),
    ('d5f7a000-0000-4000-a000-000000000402', 'Buyer Decision Frameworks', 'Decision criteria and scoring approaches for selecting a solution', 'd5f7a000-0000-4000-a000-000000000004'),
    ('d5f7a000-0000-4000-a000-000000000403', 'When to Choose X vs Y Scenarios', 'Scenario-based guidance to choose the right option for constraints and goals', 'd5f7a000-0000-4000-a000-000000000004')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------
-- Seed Sample Blog Post
-- ---------------------------
INSERT INTO public.blog_posts (
    title,
    description,
    content,
    topic_id,
    is_admin_approved,
    is_user_published
) VALUES (
    'Welcome to Our Blog',
    'Learn about our blog system and how to use it effectively',
    '# Welcome to Our Blog

This is a sample blog post that demonstrates the capabilities of our blog system.

## Features

- Rich text editing
- Beautiful and responsive design
- SEO optimization
- And much more!

Get started by creating your first blog post today!',
    'd5f7a000-0000-4000-a000-000000000202', -- How-to Tutorials subtopic
    true,
    true
)
ON CONFLICT DO NOTHING;

-- ---------------------------
-- Module Configs
-- ---------------------------

INSERT INTO public.module_configs (module_name, config) VALUES
(
    'blog',
    '{
  "BLOG_POST_SEO_META_TITLE": "Blog",
  "BLOG_POST_SEO_META_DESCRIPTION": "Here you can find all published blog posts.",
  "BLOG_POST_SEO_META_TAGS": "blog, articles, news, content"
}'::jsonb
)
ON CONFLICT (module_name) DO NOTHING;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

