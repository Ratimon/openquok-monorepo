-- ---------------------------
-- MODULE NAME: Listings
-- MODULE DATE: 20260629
-- MODULE SCOPE: Seed (bloom)
-- ---------------------------
-- Community MCP listing: Bloom — creative & media, on-brand image generation.
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
    'd5f7b000-0000-4000-a000-000000000102',
    (SELECT id FROM public.users WHERE username = 'openquok' LIMIT 1),
    NOW(),
    'Bloom MCP',
    'bloom-mcp',
    'Bloom MCP is the brand layer for agents — onboard a brand from a website or Instagram handle, then generate, edit, resize, and adapt on-brand images from chat in Cursor, Claude, Codex, OpenClaw, Hermes, and other MCP clients.',
    NULL,
    'Connect Bloom over HTTP MCP to onboard brands and produce on-brand images without re-describing colors, fonts, and tone every session. OAuth sign-in or an API key; async generations return inline in supported clients.',
    'Onboard your brand once, then generate and edit on-brand images from any MCP client — website or Instagram URL in, campaign-ready assets out.',
    'https://www.trybloom.ai/docs/mcp/getting-started',
    NULL,
    'https://www.trybloom.ai/docs/mcp/getting-started',
    $bloom_mcp_content$## Overview

Bloom turns your brand into a working system that agents can call over the Model Context Protocol. Onboard from a **website** or **Instagram @handle** — Bloom pulls colors, fonts, logo, and visual tone — then every generation stays on-brand.

Use Bloom when your social workflow needs **campaign heroes, lifestyle shots, quote cards, or platform-specific sizes** before you schedule with OpenQuok.

## Connect in three steps

1. **Open your MCP client** — Claude (custom connector), Cursor, ChatGPT, Claude Code, VS Code, Codex, OpenClaw, or Hermes Agent.
2. **Add the Bloom server URL** — `https://www.trybloom.ai/api/mcp`
3. **Sign in with Bloom** — OAuth in the browser on first connect, or configure an API key for headless hosts.

