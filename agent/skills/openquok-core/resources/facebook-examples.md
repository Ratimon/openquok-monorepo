# Facebook Page — CLI examples

Run `openquok integrations:settings <uuid>` for the exact JSON your workspace expects.

## Text-only Page post

```bash
openquok posts:create \
  -c "Hello from our Page" \
  -s "2026-01-01T12:00:00Z" \
  -i "<facebook-page-integration-id>"
```

## With image

At publish time the backend resolves each stored object key to a public `https://` URL for Meta to fetch.

```bash
test -f ./hero.jpg && test -s ./hero.jpg
IMAGE=$(openquok upload ./hero.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
openquok posts:create \
  -c "Photo update" \
  -m "$IMAGE" \
  -s "2026-01-01T12:00:00Z" \
  -i "<facebook-page-integration-id>"
```

## Link post (optional URL)

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

## Discover integration

```bash
FB_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="facebook") | .id')
openquok integrations:settings "$FB_ID"
openquok analytics:platform "$FB_ID" -d 30
```

## Post insights

```bash
POST_ID=$(openquok posts:list | jq -r '.items[0].id')
openquok analytics:post "$POST_ID" -d 7
```
