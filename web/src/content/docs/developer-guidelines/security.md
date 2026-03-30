---
title: Security guidelines
description: Service key rules, RLS guidance, rate limiting, and SSR state-management safety.
order: 2
lastUpdated: 2026-03-30
---

<script>
import { Badge, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Rules (non-negotiable)

1. **NEVER** use the service client in client-side code.
2. **NEVER** expose <Badge text="SUPABASE_SERVICE_ROLE_KEY" variant="envBackend" /> to the client.
3. Use RLS policies for data access control.
4. Always use the appropriate client for the context:
   - **Browser Client:** Public data only
   - **RLS Client:** Authenticated user data
   - **Service Client:** Admin operations
5. Configure rate limiting in <Badge text="backend/middlewares/rateLimit.ts" variant="path" /> and <Badge text="backend/config/GlobalConfig.ts" variant="path" />.

## SSR state management security

- **NEVER** import or use <Badge text="authenticationRepository" variant="default" /> in any <Badge text="+page.server.ts" variant="path" /> or <Badge text="+layout.server.ts" variant="path" /> files.
- **NEVER** mutate shared state (singletons with mutable state) in server load functions.
- **ALWAYS** set <Badge text="export const ssr = false;" variant="default" /> for protected routes (user-specific data).
- **ONLY** enable SSR (<Badge text="export const ssr = true;" variant="default" />) for public routes that don’t use shared mutable state.
- If you need auth info in SSR routes, use cookies/request context instead of shared state.

```ts
// ✅ SAFE: Use cookies for server-side auth
export const ssr = true;
export async function load({ cookies }) {
  const accessToken = cookies.get('access_token');
  // Use token to fetch user data per-request
}

// ❌ UNSAFE: Never do this in server code
import { authenticationRepository } from '$lib/user-auth/index';
await authenticationRepository.checkAuth(); // Shared state - security risk!
```

## Related Section(s)

<CardGrid>
<LinkCard title="RBAC (roles & permissions)" description="How roles/permissions are loaded and enforced in the backend" href="/docs/developer-guidelines/rbac" />
<LinkCard title="Developer Guidelines" description="Back to the developer guidelines hub" href="/docs/developer-guidelines" />
</CardGrid>

