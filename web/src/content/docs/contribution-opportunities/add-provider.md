---
title: Adding a social provider
description: Contributor guide for implementing a new social integration in OpenQuok
order: 1
lastUpdated: 2026-08-30
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Our social channels are <strong>provider classes</strong> registered in the backend, exposed through existing REST routes, and optionally wired in the web.

Connect is a fork of this checklist, not a separate product surface.

Pick one family:

| Family | Operator developer app? | User action | OpenQuok env keys | Reference |
| --- | --- | --- | --- | --- |
| <strong>OAuth</strong> (default) | Yes | Redirect to the platform | <Badge text="config.integrations.*" variant="path" /> plus self-host <code>.env.example</code> and a docker-compose row | Threads, Instagram, Facebook Page |
| <strong>Credentials in OpenQuok</strong> | No | Paste a personal API key into Add Channel | None — do not invent empty provider env placeholders | Dev.to (<Badge text="devto" variant="default" />) |

Use <strong>Facebook</strong> (<Badge text="facebook" variant="default" />), <strong>Instagram (Business)</strong> (<Badge text="instagram-business" variant="default" />), and <strong>Threads</strong> (<Badge text="threads" variant="default" />) as OAuth references. Use <strong>Dev.to</strong> (<Badge text="devto" variant="default" />) as the credentials-in-app reference.

<Callout type="note">
The provider <Badge text="identifier" variant="param" /> slug (kebab-case) lives everywhere: database <Badge text="provider_identifier" variant="param" />, OAuth callback path <Badge text="/integration/oauth/[identifier]" variant="path" />, catalog entries, CLI filters, and web routing.
</Callout>

<p><strong>Convention reference:</strong> Contributors should follow the backend + web checklist in <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/.cursor/rules/add-social-provider-integration.mdc"><Badge text=".cursor/rules/add-social-provider-integration.mdc" variant="path" /></DocsExternalLink> alongside this guide.</p>

<strong>OAuth:</strong>

1. Web calls <Badge text="GET /api/v1/integrations/social/:provider" variant="path" /> → `generateAuthUrl()`.
2. User consents at the platform; browser returns to <Badge text="/integration/oauth/:provider" variant="path" />.
3. Web calls <Badge text="POST /api/v1/integrations/social-connect/:provider" variant="path" /> → `authenticate()`.
4. If <Badge text="isBetweenSteps" variant="param" /> is true, response includes <Badge text="pages" variant="param" />; user picks an account → <Badge text="POST /api/v1/integrations/provider/:id/connect" variant="path" /> → `fetchPageInformation()`.

<strong>Credentials:</strong>

1. Add Channel shows a catalog-driven form from <Badge text="customFields()" variant="param" /> (password input + regex). Invite-link copy excludes these providers.
2. Web calls <Badge text="GET /api/v1/integrations/social/:provider" variant="path" /> → `generateAuthUrl()` seeds org/state cache. The returned <Badge text="url" variant="param" /> is the <Badge text="state" variant="param" /> string, not a platform redirect.
3. Web calls <Badge text="POST /api/v1/integrations/social-connect/:provider" variant="path" /> with that <Badge text="state" variant="param" /> and <Badge text="code" variant="param" /> as base64 JSON of the pasted key.
4. <Badge text="authenticate()" variant="param" /> validates the key with the platform and stores it as the access token. Refresh reuses the same form — do not send <code>window.location</code> to a non-URL state.

<Callout type="note" title="No public OAuth URL">
<p>Session <code>getIntegrationUrl</code> still seeds cache for the dashboard form. <Badge text="GET /api/v1/public/social/:identifier" variant="path" /> returns <strong>400</strong> for credentials providers — connect in the dashboard with an API key. Do not add a new public connect route.</p>
</Callout>

<strong>Publishing:</strong> the orchestrator loads post rows, builds <Badge text="PostDetails" variant="default" /> (content + JSON settings + media), and calls <Badge text="provider.post()" variant="default" />.

## Backend checklist

<Steps
	howToName="How to Implement New Social Provider"
	howToDescription="Contributor guide for implementing a new social integration in OpenQuok"
>

### 1. Implement `SocialProvider`

Create a class under <Badge text="backend/integrations/providers/" variant="path" /> implementing <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/integrations/social.integrations.interface.ts"><Badge text="social.integrations.interface.ts" variant="path" /></DocsExternalLink>.

Required surface:

