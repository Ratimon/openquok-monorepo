# Bring your own model — choose an agent harness for social media (secret-admin copy & paste)

**Workflow:** secret-admin → **blog-manager** → **posts/new**.  
**Topic:** [Buyer Decision Frameworks](https://www.openquok.com/blog/topic/buyerdecisionframeworks) (pick in admin; subtopic *When to Choose X vs Y* is `d5f7a000-0000-4000-a000-000000000403` if needed).  
**Rule:** FAQ, HowTo, Product, and **Audience card** live in **form fields only** — do not duplicate in `content` HTML ([web-seo-blog](../.cursor/rules/web-seo-blog.mdc)).  
**No external URLs** in `content` or structured FAQ/HowTo — use `/agents/*` and `/docs/*` only.

**Model-agnostic check (hosts in this article)**

| Host (table order) | Bring your own model? | Notes |
| --- | --- | --- |
| [ChatGPT / Codex MCP](/agents/chatgpt) | **Partial** | ChatGPT plan; MCP to OpenQuok |
| [Cursor](/agents/cursor) | **Conditional** | Third-party models: legacy **Other Models** pool vs prepaid API on Premium |
| [OpenClaw](/agents/openclaw), [Hermes](/agents/hermes) | **Yes** | Self-hosted gateways; your provider keys |
| [OpenBot](/agents/openbot) | **Yes** | BYO subscriptions, custom routers, local models; multi-agent rooms |
| [MausBot](/agents/mausbot) | **Yes** | Per-bot engine + native CLIs (Claude Code, Codex, Grok, …) on your machine |
| [Tucano](/agents/tucano) | **Yes** | Per-agent harness (Claude Code, Codex, Cursor, Grok, Pi, …) |
| [Rakazo](/agents/rakazo) | **Yes** | Self-hosted sandboxes; your API keys |

**Excluded from this article:** [Cue](/agents/cue) and [Manus](/agents/manus) are personal or studio cloud agents on the vendor stack—you do not pick your own LLM like on MausBot or OpenBot. Use their integration pages for official-API scheduling, not this BYO harness guide.

Channel SEO (same harness, per network): e.g. <a href="/agents/openbot/facebook">OpenBot + Facebook</a>, <a href="/agents/mausbot/instagram">MausBot + Instagram</a>, <a href="/agents/tucano/linkedin">Tucano + LinkedIn</a>, <a href="/agents/openclaw/threads">OpenClaw + Threads</a>.

**Comparison table row order (popularity):** mass-market MCP surfaces first (`MCP_LANDING_SEEDS`: ChatGPT, Cursor), then agent hosts in `PUBLIC_AGENT_HOST_LANDING_PAGES` hub order (OpenClaw → Hermes → … → OpenBot → MausBot → Tucano), then Rakazo.

---

## title

```
How to Choose Your Own AI Agent Harness for Social Media Management
```

## slug

```
choose-model-agnostic-agent-social-media-management
```

## description

```
Bring your own ChatGPT, Claude, or Grok plan. Compare agent harnesses—MausBot, Tucano, OpenBot, OpenClaw, Hermes, Cursor, and Rakazo—then run channels, review, and publishing in OpenQuok.
```

## topic

```
Buyer Decision Frameworks (slug: buyerdecisionframeworks)
```

## reading_time_minutes

```
19
```

---

## Audience card — preset

```
team-social-managers
```

## Audience card — title

```
Teams choosing an agent harness and bring-your-own-model setup for social with OpenQuok
```

## Audience card — description

```
You manage content across networks and you already pay for more than one AI vendor. You need a harness that fits your daily UI and a single OpenQuok workspace for channels, review, and publish control.
```

## Audience card — audience_type (optional)

```
Social leads and founders evaluating agent hosts for OpenQuok
```

---

## product.name

```
OpenQuok
```

## product.description

```
Social media management workspace with calendar, kanban, plugs, analytics, CLI, MCP tools, and openquok-core—you approve every publish regardless of which LLM your agent uses.
```

## product.brand

```
OpenQuok
```

## product.url

```
https://www.openquok.com/agents
```

---

## howto_name

```
Five steps to choose your agent harness for social media management
```

### howto_step 1 name

```
Write down your model subscriptions and daily UI
```

### howto_step 1 text

```html
<p>List paid plans (ChatGPT, Claude, Grok, Gemini) and where you already work: desktop chat, Telegram, WhatsApp, or your code editor. Browse <a href="/agents">agent hosts and MCP clients</a> and note which surfaces match that UI.</p>
```

### howto_step 2 name

```
Decide who runs the computer
```

### howto_step 2 text

```html
<p>Pick vendor cloud, your laptop, or your own server. Self-hosted paths include <a href="/agents/openclaw">OpenClaw</a>, <a href="/agents/hermes">Hermes Agent</a>, <a href="/agents/rakazo">Rakazo</a>, <a href="/agents/mausbot">MausBot</a>, <a href="/agents/tucano">Tucano</a>, and personal <a href="/agents/openbot">OpenBot</a>. Managed clouds include Grok Bot and Dots—see <a href="/blog/grok-bot-vs-openclaw-pick-your-openquok-social-scheduler-agent">Grok Bot vs OpenClaw</a> when you want a shorter compare.</p>
```

### howto_step 3 name

```
Shortlist bring-your-own-model hosts and Cursor billing
```

### howto_step 3 text

```html
<p>Use the comparison table in the article body. Confirm each finalist accepts your model keys today. Compare <a href="/agents/mausbot">MausBot</a>, <a href="/agents/tucano">Tucano</a>, and <a href="/agents/openbot">OpenBot</a> when you want desktop BYO teams. For <a href="/agents/cursor">Cursor</a>, check legacy Other Models vs Premium prepaid third-party billing—see <a href="/docs/mcp-setup-guides/cursor">Cursor MCP setup</a>. Personal cloud agents such as <a href="/agents/cue">Cue</a> are out of scope here—you do not choose the LLM on Cue OS.</p>
```

### howto_step 4 name

```
Connect OpenQuok for content and publishing
```

### howto_step 4 text

```html
<p>Install <code>@openquok/auto-cli</code> where the agent runs commands. Add <code>openquok-core</code> from <a href="/tools/skill-builder">Skill Builder</a> or the host setup guide. OpenQuok holds channels, calendar, kanban, media, plugs, and analytics—the harness only needs CLI or MCP access.</p>
```

### howto_step 5 name

```
Verify channels and keep approval on
```

### howto_step 5 text

```html
<p>Run <code>openquok integrations:list</code>, draft in chat, and move posts through <a href="/docs/posts-management/approvals">approvals</a> or kanban. Start a <a href="/pricing">free trial</a> if your workspace is new.</p>
```

---

## FAQ (form fields)

### FAQ 1 question

```
What does bring your own model mean for social media management?
```

### FAQ 1 answer

```html
<p>You keep the AI subscriptions you already pay for—ChatGPT, Claude, Grok, Gemini, or others—and pick an agent harness that talks to them. OpenQuok stays your social layer: connected accounts, drafts, schedules, approvals, and performance data. You can switch models or harnesses without reconnecting every network.</p>
```

### FAQ 2 question

```
When should I pick MausBot instead of Grok Bot?
```

### FAQ 2 answer

```html
<p>Pick <a href="/agents/mausbot">MausBot</a> when you want a free open-source desktop chat app, many parallel bots, and native Claude, Codex, or Grok CLIs on hardware you control. Pick <a href="/agents/grok-bot">Grok Bot</a> when you prefer xAI’s managed cloud teammate without running desktop software. Also compare <a href="/agents/tucano">Tucano</a>, <a href="/agents/openbot">OpenBot</a>, and <a href="/agents/rakazo">Rakazo</a> on the <a href="/agents">Agents hub</a>.</p>
```

### FAQ 2b question

```
How do MausBot, Tucano, and OpenBot differ?
```

### FAQ 2b answer

```html
<p><a href="/agents/mausbot">MausBot</a> is open-source multi-bot desktop chat—bot list, automations, optional always-on cloud. <a href="/agents/tucano">Tucano</a> is channel-based agent teams with routines and per-agent harness choice. <a href="/agents/openbot">OpenBot</a> is macOS-first multi-agent rooms with strong agent settings and BYO providers. All three let you bring your own model. See host-specific channel pages such as <a href="/agents/openbot/youtube">OpenBot + YouTube</a> or <a href="/agents/mausbot/threads">MausBot + Threads</a>.</p>
```

### FAQ 3 question

```
Can Cursor or Codex replace a full agent host?
```

### FAQ 3 answer

```html
<p><a href="/agents/cursor">Cursor</a> fits in-repo MCP sessions while you code—not a 24/7 messaging gateway. Codex-style work usually flows through <a href="/agents/chatgpt">ChatGPT MCP</a> or a desktop host like OpenBot with a ChatGPT provider. Use a host when scheduling must run outside your editor.</p>
```

### FAQ 4 question

```
How does the new Cursor Premium plan affect model-agnostic scheduling?
```

### FAQ 4 answer

```html
<p>New Cursor accounts use The X Subscription (for example Premium at $30/mo). Included usage covers Cursor’s own models in a weekly pool. Third-party models are not included—you pay API list price from prepaid credit when Agent uses Claude, GPT, or Gemini. Legacy Pro, Pro+, Ultra, and Teams seats keep two monthly pools: Cursor Models and Other Models. Legacy Pro still includes third-party usage in Other Models. Switching from legacy to The X Subscription is optional and permanent. OpenQuok MCP only needs your programmatic token. Read <a href="/agents/cursor">Cursor integration</a> and <a href="/docs/mcp-setup-guides/cursor">Cursor MCP setup</a> before you change plans.</p>
```

### FAQ 5 question

```
Does OpenQuok lock me to one LLM for social media management?
```

### FAQ 5 answer

```html
<p>No. OpenQuok does not choose your model. Your harness does. You can run Claude on one machine and ChatGPT on another workspace, or failover inside MausBot, Tucano, or OpenBot—OpenQuok still lists the same integrations for each approved workspace.</p>
```

### FAQ 6 question

```
Where should I read more comparisons?
```

### FAQ 6 answer

```html
<p>Read <a href="/blog/best-grok-bot-alternatives-in-2026-for-openquok-social-scheduling">Grok Bot alternatives for OpenQuok</a>, <a href="/blog/pick-your-openquok-harness-openai-claude-microsoft-or-google">harness by ecosystem</a>, and <a href="/blog/grok-bot-vs-openclaw-pick-your-openquok-social-scheduler-agent">Grok Bot vs OpenClaw</a>. Then open the matching page on the <a href="/agents">Agents hub</a>.</p>
```

---

## content (HTML source)

Paste into **Content → HTML source**. The block below matches the **published** post body (Nov 2026). The blog editor may re-wrap tables (`blog-content-table`, `<p>` inside cells)—that is fine; meaning and links stay the same.

```html
<p>You want agents to help with social media management: briefs, drafts, media, schedules, and follow-up. You also want freedom to change AI vendors when prices, limits, or quality shift. <strong>Bring your own model</strong> and <strong>choose your own harness</strong>. Your agent works better if you choose the harness that already owns your chat history and context. OpenQuok is the second half: connected networks, calendar, kanban, plugs, analytics, and human approval.</p>

<p>This article is a buyer decision framework. It does not crown a single winner. It helps you match ChatGPT, Cursor, OpenClaw, Hermes Agent, OpenBot, MausBot, Tucano, and Rakazo to how you already work—only harnesses where you bring your own model or keys. For sibling reads, use <a href="/blog/pick-your-openquok-harness-openai-claude-microsoft-or-google">pick your OpenQuok harness by ecosystem</a>, <a href="/blog/best-grok-bot-alternatives-in-2026-for-openquok-social-scheduling">Grok Bot alternatives for OpenQuok</a>, and <a href="/blog/grok-bot-vs-openclaw-pick-your-openquok-social-scheduler-agent">Grok Bot vs OpenClaw</a>. The <a href="/agents">Agents hub</a> lists every host and MCP client with setup guides.</p>

<h2>What bring your own model means for social media management</h2>

<p><strong>Bring your own model</strong> (sometimes called model-agnostic) means you choose the AI vendor or plan—you are not locked into one chat app’s built-in model. You pick an <strong>agent harness</strong>: the desktop app, gateway, or editor where agents run skills and talk to your models. The harness routes prompts to Claude today and Grok tomorrow. Your skills, files, and agent memory stay with that harness—not trapped inside one vendor’s chat-only UI.</p>

<p>For social media management, bring-your-own-model matters for three reasons:</p>

<table>
<thead>
<tr>
<th>#</th>
<th>Why it matters</th>
<th>In practice</th>
</tr>
</thead>
<tbody>
<tr>
<td>1</td>
<td>One plan, many jobs</td>
<td>Pay for <a href="/agents/cursor">Cursor</a>, ChatGPT, or a desktop host like <a href="/agents/openbot">OpenBot</a> once. Route each task to the model that fits—Grok for launch art or memes, Claude for tight copy or code for a custom plug. You avoid stacking extra “scheduling bot” subscriptions on every vendor chat plan.</td>
</tr>
<tr>
<td>2</td>
<td>One thread, switch models</td>
<td>A campaign thread can mix brief, draft, image prompt, and CLI checks. A harness that shares context lets you pick the right model per step without copy-paste into a new app or lost history.</td>
</tr>
<tr>
<td>3</td>
<td>Security and control</td>
<td>You choose where API keys and agent computers live—your laptop, your gateway, or your tenant. OpenQuok still holds channel OAuth in your workspace; the harness only needs CLI or MCP access to call OpenQuok.</td>
</tr>
</tbody>
</table>

<p>OpenQuok does not pick your LLM. You install <code>openquok-core</code> or connect MCP on the machine where commands run. See <a href="/tools/skill-builder">Skill Builder</a> when you want packaged skill text instead of hand-rolling SKILL.md.</p>

<h2>Five questions before you shortlist</h2>

<p>Answer these in order. They remove bad fits fast.</p>

<h3>1. Where do you want to manage social work each day?</h3>

<p>Desktop app, phone, Telegram, WhatsApp, Slack, or inside your repository editor—pick one primary surface. Messaging-first gateways favor <a href="/agents/openclaw">OpenClaw</a> and <a href="/agents/hermes">Hermes Agent</a>. Open-source multi-bot desktop chat favors <a href="/agents/mausbot">MausBot</a>. Channel-based agent teams with routines favor <a href="/agents/tucano">Tucano</a>. Polished desktop multi-agent rooms favor <a href="/agents/openbot">OpenBot</a>. In-editor tool calls favor <a href="/agents/cursor">Cursor</a>. Codex-style coding plus chat often flows through <a href="/agents/chatgpt">ChatGPT MCP</a> or a desktop host with a ChatGPT provider.</p>

<h3>2. Who runs the computer?</h3>

<p>Vendor cloud teammates avoid server ops but move sandboxes off your hardware. Self-hosted gateways and Rakazo put credentials and logs where you configure them. MausBot and personal OpenBot run on your Mac, Windows, or Linux box; optional always-on cloud is separate—check license and hosting notes on the <a href="/docs/agent-setup-guides/mausbot">MausBot guide</a> and <a href="/docs/agent-setup-guides/openbot">OpenBot guide</a>.</p>

<h3>3. How many agents do you need in one room?</h3>

<p>A single scheduling agent may be enough for steady publishing. Campaigns often need QA, brand, and subject-matter agents to brainstorm before a scheduling agent queues drafts and media. MausBot, Tucano, and OpenBot emphasize many agents in parallel on desktop. OpenClaw and Hermes emphasize gateway sessions you message from phones. Rakazo emphasizes one bot per sandbox with your model keys.</p>

<h3>4. How will the agent call OpenQuok?</h3>

<p>CLI-first <code>openquok-core</code> gives structured JSON and repeatable scripts—ideal for volume, plugs, uploads, and kanban-driven review. MCP fits tool-style calls from editors or chat clients with connectors. Many teams use CLI for operations and MCP for ad hoc questions. Start from <a href="/docs/getting-started-for-cli">CLI getting started</a> or <a href="/docs/getting-started-for-mcp">MCP getting started</a>.</p>

<h3>5. Will a human approve every publish?</h3>

<p>OpenQuok assumes you review drafts before they go live. Agents should default to <code>draft</code> status and explicit schedule commands—not silent autopilot. Wire that rule into agent instructions and use <a href="/docs/posts-management/approvals">post approvals</a> on the calendar or kanban.</p>

<h3>6. Are you on legacy Cursor Pro or new Premium?</h3>

<p>If Cursor is your harness, answer this before you pick Claude vs Grok in Agent. Legacy Pro keeps a monthly <strong>Other Models</strong> pool for third-party LLMs. New Premium trades that for more Cursor-model usage and bills Claude, GPT, and Gemini at API list price from prepaid credit. Neither choice changes OpenQuok channels or approvals. It changes how expensive each Agent turn is when you draft launch copy. When in doubt, read <a href="/docs/mcp-setup-guides/cursor">Cursor setup</a> and the FAQs on <a href="/agents/cursor">/agents/cursor</a> before you unify.</p>

<h2>Compare the harnesses in this framework</h2>

<p>The table scores fit for OpenQuok social media management—not every feature of each product. Rows are ordered for name recognition and OpenQuok hub priority: common ChatGPT and Cursor paths first, then flagship self-hosted hosts, then newer BYO desktops, then Rakazo for tenant sandboxes. The <strong>Source &amp; license</strong> column summarizes what OpenQuok documents on each <a href="/agents">integration page</a>—confirm the vendor’s current terms before production or redistribution.</p>

<table>
<thead>
<tr>
<th>Harness</th>
<th>Bring your own model</th>
<th>Source &amp; license (summary)</th>
<th>Typical daily UI</th>
<th>Where OpenQuok CLI runs</th>
<th>Best when</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="/agents/chatgpt">ChatGPT (Codex-style)</a></td>
<td>ChatGPT subscription or API via connector</td>
<td>Proprietary — OpenAI ChatGPT / Codex terms</td>
<td>ChatGPT client</td>
<td>Cloud computer or local with CLI skill</td>
<td>Codex and chat already live inside ChatGPT for you</td>
</tr>
<tr>
<td><a href="/agents/cursor">Cursor</a></td>
<td>Editor picks model; MCP calls OpenQuok; third-party use depends on legacy Other Models vs prepaid API on Premium</td>
<td>Proprietary — Cursor subscription terms</td>
<td>IDE session</td>
<td>Developer machine</td>
<td>You tie release posts to code; legacy Pro may fit if you want included Claude/GPT in Agent</td>
</tr>
<tr>
<td><a href="/agents/openclaw">OpenClaw</a></td>
<td>Bring your own models to a self-hosted Gateway</td>
<td>Open-source gateway — read upstream license in vendor repo</td>
<td>Telegram, WhatsApp, Slack, Discord</td>
<td>Gateway machine</td>
<td>You manage social from messaging apps on your own server</td>
</tr>
<tr>
<td><a href="/agents/hermes">Hermes Agent</a></td>
<td>Provider keys on gateway; skills on disk</td>
<td>Open-source gateway — read Nous Hermes upstream license</td>
<td>Telegram, WhatsApp, Slack</td>
<td>Gateway host</td>
<td>You want Hermes-style routing with messaging-first UX</td>
</tr>
<tr>
<td><a href="/agents/openbot">OpenBot</a></td>
<td>BYO subscriptions; custom OpenAI-compatible routers; local models</td>
<td>Source available — PolyForm Noncommercial 1.0.0 for personal use; read before commercial use</td>
<td>Desktop + mobile; multi-agent rooms</td>
<td>OpenBot computer</td>
<td>You want a polished desktop for teams—admins wire providers once, staff chat without VM ops</td>
</tr>
<tr>
<td><a href="/agents/mausbot">MausBot</a></td>
<td>BYO Claude, Codex, Grok CLIs; per-bot model picker</td>
<td>Open source — Apache License 2.0</td>
<td>Desktop + phone companion; bot list + automations</td>
<td>Bot computer or cloud desktop</td>
<td>You want open-source multi-bot desktop chat without Grok Bot’s managed cloud</td>
</tr>
<tr>
<td><a href="/agents/tucano">Tucano</a></td>
<td>BYO harness per agent; Claude Code, Codex, Cursor, Grok, and more</td>
<td>Proprietary desktop app — free tier; optional Pro/Team cloud; read vendor license</td>
<td>Desktop channels + routines; Telegram for approvals</td>
<td>Your computer or isolated Linux per agent</td>
<td>You want channel-based agent teams with routines and explicit approval gates</td>
</tr>
<tr>
<td><a href="/agents/rakazo">Rakazo</a></td>
<td>Your API keys on self-hosted platform</td>
<td>Open source — Apache License 2.0</td>
<td>Web, desktop, mobile, Slack</td>
<td>Per-bot sandbox</td>
<td>You must self-host bot computers for clients or tenants</td>
</tr>
</tbody>
</table>

<p><strong>Open source vs source-available:</strong> Apache 2.0 hosts (MausBot, Rakazo) suit teams that want to fork, audit, and self-host without a commercial desktop license. OpenClaw and Hermes are open-source gateways on the Agents hub billing FAQ—still read each project’s SPDX before you redistribute. OpenBot publishes source for audit but uses PolyForm Noncommercial for personal use, not a permissive OSS license. ChatGPT, Cursor, and Tucano are proprietary clients—you bring models, but you do not own the harness code. OpenQuok itself is <a href="/self-hosting">open source</a> separately from these agent products.</p>

<h2>MausBot: open-source multi-bot desktop</h2>

<p>MausBot fits operators who want a free Apache-licensed desktop app that feels like a messaging client for many bots. Each bot picks an agent engine and model. You connect Claude Code, Codex, or Grok with subscriptions you already pay for. Optional cloud plans keep bots awake when your laptop sleeps.</p>

<p>Social workflows pair well with SEO or launch bots in parallel: specialists finish briefs; a scheduling bot with <code>openquok-core</code> queues drafts. Use the skill recorder after a good openquok run to reuse the recipe. Read <a href="/docs/agent-setup-guides/mausbot">MausBot setup</a> and the <a href="/agents/mausbot">MausBot integration page</a>. For managed xAI teammates, compare <a href="/agents/grok-bot">Grok Bot</a> first.</p>

<h2>Tucano: channel-based agent teams</h2>

<p>Tucano fits operators who organize work in channels and want each agent on its own harness. You sign in to Claude Code, Codex, Cursor, Gemini, Grok, OpenCode, or Pi once. Tuca can propose specialists; you edit tools and limits before they run. Routines keep weekday social drafting on a calendar while sensitive actions wait for your yes.</p>

<p>Pair a brand or launch agent in one channel with a scheduling agent that runs <code>openquok-core</code> on your computer or an isolated Linux box. Optional Tucano Pro keeps the team in the cloud when your laptop sleeps. The desktop app is proprietary with a free tier—unlike Apache-licensed <a href="/agents/mausbot">MausBot</a>. Read <a href="/docs/agent-setup-guides/tucano">Tucano setup</a> and the <a href="/agents/tucano">Tucano integration page</a> for current license and cloud terms.</p>

<h2>OpenBot: desktop team, BYO AI</h2>

<p>OpenBot targets operators who want a capable macOS-first client and mobile companions for ongoing social operations. Agent settings show memory, skills, files, and tables in one overview. You connect ChatGPT, Claude, Grok, Gemini, or custom OpenAI-compatible endpoints—including routers some teams use for failover.</p>

<p>OpenBot stands out for <strong>everyday usability</strong>, especially inside organizations. An admin can connect provider subscriptions or API keys in agent settings once; social and marketing staff only open chat and work—they do not live in key consoles or sandbox dashboards. That split is simpler than asking every editor to manage their own Rakazo VM and keys.</p>

<p>Other reasons teams shortlist OpenBot before another self-hosted stack:</p>
<ul>
<li><strong>Rakazo → OpenBot moves</strong> — bringing an agent definition over from <a href="/agents/rakazo">Rakazo</a> is straightforward in practice, so you are not rebuilding specialists from scratch when you want a friendlier desktop.</li>
<li><strong>License clarity</strong> — personal noncommercial use is free under PolyForm Noncommercial 1.0.0; source is available to audit on your machine. Read the license before commercial rollout on <a href="/agents/openbot">OpenBot integration</a>.</li>
<li><strong>Mobile path</strong> — mobile clients already pair with the desktop host; as native apps mature, some teams plan to retire a dedicated Rakazo sandbox VM and keep one laptop—or phone—tethered host instead.</li>
<li><strong>Faster OpenQuok wiring</strong> — install <code>openquok-core</code> on the OpenBot computer, authenticate once, and message agents; no per-bot VM provisioning for a first social scheduling workflow.</li>
</ul>

<p>Multi-agent rooms fit campaigns and launches: specialists align in a shared channel; then a scheduling agent with <code>openquok-core</code> queues drafts and media. Native app connectors are still growing; when a suite is missing, you add a skill or MCP bridge—the same OpenQuok workspace still holds channels and review. Read the full wiring on <a href="/docs/agent-setup-guides/openbot">OpenBot setup</a> and the <a href="/agents/openbot">OpenBot integration page</a>. For network-specific playbooks, open a channel page—e.g. <a href="/agents/openbot/facebook">OpenBot + Facebook</a> or <a href="/agents/openbot/linkedin">OpenBot + LinkedIn</a>.</p>

<h2>Compare MausBot, Tucano, and OpenBot on the desktop</h2>

<p>All three let you bring subscriptions you already pay for and assign different models or harnesses per agent. The UX differs. MausBot feels like a bot list and automations in an open-source messenger. Tucano feels like Slack-style channels, routines, and optional Telegram approvals. OpenBot feels like polished agent settings, multi-agent rooms, and strong macOS-first UX—best when admins configure providers and end users only chat. If you only need one scheduling bot, any of the three works. If you run parallel specialists, MausBot and Tucano emphasize many named agents; OpenBot emphasizes rooms and publish settings. Smoke a channel URL before you commit—<a href="/agents/tucano/x">Tucano + X</a> and <a href="/agents/mausbot/youtube">MausBot + YouTube</a> reuse the same OpenQuok workspace rules as the parent host page.</p>

<h2>Rakazo: self-hosted sandboxes and your keys</h2>

<p>Rakazo fits when “model-agnostic” must include “keys never leave infrastructure I administer.” The platform is <strong>Apache 2.0</strong> open source—self-host Docker sandboxes and audit the stack. Each bot gets an isolated computer; you install skills and CLI there. You trade polish for control. When staff need a simpler daily UI—or you want to drop always-on sandbox VMs—compare <a href="/agents/openbot">OpenBot</a> for admin-managed keys and desktop chat. Against OpenClaw when you need Telegram-first gateways instead of bot sandboxes. Start at <a href="/docs/agent-setup-guides/rakazo">Rakazo setup</a>.</p>

<h2>OpenClaw and Hermes: gateways and messaging UI</h2>

<p>OpenClaw and Hermes Agent are self-hosted, <strong>open-source gateways</strong> (see the <a href="/agents">Agents hub</a> billing FAQ). You message from phones; the gateway runs models and skills on hardware you choose. Both fit teams that manage social from WhatsApp or Telegram daily. OpenClaw emphasizes ClawHub skills and broad channel adapters; Hermes emphasizes its gateway stack and skill layout. Read each vendor’s repository license before you fork or ship to clients.</p>

<p>Follow <a href="/docs/agent-setup-guides/openclaw">OpenClaw setup</a> and <a href="/docs/agent-setup-guides/hermes">Hermes setup</a>. For cloud versus gateway framing, read <a href="/blog/grok-bot-vs-openclaw-pick-your-openquok-social-scheduler-agent">Grok Bot vs OpenClaw</a>, then return here for model-agnostic detail.</p>

<h2>Cursor: model-agnostic inside the repo—if your plan still allows it</h2>

<p><a href="/agents/cursor">Cursor</a> is an MCP client, not a 24/7 messaging gateway. Your editor session may use Claude, GPT, Gemini, or Cursor’s own models. OpenQuok connects as MCP tools or via the CLI beside your code. This path shines when social work is tied to releases—changelog threads, Dev.to posts, launch copy beside a merge—not when marketers never open the repository.</p>

<p>Cursor billing changed how “model-agnostic” feels in the editor. New customers start on <strong>The X Subscription</strong> (for example Premium at $30/mo). That plan gives you a weekly pool for Cursor models. Third-party models are <strong>not</strong> in that pool. When you pick Claude, GPT, or Gemini in Agent, you pay API list price from prepaid credit. That is still model-agnostic at the technical level—you choose the vendor per task—but it is no longer “included subscription” model-agnostic for third parties.</p>

<p><strong>Legacy Cursor plans</strong> (Pro, Pro+, Ultra, and Teams Standard or Premium) split usage into two monthly pools: <strong>Cursor Models</strong> and <strong>Other Models</strong>. Pro and above include third-party usage in Other Models. Many teams on legacy Pro ($20/mo) keep routing Agent to Claude or GPT without a separate API prepay line. If you schedule with <a href="/agents/cursor">OpenQuok MCP</a> and you want cheap third-party routing inside Cursor, staying on legacy can matter. Switching to The X Subscription is optional—and <strong>permanent</strong> once you unify. Compare plan details on the <a href="/agents/cursor">Cursor integration</a> and <a href="/docs/mcp-setup-guides/cursor">Cursor MCP setup</a> before you move.</p>

<p>OpenQuok does not depend on which side you pick. You still add <code>openquok</code> in <code>.cursor/mcp.json</code>, verify integrations, and approve on the calendar or kanban. If Cursor’s third-party economics push you away from the editor, <a href="/agents/mausbot">MausBot</a>, <a href="/agents/tucano">Tucano</a>, <a href="/agents/openbot">OpenBot</a>, and <a href="/agents/rakazo">Rakazo</a> stay on the model-agnostic host side with BYO keys you control outside Cursor pools.</p>

<h2>Codex-style flows through ChatGPT</h2>

<p>“Codex” in buyer conversations often means OpenAI’s coding agent inside a paid ChatGPT plan—not a separate OpenQuok host page. You stay model-agnostic at the OpenQuok layer: ChatGPT carries the subscription; OpenQuok carries channels and operations. Connect via ChatGPT custom connector MCP or run CLI on a cloud computer attached to your ChatGPT workflow.</p>

<p>If ChatGPT is your only daily AI surface, start with <a href="/docs/mcp-setup-guides/chatgpt">ChatGPT MCP setup</a>. If you also run OpenBot with a ChatGPT provider, you may use desktop rooms for campaigns and ChatGPT for ad hoc tasks—both can target the same OpenQuok workspace.</p>

<h2>Per-channel landings on OpenQuok</h2>

<p>Each host has programmatic pages at <code>/agents/{host}/{channel}</code>—same harness, network-specific setup language. Examples: <a href="/agents/openbot/facebook">OpenBot + Facebook</a>, <a href="/agents/mausbot/instagram">MausBot + Instagram</a>, <a href="/agents/tucano/linkedin">Tucano + LinkedIn</a>, and <a href="/agents/openclaw/threads">OpenClaw + Threads</a>. Pick a channel page when your team cares about one network first; the parent host page stays the overview.</p>

<h2>How OpenQuok stays constant across harnesses</h2>

<p>Regardless of harness, you connect social accounts once per workspace. Agents call the same integrations list, post commands, upload helpers, plugs, and analytics queries. Human approval stays on OpenQuok—not inside the LLM transcript. That separation is the point of model-agnostic management: swap harnesses or models without re-authenticating every network.</p>

<p>Operational checklist:</p>
<ul>
<li>One OAuth or device login per MausBot bot computer, Tucano agent computer, OpenBot machine, gateway, or sandbox.</li>
<li>Store programmatic tokens only on that machine—not in shared chat logs.</li>
<li>Default agent recipes to draft status; require explicit schedule or approval notes.</li>
<li>Use <a href="/channels">supported channels</a> when you add a new network mid-quarter.</li>
</ul>

<h2>Decision paths by constraint</h2>

<h3>You must self-host and message from Telegram</h3>

<p>Shortlist OpenClaw or Hermes. Install <code>openquok-core</code> on the gateway host. Skip Cursor unless developers also need in-repo MCP.</p>

<h3>You want failover across Claude, ChatGPT, and Grok subscriptions</h3>

<p>Shortlist MausBot, Tucano, or OpenBot. Map each subscription to agents or harnesses; use a scheduling agent with stable OpenQuok instructions. Confirm license terms for commercial use before production. Use channel pages—e.g. <a href="/agents/openbot/threads">OpenBot + Threads</a>—for network-specific CLI examples.</p>

<h3>You run bots as isolated tenants for clients</h3>

<p>Shortlist Rakazo sandboxes or multiple OpenClaw gateways per environment. Give each client workspace separate OpenQuok organizations when billing requires isolation.</p>

<h3>You already live in Cursor for product work</h3>

<p>Wire MCP first for quick wins with <a href="/docs/mcp-setup-guides/cursor">Cursor MCP setup</a>. Confirm whether you still have legacy Other Models or you are on Premium with prepaid third-party usage. If third-party routing gets costly, add <a href="/agents/mausbot">MausBot</a>, <a href="/agents/tucano">Tucano</a>, or <a href="/agents/openbot">OpenBot</a> for marketing-heavy drafting while you keep Cursor for repo-tied posts. Add a gateway host later if non-developers must schedule without the IDE.</p>

<h3>You are standardizing on one vendor ecosystem</h3>

<p>Read <a href="/blog/pick-your-openquok-harness-openai-claude-microsoft-or-google">pick your harness by ecosystem</a> before you debate model-agnostic minutiae—sometimes the right answer is the agent that matches your existing invoice.</p>

<h2>After you pick: connect OpenQuok once</h2>

<p>Install <code>@openquok/auto-cli</code> on the execution environment. Add <code>openquok-core</code> through the host’s skill flow or <a href="/tools/skill-builder">Skill Builder</a>. Authenticate with device login or a rotated programmatic token from Developers → Access. Run <code>openquok integrations:list</code> before your first campaign.</p>

<p>When you compare Grok-only clouds against this list, read <a href="/blog/best-grok-bot-alternatives-in-2026-for-openquok-social-scheduling">Grok Bot alternatives</a>—it covers managed teammates that are not model-agnostic in the same way as BYO hosts.</p>

<h2>Verify from chat</h2>

<p>After setup, ask your scheduling agent:</p>
<blockquote><p>List my connected social accounts and create a draft LinkedIn post about our launch. Do not schedule until I approve on OpenQuok.</p></blockquote>

<p>Confirm the draft appears in your OpenQuok kanban or calendar before you promote the workflow to your team. New workspaces can start on <a href="/pricing">Pricing</a> with a trial; harness software and LLM subscriptions remain separate bills.</p>
```

---

## Publish checklist

- [ ] Topic: **Buyer Decision Frameworks**
- [ ] Cover image uploaded (e.g. `choose-model-agnostic-agent-social-media-management-blog-cover.jpg`)
- [ ] FAQ / HowTo / Audience in form fields only
- [ ] User published + **Admin approved**
- [ ] Smoke: `/blog/choose-model-agnostic-agent-social-media-management`, internal links, table renders
- [ ] Smoke host + channel links: `/agents/openbot/facebook`, `/agents/mausbot/instagram`, `/agents/tucano/linkedin`, `/agents/openclaw/threads`