---
title: OpenQuok browser extension
description: Install the OpenQuok Chrome extension for side-panel scheduling, Skool connect, directory autofill, and context-menu drafts.
order: 7
lastUpdated: 2026-11-14
sidebar:
  label: Browser extension
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, VideoModal } from '$lib/ui/components/docs/mdx/index.js';
import { DOCS_YOUTUBE_VIDEOS } from '$lib/docs/constants/docsYoutubeVideos';
import {
	getPublicBrowserExtensionChromeStoreCtaHref,
	PUBLIC_BROWSER_EXTENSION_CHROME_STORE_DOCS_LINK_LABEL
} from '$lib/content/constants/landing/browser-extension-chrome-cta';

const chromeWebStoreHref = getPublicBrowserExtensionChromeStoreCtaHref();
const chromeWebStoreLinkLabel = PUBLIC_BROWSER_EXTENSION_CHROME_STORE_DOCS_LINK_LABEL;
</script>

## Overview

The <strong>OpenQuok Chrome extension</strong> helps when a network needs the browser — not only dashboard OAuth or pasted keys. For a short product tour, see the <a href="/browser-extension">browser extension</a> page.

<p>On Google Chrome, install the published extension from the  <DocsExternalLink href={chromeWebStoreHref}>{chromeWebStoreLinkLabel}</DocsExternalLink>  listing. Self-host operators build and load the extension per browser — see <a href="#self-host-by-browser">Self-host by browser</a>.</p>

See it in action:
<VideoModal
	videoObjectPreset="chromeExtension"
	youtubeVideoId={DOCS_YOUTUBE_VIDEOS.chromeExtension.youtubeVideoId}
	thumbnailAlt={DOCS_YOUTUBE_VIDEOS.chromeExtension.thumbnailAlt}
/>

| Use | What the extension does |
| --- | --- |
| **Social scheduling** | Open the <strong>side panel</strong> → <strong>Social</strong>. Sign in with your dashboard. Pick channels and <strong>schedule</strong> or <strong>draft</strong> posts. OpenQuok publishes from the server. Connect channels required in the dashboard with <Badge text="Add Channel" variant="new" />. |
| **Skool** | When you connect Skool in <Badge text="Add Channel" variant="new" />, the extension reads cookies from skool.com while you stay signed in there. OpenQuok checks the session and stores it encrypted. |
| **Directory launch** | Side panel → <strong>Directory</strong>: sign in, pick a directory channel chip to open that site and load your product profile, then <strong>Fill</strong> on the directory tab (on-page panel or side panel). Or start from <a href="/account/products">My Products</a> with <Badge text="Launch to directory" variant="new" />. You submit on the directory site yourself. |

On directory sites, user are required to sign in to OpenQuok.

![Add Directory Channel in Channels Tab](/docs/_assets/directory-submission/extension-banner.webp)

Click <strong>Go to Login</strong> to open <a href="/sign-in">sign in</a> on the same host as your dashboard (including self-host) or the directory login page. See <a href="/docs/directory-submission">Directory submission</a> for My Products → launch steps.

<Callout type="note">
<p><strong>Skool</strong> is the only social channel that uses cookie connect today. <strong>PeerPush</strong> and <strong>Uneed</strong> use the extension for autofill only — OpenQuok does not post to those sites from the server.</p>
</Callout>

<Callout type="warning">
<p>Skool connect is not official OAuth. For directories, you must follow each site’s rules when you submit. OpenQuok may change extension behavior if a platform changes access.</p>
</Callout>

## Side panel (Social and Directory)

Click the <strong>OpenQuok</strong> toolbar icon to open the Chrome <strong>side panel</strong>. You can also open it from the context menu (see below) — that opens the <strong>Social</strong> tab.

