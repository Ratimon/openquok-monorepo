---
title: OpenQuok Firefox extension
description: Install the OpenQuok Firefox add-on from Mozilla Add-ons. Sidebar scheduling, Skool connect, directory autofill, and context-menu drafts.
order: 7.2
lastUpdated: 2026-11-18
sidebar:
  label: Firefox Extension
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, VideoModal } from '$lib/ui/components/docs/mdx/index.js';
import { DOCS_YOUTUBE_VIDEOS } from '$lib/docs/constants/docsYoutubeVideos';
import { OPENQUOK_BROWSER_EXTENSION_FIREFOX_ADDONS_URL } from '$lib/content/constants/landing/browser-extension-store-listings';
</script>

## Overview

The <strong>OpenQuok Firefox add-on</strong> helps when a network needs the browser — not only dashboard OAuth or pasted keys. Firefox uses a dedicated build in <Badge text="extension/dist-firefox/" variant="path" />. The UI opens in the Firefox <strong>sidebar</strong> (Gecko’s equivalent of Chromium’s side panel). For a short product tour, see the <a href="/browser-extension">browser extension</a> page.

<p>On Firefox, install the published add-on from <DocsExternalLink href={OPENQUOK_BROWSER_EXTENSION_FIREFOX_ADDONS_URL}>Firefox Add-ons (AMO)</DocsExternalLink>. Self-host operators build with <Badge text="build:firefox" variant="default" /> and load a temporary add-on — see <a href="#self-host-firefox-build">Self-host (Firefox build)</a>.</p>

See it in action:
<VideoModal
	videoObjectPreset="chromeExtension"
	youtubeVideoId={DOCS_YOUTUBE_VIDEOS.chromeExtension.youtubeVideoId}
	thumbnailAlt={DOCS_YOUTUBE_VIDEOS.chromeExtension.thumbnailAlt}
/>

| Use | What the extension does |
| --- | --- |
| **Social scheduling** | Open the <strong>sidebar</strong> → <strong>Social</strong>. Sign in with your dashboard. Pick channels and <strong>schedule</strong> or <strong>draft</strong> posts. OpenQuok publishes from the server. Connect channels required in the dashboard with <Badge text="Add Channel" variant="new" />. |
| **Skool** | When you connect Skool in <Badge text="Add Channel" variant="new" />, the extension reads cookies from skool.com while you stay signed in there. OpenQuok checks the session and stores it encrypted. |
| **Directory launch** | Sidebar → <strong>Directory</strong>: sign in, pick a directory channel chip to open that site and load your product profile, then <strong>Fill</strong> on the directory tab (on-page panel or sidebar). Or start from <a href="/account/products">My Products</a> with <Badge text="Launch to directory" variant="new" />. You submit on the directory site yourself. |

On directory sites, users are required to sign in to OpenQuok.

![Add Directory Channel in Channels Tab](/docs/_assets/directory-submission/extension-banner.webp)

Click <strong>Go to Login</strong> to open <a href="/sign-in">sign in</a> on the same host as your dashboard (including self-host) or the directory login page. See <a href="/docs/directory-submission">Directory submission</a> for My Products → launch steps.

<Callout type="note">
<p><strong>Skool</strong> is the only social channel that uses cookie connect today. <strong>PeerPush</strong> and <strong>Uneed</strong> use the extension for autofill only — OpenQuok does not post to those sites from the server.</p>
</Callout>

<Callout type="warning">
<p>Skool connect is not official OAuth. For directories, you must follow each site’s rules when you submit. OpenQuok may change extension behavior if a platform changes access.</p>
</Callout>

<Callout type="note">
<p>The dashboard reaches the Firefox add-on through a page <Badge text="postMessage" variant="param" /> bridge on OpenQuok hosts — not Chromium <Badge text="externally_connectable" variant="param" />. Directory launch handoff from My Products depends on that bridge; verify after manifest or bridge changes.</p>
</Callout>

## Install on Firefox

<p>Install OpenQuok from Mozilla Add-ons:</p>

<p><DocsExternalLink href={OPENQUOK_BROWSER_EXTENSION_FIREFOX_ADDONS_URL}>Firefox Add-ons</DocsExternalLink></p>

<p>After install, pin the add-on from the toolbar menu and open the OpenQuok sidebar to sign in.</p>

<Callout type="note">
<p><strong>Google Chrome</strong> and <strong>Microsoft Edge</strong> use the Chromium side panel build. See <a href="/docs/installation/chrome-extension">Chrome extension</a> and <a href="/docs/installation/edge-extension">Edge extension</a>.</p>
</Callout>

## Sidebar (Social and Directory)

Click the <strong>OpenQuok</strong> toolbar icon (or sidebar action) to open the Firefox <strong>sidebar</strong>. You can also open it from the context menu (see below) — that opens the <strong>Social</strong> tab.

<p>Dashboard sign-in appears <strong>once</strong> in a <strong>session bar</strong> above the Social and Directory tabs (OpenQuok.com, self-host URL, refresh, disconnect). Switch tabs without signing in again.</p>

