## Openquok CLI skill (`openquok`)

Use this CLI when you need to interact with Openquok programmatically (integrations, posts, uploads). **All output is JSON**, so it’s friendly for agent workflows.

### Setup

- Set `OPENQUOK_API_KEY` (preferred), or store it with `openquok auth:login --apiKey "..."`.
- Optionally set `OPENQUOK_API_URL` (defaults to `https://api.openquok.com`).

### Common agent workflow

1) **List integrations** (discover available channels):

```bash
openquok integrations:list
```

2) **Upload media** (if needed) and capture returned `data.filePath` and `data.id`:

```bash
openquok upload ./image.png
```

3) **Create a post**:

```bash
openquok posts:create --scheduledAt "2026-01-01T12:00:00Z" --status scheduled --body "..." --integrationIds "uuid1,uuid2"
```

4) **Inspect or modify** a post group:

```bash
openquok posts:group <postGroupUuid>
openquok posts:update-group <postGroupUuid> --json '{"scheduledAt":"...","status":"draft"}'
```

