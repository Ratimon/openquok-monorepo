<h1>Openquok NodeJS SDK</h1>

- [What is it for](#what-is-it-for)
- [Quickstart](#quickstart)

>[!NOTE]
> This package is a lightweight Node.js client for Openquok’s **programmatic API** (`/api/v1/public/*`). You authenticate using an **API key** (or OAuth app token) in the `Authorization` header. You can find the full  backend codebase at [`Openquok 's bakend`](https://github.com/Ratimon/openquok-monorepo/tree/main/backend)

---

## What Is It For

`@openquok/node` helps you automate Openquok 's social scheduling  from Node.js:

- Create/schedule posts via the programmatic API
- List posts / manage post groups
- Upload media (multipart) for use in posts
- Manage programmatic integrations (list, connect URL, delete)

It’s intentionally small: just a typed wrapper around the HTTP endpoints.

---

## Quickstart

### Installation

```bash
npm install @openquok/node
```

### Quick Guide

```ts
import Openquok from "@openquok/node";

const openquok = new Openquok("YOUR_API_KEY", {
  // optional (defaults shown)
  baseUrl: "https://api.openquok.com/", //"http://localhost:3000"
  apiPrefix: "/api/v1",
});

// Upload a file (multipart field name: `file`)
const uploaded = await openquok.upload(fileBuffer, "png");

// Create a scheduled post
await openquok.createPost({
  scheduledAt: new Date().toISOString(),
  status: "scheduled",
  body: "Hello from Openquok SDK",
  media: uploaded?.data?.filePath ? [{ id: "1", path: uploaded.data.filePath }] : undefined,
});
```

The available methods are:

- `upload(file: Buffer, extension: string)` - Upload media via `POST {apiPrefix}/public/upload`
- `createPost(body: PublicCreatePostDto)` - Create/schedule posts via `POST {apiPrefix}/public/posts`
- `listPosts(filters: PublicListPostsQueryDto)` - List posts via `GET {apiPrefix}/public/posts/list`
- `getPostGroup(postGroup: string)` - Get a post group via `GET {apiPrefix}/public/posts/group/:postGroup`
- `updatePostGroup(postGroup: string, body: PublicUpdatePostGroupDto)` - Update a post group via `PUT {apiPrefix}/public/posts/group/:postGroup`
- `deletePostGroup(postGroup: string)` - Delete a post group via `DELETE {apiPrefix}/public/posts/group/:postGroup`
- `integrations()` - Get a list of connected channels via `GET {apiPrefix}/public/integrations`
- `isConnected()` - Check connectivity via `GET {apiPrefix}/public/is-connected`
- `getIntegrationOauthUrl(integrationIdentifier: string, refresh?: string)` - Get an OAuth URL via `GET {apiPrefix}/public/social/:integrationIdentifier`
- `deleteIntegrationChannel(id: string)` - Delete a connected channel via `DELETE {apiPrefix}/public/integrations/:id`
- `getPublicPostComments(postId: string)` - Anonymous comments via `GET {apiPrefix}/public/posts/:postId/comments`

Alternatively you can use the API with curl — check out our [docs](https://www.openquok.com/docs/getting-started-for-public-api).



