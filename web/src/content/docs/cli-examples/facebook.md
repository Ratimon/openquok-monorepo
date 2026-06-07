---
title: Facebook Page
description: CLI examples for Facebook Page publishing in Openquok
order: 1
lastUpdated: 2026-06-06
---

<script>
import { Badge, Callout } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Text-only Page post

```bash
openquok posts:create \
  -c "Hello from our Page" \
  -s "2026-01-01T12:00:00Z" \
  -i "<facebook-page-integration-id>"
```

## With image

At publish time the backend resolves each stored object key to a public <Badge text="https://" variant="new" /> URL for Meta to fetch.

```bash
test -f ./hero.jpg && test -s ./hero.jpg
IMAGE=$(openquok upload ./hero.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
openquok posts:create \
  -c "Photo update" \
  -m "$IMAGE" \
  -s "2026-01-01T12:00:00Z" \
  -i "<facebook-page-integration-id>"
```

## Link post

Pass an optional URL in <Badge text="providerSettingsByIntegrationId" variant="param" />:

```bash
openquok posts:create \
  -c "Read more on our site" \
  -s "2026-01-01T12:00:00Z" \
  -i "<facebook-page-integration-id>" \
  --providerSettingsByIntegrationId '{"<facebook-page-integration-id>":{"url":"https://example.com/article"}}'
```

## Multi-photo carousel

```bash
MEDIA=$(jq -s 'add' \
  <(openquok upload ./a.jpg | jq '[{id: .data.id, path: (.data.path // .data.filePath)}]') \
  <(openquok upload ./b.jpg | jq '[{id: .data.id, path: (.data.path // .data.filePath)}]'))
openquok posts:create \
  -c "Two photos, one post" \
  -m "$MEDIA" \
  -s "2026-01-01T12:00:00Z" \
  -i "<facebook-page-integration-id>"
```

## Follow-up comment

```bash
openquok posts:create \
  -c "Main post" \
  -c "First comment on the post" \
  -s "2026-01-01T12:00:00Z" \
  -i "<facebook-page-integration-id>"
```

## Resolve integration UUID

```bash
FB_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="facebook") | .id')
openquok integrations:settings "$FB_ID"
openquok analytics:platform "$FB_ID" -d 30
```

<Callout type="note" title="App mode">
If media posts appear without images for non-testers, set your Meta app to <strong>Live</strong> mode. See <a href="/docs/social-integration/facebook#troubleshooting">Facebook troubleshooting</a>.
</Callout>