| Member | Purpose |
| --- | --- |
| <Badge text="identifier" variant="param" /> / <Badge text="name" variant="param" /> | Catalog slug and display name |
| <Badge text="scopes" variant="param" /> | OAuth scopes (empty array for credentials providers) |
| <Badge text="isBetweenSteps" variant="param" /> | `true` when user must pick Page/account after OAuth |
| <Badge text="generateAuthUrl" variant="param" /> / <Badge text="authenticate" variant="param" /> | OAuth start + code exchange, <strong>or</strong> credentials: <Badge text="customFields()" variant="param" /> metadata + <Badge text="authenticate" variant="param" /> reading base64 JSON from <Badge text="code" variant="param" /> |
| <Badge text="post" variant="param" /> | Publish scheduled content |
| <Badge text="maxLength" variant="param" /> | Caption limit for API + UI |

Common optional members:

| Member | When |
| --- | --- |
| <Badge text="customFields()" variant="param" /> | Credentials-in-app connect (API key / app password). Catalog drives the Add Channel form. |
| <Badge text="pages()" variant="param" /> | Between-steps account list |
| <Badge text="fetchPageInformation()" variant="param" /> | Finalize Page/token after picker |
| <Badge text="refreshToken" variant="param" /> + <Badge text="reConnect" variant="param" /> | Long-lived token refresh (set <Badge text="refreshCron: true" variant="param" />) |
| <Badge text="comment" variant="param" /> | Thread / follow-up replies |
| <Badge text="analytics" variant="param" /> / <Badge text="postAnalytics" variant="param" /> | Insights dashboards |
| <Badge text="validateCreatePost" variant="param" /> | Server-side schedule validation |
| <Badge text="globalPlugCatalog" variant="param" /> / <Badge text="internalPlugCatalog" variant="param" /> | Channel or post-compose plugs |
| <Badge text="settingsSchema()" variant="param" /> | Typed publish object for <Badge text="GET /public/integration-settings/:id" variant="path" /> |
| <Badge text="tools()" variant="param" /> | Allow-listed methods for <Badge text="POST /public/integration-trigger/:id" variant="path" /> |

<strong>Config rule (OAuth):</strong> read secrets only from <Badge text="config.integrations.*" variant="path" /> in <Badge text="GlobalConfig.ts" variant="path" /> — never <Badge text="process.env" variant="param" /> inside provider code.

<strong>Config rule (credentials):</strong> skip <Badge text="GlobalConfig.ts" variant="path" />, <Badge text=".env.development.example" variant="path" />, and <Badge text="infra/self-host/.env.example" variant="path" />. The user-pasted key lives on the integration row.

<strong>Redirect URIs (OAuth):</strong> build with <Badge text="oauthFrontendOrigin()" variant="param" /> + <Badge text="oauthFrontendSocialCallbackPath(identifier)" variant="param" /> so local HTTP dev uses the HTTPS relay consistently.

<strong>Media:</strong> composer stores object keys in post JSON; resolve public URLs with <Badge text="publicUrlForObjectKey" variant="param" /> (see Threads / Facebook publish helpers).

### 2. Register the provider

Add `new YourProvider()` to the array in <Badge text="backend/integrations/integrationManager.ts" variant="path" />.

No new API routes are required — existing integration endpoints dispatch by identifier.

### 3. Token refresh / between-steps storage

If OAuth returns a <strong>user token</strong> but publishing needs a <strong>Page or sub-account token</strong>, follow the Instagram (Business) / Facebook pattern in <Badge text="IntegrationConnectionService.saveProviderPageForOrganization" variant="path" />:

- Store the Page token in <Badge text="token" variant="param" />.
- Keep the user token in <Badge text="refresh_token" variant="param" />.
- Keep the pre-picker user id in <Badge text="root_internal_id" variant="param" /> for <Badge text="reConnect" variant="param" /> during cron refresh.

Extend the `preservesUserTokenForRefresh` branch when adding another Meta-style provider.

### 4. Environment variables (OAuth only)

Skip this step when <Badge text="customFields()" variant="param" /> is set.

Add keys to <Badge text="backend/config/GlobalConfig.ts" variant="path" /> and <Badge text="backend/.env.development.example" variant="path" />. If orchestrator workers need the same keys, mirror them per the orchestrator env rule.

Also add empty placeholders under <strong>Social provider apps</strong> in <Badge text="infra/self-host/.env.example" variant="path" />, and document the ID/secret pair in <a href="/docs/installation/docker-compose">Self-host — Docker Compose</a>.

For credentials providers, document in that docker-compose page that the channel needs <strong>no</strong> operator app (user API key in the dashboard). Do not invent empty provider env placeholders.

### 5. Database

Usually <strong>no migration</strong> — `integrations.provider_identifier` is free text. Add migrations only for new columns, plug tables, or RLS changes.

### 6. Tests (when behavior is non-trivial)

