# Instagram — standalone (`instagram-standalone`)

Use the integration UUID whose `identifier` is `instagram-standalone` (Instagram Login product).

```bash
IG_STANDALONE_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="instagram-standalone") | .id')
openquok integrations:settings "$IG_STANDALONE_ID"
```

Always run `integrations:settings` for required fields and allow-listed `output.tools` before posting.

## Feed post

```bash
IMAGE=$(openquok upload ./image.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
openquok posts:create \
  -c "Caption #hashtag" \
  -s "2026-01-01T12:00:00Z" \
  --settings '{"post_type":"post"}' \
  -m "$IMAGE" \
  -i "<instagram-standalone-uuid>"
```

## Story

```bash
STORY=$(openquok upload ./story.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
openquok posts:create \
  -c "" \
  -s "2026-01-01T12:00:00Z" \
  --settings '{"post_type":"story"}' \
  -m "$STORY" \
  -i "<instagram-standalone-uuid>"
```
