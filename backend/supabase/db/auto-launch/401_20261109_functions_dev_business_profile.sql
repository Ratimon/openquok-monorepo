-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261109
-- MODULE SCOPE: Functions (local dev — optional OpenQuok business profile seed)
-- ---------------------------

BEGIN;

CREATE OR REPLACE FUNCTION public.auto_launch_dev_openquok_profile_seed_enabled()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(
        (
            SELECT (mc.config ->> 'SEED_OPENQUOK_BUSINESS_PROFILE_ON_ORG_CREATE')::boolean
            FROM public.module_configs AS mc
            WHERE mc.module_name = 'auto_launch'
        ),
        FALSE
    );
$$;

COMMENT ON FUNCTION public.auto_launch_dev_openquok_profile_seed_enabled() IS
    'When true (module_configs.auto_launch), new workspaces receive a pre-filled OpenQuok My Products profile for local dev.';

CREATE OR REPLACE FUNCTION public.auto_launch_ensure_openquok_business_profile(p_organization_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
    v_profile_id uuid;
    v_profile_data jsonb := $json$
{
    "slug": "openquok",
    "categories": ["SaaS", "Marketing", "Developer Tools"],
    "use_cases": ["Social Media Automation", "Content Creation", "AI Agents"],
    "target_audiences": ["Content Creators", "Social Media Managers", "Founders"],
    "platforms": ["Web", "API", "MCP", "CLI", "Chrome extension"],
    "tech_stack": ["TypeScript", "SvelteKit", "Node.js", "PostgreSQL", "Supabase"],
    "pricing_type": "freemium",
    "is_open_source": true,
    "repository_url": "https://github.com/Ratimon/openquok-monorepo",
    "launch_video_url": "https://www.youtube.com/watch?v=iKNimZ9FBu8",
    "gallery_urls": [],
    "social_x": "https://x.com/openquok",
    "social_youtube": "https://www.youtube.com/watch?v=iKNimZ9FBu8",
    "acquisition_listed": false
}
$json$::jsonb;
    v_openquok_description text := $html$
<p>OpenQuok is an open-source Content OS for social scheduling and directory launch. Plan, draft, schedule, and track posts from one workspace. Use the calendar and kanban board—you approve every post before it goes live.</p>
<p>Post everywhere you publish: Meta (Facebook Page, Instagram, Threads), LinkedIn, X, YouTube, TikTok, Bluesky, Dev.to, Skool, and Reddit. Connect AI agents through MCP, the openquok CLI, or the Public API.</p>
<p>Install the OpenQuok Chrome extension to autofill directory forms on PeerPush, Uneed, Open Launch, and more. Run on OpenQuok Cloud or self-host the full stack (AGPL on GitHub).</p>
$html$;
    v_description text;
BEGIN
    v_description := v_openquok_description;
    -- Uneed maps `profile_data.category` (single select); dashboard stores first Discovery category.
    v_profile_data := v_profile_data || jsonb_build_object(
        'category',
        NULLIF(TRIM(v_profile_data #>> '{categories,0}'), '')
    );

    IF p_organization_id IS NULL THEN
        RETURN NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.organizations AS o WHERE o.id = p_organization_id) THEN
        RETURN NULL;
    END IF;

    SELECT p.id
    INTO v_profile_id
    FROM public.auto_launch_product_profiles AS p
    WHERE p.organization_id = p_organization_id
      AND p.deleted_at IS NULL
      AND p.profile_kind = 'main'
      AND p.parent_profile_id IS NULL
    ORDER BY p.created_at ASC
    LIMIT 1;

    IF v_profile_id IS NOT NULL THEN
        -- Repair legacy rows where SQL dollar-quote delimiters were saved into description (local dev copy/paste).
        UPDATE public.auto_launch_product_profiles AS p
        SET
            description = v_openquok_description,
            updated_at = NOW()
        WHERE p.id = v_profile_id
          AND p.name = 'OpenQuok'
          AND (
              p.description LIKE '%$html$%'
              OR p.description LIKE '%$json$%'
          );
        RETURN v_profile_id;
    END IF;

    INSERT INTO public.auto_launch_product_profiles (
        organization_id,
        name,
        tagline,
        description,
        website_url,
        logo_url,
        profile_data,
        profile_kind,
        created_at,
        updated_at
    )
    VALUES (
        p_organization_id,
        'OpenQuok',
        'Save hours: agentic Social scheduling + Directory launch.',
        v_description,
        'https://www.openquok.com',
        'https://www.openquok.com/pwa/favicon-512.png',
        v_profile_data,
        'main',
        NOW(),
        NOW()
    )
    RETURNING id INTO v_profile_id;

    RETURN v_profile_id;
END;
$fn$;

COMMENT ON FUNCTION public.auto_launch_ensure_openquok_business_profile(uuid) IS
    'Idempotently inserts the exemplar OpenQuok business profile when the workspace has no main product profile.';

CREATE OR REPLACE FUNCTION public.auto_launch_trg_seed_openquok_profile_after_org()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF public.auto_launch_dev_openquok_profile_seed_enabled() THEN
        PERFORM public.auto_launch_ensure_openquok_business_profile(NEW.id);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_launch_seed_openquok_profile_on_org ON public.organizations;

CREATE TRIGGER trg_auto_launch_seed_openquok_profile_on_org
    AFTER INSERT ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_launch_trg_seed_openquok_profile_after_org();

REVOKE ALL ON FUNCTION public.auto_launch_dev_openquok_profile_seed_enabled() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auto_launch_ensure_openquok_business_profile(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auto_launch_dev_openquok_profile_seed_enabled() TO service_role;
GRANT EXECUTE ON FUNCTION public.auto_launch_ensure_openquok_business_profile(uuid) TO service_role;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