| Tab | Purpose |
| --- | --- |
| <strong>Social</strong> | Sign in to OpenQuok.com or enter a self-host URL (<Badge text="https://localhost:5173" variant="path" />). Keep a signed-in dashboard tab. Then pick channels, write a post, attach media, preview, and choose <strong>Publish now</strong>, <strong>Schedule</strong>, or <strong>Draft</strong>. Use <strong>web UI</strong> for the full feature (media library, AI tools, large uploads). |
| <strong>Directory</strong> | Check sign-in, see profile status, and run <strong>Fill</strong> for PeerPush or Uneed on the active tab. |


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
<p><strong>Local dev (<Badge text="https://localhost:5173" variant="path" />):</strong> Sign in, keep that tab in the same window as the side panel, then tap <strong>Refresh</strong>. If you are still on a production session — sign out on <Badge text="www.openquok.com" variant="path" /> or use a separate Chrome profile.</p>
</Callout>

## Context menu

Right-click on any page:

| Menu item | When it appears | Draft |
| --- | --- | --- |
| <strong>Schedule with OpenQuok</strong> | Selected text | Body = selection |
| <strong>Schedule with OpenQuok</strong> | Page background | Body = page title + URL |
| <strong>Schedule with OpenQuok</strong> | Image | Uploads the image when possible. If upload fails, the URL goes in the body with a warning |
| <strong>Humanize selection with OpenQuok</strong> | Selected text | Opens <Badge text="/tools/humanizer" variant="path" /> in a new tab with the selection in the composer (up to about <strong>2,200</strong> characters). The side panel stays closed. |

![Right click to see OpenQuok in Context Menu](/docs/_assets/directory-submission/extension-context-menu.webp)

<p>For <strong>Schedule with OpenQuok</strong>, the extension saves the draft, opens the side panel on <strong>Social</strong>, and focuses the composer. <strong>Humanize selection with OpenQuok</strong> opens the Humanizer tab with your selection in the composer; the side panel stays closed. The tab uses your active dashboard host when you are on one, otherwise an open <Badge text="localhost:5173" variant="param" /> tab, otherwise the host where the extension session is signed in.</p>

<Callout type="note">
<p>Posts still go through your signed-in API (<Badge text="POST /api/v1/posts" variant="path" />). Sending directly from a live platform tab is planned for cookie channels but is not in the current build.</p>
</Callout>



## Who needs this

| Audience | Action |
| --- | --- |
| <strong>Social scheduling</strong> | Install the extension, open <strong>Social</strong>, sign in, and schedule to channels you connected in the dashboard. |
| <strong>Skool</strong> | Install in Chrome, stay signed in on Skool, then use <Badge text="Add Channel" variant="new" /> in the dashboard. |
| <strong>Directory launch</strong> | Install the extension, complete a product profile on My Products, then launch to PeerPush, Uneed, or another supported directory. See <a href="/docs/directory-submission">Directory submission</a>. |
| <strong>Self-host operators</strong> | Build the extension, set <Badge text="VITE_OPENQUOK_BROWSER_EXTENSION_ID" variant="envWeb" /> (or <Badge text="VITE_OPENQUOK_BROWSER_EXTENSION_IDS" variant="envWeb" />), and add your dashboard HTTPS URL to the manifest. See <a href="/docs/configuration-web/browser-extension-chrome">Chrome</a>, <a href="/docs/configuration-web/browser-extension-edge">Edge</a>, or <a href="/docs/configuration-web/browser-extension-firefox">Firefox</a>. |

## Environment variables (web)

The dashboard talks to the extension with <Badge text="chrome.runtime.sendMessage" variant="default" />. Set the extension ID on the web app:

| Variable | Purpose |
| --- | --- |
| <Badge text="VITE_OPENQUOK_BROWSER_EXTENSION_ID" variant="envWeb" /> | Extension ID from <strong>Extensions → Details</strong> (or the Chrome Web Store when published). |

Copy from <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/.env.development.example"><Badge text="web/.env.development.example" variant="path" /></DocsExternalLink> into <Badge text="web/.env.development.local" variant="envWeb" />. Restart the dev server after you change it.

