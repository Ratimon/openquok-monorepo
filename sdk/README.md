<h1>Openquok NodeJS SDK</h1>

- [What is it for](#what-is-it-for)
- [Quickstart](#quickstart)

>[!NOTE]
> This package is a lightweight Node.js client for Openquok’s **programmatic API** (`/api/v1/public/*`). You authenticate using an **API key** (`opo_…`) sent as `Authorization: Bearer …` on every request. Backend reference: [`backend`](https://github.com/Ratimon/openquok-monorepo/tree/main/backend).

---

## What Is It For

`@openquok/node-sdk` helps you automate Openquok's social scheduling from Node.js:

- Create/schedule posts via the programmatic API (including agent/kanban review fields)
- List posts and flip draft ↔ scheduled (`flipPostStatus`)
- Upload media (multipart or from URL) for use in posts
- Manage integrations (list, groups, settings, trigger provider tools, OAuth URL, delete)
- Configure global plugs (catalog, list, upsert, activate, delete)
- Analytics, notifications, and missing-release linking

It’s intentionally small: a typed wrapper around the same HTTP endpoints the `openquok` CLI uses.

---

## Quickstart

### Installation

```bash
npm install @openquok/node-sdk
```

### Quick Guide

```ts
import Openquok from "@openquok/node-sdk";

const openquok = new Openquok("opo_your_programmatic_token", {
  // optional (defaults shown)
  baseUrl: "https://api.openquok.com",
  apiPrefix: "/api/v1",
});

await openquok.isConnected();
const { workspace } = await openquok.getWorkspace();

const uploaded = await openquok.upload(fileBuffer, "png");

await openquok.postAsAgent({
  scheduledAt: new Date().toISOString(),
  status: "draft",
  body: "Hello from Openquok SDK",
  note: "Review CTA before scheduling",
  media: uploaded?.data?.filePath
    ? [{ id: "1", path: uploaded.data.filePath }]
    : undefined,
  integrationIds: ["<integration-id>"],
});
```

### Methods

| Method | HTTP |
|--------|------|
| `isConnected()` | `GET /public/is-connected` |
| `getWorkspace()` | `GET /public/workspace` |
| `upload(file, extension)` | `POST /public/upload` |
| `uploadFromUrl(url)` | `POST /public/upload-from-url` |
| `post(body)` | `POST /public/posts` |
| `postAsAgent(body)` | `POST /public/posts` with `isAgent: true` |
| `postList(filters)` | `GET /public/posts/list` |
| `getPost(postId)` | `GET /public/posts/:postId` |
| `flipPostStatus(postId, status \| body)` | `PUT /public/posts/:postId/status` |
| `updatePostReviewTodo(postId, body)` | `PUT /public/posts/:postId/review-todo` |
| `deletePost(postId)` | `DELETE /public/posts/:postId` |
| `getMissingContent(postId)` | `GET /public/posts/:postId/missing` |
| `updateReleaseId(postId, releaseId)` | `PUT /public/posts/:postId/release-id` |
| `listGroups()` | `GET /public/groups` |
| `integrations({ group? })` | `GET /public/integrations` |
| `getPlugCatalog()` | `GET /public/plug-catalog` |
| `listIntegrationPlugs(integrationId)` | `GET /public/integration-plugs/:id` |
| `upsertIntegrationPlug(integrationId, body)` | `POST /public/integration-plugs/:id` |
| `deleteIntegrationPlug(plugId)` | `DELETE /public/plugs/:plugId` |
| `setIntegrationPlugActivated(plugId, activated)` | `PUT /public/plugs/:plugId/activate` |
| `getIntegrationSettings(id)` | `GET /public/integration-settings/:id` |
| `triggerIntegration(id, { methodName, data? })` | `POST /public/integration-trigger/:id` |
| `getIntegrationOAuthUrl(identifier, { refresh? })` | `GET /public/social/:identifier` |
| `deleteIntegrationChannel(id)` | `DELETE /public/integrations/:id` |
| `getIntegrationAnalytics(id, 7\|30\|90)` | `GET /public/analytics/:id` |
| `getPostAnalytics(postId, 7\|30\|90)` | `GET /public/analytics/post/:postId` |
| `listNotifications(page?)` | `GET /public/notifications` |

Exported helpers: `withAgentCreatePayload`, `OpenquokHttpError`, and DTO types from the package entry.

Alternatively you can use the API with curl — see our [docs](https://www.openquok.com/docs/getting-started-for-public-api).

For a third-party OAuth2 app (Authorization Code → `opo_` token), see [`examples/oauth2-express.mjs`](./examples/oauth2-express.mjs).
