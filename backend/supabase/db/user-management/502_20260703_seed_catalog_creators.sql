-- ---------------------------
-- MODULE NAME: User Management
-- MODULE DATE: 20260703
-- MODULE SCOPE: Seed
-- ---------------------------
-- Public catalog publisher for seeded listings (official hub entries).
-- Not a login account: auth_id is NULL and is_super_admin is FALSE.
-- Platform super admin is exactly one real user — set manually after signup (see docs/admin/super-admin).

BEGIN;

INSERT INTO public.users (
    id,
    auth_id,
    email,
    full_name,
    username,
    is_super_admin,
    is_email_verified,
    created_at,
    updated_at
) VALUES (
    'd5f7a100-0000-4000-a000-000000000001',
    NULL,
    'catalog@openquok.local',
    'OpenQuok',
    'openquok',
    FALSE,
    TRUE,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username,
    is_super_admin = FALSE,
    is_email_verified = EXCLUDED.is_email_verified,
    updated_at = NOW();

INSERT INTO public.user_profiles (owner_id, tag_line, created_at, updated_at)
VALUES (
    'd5f7a100-0000-4000-a000-000000000001',
    'Official OpenQuok building blocks and playbooks.',
    NOW(),
    NOW()
)
ON CONFLICT (owner_id) DO UPDATE SET
    tag_line = EXCLUDED.tag_line,
    updated_at = NOW();

-- Remove legacy duplicate catalog user if present from an earlier seed revision.
DELETE FROM public.user_profiles
WHERE owner_id = 'd5f7a100-0000-4000-a000-000000000002';

DELETE FROM public.users
WHERE id = 'd5f7a100-0000-4000-a000-000000000002';

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