<Callout type="note">
<p>Skool connect does not need OAuth keys on the server. The extension can refresh Skool cookies while you stay signed in. Directory autofill reads profile data from OpenQuok over the same link. See <a href="/docs/channels/connect">Connect a channel</a> and our <a href="/privacy-policy">Privacy Policy</a>.</p>
</Callout>

## Install from Chrome Web Store

<p>For most users on Google Chrome, install OpenQuok from the Chrome Web Store:</p>

<p><DocsExternalLink href={chromeWebStoreHref}>{chromeWebStoreLinkLabel}</DocsExternalLink></p>

<p>After install, pin the toolbar icon and open the side panel to sign in. Self-hosters who build from source or ship Edge / Firefox builds should follow the configuration guides below.</p>

<h2 id="self-host-by-browser">Self-host by browser</h2>

<p>Build commands, unpacked load steps, extension IDs on the web app, and custom dashboard origins are documented under <strong>Configuration - Web</strong>:</p>

<CardGrid>
<LinkCard title="Extension (Chrome)" description="Build for Google Chrome, store install or load from source" href="/docs/configuration-web/browser-extension-chrome" />
<LinkCard title="Extension (Edge)" description="Build for Microsoft Edge; use the same package as Chrome" href="/docs/configuration-web/browser-extension-edge" />
<LinkCard title="Extension (Firefox)" description="Build for Firefox; load a temporary add-on for testing" href="/docs/configuration-web/browser-extension-firefox" />
</CardGrid>

## Manual verification checklist for self-host

Use this after you build or update the extension from source. Use a Chrome profile where you are signed in to OpenQuok with at least two social channels.

### Checklist for Social Tab

<Steps
	howToName="Verify the Social tab"
	howToDescription="Confirm session, channels, posts, media, and preview after an extension build."
>

### Session and channels

<p>Open <strong>Social</strong> — the composer shows your dashboard session. <strong>Select all</strong> or <strong>Select grouped channels</strong>. Tap <strong>+</strong> — it opens Add Channel on the account page. Schedule a post. Optional: right-click text → <strong>Schedule with OpenQuok</strong> — text appears in the composer.</p>

### Media and preview

<p>Attach a media. Remove one with <strong>×</strong>. Try an oversized file — error before upload. Draft or schedule with media only (empty caption) — post has media on the dashboard. Right-click an image → <strong>Schedule with OpenQuok</strong> — preview or URL fallback behaves as expected. Confirm <strong>Preview</strong> updates; one channel vs many changes preview style. <strong>Open full composer</strong> still opens the dashboard editor.</p>

</Steps>

### Checklist for Directory Tab

<Steps
	howToName="Verify the Directory tab"
	howToDescription="Confirm the panel, Fill actions, and directory avatars after an extension build."
>

### Panel and Fill

<p>Switch to <strong>Directory</strong> — text and buttons are readable on the panel theme. Smoke one <strong>Fill</strong> on PeerPush or Uneed when you use directory launch.</p>

### Directory avatar

<p>Tap a directory avatar — the <strong>Fill</strong> panel opens on the directory tab when you are signed in with a product profile.</p>

</Steps>

## Related

<CardGrid>
<LinkCard title="Browser extension (overview)" description="Post from any tab with the Chrome side panel" href="/browser-extension" />
<LinkCard title="Skool" description="Connect Skool with the extension" href="/docs/social-integration/skool" />
<LinkCard title="Directory submission" description="My Products and extension handoff" href="/docs/directory-submission" />
<LinkCard title="Connect rules" description="Which networks use OAuth, keys, or the extension" href="/docs/platforms/connect-rules" />
<LinkCard title="Connect a channel" description="Add Channel in the dashboard" href="/docs/channels/connect" />
<LinkCard title="AI generation" description="Dashboard AI tools and the free Humanizer" href="/docs/creating-posts/ai-generation" />
<LinkCard title="Extension (Chrome) self-host" description="Build for Chrome and connect your dashboard" href="/docs/configuration-web/browser-extension-chrome" />
<LinkCard title="Configuration - Web" description="VITE_* variables and extension IDs" href="/docs/configuration-web" />
</CardGrid>