Add unit tests beside the provider (OAuth or credentials connect, publish payload shaping). Extend <Badge text="IntegrationConnectionService.unit.test.ts" variant="path" /> when between-steps save logic differs, when <Badge text="customFields" variant="param" /> skips the OAuth verifier, or when a real <Badge text="settingsSchema()" variant="param" /> object is returned.

</Steps>

## Web checklist

The <strong>connect catalog</strong> is backend-driven (<Badge text="GET /integrations" variant="path" />). The <strong>composer</strong> is opt-in per provider.

<Steps
	howToName="Web checklist"
	howToDescription="Wire the connect catalog, composer preview, and optional settings UI for a new social provider."
>

### 1. Launch provider config

Add <Badge text="web/src/lib/ui/components/posts/providers/[id]/[id].provider.ts" variant="path" /> exporting a <Badge text="LaunchProviderConfig" variant="default" /> (`maximumCharacters`, `postComment`, optional `checkValidity`).

Register it in <Badge text="getLaunchProviderConfig" variant="param" /> inside <Badge text="providers/index.ts" variant="path" />.

### 2. Preview component (recommended)

Add a provider-specific preview Svelte component and branch in <Badge text="ShowAllProviders.svelte" variant="path" />.


When the provider has compose-time settings (step 6), the Post Preview column must reflect them live — not show placeholders because preview received an empty settings object.

| Layer | Action |
| --- | --- |
| <Badge text="[id]Preview.svelte" variant="path" /> | Accept a <Badge text="providerSettings" variant="param" /> prop; read it with <Badge text="read*LaunchSettings" variant="param" />; render title, tags, cover, and other fields the Settings panel writes. |
| <Badge text="ShowAllProviders.svelte" variant="path" /> | Pass <Badge text="providerSettings" variant="param" /> on every preview branch that consumes compose settings — not only Dev.to. |
| <Badge text="AddEditModal.svelte" variant="path" /> | Derive effective preview settings from <Badge text="previewChannel.id" variant="param" /> + <Badge text="providerSettingsByIntegrationId" variant="param" /> and pass them to <Badge text="ShowAllProviders" variant="param" />. |
| Parent modals | Do <strong>not</strong> pass <Badge text="previewProviderSettings" variant="param" /> from <Badge text="followUpTargetIntegrationId" variant="param" /> — that ID is only set for Threads/Instagram follow-up replies and leaves other providers with an empty settings object. |

<strong>References:</strong> Dev.to (<Badge text="title" variant="param" />, <Badge text="tags" variant="param" />, <Badge text="series" variant="param" />), YouTube (<Badge text="title" variant="param" />, <Badge text="thumbnail" variant="param" />), TikTok photo carousel (<Badge text="title" variant="param" />). Landing bento mocks should pass explicit mock <Badge text="providerSettings" variant="param" /> into <Badge text="ShowAllProviders" variant="param" /> (see <Badge text="BentoDevtoSettingsPreview.svelte" variant="path" />).

### 2b. User docs — editor table

When composer support ships, update <a href="/docs/creating-posts/writing-the-post">Writing the post</a> (<Badge text="web/src/content/docs/creating-posts/writing-the-post.md" variant="path" />) → <strong>Editor by platform</strong>.

Map <Badge text="SocialProvider.editor" variant="param" /> on the provider class to the <strong>Used by</strong> column:

| <Badge text="editor" variant="param" /> | Action |
| --- | --- |
| <Badge text="normal" variant="param" /> | Add platform to <strong>Standard</strong> row if not covered by “most social channels”; otherwise no change. |
| <Badge text="markdown" variant="param" /> | Append the platform name when unlocked on <strong>Markdown</strong> row (e.g. <strong>Threads</strong> when unlocked). |
| <Badge text="html" variant="param" /> | Append on <strong>HTML</strong> row (note if publish strips to plain text, like X). |
| <Badge text="none" variant="param" /> | First live Plain provider: replace “None yet” with that platform. |

<strong>Rules:</strong> one table only (<Badge text="Editor | Toolbar | Used by" variant="default" />); change <strong>Toolbar</strong> only for real toolbar exceptions; bump <Badge text="lastUpdated" variant="param" /> in the same PR; <Badge text="editor" variant="param" /> on the provider class is the source of truth.

### 3. OAuth between-steps UI

Reuse <Badge text="IntegrationContinue.svelte" variant="path" /> on route <Badge text="/integration/oauth/[provider]" variant="path" />. When <Badge text="isBetweenSteps" variant="param" /> is true:

