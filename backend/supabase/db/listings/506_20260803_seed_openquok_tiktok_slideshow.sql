-- ---------------------------
-- MODULE NAME: Listings
-- MODULE DATE: 20260803
-- MODULE SCOPE: Seed (openquok-tiktok-slideshow + viral-tiktok-carousel)
-- ---------------------------
-- Official skills-only listing: openquok-tiktok-slideshow (lightweight creator pipeline).
-- Updates viral-tiktok-carousel stack: openquok-core + openquok-tiktok-slideshow; no RevenueCat.

BEGIN;

-- ---------------------------
-- openquok-tiktok-slideshow (skills-only)
-- ---------------------------

INSERT INTO public.listings (
    id,
    owner_id,
    published_at,
    title,
    slug,
    description,
    description_skills,
    description_mcp,
    excerpt,
    click_url,
    click_url_skills,
    click_url_mcp,
    content,
    content_skills,
    content_mcp,
    listing_kind,
    extension_type,
    install_command_skills,
    install_command_mcp,
    is_official,
    source_repo_url,
    skill_source_url,
    skill_name,
    license,
    version,
    mcp_tools,
    mcp_transport,
    mcp_server_config,
    skill_commands,
    is_user_published,
    is_admin_published,
    schema_type,
    listing_category_id,
    faq,
    listing_tag_slugs
) VALUES (
    'd5f7b000-0000-4000-a000-000000000105',
    (SELECT id FROM public.users WHERE username = 'openquok' LIMIT 1),
    NOW(),
    'OpenQuok TikTok Slideshow',
    'openquok-tiktok-slideshow',
    'Generate TikTok photo-carousel slideshows with a locked character (AI images + text overlays) and post via the openquok CLI. Research any niche, lock face/body reference images, generate portrait frames, overlay text, then draft or schedule through openquok-core.',
    'Generate TikTok photo-carousel slideshows with a locked character (AI images + text overlays) and post via the openquok CLI. Research any niche, lock face/body reference images, generate portrait frames, overlay text, then draft or schedule through openquok-core.',
    NULL,
    'Research a channel, lock a character, generate portrait slides, overlay text, and post via openquok-core. Install with --copy so scripts/ are real files.',
    'https://www.openquok.com/docs/other-skills/openquok-tiktok-slideshow',
    'https://www.openquok.com/docs/other-skills/openquok-tiktok-slideshow',
    NULL,
    $tiktok_slideshow_skill$## Overview

Lightweight creator tooling: **research channel → lock character → generate → overlay → post via openquok**.

This skill **never replaces openquok-core**. It assumes `openquok` is on PATH, uses core media Rule 2 (`upload` → `{id,path}`), and TikTok photo-carousel / private-draft recipes from openquok-core.

| Property | Value |
|----------|-------|
| **name** | openquok-tiktok-slideshow |
| **requires** | openquok-core (CLI), Node 18+, canvas (overlays), image provider key |
| **allowed-tools** | Bash(openquok:*), Bash(node:*) |

## Install (Copy required)

Scripts must land as **real files** (not agent-dir symlinks only):

```bash
npx skills add https://github.com/Ratimon/openquok-monorepo/tree/main/agent --skill openquok-tiktok-slideshow --copy -y
```

## Prerequisites

| Need | Notes |
|------|-------|
| **openquok-core** + global CLI | Auth, `upload`, `posts:create` |
| **Node.js 18+** | All scripts under `scripts/` |
| **canvas** | Text overlays (`add-text-overlay.js`) |
| **Image provider** | Prefer OpenAI `gpt-image-1.5`; or Stability / Replicate / local images |
| **TikTok (or other) integration** | Connected in the OpenQuok workspace; UUID from `openquok integrations:list` |

## Pipeline

1. **Channel intent** — niche, audience pain, handle ideas, platforms.
2. **Research** — accounts, hooks, formats, gaps → `channel-research.json`.
3. **Lock character** — `character-profile.json` (`LOCKED` + `VARIATIONS`) plus face/body lock images under `refs/`.
4. **OpenQuok channel** — `integrations:list` → store integration UUID; prefer `SELF_ONLY` draft.
5. **Generate → overlay → post** — `generate-slides.js` → `add-text-overlay.js` → `post-via-openquok.js`.

Default posting: `SELF_ONLY` + `DIRECT_POST` so a human can add trending audio before going public.
$tiktok_slideshow_skill$,
    $tiktok_slideshow_skill$## Overview

Lightweight creator tooling: **research channel → lock character → generate → overlay → post via openquok**.

This skill **never replaces openquok-core**. It assumes `openquok` is on PATH, uses core media Rule 2 (`upload` → `{id,path}`), and TikTok photo-carousel / private-draft recipes from openquok-core.

| Property | Value |
|----------|-------|
| **name** | openquok-tiktok-slideshow |
| **requires** | openquok-core (CLI), Node 18+, canvas (overlays), image provider key |
| **allowed-tools** | Bash(openquok:*), Bash(node:*) |

## Install (Copy required)

Scripts must land as **real files** (not agent-dir symlinks only):

```bash
npx skills add https://github.com/Ratimon/openquok-monorepo/tree/main/agent --skill openquok-tiktok-slideshow --copy -y
```

## Prerequisites

| Need | Notes |
|------|-------|
| **openquok-core** + global CLI | Auth, `upload`, `posts:create` |
| **Node.js 18+** | All scripts under `scripts/` |
| **canvas** | Text overlays (`add-text-overlay.js`) |
| **Image provider** | Prefer OpenAI `gpt-image-1.5`; or Stability / Replicate / local images |
| **TikTok (or other) integration** | Connected in the OpenQuok workspace; UUID from `openquok integrations:list` |

## Pipeline

1. **Channel intent** — niche, audience pain, handle ideas, platforms.
2. **Research** — accounts, hooks, formats, gaps → `channel-research.json`.
3. **Lock character** — `character-profile.json` (`LOCKED` + `VARIATIONS`) plus face/body lock images under `refs/`.
4. **OpenQuok channel** — `integrations:list` → store integration UUID; prefer `SELF_ONLY` draft.
5. **Generate → overlay → post** — `generate-slides.js` → `add-text-overlay.js` → `post-via-openquok.js`.

Default posting: `SELF_ONLY` + `DIRECT_POST` so a human can add trending audio before going public.
$tiktok_slideshow_skill$,
    NULL,
    'extension',
    'skills',
    'npx skills add https://github.com/Ratimon/openquok-monorepo/tree/main/agent --skill openquok-tiktok-slideshow --copy -y',
    NULL,
    TRUE,
    'https://github.com/Ratimon/openquok-monorepo',
    'https://raw.githubusercontent.com/Ratimon/openquok-monorepo/main/agent/skills/openquok-tiktok-slideshow/SKILL.md',
    'openquok-tiktok-slideshow',
    'MIT',
    '1.0.0',
    NULL,
    NULL,
    NULL,
    $skill_commands$[
  {
    "name": "onboarding",
    "description": "Scaffold or validate a channel + character workspace (posts/, refs/, config, empty character profile).",
    "kind": "cli",
    "command_template": "node scripts/onboarding.js --init --dir tiktok-marketing/",
    "example_prompt": "Initialize a TikTok slideshow workspace and validate the config after the user fills channel and character fields."
  },
  {
    "name": "competitor-research",
    "description": "Save and query channel research findings (accounts, hooks, gaps) in channel-research.json.",
    "kind": "cli",
    "command_template": "node scripts/competitor-research.js --dir tiktok-marketing/ --summary",
    "example_prompt": "Summarize saved niche research and list gap opportunities before locking the character."
  },
  {
    "name": "generate-slides",
    "description": "Generate six portrait (1024×1536) slideshow frames from the locked character profile and per-slide variations.",
    "kind": "cli",
    "command_template": "node scripts/generate-slides.js --config tiktok-marketing/config.json --output tiktok-marketing/posts/YYYY-MM-DD-HHmm/ --prompts prompts.json",
    "example_prompt": "Generate six portrait slides using the locked character profile and today's variation prompts."
  },
  {
    "name": "add-text-overlay",
    "description": "Add white-fill / black-outline text overlays to raw slide images (requires node-canvas).",
    "kind": "cli",
    "command_template": "node scripts/add-text-overlay.js --input tiktok-marketing/posts/YYYY-MM-DD-HHmm/ --texts texts.json",
    "example_prompt": "Overlay Hook → Problem → Discovery → Transform → CTA text on the six raw slides."
  },
  {
    "name": "post-via-openquok",
    "description": "Upload finished slides via openquok and create a TikTok photo carousel (prefers SELF_ONLY draft).",
    "kind": "cli",
    "command_template": "node scripts/post-via-openquok.js --config tiktok-marketing/config.json --dir tiktok-marketing/posts/YYYY-MM-DD-HHmm/ --caption \"…\" --title \"Short title\"",
    "example_prompt": "Upload the finished slides and schedule a private TikTok photo carousel draft for human review."
  }
]$skill_commands$::jsonb,
    TRUE,
    TRUE,
    'SoftwareApplication',
    'd5f7b000-0000-4000-a000-000000000006',
    '[
        {"question": "Does this replace openquok-core?", "answer": "No. openquok-tiktok-slideshow requires the openquok CLI from openquok-core for auth, upload, and posts:create. Install both; use --copy when installing this skill so scripts/ are real files."},
        {"question": "Why install with --copy?", "answer": "The pipeline scripts under scripts/ must be real files on disk. Symlink-only installs omit or break node script execution on many agent hosts."},
        {"question": "What is a locked character?", "answer": "LOCKED traits (identity, face, body, signature) plus face_lock and body_lock reference images stay fixed after approval. Only VARIATIONS (outfit, pose, setting, etc.) change per post."},
        {"question": "Should I post publicly right away?", "answer": "Prefer privacy_level SELF_ONLY with DIRECT_POST so the carousel lands as a private draft. Add trending audio in TikTok, then publish."}
    ]'::jsonb,
    ARRAY['openquok-core', 'tiktok']::text[]
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    description_skills = EXCLUDED.description_skills,
    description_mcp = EXCLUDED.description_mcp,
    excerpt = EXCLUDED.excerpt,
    click_url = EXCLUDED.click_url,
    click_url_skills = EXCLUDED.click_url_skills,
    click_url_mcp = EXCLUDED.click_url_mcp,
    content = EXCLUDED.content,
    content_skills = EXCLUDED.content_skills,
    content_mcp = EXCLUDED.content_mcp,
    listing_kind = EXCLUDED.listing_kind,
    extension_type = EXCLUDED.extension_type,
    install_command_skills = EXCLUDED.install_command_skills,
    install_command_mcp = EXCLUDED.install_command_mcp,
    is_official = EXCLUDED.is_official,
    owner_id = EXCLUDED.owner_id,
    source_repo_url = EXCLUDED.source_repo_url,
    skill_source_url = EXCLUDED.skill_source_url,
    skill_name = EXCLUDED.skill_name,
    license = EXCLUDED.license,
    version = EXCLUDED.version,
    mcp_tools = EXCLUDED.mcp_tools,
    mcp_transport = EXCLUDED.mcp_transport,
    mcp_server_config = EXCLUDED.mcp_server_config,
    skill_commands = EXCLUDED.skill_commands,
    is_user_published = EXCLUDED.is_user_published,
    is_admin_published = EXCLUDED.is_admin_published,
    schema_type = EXCLUDED.schema_type,
    listing_category_id = EXCLUDED.listing_category_id,
    faq = EXCLUDED.faq,
    listing_tag_slugs = EXCLUDED.listing_tag_slugs,
    updated_at = NOW(),
    published_at = COALESCE(public.listings.published_at, EXCLUDED.published_at);

