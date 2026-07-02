-- ---------------------------
-- MODULE NAME: Listings
-- MODULE DATE: 20260630
-- MODULE SCOPE: Seed (openquok-core skill_commands + social-growth-stack)
-- ---------------------------
-- Populates skill_commands on openquok-core from the CLI command reference.
-- Seeds official stack: openquok-core + revenuecat-mcp with Larry-style workflow.

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

INSERT INTO public.listings (
    id,
    owner_id,
    published_at,
    title,
    slug,
    description,
    excerpt,
    content,
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
    NULL,
    NOW(),
    'Social Growth Stack',
    'social-growth-stack',
    'Publish a TikTok photo carousel with OpenQuok Core, review performance after it goes live, then layer RevenueCat subscription context on top of your channel analytics. Requires openquok-core and RevenueCat MCP — see Prerequisites in the exported SKILL.md.',
    'Schedule viral-style carousels with the openquok CLI, wait for publish, read channel analytics, then ask RevenueCat MCP for subscriber context. Install openquok-core + RevenueCat MCP first.',
    $stack_content$## Social Growth Stack

Ship a repeatable creator workflow without leaving your agent. **Prerequisites:** install and authenticate **openquok-core** (OpenQuok CLI + skill) and connect **RevenueCat MCP** when you want subscription context alongside social analytics.

1. **Connect channels** — `openquok integrations:list` to grab the integration UUID for TikTok (or another platform).
2. **Schedule content** — `openquok posts:create --json` with a photo-carousel payload (see workflow example JSON).
3. **Review** — wait for the scheduled publish window and sanity-check the live post.
4. **Measure reach** — `openquok analytics:platform <uuid> --days 7` for channel-level performance.
5. **Add revenue context** — prompt RevenueCat MCP for entitlements and subscriber state to interpret what growth means for your app.

Clone this stack in Skill Builder to export a SKILL.md with Prerequisites, Quick Reference, and workflow steps.
$stack_content$,
    'stack',
    NULL,
    TRUE,
    TRUE,
    TRUE,
    'CreativeWork',
    'd5f7b000-0000-4000-a000-000000000006',
    $stack_blueprint${
  "workflow_steps": [
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
  "generated_markdown": "## Prerequisites\n\nInstall **openquok-core** (OpenQuok CLI + skill) and connect **RevenueCat MCP** for the full publish → analytics → revenue loop.\n\n## Workflow\n\n1. openquok-core · integrations:list — List connected social channels and pick the integration UUID.\n2. openquok-core · posts:create — Schedule a TikTok photo carousel (see reference JSON).\n3. Wait for publish and review the live post.\n4. openquok-core · analytics:platform — Pull 7-day channel metrics.\n5. revenuecat-mcp · get_customer — Add subscription context to interpret growth."
}$stack_blueprint$::jsonb,
    ARRAY['openquok-core', 'revenuecat-mcp', 'tiktok']::text[]
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    excerpt = EXCLUDED.excerpt,
    content = EXCLUDED.content,
    listing_kind = EXCLUDED.listing_kind,
    is_official = EXCLUDED.is_official,
    is_user_published = EXCLUDED.is_user_published,
    is_admin_published = EXCLUDED.is_admin_published,
    schema_type = EXCLUDED.schema_type,
    listing_category_id = EXCLUDED.listing_category_id,
    stack_blueprint = EXCLUDED.stack_blueprint,
    listing_tag_slugs = EXCLUDED.listing_tag_slugs,
    updated_at = NOW(),
    published_at = COALESCE(public.listings.published_at, EXCLUDED.published_at);

DELETE FROM public.listing_stack_members lsm
USING public.listings l
WHERE lsm.stack_listing_id = l.id
  AND l.slug = 'social-growth-stack';

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
        ('revenuecat-mcp', 'mcp', 1)
) AS roles(member_slug, member_role, sort_order) ON TRUE
JOIN public.listings member ON member.slug = roles.member_slug
WHERE stack.slug = 'social-growth-stack'
ON CONFLICT (stack_listing_id, member_listing_id) DO UPDATE SET
    member_role = EXCLUDED.member_role,
    sort_order = EXCLUDED.sort_order;

DELETE FROM public.listings_listing_tags_association lta
USING public.listings l
WHERE lta.listing_id = l.id
  AND l.slug = 'social-growth-stack';

INSERT INTO public.listings_listing_tags_association (listing_id, listing_tag_id)
SELECT l.id, t.id
FROM public.listings l
JOIN public.listing_tags t ON t.slug = ANY (l.listing_tag_slugs)
WHERE l.slug = 'social-growth-stack'
ON CONFLICT DO NOTHING;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
