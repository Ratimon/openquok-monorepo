# Dev.to (`devto`) — CLI examples

```bash
DEVTO_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="devto") | .id')
openquok integrations:settings "$DEVTO_ID"
```

Connect the channel in the OpenQuok dashboard with a personal API key (DEV Settings → Extensions). There is no public OAuth start URL.

Run `integrations:settings` for `output.rules`, `output.maxLength`, typed `settingsSchema`, and allow-listed `output.tools` (`tags`, `organizations`).

Settings mechanics: [provider-settings.md](./provider-settings.md). JSON recipes: [examples/EXAMPLES.md](./examples/EXAMPLES.md#devto).

## Supported features

| Feature | Supported | Notes |
| --- | --- | --- |
| Markdown article body | Yes | Root `-c` caption (up to 100,000 characters) |
| Title | Yes | Required; min 2 characters (`title`) |
| Tags | Yes | Up to 4 names; strings or `{ value, label }` |
| Cover image | Yes | `main_image` / `mainImage` `{ path }` from a prior `upload` |
| Canonical URL | Yes | `canonical` (aliases `canonical_url`, `canonicalUrl`) |
| Organization | Yes | Numeric id from `integrations:trigger … organizations` |
| Tag / org lookup | Yes | `integrations:trigger` `tags` and `organizations` |
| Follow-up comments | No | Out of scope |
| Series | No | Not implemented |
| Analytics | No | No date-range analytics API |
| Public OAuth connect | No | Dashboard API key only |

## Agent tasks

| User wants to… | JSON example |
| --- | --- |
| Schedule a markdown article with title and tags | [devto-article-title-tags.json](./examples/devto-article-title-tags.json) |
| Syndicate with a canonical URL | [devto-canonical.json](./examples/devto-canonical.json) |
| Publish under an organization with a cover | [devto-organization.json](./examples/devto-organization.json) |
| List tag suggestions | `openquok integrations:trigger "$DEVTO_ID" tags` |
| List organizations the key can publish under | `openquok integrations:trigger "$DEVTO_ID" organizations` |
| See the typed settings schema | `openquok integrations:settings "$DEVTO_ID"` |

## Provider settings

Flat JSON on `--settings` or inside `--providerSettingsByIntegrationId` for the Dev.to UUID. Nested `devto.*` matches the web composer bucket.

| Key | Values | When |
| --- | --- | --- |
| `title` | string (min 2 chars) | Required for valid publish |
| `tags` | strings or `[{ "value": "…", "label": "…" }]` | Optional; max 4 |
| `canonical` | URL string | Optional syndication URL |
| `canonical_url` / `canonicalUrl` | URL string | Aliases for `canonical` |
| `organization` | integer id | Optional; from `organizations` tool |
| `organization_id` / `organizationId` | integer | Aliases for `organization` |
| `main_image` / `mainImage` | `{ "path": "…" }` or path string | Optional cover after upload |
| `devto.title` | string | Same as `title` (composer bucket) |
| `devto.tags` | tag array | Same as `tags` |
| `devto.canonical` | URL string | Same as `canonical` |
| `devto.organization` | integer | Same as `organization` |
| `devto.mainImage` | `{ "path": "…" }` | Same as `mainImage` |

**Rules:** Title min 2 characters. At most 4 tags. Body is markdown. Cover path must come from `openquok upload` / `upload-from-url` (Rule 2), not a raw local path. Duplicate canonical URLs fail at publish with a clear error.

## Run an example

```bash
openquok posts:create --json ./examples/devto-article-title-tags.json
```

## Discover integration

```bash
openquok integrations:settings "$DEVTO_ID"
openquok integrations:trigger "$DEVTO_ID" tags
openquok integrations:trigger "$DEVTO_ID" organizations
```