DELETE FROM public.listings_listing_tags_association lta
USING public.listings l
WHERE lta.listing_id = l.id
  AND l.slug = 'openquok-tiktok-slideshow';

INSERT INTO public.listings_listing_tags_association (listing_id, listing_tag_id)
SELECT l.id, t.id
FROM public.listings l
JOIN public.listing_tags t ON t.slug = ANY (l.listing_tag_slugs)
WHERE l.slug = 'openquok-tiktok-slideshow'
ON CONFLICT DO NOTHING;

-- ---------------------------
-- viral-tiktok-carousel stack (additive update; no RevenueCat)
-- ---------------------------

UPDATE public.listings
SET
    slug = 'viral-tiktok-carousel',
    title = 'Viral TikTok Carousel',
    updated_at = NOW()
WHERE id = 'd5f7b000-0000-4000-a000-000000000104'
   OR slug = 'social-growth-stack';

INSERT INTO public.listings (
    id,
    owner_id,
    published_at,
    title,
    slug,
    description,
    excerpt,
    content,
    source_repo_url,
    version,
    license,
    listing_kind,
    extension_type,
    is_official,
    is_user_published,
    is_admin_published,
    schema_type,
    listing_category_id,
    stack_blueprint,
    listing_tag_slugs
) VALUES (
    'd5f7b000-0000-4000-a000-000000000104',
    (SELECT id FROM public.users WHERE username = 'openquok' LIMIT 1),
    NOW(),
    'Viral TikTok Carousel',
    'viral-tiktok-carousel',
    'Research a niche, lock a consistent character, generate portrait slideshow images, overlay text, and schedule a TikTok photo carousel with OpenQuok Core. Requires openquok-core and openquok-tiktok-slideshow — see Prerequisites in the exported SKILL.md.',
    'Research → lock character → generate → overlay → post via openquok-core. Install openquok-core + openquok-tiktok-slideshow (--copy) first.',
    $stack_content$## Viral TikTok Carousel

Ship a repeatable creator workflow without leaving your agent. **Prerequisites:** install and authenticate **openquok-core** (OpenQuok CLI + skill), then install **openquok-tiktok-slideshow** with **Copy** so pipeline scripts are real files.

1. **Research the channel** — pick a niche, study peer accounts (hooks, formats, gaps), and save findings with the slideshow research helper.
2. **Lock the character** — write `character-profile.json` (`LOCKED` + `VARIATIONS`) and save face/body lock reference images. Do not change locks after approval.
3. **Generate slides** — run `generate-slides.js` with OpenAI GPT Image 1.5 (`gpt-image-1.5`) for portrait (1024×1536) frames (or Stability / Replicate / local).
4. **Overlay text** — `add-text-overlay.js` for Hook → Problem → Discovery → Transform → CTA copy.
5. **Schedule via openquok-core** — `post-via-openquok.js` uploads with `openquok upload` then creates a TikTok photo carousel (prefer `SELF_ONLY` draft so a human adds trending audio).
6. **Optional review** — after publish, `openquok analytics:platform <uuid> --days 7` for channel-level performance.

Clone this stack in Skill Builder to export a SKILL.md with Prerequisites, Quick Reference, and workflow steps.
$stack_content$,
    'https://github.com/Ratimon/openquok-monorepo',
    '1.0.0',
    'MIT',
    'stack',
    NULL,
    TRUE,
    TRUE,
    TRUE,
    'CreativeWork',
    'd5f7b000-0000-4000-a000-000000000007',
    $stack_blueprint${
  "workflow_steps": [
    {
      "type": "text",
      "title": "Research the channel",
      "content": "Define niche and audience pain. Research peer accounts for hooks, formats, sounds, and gaps. Save findings with openquok-tiktok-slideshow competitor-research.js into channel-research.json."
    },
    {
      "type": "text",
      "title": "Lock the character",
      "content": "Conversationally define identity. Write character-profile.json from the skill template (LOCKED immutable traits + VARIATIONS per post). Generate and save face_lock and body_lock reference images. Never change locks after approval."
    },
    {
      "type": "command",
      "listing_slug": "openquok-tiktok-slideshow",
      "command_name": "generate-slides",
      "title": "Generate portrait slideshow images",
      "command_template": "node scripts/generate-slides.js --config tiktok-marketing/config.json --output tiktok-marketing/posts/YYYY-MM-DD-HHmm/ --prompts prompts.json",
      "prompt": "Generate six portrait (1024×1536) slides from the locked character profile and today's variation prompts. Prefer OpenAI gpt-image-1.5."
    },
    {
      "type": "command",
      "listing_slug": "openquok-tiktok-slideshow",
      "command_name": "add-text-overlay",
      "title": "Add text overlays",
      "command_template": "node scripts/add-text-overlay.js --input tiktok-marketing/posts/YYYY-MM-DD-HHmm/ --texts texts.json",
      "prompt": "Overlay Hook → Problem → Discovery → Transform ×2 → CTA text on the six raw slides."
    },
    {
      "type": "command",
      "listing_slug": "openquok-core",
      "command_name": "integrations:list",
      "title": "Discover connected channels",
      "command_template": "# List all connected social channels (integration UUIDs)\nopenquok integrations:list",
      "prompt": "List connected social channels and pick the integration UUID for TikTok (or the platform you are publishing to)."
    },
    {
      "type": "command",
      "listing_slug": "openquok-tiktok-slideshow",
      "command_name": "post-via-openquok",
      "title": "Upload and schedule the carousel",
      "command_template": "node scripts/post-via-openquok.js --config tiktok-marketing/config.json --dir tiktok-marketing/posts/YYYY-MM-DD-HHmm/ --caption \"…\" --title \"Short title\"",
      "prompt": "Upload finished slides via openquok and create a TikTok photo carousel. Prefer SELF_ONLY + DIRECT_POST so a human can add trending audio before going public."
    },
    {
      "type": "command",
      "listing_slug": "openquok-core",
      "command_name": "analytics:platform",
      "title": "Measure channel performance (optional)",
      "command_template": "# Platform-level metrics for a connected channel (7, 30, or 90 days)\nopenquok analytics:platform <integration-uuid> --days 7",
      "prompt": "After the carousel is live, pull seven-day platform analytics for the same integration UUID."
    }
  ],
  "reference_assets": [
    {
      "type": "json",
      "label": "TikTok photo carousel payload",
      "payload": "{\n  \"scheduledAt\": \"2026-01-01T12:00:00.000Z\",\n  \"status\": \"scheduled\",\n  \"body\": \"Carousel caption — links in bio.\",\n  \"integrationIds\": [\"<integration-id>\"],\n  \"media\": [\n    { \"id\": \"<media-id-1>\", \"path\": \"https://cdn.example.com/a.jpg\" },\n    { \"id\": \"<media-id-2>\", \"path\": \"https://cdn.example.com/b.jpg\" }\n  ],\n  \"providerSettingsByIntegrationId\": {\n    \"<integration-id>\": {\n      \"title\": \"A short photo title\",\n      \"privacy_level\": \"SELF_ONLY\",\n      \"content_posting_method\": \"DIRECT_POST\"\n    }\n  }\n}"
    }
  ],
  "model_bindings": [
    {
      "use_case": "image_generation",
      "provider": "openai",
      "model": "gpt-image-1.5"
    },
    {
      "use_case": "image_editing",
      "provider": "openai",
      "model": "gpt-image-1.5"
    },
    {
      "use_case": "chat",
      "provider": "openai",
      "model": "gpt-5.5"
    }
  ],
  "generated_markdown": "## Prerequisites\n\nInstall **openquok-core** (OpenQuok CLI + skill) and **openquok-tiktok-slideshow** with **Copy** so `scripts/` are real files.\n\n## AI models\n\n- **Image generation & editing:** OpenAI GPT Image 1.5 (`gpt-image-1.5`) — portrait slideshow frames before overlay and upload.\n- **Chat & agents:** OpenAI GPT-5.5 — orchestrate research, character lock, and slide copy.\n\n## Workflow\n\n1. Research the niche and save channel-research.json.\n2. Lock character-profile.json plus face/body reference images.\n3. openquok-tiktok-slideshow · generate-slides — Six portrait frames from LOCKED + VARIATIONS.\n4. openquok-tiktok-slideshow · add-text-overlay — Hook → CTA overlays.\n5. openquok-core · integrations:list — Pick the TikTok integration UUID.\n6. openquok-tiktok-slideshow · post-via-openquok — Upload and create a SELF_ONLY carousel draft.\n7. (Optional) openquok-core · analytics:platform — Pull 7-day channel metrics after publish."
}$stack_blueprint$::jsonb,
    ARRAY['openquok-core', 'tiktok']::text[]
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    excerpt = EXCLUDED.excerpt,
    content = EXCLUDED.content,
    source_repo_url = EXCLUDED.source_repo_url,
    version = EXCLUDED.version,
    license = EXCLUDED.license,
    listing_kind = EXCLUDED.listing_kind,
    is_official = EXCLUDED.is_official,
    owner_id = EXCLUDED.owner_id,
    is_user_published = EXCLUDED.is_user_published,
    is_admin_published = EXCLUDED.is_admin_published,
    schema_type = EXCLUDED.schema_type,
    listing_category_id = EXCLUDED.listing_category_id,
    stack_blueprint = EXCLUDED.stack_blueprint,
    listing_tag_slugs = EXCLUDED.listing_tag_slugs,
    updated_at = NOW(),
    published_at = COALESCE(public.listings.published_at, EXCLUDED.published_at);

UPDATE public.listings
SET
    source_repo_url = 'https://github.com/Ratimon/openquok-monorepo',
    version = '1.0.0',
    license = 'MIT'
WHERE slug = 'viral-tiktok-carousel'
  AND (
      source_repo_url IS NULL OR btrim(source_repo_url) = ''
      OR version IS NULL OR btrim(version) = ''
      OR license IS NULL OR btrim(license) = ''
  );

DELETE FROM public.listing_stack_members lsm
USING public.listings l
WHERE lsm.stack_listing_id = l.id
  AND l.slug = 'viral-tiktok-carousel';

INSERT INTO public.listing_stack_members (stack_listing_id, member_listing_id, member_role, sort_order)
SELECT
    stack.id,
    member.id,
    roles.member_role,
    roles.sort_order
FROM public.listings stack
JOIN (
    VALUES
        ('openquok-core', 'skills', 0),
        ('openquok-tiktok-slideshow', 'skills', 1)
) AS roles(member_slug, member_role, sort_order) ON TRUE
JOIN public.listings member ON member.slug = roles.member_slug
WHERE stack.slug = 'viral-tiktok-carousel'
ON CONFLICT (stack_listing_id, member_listing_id) DO UPDATE SET
    member_role = EXCLUDED.member_role,
    sort_order = EXCLUDED.sort_order;

DELETE FROM public.listings_listing_tags_association lta
USING public.listings l
WHERE lta.listing_id = l.id
  AND l.slug = 'viral-tiktok-carousel';

INSERT INTO public.listings_listing_tags_association (listing_id, listing_tag_id)
SELECT l.id, t.id
FROM public.listings l
JOIN public.listing_tags t ON t.slug = ANY (l.listing_tag_slugs)
WHERE l.slug = 'viral-tiktok-carousel'
ON CONFLICT DO NOTHING;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
