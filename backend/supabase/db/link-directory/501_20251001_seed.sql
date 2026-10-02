-- ---------------------------
-- MODULE NAME: Link Directory
-- MODULE DATE: 20251001
-- MODULE SCOPE: Seed (editorial catalog tags; facet browse uses opportunity fields + virtual slugs in app code)
-- ---------------------------

BEGIN;

INSERT INTO public.link_directory_categories (
    id,
    name,
    slug,
    headline,
    description,
    sort_order
) VALUES
    (
        'd5f7d000-0001-4000-a000-000000000001',
        'Social platforms',
        'social-platforms',
        'Earn links on social networks',
        'Profiles, posts, threads, and community answers on major social platforms.',
        10
    ),
    (
        'd5f7d000-0001-4000-a000-000000000002',
        'Launch platforms',
        'launch-platforms',
        'Product launch and startup listings',
        'Directories and launch sites where you submit products for visibility and backlinks — including GitHub awesome lists and README links when relevant.',
        20
    ),
    (
        'd5f7d000-0001-4000-a000-000000000004',
        'Maker and dev directories',
        'maker-dev-directory',
        'Builders, OSS, and dev communities',
        'GitHub lists, dev communities, and maker hubs.',
        40
    ),
    (
        'd5f7d000-0001-4000-a000-000000000005',
        'AI tool directories',
        'ai-tool-directory',
        'AI product listings',
        'Directories focused on AI tools and agents, plus GitHub catalog and list contributions where editors accept them.',
        50
    )
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    headline = EXCLUDED.headline,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;

INSERT INTO public.link_directory_tag_groups (id, name, sort_order) VALUES
    ('d5f7d000-0002-4000-a000-000000000002', 'Community', 20),
    ('d5f7d000-0002-4000-a000-000000000003', 'Platform', 30),
    ('d5f7d000-0002-4000-a000-000000000004', 'Quality', 40)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    sort_order = EXCLUDED.sort_order;

INSERT INTO public.link_directory_tags (id, name, slug, description) VALUES
    ('d5f7d000-0003-4000-a000-000000000006', 'High domain rating', 'high-dr', 'Strong estimated authority for the host domain.'),
    ('d5f7d000-0003-4000-a000-000000000007', 'Community moderated', 'community-moderated', 'Moderators or community rules gate visibility.'),
    (
        'd5f7d000-0003-4000-a000-000000000008',
        'GitHub',
        'github',
        'Backlinks earned on GitHub — awesome lists, profile README links, or pull requests. Applies across launch, AI, and maker directories.'
    )
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description;

INSERT INTO public.link_directory_tag_groups_tags_association (
    link_directory_tag_id,
    link_directory_tag_group_id
) VALUES
    ('d5f7d000-0003-4000-a000-000000000007', 'd5f7d000-0002-4000-a000-000000000002'),
    ('d5f7d000-0003-4000-a000-000000000008', 'd5f7d000-0002-4000-a000-000000000003'),
    ('d5f7d000-0003-4000-a000-000000000006', 'd5f7d000-0002-4000-a000-000000000004')
ON CONFLICT DO NOTHING;

INSERT INTO public.link_directory_opportunity_types (id, slug, label, description, sort_order) VALUES
    ('d5f7d000-0004-4000-a000-000000000001', 'post_link', 'Post link', 'Link in a feed post or update.', 10),
    ('d5f7d000-0004-4000-a000-000000000002', 'profile_link', 'Profile link', 'Website field on a profile or page.', 20),
    ('d5f7d000-0004-4000-a000-000000000003', 'comment_link', 'Comment link', 'Link shared in a comment or reply.', 30),
    ('d5f7d000-0004-4000-a000-000000000004', 'qa_link', 'Q&A link', 'Answer or thread where a link is allowed.', 40),
    ('d5f7d000-0004-4000-a000-000000000005', 'thread_link', 'Thread link', 'Multi-post thread with a prominent link.', 50),
    ('d5f7d000-0004-4000-a000-000000000006', 'product_submission', 'Product submission', 'Submit a product or startup listing.', 60),
    ('d5f7d000-0004-4000-a000-000000000007', 'guest_post', 'Guest post', 'Contributed article with editorial review.', 70),
    ('d5f7d000-0004-4000-a000-000000000008', 'github_contribution', 'GitHub contribution', 'Pull request or list entry on GitHub.', 80),
    ('d5f7d000-0004-4000-a000-000000000009', 'other', 'Other', 'Custom workflow not covered by other types.', 90)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    label = EXCLUDED.label,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