| Tab | Purpose |
| --- | --- |
| <strong>Social</strong> | After you connect in the session bar, pick channels, write a post, attach media, preview, and choose <strong>Publish now</strong>, <strong>Schedule</strong>, or <strong>Draft</strong>. Keep a signed-in dashboard tab open. Use <strong>web UI</strong> for the full feature (media library, AI tools, large uploads). |
| <strong>Directory</strong> | See profile status and run <strong>Fill</strong> for directory destinations on the active tab when the session bar shows you are signed in. |

### Composer media (Social tab)

Use the toolbar <strong>+</strong> to attach images or video. Thumbnails show on your device until you publish, schedule, or draft — then the extension uploads to <Badge text="POST /api/v1/media/upload" variant="path" /> and creates the post. Remove a file with <strong>×</strong> on its thumbnail.

![OpenQuok Chrome Extension's Social Tab](/docs/_assets/directory-submission/extension-social.webp)

| Limit | Value |
| --- | --- |
| Attachments per post | Up to <strong>10</strong> |
| Single image (client check) | About <strong>30 MB</strong> |
| Single video (client check) | Up to <strong>1 GB</strong> |

<Callout type="warning">
<p>Oversized or unsupported files are blocked when uploading. Network limits still apply at publish time — use <strong>Open full composer</strong> for the media library or very large files.</p>
</Callout>

<Callout type="note">
<p>Extension uploads use the signed-in dashboard route, not <Badge text="POST /public/upload" variant="path" />. Very large videos may be slow — use the dashboard composer for heavy clips.</p>
</Callout>

### Channel selection

Channels appear as avatars above the post field. Use <strong>Select all</strong> or <strong>Select grouped channels</strong> for a workspace group. Tap a chip to include or exclude a channel. The <strong>+</strong> chip opens <strong>Add Channel</strong> on <a href="/account">My Dashboard</a> (or focuses an open account tab).

<Callout type="note">
<p><strong>Local dev (<Badge text="https://localhost:5173" variant="path" />):</strong> Sign in, keep that tab in the same window as the sidebar, then tap <strong>Refresh</strong>. If you are still on a production session — sign out on <Badge text="www.openquok.com" variant="path" /> or use a separate Firefox profile.</p>
</Callout>

## Context menu

Right-click on any page:

| Menu item | When it appears | Draft |
| --- | --- | --- |
| <strong>Schedule with OpenQuok</strong> | Selected text | Body = selection |
| <strong>Schedule with OpenQuok</strong> | Page background | Body = page title + URL |
| <strong>Schedule with OpenQuok</strong> | Image | Uploads the image when possible. If upload fails, the URL goes in the body with a warning |
| <strong>Humanize selection with OpenQuok</strong> | Selected text | Opens <Badge text="/tools/humanizer" variant="path" /> in a new tab with the selection in the composer (up to about <strong>2,200</strong> characters). The sidebar stays closed. |

![Right click to see OpenQuok in Context Menu](/docs/_assets/directory-submission/extension-context-menu.webp)

<p>For <strong>Schedule with OpenQuok</strong>, the extension saves the draft, opens the sidebar on <strong>Social</strong>, and focuses the composer. <strong>Humanize selection with OpenQuok</strong> opens the Humanizer tab with your selection in the composer; the sidebar stays closed. The tab uses your active dashboard host when you are on one, otherwise an open <Badge text="localhost:5173" variant="param" /> tab, otherwise the host where the extension session is signed in.</p>

<Callout type="note">
<p>Posts still go through your signed-in API (<Badge text="POST /api/v1/posts" variant="path" />). Sending directly from a live platform tab is planned for cookie channels but is not in the current build.</p>
</Callout>

## Who needs this

| Audience | Action |
| --- | --- |
| <strong>Social scheduling</strong> | Install the add-on in Firefox, open <strong>Social</strong>, sign in, and schedule to channels you connected in the dashboard. |
| <strong>Skool</strong> | Install in Firefox, stay signed in on Skool, then use <Badge text="Add Channel" variant="new" /> in the dashboard. |
| <strong>Directory launch</strong> | Install the add-on, complete a product profile on My Products, then launch to PeerPush, Uneed, or another supported directory. See <a href="/docs/directory-submission">Directory submission</a>. |
| <strong>Self-host operators</strong> | Build <Badge text="dist-firefox/" variant="path" />, load as a temporary add-on in <strong>about:debugging</strong>, set <Badge text="firefox:&lt;add-on-id&gt;" variant="envWeb" /> in <Badge text="VITE_OPENQUOK_BROWSER_EXTENSION_IDS" variant="envWeb" />, and verify host permissions on the merged manifest. See <a href="/docs/configuration-web/browser-extension-firefox">Extension (Firefox)</a>. |

## Environment variables (web)

On Firefox, the web app detects the add-on through the **page runtime bridge** and optional ID map entries — not <Badge text="chrome.runtime.sendMessage" variant="default" /> from arbitrary origins.

| Variable | Purpose |
| --- | --- |
| <Badge text="VITE_OPENQUOK_BROWSER_EXTENSION_IDS" variant="envWeb" /> | Include <Badge text="firefox:&lt;add-on-id&gt;" variant="envWeb" /> after AMO publish (default gecko id <Badge text="openquok@openquok.com" variant="path" /> in <Badge text="manifest.firefox.json" variant="path" /> unless AMO assigns another). Pair with <Badge text="chromium:…" variant="envWeb" /> / <Badge text="edge:…" variant="envWeb" /> when users may run multiple browsers. |
| <Badge text="VITE_OPENQUOK_BROWSER_EXTENSION_ID" variant="envWeb" /> | Legacy single Chromium ID only — insufficient for Firefox-only workspaces; prefer the multi-ID map. |

Copy from <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/.env.development.example"><Badge text="web/.env.development.example" variant="path" /></DocsExternalLink> into <Badge text="web/.env.development.local" variant="envWeb" />. Restart the dev server after you change it.

<Callout type="note">
<p>Skool connect does not need OAuth keys on the server. Directory autofill reads profile data from OpenQuok over the same session link. See <a href="/docs/channels/connect">Connect a channel</a> and our <a href="/privacy-policy">Privacy Policy</a>.</p>
</Callout>

<h2 id="self-host-firefox-build">Self-host (Firefox build)</h2>

<p>Operators who build from source: run <Badge text="pnpm --filter @openquok/browser-extension build:firefox" variant="default" />, load <Badge text="dist-firefox/" variant="path" /> as a temporary add-on, set <Badge text="VITE_OPENQUOK_BROWSER_EXTENSION_IDS" variant="envWeb" />, and confirm <Badge text="host_permissions" variant="param" /> cover your dashboard origin. Full steps, AMO zip, and bridge verification live in <a href="/docs/configuration-web/browser-extension-firefox">Extension (Firefox)</a> under <strong>Configuration - Web</strong>.</p>

## Manual verification checklist for self-host

Use this after you build or update the Firefox add-on from source. Use a Firefox profile where you are signed in to OpenQuok with at least two social channels.

### Checklist for Social Tab

<Steps
	howToName="Verify the Social tab in Firefox"
	howToDescription="Confirm session, channels, posts, media, and preview after a Firefox extension build."
>

### Session and channels

<p>Connect in the <strong>session bar</strong> above the tabs — the Social tab shows the composer and the connection label stays visible when you switch to <strong>Directory</strong> (no duplicate sign-in banner). <strong>Select all</strong> or <strong>Select grouped channels</strong>. Tap <strong>+</strong> — it opens Add Channel on the account page. Schedule a post. Optional: right-click text → <strong>Schedule with OpenQuok</strong> — text appears in the composer.</p>

### Media and preview

<p>Attach a media. Remove one with <strong>×</strong>. Try an oversized file — error before upload. Draft or schedule with media only (empty caption) — post has media on the dashboard. Right-click an image → <strong>Schedule with OpenQuok</strong> — preview or URL fallback behaves as expected. Confirm <strong>Preview</strong> updates; one channel vs many changes preview style. <strong>Open full composer</strong> still opens the dashboard editor.</p>

</Steps>

### Checklist for Directory Tab

<Steps
	howToName="Verify the Directory tab in Firefox"
	howToDescription="Confirm the sidebar, Fill actions, directory avatars, and dashboard handoff after a Firefox extension build."
>

### Panel and Fill

<p>Switch to <strong>Directory</strong> — text and buttons are readable on the sidebar theme. Smoke one <strong>Fill</strong> on PeerPush or Uneed when you use directory launch.</p>

### Directory avatar and handoff

<p>Tap a directory avatar — the <strong>Fill</strong> UI opens on the directory tab when you are signed in with a product profile. From <a href="/account/products">My Products</a>, run <strong>Launch to directory</strong> once and confirm the dashboard handoff reaches the add-on through the page bridge.</p>

</Steps>

## Related

<CardGrid>
<LinkCard title="Browser extension (overview)" description="Post from any tab with the extension" href="/browser-extension" />
<LinkCard title="Chrome extension" description="Chromium side panel install guide" href="/docs/installation/chrome-extension" />
<LinkCard title="Edge extension" description="Edge Add-ons; same Chromium build as Chrome" href="/docs/installation/edge-extension" />
<LinkCard title="Extension (Firefox) self-host" description="build:firefox, temporary add-on, AMO zip" href="/docs/configuration-web/browser-extension-firefox" />
<LinkCard title="Skool" description="Connect Skool with the extension" href="/docs/social-integration/skool" />
<LinkCard title="Directory submission" description="My Products and extension handoff" href="/docs/directory-submission" />
<LinkCard title="Connect rules" description="Which networks use OAuth, keys, or the extension" href="/docs/platforms/connect-rules" />
<LinkCard title="Connect a channel" description="Add Channel in the dashboard" href="/docs/channels/connect" />
<LinkCard title="Configuration - Web" description="VITE_* variables and extension IDs" href="/docs/configuration-web" />
</CardGrid>