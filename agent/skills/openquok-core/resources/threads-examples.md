# Threads (Meta) — CLI examples

Always run `openquok integrations:settings <uuid>` for the exact JSON your workspace expects. Snippets below are illustrative.

For server-side publish behavior (public URLs, SVG, Graph errors), see [threads-publish.md](./threads-publish.md).

## Text-only

```bash
openquok posts:create \
  -c "Launch post" \
  -s "2026-01-01T12:00:00Z" \
  -i "<threads-uuid>"
```

## With image (Rule 2)

At publish time the backend turns each stored object key into a **public `https://` URL** and Meta’s servers **fetch** that URL for the Threads media container. Prefer **JPEG or PNG**; **SVG is rejected** (see [threads-publish.md](./threads-publish.md)).

```bash
test -f ./hero.jpg && test -s ./hero.jpg
IMAGE=$(openquok upload ./hero.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
openquok posts:create \
  -c "Shipped today 🚀" \
  -m "$IMAGE" \
  -s "2026-01-01T12:00:00Z" \
  -i "<threads-uuid>"
```

## Multi-segment thread

`-d` is **milliseconds** between follow-up segments (default **5000** ms if omitted).

```bash
INTRO=$(openquok upload ./intro.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
P1=$(openquok upload ./point1.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')

openquok posts:create \
  -c "Thread starter (1/3)" -m "$INTRO" \
  -c "Point one (2/3)" -m "$P1" \
  -c "Conclusion (3/3)" \
  -s "2026-01-01T12:00:00Z" \
  -d 60000 \
  -i "<threads-uuid>"
```

## Discover integration and tools

```bash
TH_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="threads") | .id')
openquok integrations:settings "$TH_ID"
# Replace METHOD with a name from output.tools[].methodName; adjust -d to match dataSchema.
openquok integrations:trigger "$TH_ID" METHOD -d '{}'
```
