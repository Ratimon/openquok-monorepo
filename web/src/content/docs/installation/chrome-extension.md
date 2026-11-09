---
title: OpenQuok browser extension
description: Install the OpenQuok Chrome extension for side-panel scheduling, Skool connect, directory autofill, and context-menu drafts.
order: 7
lastUpdated: 2026-11-04
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

<p>On Google Chrome, install the published extension from the  <DocsExternalLink href={chromeWebStoreHref}>{chromeWebStoreLinkLabel}</DocsExternalLink>  listing. Self-host operators can still load an unpacked build — see <a href="#install-from-source-unpacked">Install from source</a>.</p>

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
| **Directory launch** | From <a href="/account/products">My Products</a>, choose <Badge text="Launch to directory" variant="new" />. The extension opens the directory site and fills fields from your product profile. You review and click submit on the directory. Use the side panel <strong>Directory</strong> tab to <strong>Fill</strong> on the open tab. |

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

### Channel selection (Social composer)

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

![Right click to see OpenQuok in Context Menu](/docs/_assets/directory-submission/extension-context-menu.webp)

The extension saves the draft, opens the side panel on <strong>Social</strong>, and focuses the composer.

<Callout type="note">
<p>Posts still go through your signed-in API (<Badge text="POST /api/v1/posts" variant="path" />). Sending directly from a live platform tab is planned for cookie channels but is not in the current build.</p>
</Callout>



## Who needs this

| Audience | Action |
| --- | --- |
| <strong>Social scheduling</strong> | Install the extension, open <strong>Social</strong>, sign in, and schedule to channels you connected in the dashboard. |
| <strong>Skool</strong> | Install in Chrome, stay signed in on Skool, then use <Badge text="Add Channel" variant="new" /> in the dashboard. |
| <strong>Directory launch</strong> | Install the extension, complete a product profile on My Products, then launch to PeerPush, Uneed, or another supported directory. See <a href="/docs/directory-submission">Directory submission</a>. |
| <strong>Self-host operators</strong> | Build the extension, set <Badge text="VITE_OPENQUOK_BROWSER_EXTENSION_ID" variant="envWeb" /> on the web app, and add your dashboard HTTPS URL to <Badge text="externally_connectable" variant="param" /> in the manifest. |

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

<p>After install, pin the toolbar icon, set <Badge text="VITE_OPENQUOK_BROWSER_EXTENSION_ID" variant="envWeb" /> on the web app to the extension ID shown on <strong>chrome://extensions</strong> (or use the store listing ID when you installed from the Web Store), then open the side panel and sign in.</p>

<h2 id="install-from-source-unpacked">Install from source (unpacked)</h2>

<Steps
	howToName="Load the OpenQuok browser extension in Chrome"
	howToDescription="Build the extension from the monorepo and load it unpacked for development or self-host."
>

### Build the package

From the monorepo root:

```bash
pnpm common:build
pnpm --filter @openquok/browser-extension build
```

Output is in <Badge text="extension/dist/" variant="path" />.

### Load in Chrome

Open <strong>chrome://extensions</strong>, turn on <strong>Developer mode</strong>, click <strong>Load unpacked</strong>, and select the <strong>dist</strong> folder inside your monorepo clone (for example <Badge text="openquok-monorepo/extension/dist" variant="path" />). Chrome needs <strong>manifest.json</strong> in the folder you pick — not the repo root, not <Badge text="extension/" variant="path" /> alone, and not your Desktop or Downloads shortcut.

<Callout type="warning">
<p>Installing the published Chrome Web Store build does <strong>not</strong> block a separate unpacked copy. The Web Store build keeps its own extension ID; unpacked dev builds get a different ID — set <Badge text="VITE_OPENQUOK_BROWSER_EXTENSION_ID" variant="envWeb" /> to match whichever build your web app should talk to.</p>
</Callout>

![Load Unpacked OpenQuok Chrome Extension](/docs/_assets/installation/local-extension.webp)

Copy the <strong>ID</strong> from the extension card into <Badge text="VITE_OPENQUOK_BROWSER_EXTENSION_ID" variant="envWeb" /> for your web deployment.

### Open the side panel

Pin the extension and click <strong>OpenQuok</strong>. Use <strong>Social</strong> to sign in and schedule, or <strong>Directory</strong> after a launch from My Products.

### Connect Skool (social posting)

Open <strong>skool.com</strong> in the <strong>same Chrome profile</strong> as the extension and sign in.

In OpenQuok, choose <Badge text="Add Channel" variant="new" /> → Skool. Read the notice, then approve cookie access when prompted.

### Launch to a directory

On <a href="/account/products">My Products</a>, open or create a business profile, pick PeerPush or Uneed, and choose <Badge text="Launch to directory" variant="new" />. The extension opens the site and fills fields; you submit on the directory site.

If you are not signed in to OpenQuok, sign in at <a href="/sign-in">sign in</a> first (or use the banner’s <strong>Go to Login</strong>). You may also need an account on the directory before <strong>Fill</strong> works.

</Steps>

Optional zip for manual distribution:

```bash
pnpm --filter @openquok/browser-extension zip
```

## Self-host dashboard origin

The extension accepts messages only from URLs in <Badge text="manifest.json" variant="path" /> → <Badge text="externally_connectable.matches" variant="param" />. Defaults include local dev and <Badge text="https://*.openquok.com/*" variant="path" />.

If your dashboard runs on another HTTPS host, add that URL to the manifest, rebuild, and give users the new build.

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
<LinkCard title="Web configuration" description="VITE_* variables for the dashboard" href="/docs/configuration-web" />
</CardGrid>
