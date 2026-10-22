---
title: Gemini Task
description: Connect OpenQuok to Gemini Task via Connected Apps (MCP), skills, and the public API — assign social drafts from the Gemini app.
order: 8
lastUpdated: 2026-10-14
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Prerequisites

- **Gemini Task** (personal agent mode): a **personal** Google Account (not work or school), age **18+**, <DocsExternalLink href="https://gemini.google/subscriptions/">Google AI Pro or Ultra</DocsExternalLink>, **Keep Activity** on, and **Personal Intelligence** opt-in. Google documents task availability on gemini.google.com, the Gemini mobile apps, and the Gemini app on Mac — but **not** in the European Economic Area, Nigeria, Switzerland, or the United Kingdom yet. See <DocsExternalLink href="https://support.google.com/gemini/answer/17094507">Manage tasks &amp; workflows in Gemini Apps</DocsExternalLink>.
- **Connected Apps, skills, and tasks** on paid plans: Google lists those features for Google AI subscribers in <DocsExternalLink href="https://support.google.com/gemini/answer/16275805">Gemini Apps limits &amp; feature availability</DocsExternalLink>.
- An OpenQuok workspace with at least one connected social channel.
- A programmatic token or MCP URL from <Badge text="Developers → Access" variant="default" />.

<Callout type="note">
<p>Google renamed the consumer personal agent in the Gemini app from <strong>Gemini Spark</strong> to <strong>Task</strong>. Click <strong>Task</strong> below the prompt box (not only a “Chat / Task” toggle label in all clients). Existing task threads stay in the sidebar. See <DocsExternalLink href="https://support.google.com/gemini/answer/17094507">Manage tasks &amp; workflows in Gemini Apps</DocsExternalLink>.</p>
</Callout>

<Callout type="warning">
<p><strong>Gemini Task</strong> is the personal agent in gemini.google.com with Task threads, skills, and Connected Apps. <a href="/agents/android-studio">Android Studio</a> is Gemini in the IDE. <a href="/agents/antigravity-cli">Antigravity CLI</a> is Gemini in the terminal. Each has its own OpenQuok setup guide.</p>
</Callout>

## Installation

<Steps
	howToName="Connect OpenQuok to Gemini Task"
	howToDescription="Connected Apps MCP on the web, optional skills, and verification prompts in Task mode."
>

### Confirm Gemini Task is available

<p>Open <DocsExternalLink href="https://gemini.google.com">gemini.google.com</DocsExternalLink> on a computer (or the Gemini app on Mac), sign in with a personal account, and click <strong>Task</strong> below the text box. Product overview: <DocsExternalLink href="https://gemini.google/overview/agent/spark/">Gemini personal agent</DocsExternalLink>.</p>

### Create an OpenQuok MCP URL

<p>In the OpenQuok dashboard, open <Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />. Copy the <strong>MCP server URL</strong> for your workspace (path or header auth).</p>

<p>Do not paste the URL into public chats or shared documents.</p>

<h3 id="choose-a-connection-path">Choose a connection path</h3>

<Tabs items={["Connected App (MCP)", "Skill in Task", "Public API"]}>
<TabItem label="Connected App (MCP)">

<Callout type="warning" title="Custom MCP eligibility">
<p>Google’s help center requires age <strong>18+</strong>, a <strong>personal</strong> account, <strong>Keep Activity</strong> on, and (for now) that you are <strong>in the United States</strong> to add a custom MCP app. Custom Connected Apps are <strong>English-only</strong> and can only be linked on the <strong>web</strong> app; after that, the same app is available on Gemini mobile. See <DocsExternalLink href="https://support.google.com/gemini/answer/17209137">Connect &amp; manage custom apps for Gemini Apps</DocsExternalLink>.</p>
</Callout>

<p>On your computer, go to gemini.google.com. At the bottom, open <strong>Settings</strong> → <strong>Connected Apps</strong>. If you do not see Connected Apps, open <strong>Personal Intelligence</strong> → <strong>Connected Apps</strong> first.</p>

<p>Under <strong>Custom apps</strong>, choose <strong>Add a custom app</strong> and paste your OpenQuok MCP server URL from Developers → Access. The MCP server must follow the standard MCP specifications. If the server does not support Dynamic Client Registration, next to <strong>Advanced features</strong>, click <strong>Show more</strong> and enter credentials (for example a Bearer token in headers instead of a path key).</p>

<p>After you connect on the web, you can use the custom app in Task threads and chat on web and mobile. To steer a prompt at your app, type <Badge text="@" variant="default" /> and select the custom app. Google may ask you to confirm before write actions from third-party MCP servers.</p>

<p>Official steps: <DocsExternalLink href="https://support.google.com/gemini/answer/17209137">Connect &amp; manage custom apps for Gemini Apps</DocsExternalLink>.</p>

</TabItem>
<TabItem label="Skill in Task">

<p>You can save reusable instructions as a <strong>skill</strong> and reference it with <Badge text="@" variant="default" /> in a task thread.</p>

<p>Include openquok-core scheduling rules or paste key CLI commands from <a href="/docs/getting-started-for-cli">CLI introduction</a>.</p>

<blockquote><p>@openquok-scheduling List my connected channels with integrationList, then draft LinkedIn and X posts for tomorrow at 10:00 — queue as drafts only.</p></blockquote>

</TabItem>
<TabItem label="Public API">

<p>When a task calls REST directly, use your <Badge text="opo_" variant="default" /> token in the <Badge text="Authorization" variant="default" /> header. See <a href="/docs/getting-started-for-public-api">Public API</a>.</p>

```bash
export OPENQUOK_API_KEY=opo_your_programmatic_token
openquok integrations:list
```

</TabItem>
</Tabs>

### Verify before you schedule

<p>In a Task thread, ask Gemini:</p>

<blockquote><p>Use OpenQuok to list my connected social integrations and publishing rules. Do not schedule anything yet.</p></blockquote>

<p>Then assign drafting work and keep posts in <Badge text="draft" variant="default" /> or scheduled state until you approve on OpenQuok. Supervise custom MCP tools closely — Google does not control third-party servers.</p>

</Steps>

## Related

<CardGrid>
<LinkCard title="Android Studio MCP" description="Gemini in Agent mode inside the Android IDE" href="/docs/mcp-setup-guides/android-studio" />
<LinkCard title="Antigravity CLI" description="Gemini terminal agent MCP config" href="/docs/mcp-setup-guides/antigravity-cli" />
<LinkCard title="MCP introduction" description="Auth patterns and tool overview" href="/docs/getting-started-for-mcp" />
<LinkCard title="CLI authentication" description="OAuth device flow and programmatic tokens" href="/docs/getting-started-for-cli/authentication" />
</CardGrid>
