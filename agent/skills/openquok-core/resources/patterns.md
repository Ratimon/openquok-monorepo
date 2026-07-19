# Workflow recipes

Extended `openquok` patterns. Rules and auth: [SKILL.md](../SKILL.md). Commands: [command-reference.md](./command-reference.md). Per-channel features and publish settings: [provider-settings.md](./provider-settings.md) and `*-examples.md`. Plugs (internal + global): [plugs.md](./plugs.md).

## Resolve integration UUIDs

```bash
openquok integrations:list | jq -r '.[] | {id, identifier}'
openquok integrations:settings <integration-uuid>
```

Meta channels today: `threads`, `facebook`, `instagram-standalone`, `instagram-business`. LinkedIn: `linkedin`, `linkedin-page`. Call `integrations:trigger` only for `methodName` values listed under `output.tools`.

## Allow-listed provider tools

```bash
TH_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="threads") | .id')
openquok integrations:settings "$TH_ID"
openquok integrations:trigger "$TH_ID" <method-from-settings> -d '{}'
```

Replace `<method-from-settings>` and `-d` using `output.tools[].methodName` and `dataSchema`.

## Multiple attachments

```bash
MEDIA=$(jq -s 'add' \
  <(openquok upload ./a.jpg | jq '[{id: .data.id, path: (.data.path // .data.filePath)}]') \
  <(openquok upload ./b.jpg | jq '[{id: .data.id, path: (.data.path // .data.filePath)}]'))
openquok posts:create -c "…" -m "$MEDIA" -s "2026-01-01T12:00:00Z" -i "<uuid>"
```

## Multi-channel campaign (JSON file)

Use [examples/multi-platform-campaign.json](./examples/multi-platform-campaign.json) — per-channel bodies and `providerSettingsByIntegrationId`.

```bash
openquok posts:create --json ./examples/multi-platform-campaign.json
```

## Enforce max length

```bash
INTEGRATION_ID="<uuid>"
CONTENT="Your caption"
MAX=$(openquok integrations:settings "$INTEGRATION_ID" | jq '.output.maxLength')
# Truncate CONTENT when ${#CONTENT} -gt MAX before posts:create
```

## Batch schedule

Loop `openquok upload` + `posts:create` per slot; reuse one integration UUID; vary `-s` and `-c` per iteration.

## Internal plugs on scheduled posts

Attach internal plugs when creating posts — same-account Threads reply or cross-account comment/repost/reshare. Use `providerSettingsByIntegrationId` with the channel bucket (`threads`, `x`, `linkedin`). Examples: [threads-engagement-plug.json](./examples/threads-engagement-plug.json), [threads-cross-account-plug.json](./examples/threads-cross-account-plug.json), [x-cross-account-repost.json](./examples/x-cross-account-repost.json). Catalog: [plugs.md](./plugs.md).

## Global plugs on channels

```bash
openquok plugs:catalog
openquok plugs:list <integration-id>
openquok plugs:upsert <integration-id> --func autoPlugPost \
  --fields '[{"name":"likesAmount","value":"100"},{"name":"post","value":"Grab the link in bio!"}]'
```

See [plugs.md](./plugs.md) for provider matrix and `plugs:activate` / `plugs:delete`.

## Retry on transient failure

Retry `posts:create` with exponential backoff (e.g. 2s, 4s, 8s) up to a fixed attempt cap; surface the last stderr/stdout to the user.
