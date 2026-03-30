---
title: RBAC (roles & permissions)
description: App-level roles/permissions and the recommended backend integration patterns.
order: 1
lastUpdated: 2026-03-30
---

<script>
import { Badge, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

App-level RBAC is distinct from workspace membership. Roles and permissions are stored in the database and loaded by the backend when using <Badge text="requireFullAuthWithRoles" variant="default" />.

There is no JWT auth hook; the app resolves <Badge text="public.users.id" variant="path" /> from the token and fetches roles/permissions from <Badge text="user_roles" variant="path" /> and <Badge text="role_permissions" variant="path" />.

## Roles

- **Editor** — Can view and manage feedback; can view role/permission data. Use case: content moderators or support.
- **Admin** — All editor permissions plus <Badge text="users.manage_roles" variant="default" /> (assign/remove roles). Only **super admins** can assign/remove the **admin** role; admins can assign/remove only the **editor** role (enforced in <Badge text="RbacService" variant="default" /> and DB RPCs). Use case: platform admins.
- **Super Admin** — Not a role; a flag on <Badge text="public.users" variant="path" /> (<Badge text="is_super_admin=true" variant="default" />). Bypasses permission checks and can assign/remove any role.

## Backend integration

<Steps>

### Types

The role/permission types live in <Badge text="backend/data/types/rbacTypes.ts" variant="path" /> (for example <Badge text="AppRole" variant="default" /> and <Badge text="AppPermission" variant="default" />).

### Authenticate with roles

Use <Badge text="requireFullAuthWithRoles(supabase, userRepository, rbacRepository)" variant="default" /> so <Badge text="req.user" variant="default" /> includes:

- <Badge text="roles" variant="default" />
- <Badge text="permissions" variant="default" />
- <Badge text="publicId" variant="default" />
- <Badge text="isSuperAdmin" variant="default" />

Use <Badge text="requireFullAuth" variant="default" /> only when the route does not need role/permission resolution.

### Route guards

Use role/permission middlewares after <Badge text="requireFullAuthWithRoles" variant="default" />:

- <Badge text="requireEditor" variant="default" /> — editor, admin, or super_admin
- <Badge text="requireAdmin" variant="default" /> — admin or super_admin
- <Badge text="requireSuperAdmin" variant="default" /> — super_admin only
- <Badge text="requireRole('editor')" variant="default" /> — that role or super_admin
- <Badge text="requirePermission('feedback.view')" variant="default" /> — that permission (super_admin bypasses)
- <Badge text="requireAnyPermission([...])" variant="default" /> — at least one permission

</Steps>

## Example: protect by permission

```ts
const authWithRoles = requireFullAuthWithRoles(supabase, userRepository, rbacRepository);
const requireManageRoles = requirePermission('users.manage_roles');
rbacRouter.post('/users/:userId/roles/:role', authWithRoles, requireManageRoles, rbacController.assignRole);
rbacRouter.delete('/users/:userId/roles/:role', authWithRoles, requireManageRoles, rbacController.removeRole);
```

## Example: protect by editor or higher

```ts
feedbackRouter.get('/', authWithRoles, requireEditor, feedbackController.getAllFeedbacks);
feedbackRouter.patch('/:feedbackId', authWithRoles, requireEditor, feedbackController.handleFeedback);
```

## Related Section(s)

<CardGrid>
<LinkCard title="Security guidelines" description="Secret-handling rules and SSR safety constraints" href="/docs/developer-guidelines/security" />
<LinkCard title="Developer Guidelines" description="Back to the developer guidelines hub" href="/docs/developer-guidelines" />
</CardGrid>

