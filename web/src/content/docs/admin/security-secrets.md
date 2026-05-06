---
title: Security secrets
description: Configure the secret variable for invite links and OAuth2 token hashing.
order: 2
lastUpdated: 2026-05-06
---

## What to set

Set **`SECURITY_SECRET`** in your backend environment.

It is used for:

- **Invite links**: signing organization invite tokens.
- **OAuth2**: hashing OAuth client secrets, authorization codes, and access tokens (raw secrets are never stored).

## How to generate

Generate a random secret and store it in your backend env file.

```bash
openssl rand -hex 32
```

## Where to set it

- Local dev: `backend/.env.development`
- Production: your deployment secret manager / env (e.g. `backend/.env.production.local` if you use it)

## Rotation warning

Changing `SECURITY_SECRET` will invalidate:

- outstanding invite links
- existing OAuth client secrets (apps must be updated/re-rotated)
- existing OAuth access tokens (clients must re-authorize)

