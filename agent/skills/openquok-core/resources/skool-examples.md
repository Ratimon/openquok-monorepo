# Skool (`skool`) — CLI examples

```bash
SKOOL_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="skool") | .id')
openquok integrations:settings "$SKOOL_ID"
```

**Connect in the dashboard first** — the CLI cannot connect Skool. Install the [OpenQuok browser extension](https://www.openquok.com/docs/installation/chrome-extension), sign in on [skool.com](https://www.skool.com/) in the same Chrome profile, then **Add Channel → Skool**. `GET /api/v1/public/social/skool` returns **400**; there is no operator OAuth app.

Run `integrations:settings` for `output.rules`, `output.maxLength`, typed `settingsSchema`, and allow-listed `output.tools` (`groups`, `label`).

Settings mechanics: [provider-settings.md](./provider-settings.md). JSON recipes: [examples/EXAMPLES.md](./examples/EXAMPLES.md#skool).

## Supported features

| Feature | Supported | Notes |
| --- | --- | --- |
| Text posts | Yes | Root `-c` caption (up to **5,000** characters) |
| Title | Yes | Required (`title` / `skool.title`) |
| Group | Yes | Required group id (`group` / `skool.group`) — from `integrations:trigger … groups` |
| Label | Yes | Optional label id per group — `label` / `skool.label` or `label` tool with `{ "id": "<groupId>" }` |
| Images | Yes | Main post and follow-up rows — upload first (Rule 2); OpenQuok uploads to Skool at publish |
| Follow-up comments | Yes | `skool.replies[]` with `delaySeconds`; optional `media` per reply when the group allows |
| Group / label lookup | Yes | `integrations:trigger` `groups` and `label` |
| Browser extension connect | Yes | Dashboard only — agents cannot complete connect via CLI |
| Channel / post analytics | No | Not available for Skool in OpenQuok |
| Internal / global plugs | No | Not supported on `skool` |
| Native Skool video | No | Use images instead |
| Public OAuth connect | No | Extension session only |

## Agent tasks

| User wants to… | JSON example |
| --- | --- |
| Schedule a text post with title and group | [skool-text-title-group.json](./examples/skool-text-title-group.json) |
| Add an optional label | [skool-with-label.json](./examples/skool-with-label.json) |
| Attach images to the main post | [skool-with-image.json](./examples/skool-with-image.json) |
| Schedule follow-up comments | [skool-follow-up.json](./examples/skool-follow-up.json) |
| List Skool groups | `openquok integrations:trigger "$SKOOL_ID" groups` |
| List labels for a group | `openquok integrations:trigger "$SKOOL_ID" label -d '{"id":"<group-id>"}'` |
| See the typed settings schema | `openquok integrations:settings "$SKOOL_ID"` |

## Provider settings

Flat JSON on `--settings` or inside `--providerSettingsByIntegrationId` for the Skool UUID. Nested `skool.*` matches the web composer bucket.

| Key | Values | When |
| --- | --- | --- |
| `title` | string (min 1 char) | **Required** post title |
| `group` | string (group id) | **Required** — from `groups` tool (`value` field) |
| `group_id` / `groupId` | string | Aliases for `group` |
| `label` | string (label id) | Optional; omit or use `none` for default |
| `skool.title` | string | Same as `title` |
| `skool.group` | string | Same as `group` |
| `skool.label` | string | Same as `label` |
| `skool.replies` | reply rows | Follow-up comments after main post publishes |

**Rules:** Title and group are required at publish. Resolve group id with `groups` before scheduling. For labels, call `label` with the target group id. Session refresh uses the browser extension — if the channel shows **Refresh needed**, sign in on Skool again and repeat the extension connect flow.

## Run an example

Replace `<integration-id>`, `<group-id>`, and label ids with values from `integrations:trigger`.

```bash
openquok posts:create --json ./examples/skool-text-title-group.json
openquok posts:create --json ./examples/skool-follow-up.json
```

## Discover integration

```bash
openquok integrations:settings "$SKOOL_ID"
openquok integrations:trigger "$SKOOL_ID" groups
openquok integrations:trigger "$SKOOL_ID" label -d '{"id":"<group-id>"}'
```

Setup and security notes: [Skool social integration](https://www.openquok.com/docs/social-integration/skool).