Full client-specific steps: [Bloom MCP setup](https://www.trybloom.ai/docs/mcp/getting-started).

## What you can do

- **Onboard a brand** — `Onboard pagecraft.com as a brand in Bloom.` or point at an Instagram profile.
- **Generate images** — describe the shot; Bloom uses your brand profile for palette and tone.
- **Edit and adapt** — brighten backgrounds, add details, remove backgrounds, or vectorize logos.
- **Resize for channels** — recompose one hero into Story, feed, and banner aspect ratios (pairs well with OpenQuok scheduling).
- **Batch campaigns** — request many variants in one message; Bloom queues parallel generations.

Prefer REST? The same brand layer is available at [Bloom API](https://www.trybloom.ai/docs/api) with `x-api-key` or OAuth bearer tokens.

## Example prompts

```text
Onboard acme.com as a brand in Bloom.
```

```text
Using my Acme brand, generate a 16:9 launch hero — clean, confident, spring palette.
```

```text
Resize the latest hero for an IG Story and a YouTube banner.
```

## MCP configuration

HTTP transport. Most clients add a custom connector or remote MCP entry pointing at:

```json
{
  "url": "https://www.trybloom.ai/api/mcp",
  "name": "bloom",
  "transport": "http"
}
```

OAuth is the default path for interactive clients; use a Bloom API key when OAuth is unavailable.
$bloom_mcp_content$,
    NULL,
    $bloom_mcp_content$## Overview

Bloom turns your brand into a working system that agents can call over the Model Context Protocol. Onboard from a **website** or **Instagram @handle** — Bloom pulls colors, fonts, logo, and visual tone — then every generation stays on-brand.

Use Bloom when your social workflow needs **campaign heroes, lifestyle shots, quote cards, or platform-specific sizes** before you schedule with OpenQuok.

## Connect in three steps

1. **Open your MCP client** — Claude (custom connector), Cursor, ChatGPT, Claude Code, VS Code, Codex, OpenClaw, or Hermes Agent.
2. **Add the Bloom server URL** — `https://www.trybloom.ai/api/mcp`
3. **Sign in with Bloom** — OAuth in the browser on first connect, or configure an API key for headless hosts.

Full client-specific steps: [Bloom MCP setup](https://www.trybloom.ai/docs/mcp/getting-started).

## What you can do

- **Onboard a brand** — `Onboard pagecraft.com as a brand in Bloom.` or point at an Instagram profile.
- **Generate images** — describe the shot; Bloom uses your brand profile for palette and tone.
- **Edit and adapt** — brighten backgrounds, add details, remove backgrounds, or vectorize logos.
- **Resize for channels** — recompose one hero into Story, feed, and banner aspect ratios (pairs well with OpenQuok scheduling).
- **Batch campaigns** — request many variants in one message; Bloom queues parallel generations.

Prefer REST? The same brand layer is available at [Bloom API](https://www.trybloom.ai/docs/api) with `x-api-key` or OAuth bearer tokens.

## Example prompts

```text
Onboard acme.com as a brand in Bloom.
```

```text
Using my Acme brand, generate a 16:9 launch hero — clean, confident, spring palette.
```

```text
Resize the latest hero for an IG Story and a YouTube banner.
```

## MCP configuration

HTTP transport. Most clients add a custom connector or remote MCP entry pointing at:

```json
{
  "url": "https://www.trybloom.ai/api/mcp",
  "name": "bloom",
  "transport": "http"
}
```

OAuth is the default path for interactive clients; use a Bloom API key when OAuth is unavailable.
$bloom_mcp_content$,
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
        {"name": "bloom_onboard_brand", "description": "Onboard a brand from a website or Instagram URL — pulls logo, colors, fonts, and visual tone into a workspace."},
        {"name": "bloom_generate_image", "description": "Generate on-brand images from a prompt scoped to a brand session."},
        {"name": "bloom_edit_image", "description": "Edit an existing Bloom image while keeping brand consistency."},
        {"name": "bloom_resize_image", "description": "Recompose an image to a new aspect ratio for another channel placement."},
        {"name": "bloom_list_brands", "description": "List brands available in the connected Bloom workspace."}
    ]'::jsonb,
    'http',
    '{"url": "https://www.trybloom.ai/api/mcp", "name": "bloom", "version": "1.0.0", "transport": "http"}'::jsonb,
    TRUE,
    TRUE,
    'SoftwareApplication',
    'd5f7b000-0000-4000-a000-000000000001',
    '[
        {"question": "Do I need an API key to use Bloom MCP?", "answer": "No for most clients — Bloom MCP supports OAuth sign-in on first connect. Use a Bloom API key when your agent runs headless or your client cannot open a browser for OAuth."},
        {"question": "How is Bloom MCP different from the REST API?", "answer": "Both expose the same brand layer. MCP lets you drive onboarding and generations in natural language from Cursor, Claude, or Codex. The REST API suits server-side automations and custom pipelines."},
        {"question": "Can I onboard from Instagram?", "answer": "Yes. Point Bloom at your website or an Instagram @handle during onboarding. Visual DNA analysis runs in the background while you start generating."},
        {"question": "How long do generations take?", "answer": "Bloom queues images asynchronously. Most complete within a minute or two; your agent receives the finished asset inline in supported MCP clients."}
    ]'::jsonb,
    ARRAY['claude-code', 'codex', 'cursor', 'hermes', 'instagram', 'openclaw', 'vscode-copilot']::text[]
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
WHERE l.slug = 'bloom-mcp'
  AND t.slug = ANY (ARRAY[
    'claude-code',
    'codex',
    'cursor',
    'hermes',
    'instagram',
    'openclaw',
    'vscode-copilot'
  ]::text[])
ON CONFLICT DO NOTHING;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