- Add a config under <Badge text="web/src/lib/integrations/continue-provider/" variant="path" /> and register it in <Badge text="continue-provider/index.ts" variant="path" /> (title, empty-state copy, icon, and <Badge text="toSaveParams" variant="param" /> for <Badge text="saveProviderPage" variant="param" />).
- Connect response <Badge text="pages" variant="param" /> is passed through <Badge text="ContinueIntegration.presenter.svelte.ts" variant="path" />; the shared <Badge text="ContinueProviderPicker.svelte" variant="path" /> renders the list.

### 4. Credentials connect UI

When the catalog includes <Badge text="customFields" variant="param" />:

- Show the provider in the normal Add Channel grid (<Badge text="AddProvider.svelte" variant="path" />). Keep filtering these providers from <strong>invite</strong> links.
- Open a credentials dialog (password input + regex from catalog). Submit: <Badge text="getAuthorizeUrl" variant="param" /> then <Badge text="connectSocial" variant="param" /> with <Badge text="state" variant="param" /> = returned <Badge text="url" variant="param" /> and <Badge text="code" variant="param" /> = base64 JSON of the key.
- Reuse the same dialog from <Badge text="IntegrationContinue.svelte" variant="path" /> so refresh works without an OAuth redirect. Do not assign <code>window.location.href</code> to a non-URL state string.

### 5. Labels and icons

Add display names to <Badge text="web/src/data/social-providers.ts" variant="path" /> if the slug is new. Icons may already exist for marketing placeholders.

### 6. Settings panel (optional)

If the provider needs compose-time options (Instagram post type, Dev.to title/tags, etc.), add Svelte settings under <Badge text="providers/[id]/" variant="path" /> and wire <Badge text="SettingsAccordion.svelte" variant="path" />. Emit <strong>only that provider’s bucket</strong>.

</Steps>

## Documentation and agent resources

When shipping a user-facing provider, add:

| Artifact | Location |
| --- | --- |
| Setup guide | <Badge text="web/src/content/docs/social-integration/[id].md" variant="path" /> |
| Index LinkCard | <Badge text="social-integration/index.md" variant="path" /> |
| CLI examples | <Badge text="web/src/content/docs/cli-examples/[id].md" variant="path" /> |
| Composer editor modes | <Badge text="web/src/content/docs/creating-posts/writing-the-post.md" variant="path" /> — update **Editor by platform** **Used by** for the provider’s <Badge text="editor" variant="param" /> (`normal`, `markdown`, `html`, `none`) |
| Agent recipes | <Badge text="agent/skills/openquok-core/resources/[id]-examples.md" variant="path" /> |
| Identifier list | <Badge text="agent/skills/openquok-core/resources/patterns.md" variant="path" /> |

<strong>OAuth setup guides</strong> document operator app IDs, secrets, and redirect URIs. <strong>Credentials setup guides</strong> document where the <strong>user</strong> creates the API key; skip operator ID/secret rows and backend env sections.

Follow <a href="/docs/documentation-contribution">Documentation contribution</a> for MDX components, env badges, and redirect URI placeholders.

## Reference providers

<CardGrid>
<LinkCard title="Meta Threads" description="Single-step OAuth, media containers, plugs" href="/docs/social-integration/threads" />
<LinkCard title="Instagram" description="Business (Page picker) and Standalone Login" href="/docs/social-integration/instagram" />
<LinkCard title="Facebook Page" description="Facebook Login, Page picker, feed and video publish" href="/docs/social-integration/facebook" />
<LinkCard title="Dev.to" description="Credentials-in-app API key, markdown articles, tags and organizations tools" href="/docs/social-integration/devto" />
</CardGrid>

## PR review prompts

Before opening a PR, confirm:

- Provider is registered in <Badge text="integrationManager.ts" variant="path" />.
- <strong>OAuth:</strong> Redirect URI in the platform console matches <Badge text="/integration/oauth/[identifier]" variant="path" /> exactly. New operator env keys exist in <Badge text="infra/self-host/.env.example" variant="path" /> and the docker-compose social-apps table.
- <strong>Credentials:</strong> no new env vars; docker-compose callout that there is no operator app; dashboard Add Channel and refresh work; <Badge text="GET /public/social/[identifier]" variant="path" /> returns 400.
- No secrets or third-party project names in comments or docs (repo neutrality rule).
- Composer validation matches backend `validateCreatePost` / publish rules.
- <strong>Post Preview:</strong> when compose settings ship, preview reads <Badge text="providerSettings" variant="param" /> via <Badge text="read*LaunchSettings" variant="param" />; Settings changes update preview live; <Badge text="AddEditModal.svelte" variant="path" /> derives settings from the preview channel (not <Badge text="followUpTargetIntegrationId" variant="param" />).
- Live vs Development mode called out in docs when media visibility differs.
