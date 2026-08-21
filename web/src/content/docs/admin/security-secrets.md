---
title: Security secrets
description: Configure SECURITY_SECRET and optional INTEGRATIONS_TOKEN_ENCRYPTION_KEY for invite links, OAuth hashing, and channel token encryption.
order: 2
lastUpdated: 2026-08-21
---

<script>
import { Badge } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What to set

Set <Badge text="SECURITY_SECRET" variant="envBackend" /> in your backend environment.

It is used for:

- **Invite links**: signing organization invite tokens.
- **OAuth2**: hashing OAuth client secrets, authorization codes, and access tokens (raw secrets are never stored).
- **Channel tokens (fallback)**: AES-GCM encryption of <Badge text="integrations.token" variant="path" /> / <Badge text="refresh_token" variant="path" /> when <Badge text="INTEGRATIONS_TOKEN_ENCRYPTION_KEY" variant="envBackend" /> is unset.

Optionally set a dedicated <Badge text="INTEGRATIONS_TOKEN_ENCRYPTION_KEY" variant="envBackend" /> so rotating invite/OAuth hashing does not re-key every connected channel. Prefer a separate value in production.

## How to generate

Generate a random secret and store it in your backend env file.

```bash
openssl rand -hex 32
```

## Where to set it

- Local dev: `backend/.env.development`
- Production: your deployment secret manager / env (e.g. `backend/.env.production.local` if you use it)
- Self-host: <Badge text="infra/self-host/.env" variant="path" /> (see the example template)

## Migrating existing plaintext channel tokens

New connects encrypt automatically when a key is configured. To rewrite legacy plaintext rows:

```bash
pnpm --filter ./backend exec tsx scripts/migrate_encrypt_integration_tokens.ts
```

## Rotation warning

Changing <Badge text="SECURITY_SECRET" variant="envBackend" /> will invalidate:

- outstanding invite links
- existing OAuth client secrets (apps must be updated/re-rotated)
- existing OAuth access tokens (clients must re-authorize)

If you relied on <Badge text="SECURITY_SECRET" variant="envBackend" /> as the channel-token encryption key (no dedicated <Badge text="INTEGRATIONS_TOKEN_ENCRYPTION_KEY" variant="envBackend" />), rotating it also prevents decrypting existing ciphertext — set a dedicated integrations key before rotating, or re-connect channels after migrating with the new key.
