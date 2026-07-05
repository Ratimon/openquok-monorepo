-- ---------------------------
-- MODULE NAME: Listings
-- MODULE DATE: 20260630
-- MODULE SCOPE: Seed (openquok-core skill_commands + viral-tiktok-carousel)
-- ---------------------------
-- Populates skill_commands on openquok-core from the CLI command reference.
-- Seeds official skills playbook: openquok-core stack member (RevenueCat MCP stays in blueprint prerequisites).

BEGIN;

UPDATE public.listings
SET
    skill_commands = $skill_commands$[
  {
    "name": "config:show",
    "description": "Print resolved API URLs, auth server, deployment mode, and value sources (no secrets).",
    "kind": "cli",
    "command_template": "openquok config:show"
  },
  {
    "name": "auth:login",
    "description": "Start device OAuth login. Messaging agents should use --json --no-poll, then auth:login:poll.",
    "kind": "cli",
    "command_template": "openquok auth:login --json --no-poll",
    "example_prompt": "Start device login and return the verification URL for the user to authorize."
  },
  {
    "name": "auth:login:poll",
    "description": "Complete device OAuth after the user authorizes in the browser.",
    "kind": "cli",
    "command_template": "openquok auth:login:poll --device-code \"<device_code>\""
  },
  {
    "name": "auth:status",
    "description": "Check whether stored credentials or OPENQUOK_API_KEY are valid.",
    "kind": "cli",
    "command_template": "openquok auth:status"
  },
  {
    "name": "auth:workspace",
    "description": "Return the current workspace id and name for connected credentials.",
    "kind": "cli",
    "command_template": "openquok auth:workspace"
  },
  {
    "name": "auth:logout",
    "description": "Clear stored CLI credentials.",
    "kind": "cli",
    "command_template": "openquok auth:logout"
  },
  {
    "name": "integrations:list",
    "description": "List connected social channels. Optionally filter by channel group id.",
    "kind": "cli",
    "command_template": "# List all connected social channels (integration UUIDs)\nopenquok integrations:list",
    "example_prompt": "List connected channels and return the integration UUID for the target platform."
  },
  {
    "name": "integrations:groups",
    "description": "List channel groups (integration customers) for the workspace.",
    "kind": "cli",
    "command_template": "openquok integrations:groups"
  },
  {
    "name": "integrations:settings",
    "description": "Return posting rules, character limits, settings schema, and allow-listed tools for an integration.",
    "kind": "cli",
    "command_template": "openquok integrations:settings <integration-uuid>"
  },
  {
    "name": "integrations:trigger",
    "description": "Invoke a single allow-listed provider method on a connected channel.",
    "kind": "cli",
    "command_template": "openquok integrations:trigger <integration-uuid> <method-name> --data '<json>'"
  },
  {
    "name": "posts:list",
    "description": "List scheduled and draft posts in a date window (default ±30 local calendar days).",
    "kind": "cli",
    "command_template": "openquok posts:list --start \"2026-01-01T00:00:00Z\" --end \"2026-02-01T00:00:00Z\""
  },
  {
    "name": "posts:create",
    "description": "Create or schedule social posts. Supports flags, repeated bodies for threads, or a full JSON payload.",
    "kind": "cli",
    "command_template": "# Create or schedule a post (upload media first — Rule 2 in openquok-core)\nopenquok posts:create --json ./post.json",
    "example_prompt": "Schedule a TikTok photo carousel using the example JSON payload.",
    "example_payload": {
      "scheduledAt": "2026-01-01T12:00:00.000Z",
      "status": "scheduled",
      "body": "Carousel caption — links in bio.",
      "integrationIds": ["<integration-id>"],
      "media": [
        { "id": "<media-id-1>", "path": "https://cdn.example.com/a.jpg" },
        { "id": "<media-id-2>", "path": "https://cdn.example.com/b.jpg" }
      ],
      "providerSettingsByIntegrationId": {
        "<integration-id>": {
          "title": "A short photo title",
          "privacy_level": "PUBLIC_TO_EVERYONE",
          "content_posting_method": "DIRECT_POST"
        }
      }
    }
  },
  {
    "name": "posts:status",
    "description": "Flip a post between draft and scheduled at its stored publish time.",
    "kind": "cli",
    "command_template": "openquok posts:status <post-id> --status draft"
  },
  {
    "name": "posts:review-todo",
    "description": "Attach a review note to a post row.",
    "kind": "cli",
    "command_template": "openquok posts:review-todo <post-id> --note \"Needs approval\""
  },
  {
    "name": "posts:delete",
    "description": "Delete a post row from the workspace.",
    "kind": "cli",
    "command_template": "openquok posts:delete <post-id>"
  },
  {
    "name": "posts:missing",
    "description": "List provider release candidates when release_id is missing for analytics linking.",
    "kind": "cli",
    "command_template": "openquok posts:missing <post-id>"
  },
  {
    "name": "posts:connect",
    "description": "Link a post to a provider release id for per-post analytics.",
    "kind": "cli",
    "command_template": "openquok posts:connect <post-id> --release-id \"<provider-release-id>\""
  },
  {
    "name": "analytics:platform",
    "description": "Fetch platform-level metrics for a connected channel (7, 30, or 90 days).",
    "kind": "cli",
    "command_template": "# Platform-level metrics for a connected channel (7, 30, or 90 days)\nopenquok analytics:platform <integration-uuid> --days 7",
    "example_prompt": "Pull seven-day platform analytics for the integration used to publish the carousel."
  },
  {
    "name": "analytics:post",
    "description": "Fetch per-post metrics for a published post row.",
    "kind": "cli",
    "command_template": "openquok analytics:post <post-id> --days 7"
  },
  {
    "name": "upload",
    "description": "Upload a local image or video; returns media id and path for posts:create.",
    "kind": "cli",
    "command_template": "openquok upload ./image.png"
  },
  {
    "name": "upload-from-url",
    "description": "Upload media from a remote URL; returns media id and path for posts:create.",
    "kind": "cli",
    "command_template": "openquok upload-from-url \"https://cdn.example.com/banner.png\""
  }
]$skill_commands$::jsonb,
    updated_at = NOW()
