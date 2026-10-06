# PR notes: Link directory Redis + public CMS HTTP cache

Copy into the pull request **Summary** / **Test plan** when this branch ships `LinkDirectoryService` Redis caching together with build-backlinks freshness fixes.

## Keep these layers (not replaced by Redis)

| Layer | Location | Role |
| --- | --- | --- |
| Redis read-aside | `LinkDirectoryService` (same pattern as `BlogService`, `ListingService`) | Fewer Postgres reads on origin |
| API `Cache-Control` | `backend/utils/http/publicCmsCache.ts` + `isEditorManagedPublicDetailRoute` | Hub JSON ~60s; detail `private, no-cache, must-revalidate` |
| SSR fetch | `publicCmsEditorManagedDetailRequestOptions` (`cache: 'no-store'`) | SvelteKit does not reuse stale detail JSON |
| HTML document | `applyPublicHtmlCacheHeadersForPathname` in `(public)/+layout.server.ts` | Edge does not serve stale SSR HTML after secret-admin edits |

Redis invalidation does **not** purge Vercel/Cloudflare HTML or browser JSON entries that were cached under the old policy. Removing `publicCmsCache` or hub HTML cache would regress hub performance; removing detail no-cache would regress editor-managed freshness (build-backlinks opportunity steps, blog body, listings).

## HTML path policy (this PR)

`isEditorManagedPublicHtmlPath` sets `private, no-cache, must-revalidate` on anonymous SSR HTML for:

- `/build-backlinks/{siteSlug}` (not hub, tags, or categories)
- `/blog/{postSlug}` (not topic/author hubs)
- `/creators/{user}/building-blocks/{slug}` and `…/playbooks/{slug}`

Hubs and filters keep `public, max-age=60, s-maxage=300, stale-while-revalidate=600`.

Durable reference: [Cache design — Public content and caching](https://www.openquok.com/docs/configuration-backend/cache-design#public-content-and-caching) (`web/src/content/docs/configuration-backend/cache-design.md`).

## Verification

1. Unit tests: `publicCmsPageCache.test.ts`, `LinkDirectoryService.unit.test.ts`, `publicRouteRegistry.unit.test.ts`, `publicCmsCacheHeaders.unit.test.ts`.
2. Logged out: edit link-directory opportunity steps in secret-admin → hard refresh `/build-backlinks/{slug}` → updated content.
3. `curl -I` `GET /api/v1/link-directory/published/{slug}` → `Cache-Control: private, no-cache, must-revalidate`.
4. `curl -I` `GET /api/v1/link-directory/published` (hub) → `public, max-age=60,…`.
5. Same no-cache on document response for `/blog/{slug}` and creator listing detail paths when logged out.
