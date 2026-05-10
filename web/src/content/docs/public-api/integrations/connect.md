---
title: 'Connect Channel (OAuth)'
description: 'Get an OAuth authorization URL using your organization API key (programmatic /public route).'
openapi: 'GET /public/social/{integration}'
order: 1
lastUpdated: 2026-05-10
---

Use this flow from a **server or script** with your **organization API key** in the **`Authorization`** header (: obtain the URL, redirect the user, then complete the handshake).

Full URL shape: **`GET /api/v1/public/social/{integration}`** (with optional **`?refresh=<integration-uuid>`** to refresh tokens for an existing channel). Session-based apps can use **`GET /api/v1/integrations/social/{integration}`** with a logged-in user instead.

After the provider redirects back, call **OAuth callback (social-connect)** — **`POST /integrations/social-connect/{integration}`** — with the **`code`** and **`state`** from the redirect (that step does **not** use the API key on the wire in OpenQuok’s no-auth router).

**Authorizations**, **path**, **query**, and **header** parameters above the article body come from **`openapi:`** and **`GET /api/v1/openapi.json`**.

On desktop, **request** and **response** panels load from the same spec. Add **`@openapi`** YAML in `backend/swagger/jsdoc/*.doc.ts` when you add operations.
