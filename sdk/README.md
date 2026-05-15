<h1>Openquok NodeJS SDK</h1>

- [What is it for](#what-is-it-for)
- [Quickstart](#quickstart)

>[!NOTE]
> This package is a lightweight Node.js client for Openquok’s **programmatic API** (`/api/v1/public/*`). You authenticate using an **API key** (or OAuth app token) in the `Authorization` header. You can find the full  backend codebase at [`Openquok 's bakend`](https://github.com/Ratimon/openquok-monorepo/tree/main/backend)

---

## What Is It For

`@openquok/node-sdk` helps you automate Openquok 's social scheduling  from Node.js:

- Create/schedule posts via the programmatic API
- List posts and flip draft ↔ scheduled (`flipPostStatus`) without full group CRUD over the public API
- Upload media (multipart) for use in posts
- Manage programmatic integrations (list, connect URL, delete)

It’s intentionally small: just a typed wrapper around the HTTP endpoints.

---

## Quickstart

### Installation

```bash
npm install @openquok/node-sdk
```

### Quick Guide

```ts
import Openquok from "@openquok/node-sdk";

const openquok = new Openquok("YOUR_API_KEY", {
  // optional (defaults shown)
  baseUrl: "https://api.openquok.com",
  apiPrefix: "/api/v1",
});

// Upload a file (multipart field name: `file`)
const uploaded = await openquok.upload(fileBuffer, "png");

// Create a scheduled post
await openquok.post({
  scheduledAt: new Date().toISOString(),
  status: "scheduled",
  body: "Hello from Openquok SDK",
  media: uploaded?.data?.filePath ? [{ id: "1", path: uploaded.data.filePath }] : undefined,
});
```

The available methods include:

- `upload(file: Buffer, extension: string)` — `POST {apiPrefix}/public/upload`
- `uploadFromUrl(url: string)` — `POST {apiPrefix}/public/upload-from-url`
- `post(body: PublicCreatePostDto)` — `POST {apiPrefix}/public/posts`
- `postList(filters: PublicListPostsQueryDto)` — `GET {apiPrefix}/public/posts/list`
- `getPost(postId: string)` — `GET {apiPrefix}/public/posts/:postId` (row id + parent `postGroup`)
- `flipPostStatus(postId: string, body: PublicFlipPostStatusDto)` — `PUT {apiPrefix}/public/posts/:postId/status`
- `deletePost(postId: string)` — `DELETE {apiPrefix}/public/posts/:postId` (`data.postId`, `data.postGroup`)
- `getMissingContent(postId: string)` — `GET {apiPrefix}/public/posts/:postId/missing`
- `updateReleaseId(postId: string, releaseId: string)` — `PUT {apiPrefix}/public/posts/:postId/release-id`
- `getIntegrationAnalytics(integrationId, date)` / `getPostAnalytics(postId, date)` — analytics
- `listNotifications(page?)` — notifications
- `integrations()` — `GET {apiPrefix}/public/integrations`
- `deleteIntegrationChannel(id: string)` — `DELETE {apiPrefix}/public/integrations/:id`

Alternatively you can use the API with curl — check out our [docs](https://www.openquok.com/docs/getting-started-for-public-api).



