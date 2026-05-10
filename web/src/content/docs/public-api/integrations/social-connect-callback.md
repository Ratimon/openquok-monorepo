---
title: 'OAuth callback (social-connect)'
description: 'Exchange the OAuth redirect code for a connected channel (no API key on this route).'
openapi: 'POST /integrations/social-connect/{integration}'
order: 2
lastUpdated: 2026-05-10
---

After the user returns from the provider, your app calls this endpoint with **`state`**, **`code`**, and **`timezone`** in the body. Organization context is resolved from the **`state`** value stored when the OAuth URL was created (see **Connect Channel (OAuth)** for the programmatic **GET** step).

This route is **not** protected by the organization API key middleware; do not send **`Authorization`** for the raw programmatic key here unless your deployment adds separate auth.
