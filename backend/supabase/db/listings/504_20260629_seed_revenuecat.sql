-- ---------------------------
-- MODULE NAME: Listings
-- MODULE DATE: 20260629
-- MODULE SCOPE: Seed (revenuecat)
-- ---------------------------
-- Community MCP listing: RevenueCat — analytics & metrics, subscription data.
-- Hub expanded card: mcp_tools table (required), click_url_mcp → MCP Doc button, install_command_mcp NULL.
-- mcp_server_config is for the detail-page install section only.

BEGIN;

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
    is_user_published,
    is_admin_published,
    schema_type,
    listing_category_id,
    faq,
    listing_tag_slugs
) VALUES
(
    'd5f7b000-0000-4000-a000-000000000103',
    NULL,
    NOW(),
    'RevenueCat MCP',
    'revenuecat-mcp',
    'RevenueCat MCP exposes subscription catalog and customer entitlement data to AI agents — inspect products, offerings, and subscriber state from Cursor, Claude Code, Codex, or VS Code Copilot over HTTP MCP.',
    NULL,
    'Connect the hosted RevenueCat MCP server to query and manage in-app purchase data from chat. OAuth is available on supported clients; otherwise authenticate with a RevenueCat API v2 secret key.',
    'Wire subscription metrics and entitlement state into your agent — products, offerings, and customer data over HTTP MCP from Cursor, Claude Code, Codex, or VS Code.',
    'https://www.revenuecat.com/docs/tools/mcp/setup',
    NULL,
    'https://www.revenuecat.com/docs/tools/mcp/setup',
    $revenuecat_mcp_content$## Overview

RevenueCat MCP connects your **in-app subscription stack** to coding agents. Ask about products, entitlements, offerings, and customer state without switching to the dashboard — useful when drafting launch posts, support replies, or release notes grounded in live subscription data.

## Server URL

```text
https://mcp.revenuecat.ai/mcp
```

Streamable HTTP transport. RevenueCat hosts the server; you authenticate per client.

## Authentication

Two options:

- **OAuth (recommended)** — supported on Claude, Codex, Copilot, Cursor, VS Code, and other listed clients. Sign in to RevenueCat when prompted.
- **API v2 secret key** — create a dedicated key in your RevenueCat project **API Keys** settings. Use a write-enabled key if the agent will create or modify resources; read-only works for inspection tasks.

## Client setup

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "servers": {
    "revenuecat": {
      "url": "https://mcp.revenuecat.ai/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_V2_SECRET_KEY"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add --transport http revenuecat https://mcp.revenuecat.ai/mcp
```

### OpenAI Codex

```bash
codex mcp add revenuecat --url https://mcp.revenuecat.ai/mcp
```

Or add a Streamable HTTP entry in Codex MCP settings with the URL above.

### VS Code Copilot

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "revenuecat-mcp": {
      "url": "https://mcp.revenuecat.ai/mcp",
      "type": "http"
    }
  }
}
```

Full instructions: [RevenueCat MCP setup](https://www.revenuecat.com/docs/tools/mcp/setup).

## Example prompts

```text
List entitlements configured in my RevenueCat project.
```

```text
Summarize active subscriptions for customer ID abc-123.
```

```text
What offerings are live in the default paywall?
```
$revenuecat_mcp_content$,
    NULL,
    $revenuecat_mcp_content$## Overview

RevenueCat MCP connects your **in-app subscription stack** to coding agents. Ask about products, entitlements, offerings, and customer state without switching to the dashboard — useful when drafting launch posts, support replies, or release notes grounded in live subscription data.

## Server URL

```text
https://mcp.revenuecat.ai/mcp
```

Streamable HTTP transport. RevenueCat hosts the server; you authenticate per client.

## Authentication

Two options:

- **OAuth (recommended)** — supported on Claude, Codex, Copilot, Cursor, VS Code, and other listed clients. Sign in to RevenueCat when prompted.
- **API v2 secret key** — create a dedicated key in your RevenueCat project **API Keys** settings. Use a write-enabled key if the agent will create or modify resources; read-only works for inspection tasks.

## Client setup

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "servers": {
    "revenuecat": {
      "url": "https://mcp.revenuecat.ai/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_V2_SECRET_KEY"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add --transport http revenuecat https://mcp.revenuecat.ai/mcp
```

### OpenAI Codex

```bash
codex mcp add revenuecat --url https://mcp.revenuecat.ai/mcp
```

Or add a Streamable HTTP entry in Codex MCP settings with the URL above.

### VS Code Copilot

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "revenuecat-mcp": {
      "url": "https://mcp.revenuecat.ai/mcp",
      "type": "http"
    }
  }
}
```

Full instructions: [RevenueCat MCP setup](https://www.revenuecat.com/docs/tools/mcp/setup).

## Example prompts

```text
List entitlements configured in my RevenueCat project.
```

```text
Summarize active subscriptions for customer ID abc-123.
```

```text
What offerings are live in the default paywall?
```
$revenuecat_mcp_content$,
    'extension',
    'mcp',
    NULL,
    NULL,
    FALSE,
    NULL,
    NULL,
    NULL,
    NULL,
    '1.0.0',
    '[
        {"name": "list_products", "description": "List in-app products configured in a RevenueCat project."},
        {"name": "list_entitlements", "description": "List entitlements and their attached products."},
        {"name": "list_offerings", "description": "List offerings and packages available for paywalls."},
        {"name": "get_customer", "description": "Look up a subscriber and their active entitlements."},
        {"name": "list_projects", "description": "List RevenueCat projects accessible to the authenticated account."}
    ]'::jsonb,
    'http',
    '{"url": "https://mcp.revenuecat.ai/mcp", "auth": "Bearer YOUR_API_V2_SECRET_KEY", "name": "revenuecat", "version": "1.0.0", "transport": "http"}'::jsonb,
    TRUE,
    TRUE,
    'SoftwareApplication',
    'd5f7b000-0000-4000-a000-000000000002',
    '[
        {"question": "Do I need an API key if my client supports OAuth?", "answer": "No. OAuth is the recommended path on Claude, Codex, Copilot, Cursor, and VS Code. Use an API v2 secret key when OAuth is unavailable or for automation hosts."},
        {"question": "Which API key permissions do I need?", "answer": "Use a write-enabled API v2 secret key if the agent will create or modify catalog resources. A read-only key is enough to inspect products, entitlements, and customer state."},
        {"question": "Is this the same as RevenueCat REST API v2?", "answer": "The MCP server wraps RevenueCat project data for agent tool calls. Complex automations may still use REST directly; MCP fits interactive inspection and drafting from your editor or terminal."},
        {"question": "Where do I create an API key?", "answer": "Open your RevenueCat dashboard, go to the project API Keys page, and create a dedicated v2 secret key for MCP use."}
    ]'::jsonb,
    ARRAY['claude-code', 'codex', 'cursor', 'vscode-copilot']::text[]
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
    source_repo_url = EXCLUDED.source_repo_url,
    skill_source_url = EXCLUDED.skill_source_url,
    skill_name = EXCLUDED.skill_name,
    license = EXCLUDED.license,
    version = EXCLUDED.version,
    mcp_tools = EXCLUDED.mcp_tools,
    mcp_transport = EXCLUDED.mcp_transport,
    mcp_server_config = EXCLUDED.mcp_server_config,
    is_user_published = EXCLUDED.is_user_published,
    is_admin_published = EXCLUDED.is_admin_published,
    schema_type = EXCLUDED.schema_type,
    listing_category_id = EXCLUDED.listing_category_id,
    faq = EXCLUDED.faq,
    listing_tag_slugs = EXCLUDED.listing_tag_slugs,
    updated_at = NOW(),
    published_at = COALESCE(public.listings.published_at, EXCLUDED.published_at);


INSERT INTO public.listings_listing_tags_association (listing_id, listing_tag_id)
SELECT l.id, t.id
FROM public.listings l
CROSS JOIN public.listing_tags t
WHERE l.slug = 'revenuecat-mcp'
  AND t.slug = ANY (ARRAY[
    'claude-code',
    'codex',
    'cursor',
    'vscode-copilot'
  ]::text[])
ON CONFLICT DO NOTHING;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
