# Instagram — business (`instagram-business`)

Use the integration UUID whose `identifier` is `instagram-business` (Page-linked professional account). Confirm `post_type` and other keys with `integrations:settings` for that row.

```bash
IG_BUSINESS_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="instagram-business") | .id')
openquok integrations:settings "$IG_BUSINESS_ID"
```

## Feed post

```bash
IMAGE=$(openquok upload ./image.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
openquok posts:create \
  -c "Caption #hashtag" \
  -s "2026-01-01T12:00:00Z" \
  --settings '{"post_type":"post"}' \
  -m "$IMAGE" \
  -i "<instagram-business-uuid>"
```