WHERE slug = 'openquok-core';

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
    'Publish a TikTok photo carousel with OpenQuok Core, review performance after it goes live, then layer RevenueCat subscription context on top of your channel analytics. Generate portrait slideshow images with OpenAI GPT Image 1.5 before scheduling — the model proven TikTok marketing playbooks use for photorealistic slides. Requires openquok-core and RevenueCat MCP — see Prerequisites in the exported SKILL.md.',
    'Schedule viral-style carousels with GPT Image 1.5 slides, the openquok CLI, channel analytics, and RevenueCat subscriber context. Install openquok-core + RevenueCat MCP first.',
    $stack_content$## Viral TikTok Carousel

Ship a repeatable creator workflow without leaving your agent. **Prerequisites:** install and authenticate **openquok-core** (OpenQuok CLI + skill) and connect **RevenueCat MCP** when you want subscription context alongside social analytics.

1. **Generate slides** — use **OpenAI GPT Image 1.5** (`gpt-image-1.5`) for portrait (1024×1536) slideshow images. Prefer 1.5 over earlier image models for photorealistic, phone-camera-style frames that hold attention in the feed.
2. **Connect channels** — `openquok integrations:list` to grab the integration UUID for TikTok (or another platform).
3. **Schedule content** — upload slide images with `openquok upload`, then `openquok posts:create --json` with a photo-carousel payload (see workflow example JSON).
4. **Review** — wait for the scheduled publish window and sanity-check the live post.
5. **Measure reach** — `openquok analytics:platform <uuid> --days 7` for channel-level performance.
6. **Add revenue context** — prompt RevenueCat MCP for entitlements and subscriber state to interpret what growth means for your app.

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
      "title": "Generate portrait slideshow images",
      "content": "Generate six portrait (1024×1536) slideshow images with OpenAI GPT Image 1.5 (gpt-image-1.5). Use consistent scene anchors across slides, iPhone-photo-style prompts, and realistic lighting before adding text overlays and uploading to OpenQuok."
    },
    {
      "type": "command",
      "listing_slug": "openquok-core",
      "command_name": "integrations:list",
      "title": "Discover connected channels",
      "command_template": "# List all connected social channels (integration UUIDs)\nopenquok integrations:list",
      "prompt": "List connected social channels and pick the integration UUID for the platform you are publishing to."
    },
    {
      "type": "command",
      "listing_slug": "openquok-core",
      "command_name": "posts:create",
      "title": "Schedule a post",
      "command_template": "# Create or schedule a post (upload media first — Rule 2 in openquok-core)\nopenquok posts:create --json ./post.json",
      "prompt": "Schedule a TikTok photo carousel using the example JSON payload. Upload images first with openquok upload when paths are local files.",
      "example_payload": {
        "scheduledAt": "2026-01-01T12:00:00.000Z",
        "status": "scheduled",
        "body": "Carousel caption — links in bio.",
        "integrationIds": ["<integration-id>"],
        "media": [
          { "id": "<media-id-1>", "path": "https://cdn.example.com/a.jpg" },
          { "id": "<media-id-2>", "path": "https://cdn.example.com/b.jpg" }
        ],
        "providerSettingsByIntegrationId": {
          "<integration-id>": {
            "title": "A short photo title",
            "privacy_level": "PUBLIC_TO_EVERYONE",
            "content_posting_method": "DIRECT_POST"
          }
        }
      }
    },
    {
      "type": "text",
      "title": "Review the live post",
      "content": "Wait for the scheduled publish time, then review the live post before pulling metrics."
    },
    {
      "type": "command",
      "listing_slug": "openquok-core",
      "command_name": "analytics:platform",
      "title": "Measure channel performance",
      "command_template": "# Platform-level metrics for a connected channel (7, 30, or 90 days)\nopenquok analytics:platform <integration-uuid> --days 7",
      "prompt": "Pull seven-day platform analytics for the same integration UUID used when scheduling the carousel."
    },
    {
      "type": "command",
      "listing_slug": "revenuecat-mcp",
      "command_name": "get_customer",
      "title": "Add revenue context",
      "prompt": "Summarize active subscriptions and entitlements for a customer id to contextualize how social reach maps to revenue."
    }
  ],
  "reference_assets": [
    {
      "type": "json",
      "label": "TikTok photo carousel payload",
      "payload": "{\n  \"scheduledAt\": \"2026-01-01T12:00:00.000Z\",\n  \"status\": \"scheduled\",\n  \"body\": \"Carousel caption — links in bio.\",\n  \"integrationIds\": [\"<integration-id>\"],\n  \"media\": [\n    { \"id\": \"<media-id-1>\", \"path\": \"https://cdn.example.com/a.jpg\" },\n    { \"id\": \"<media-id-2>\", \"path\": \"https://cdn.example.com/b.jpg\" }\n  ],\n  \"providerSettingsByIntegrationId\": {\n    \"<integration-id>\": {\n      \"title\": \"A short photo title\",\n      \"privacy_level\": \"PUBLIC_TO_EVERYONE\",\n      \"content_posting_method\": \"DIRECT_POST\"\n    }\n  }\n}"
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
  "generated_markdown": "## Prerequisites\n\nInstall **openquok-core** (OpenQuok CLI + skill) and connect **RevenueCat MCP** for the full publish → analytics → revenue loop.\n\n## AI models\n\n- **Image generation & editing:** OpenAI GPT Image 1.5 (`gpt-image-1.5`) — portrait slideshow frames before upload.\n- **Chat & agents:** OpenAI GPT-5.5 — orchestrate research, hooks, and the daily feedback loop.\n\n## Workflow\n\n1. Generate portrait slideshow images with GPT Image 1.5.\n2. openquok-core · integrations:list — List connected social channels and pick the integration UUID.\n3. openquok-core · posts:create — Schedule a TikTok photo carousel (see reference JSON).\n4. Wait for publish and review the live post.\n5. openquok-core · analytics:platform — Pull 7-day channel metrics.\n6. revenuecat-mcp · get_customer — Add subscription context to interpret growth."
}$stack_blueprint$::jsonb,
    ARRAY['openquok-core', 'revenuecat-mcp', 'tiktok']::text[]
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
        ('openquok-core', 'skills', 0)
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
