-- ---------------------------
-- MODULE NAME: Organization
-- MODULE DATE: 20260309
-- MODULE SCOPE: Tables
-- ---------------------------
-- Prefix 103 ensures this runs after user-management (101, creates users) and user-auth (102).
-- user_organizations references public.users(id).

BEGIN;

-- ---------------------------
-- Organization role (membership)
-- ---------------------------

DO $$ BEGIN
    CREATE TYPE public.workspace_membership_role AS ENUM ('user', 'admin', 'superadmin');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE public.workspace_membership_role IS 'Role of a user within a workspace/organization membership';

-- ---------------------------
-- Organizations
-- ---------------------------

CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    api_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.organizations IS 'Organizations (workspaces/tenants). Tenant key for org-scoped rows (e.g. public.posts.organization_id, public.comments.organization_id).';
COMMENT ON COLUMN public.organizations.api_key IS 'Optional API key for programmatic access';

-- ---------------------------
-- User-Organization membership
-- ---------------------------

CREATE TABLE IF NOT EXISTS public.user_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    role public.workspace_membership_role NOT NULL DEFAULT 'user',
    disabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_user_organization UNIQUE (user_id, organization_id)
);

COMMENT ON TABLE public.user_organizations IS 'Junction: users belong to organizations with a role';
COMMENT ON COLUMN public.user_organizations.role IS 'workspace_membership_role (user | admin | superadmin)';
COMMENT ON COLUMN public.user_organizations.disabled IS 'When true, membership is inactive';

-- ---------------------------
-- Organization invites (pending)
-- ---------------------------

CREATE TABLE IF NOT EXISTS public.organization_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'admin')),
    invited_by_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);

COMMENT ON TABLE public.organization_invites IS 'Pending workspace invites (by email); invitee can accept from list or via link';

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
