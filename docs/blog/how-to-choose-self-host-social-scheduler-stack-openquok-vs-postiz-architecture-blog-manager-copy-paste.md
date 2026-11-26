# Self-host scheduler stack — OpenQuok vs Postiz architecture (secret-admin copy & paste)

**Workflow:** secret-admin → **blog-manager** → edit existing post **or** paste into **Content → HTML source**.  
**Live:** [how-to-choose-self-host-social-scheduler-stack-openquok-vs-postiz-architecture](https://www.openquok.com/blog/how-to-choose-self-host-social-scheduler-stack-openquok-vs-postiz-architecture) (synced from production, 2026-11-26).  
**Topic:** [Buyer Decision Frameworks](https://www.openquok.com/blog/topic/buyerdecisionframeworks) (subtopic *When to Choose X vs Y* → `d5f7a000-0000-4000-a000-000000000403` if needed).  
**Rule:** FAQ, HowTo, Product, and **Audience card** live in **form fields only** — do not duplicate in `content` HTML ([web-seo-blog](../.cursor/rules/web-seo-blog.mdc)).  
**No external URLs** in `content` or structured FAQ/HowTo — use `/agents/*`, `/docs/*`, `/compare/*`, and `/blog/*` only.

**This refresh (2026-11-26)**

- New **h2:** *Scheduler stack vs agent harness* — two congruence decisions, not one.
- Condensed **harness paths** table for self-host operators + link to [choose your agent harness](/blog/how-to-choose-your-own-ai-agent-harness-for-social-media-management).
- **Inline images preserved** — self-host scheduler diagram (intro) and OpenQuok project diagram (architecture section).
- **Main comparison table:** new row *Agent / automation surface*.
- Intro, *When OpenQuok*, *When Postiz*, **FAQ 2**, and **How-to step 1 / 4 / 5** mention the harness article where relevant.
- **reading_time_minutes** → `18` (was ~16 before the harness block).

**Sibling posts**

| Post | Slug |
| --- | --- |
| Features + pricing narrative | `openquok-vs-postiz-two-open-source-schedulers-different-strengths` |
| Bring-your-own-model harness map | `how-to-choose-your-own-ai-agent-harness-for-social-media-management` |

---

## title

```
How to Choose Self-Host Social Scheduler Stack: OpenQuok vs Postiz Architecture
```

## slug

```
how-to-choose-self-host-social-scheduler-stack-openquok-vs-postiz-architecture
```

## description

```
Compare OpenQuok and Postiz self-host architecture—SvelteKit and BullMQ vs Nest and Temporal—plus where your agent harness fits. Congruent stacks, built-in CMS, and MCP paths.
```

## topic

```
Buyer Decision Frameworks (slug: buyerdecisionframeworks)
```

## reading_time_minutes

```
18
```

---

## Audience card — preset

```
developer
```

## Audience card — title

```
Developers
```

## Audience card — description

```
You compare monorepos, workers, and deploy units before you pick a scheduler. This post maps OpenQuok and Postiz stacks so you can fork, self-host, and wire agents without fighting the framework.
```

## Audience card — audience_type (optional)

```
Developers evaluating AGPL self-host scheduler architecture
```

---

## product.name

```
OpenQuok Self-Hosting
```

## product.description

```
Run web, API, BullMQ workers, and built-in blog CMS on your infrastructure. AGPL software fee is zero—you pay for Postgres, Redis, and the hosts you size. Wire agents through CLI, MCP, or openquok-core without changing channel OAuth in the workspace.
```

## product.brand

```
OpenQuok
```

## product.url

```
https://www.openquok.com/self-hosting
```

---

## howto_name

```
How to choose a self-host social scheduler tech stack
```

### howto_step 1 name

```
1. Write one guiding principle and your hard constraints
```

### howto_step 1 text

```html
<p>Decide what matters most: lowest infra cost, MCP and agents, Temporal durability, built-in CMS SEO on one origin, or human review before publish. List non-negotiable constraints (budget cap, no Temporal cluster, team skills). Congruent architecture means every choice supports that single principle—see the post body for examples. Split <strong>scheduler stack</strong> from <strong>agent harness</strong>: you may self-host OpenQuok on a small VPS and run agents on laptops or a gateway. If harness choice is still open, read <a href="/blog/how-to-choose-your-own-ai-agent-harness-for-social-media-management">How to Choose Your Own AI Agent Harness for Social Media Management</a>. If you already use OpenQuok in the cloud, compare paths on <a href="/self-hosting">Self-hosting</a> and <a href="/pricing">Pricing</a>.</p>
```

### howto_step 2 name

```
2. Compare runtime architecture and tech stack
```

### howto_step 2 text

```html
<p>Read both stacks side by side. OpenQuok: SvelteKit web, Express API, BullMQ workers on Redis, optional extension and public API, MCP, and CLI. See <a href="/docs/getting-started-for-dev/architecture">Project Architecture</a> and <a href="/docs/getting-started-for-dev/architecture#presenters-repositories">presenters and repositories</a>. Postiz: React and NestJS, Temporal for workflows, often one Docker image plus database, Redis, and Temporal. Product-level differences: <a href="/blog/openquok-vs-postiz-two-open-source-schedulers-different-strengths">OpenQuok vs Postiz</a> and <a href="/compare/openquok/postiz">compare</a>.</p>
```

### howto_step 3 name

```
3. Match cost and ops to your principle
```

### howto_step 3 text

```html
<p>Both schedulers can be AGPL with no software fee. Infra cost follows shape: a small Docker Compose stack (web, API, workers, Redis, Postgres) vs a production-style cloud layout with many managed services and a Temporal cluster. If your principle is one modest VPS, favor a modular BullMQ worker model. If your principle is cloud production at scale, a Temporal-centric bundle may fit. OpenQuok starting point: <a href="/docs/installation/docker-compose">Docker Compose</a>.</p>
```

### howto_step 4 name

```
4. Choose OpenQuok or Postiz for self-host
```

### howto_step 4 text

```html
<p>Choose OpenQuok when you want custom-friendly OSS, presenter/repository maintainability, built-in blog and SEO, MCP/API, BullMQ instead of Temporal at your scale, and small-footprint self-host—<a href="/self-hosting">Self-hosting</a>, <a href="/docs/getting-started-for-mcp">MCP</a>, <a href="/browser-extension">browser extension</a>. Pair it with a bring-your-own-model harness (<a href="/agents/openclaw">OpenClaw</a>, <a href="/agents/mausbot">MausBot</a>, <a href="/agents/cursor">Cursor</a>, and others on the <a href="/agents">Agents hub</a>); see <a href="/blog/how-to-choose-your-own-ai-agent-harness-for-social-media-management">choose your agent harness</a> for the full map. Choose Postiz when Temporal-first scheduling, Nest/React as your stack, and a horizontal agentic product bundle match your plan—and marketing already lives outside the scheduler repo.</p>
```

### howto_step 5 name

```
5. Start deploy or deepen the comparison
```

### howto_step 5 text

```html
<p>For OpenQuok, follow <a href="/docs/installation/docker-compose">Docker Compose</a> and <a href="/docs/getting-started-for-dev/architecture">architecture</a>, then wire agents via <a href="/docs/getting-started-for-mcp">MCP getting started</a> or <a href="/docs/getting-started-for-cli">CLI getting started</a>. Still deciding on harnesses? Read <a href="/blog/how-to-choose-your-own-ai-agent-harness-for-social-media-management">choose your agent harness for social media management</a>. Still deciding on schedulers? Use <a href="/alternatives/postiz">Postiz alternatives</a> and the <a href="/compare">compare hub</a> for ranked schedulers and feature rows before you migrate.</p>
```

---

## FAQ (form fields)

### FAQ 1 question

```
What tech stack does OpenQuok use for self-host?
```

### FAQ 1 answer

```html
<p>OpenQuok uses SvelteKit for web, Express.js for the API, and BullMQ workers on Redis. The web app separates UI from logic via presenters and repositories. See <a href="/docs/getting-started-for-dev/architecture">Project Architecture</a> and <a href="/docs/getting-started-for-dev/architecture#presenters-repositories">presenters and repositories</a>.</p>
```

### FAQ 2 question

```
How do you choose between OpenQuok and Postiz for self-host?
```

### FAQ 2 answer

```html
<p>Write one guiding principle—cost, Temporal durability, MCP-first automation, or CMS on one origin—and check whether each stack supports it without contradiction. OpenQuok fits modular BullMQ self-host, presenter/repository web code, built-in blog SEO, and agents on <strong>your</strong> harness through MCP or <code>openquok-core</code>. Postiz fits Temporal-centric Nest/React ops and a bundled agentic scheduler product. For features and pricing narrative, read <a href="/blog/openquok-vs-postiz-two-open-source-schedulers-different-strengths">OpenQuok vs Postiz — different strengths</a> and <a href="/compare/openquok/postiz">compare</a>. For harness choice after you pick OpenQuok, read <a href="/blog/how-to-choose-your-own-ai-agent-harness-for-social-media-management">choose your agent harness</a>.</p>
```

### FAQ 3 question

```
Why does OpenQuok separate presenters and repositories?
```

### FAQ 3 answer

```html
<p>Thin Svelte templates and testable presenters keep API changes in repository files instead of scattered fetch logic. That layering is congruent with custom OSS you will fork and extend—including secret-admin blog CMS and public compare pages. Summary: <a href="/docs/getting-started-for-dev/architecture#presenters-repositories">presenters and repositories</a>.</p>
```

### FAQ 4 question

```
Does self-hosting OpenQuok force a specific AI agent or model?
```

### FAQ 4 answer

```html
<p>No. OpenQuok holds channel OAuth, calendar, kanban, plugs, and approvals. You pick the agent harness and model on separate hardware—gateway, desktop, or editor. Connect through MCP, CLI, or <code>openquok-core</code> on the machine where commands run. Read <a href="/blog/how-to-choose-your-own-ai-agent-harness-for-social-media-management">How to Choose Your Own AI Agent Harness for Social Media Management</a> and browse <a href="/agents">Agents</a> for setup guides.</p>
```

---

## content (HTML source)

Paste into **Content → HTML source**. The block below is the **proposed** body after the 2026-11-26 refresh (includes harness cross-link). The blog editor may re-wrap tables (`blog-content-table`, `<p>` inside cells)—that is fine; meaning and links stay the same.

```html
<p>AI tools can write and change code faster than most teams could before. That shift pushes more teams toward <strong>custom software</strong>. This guide explains <strong>how to choose</strong> between <strong>OpenQuok vs Postiz</strong> as open-source <strong>self-host social schedulers</strong>. It uses <strong>congruent architecture</strong> as the lens: do your frameworks, services, marketing stack, and cost model support one clear principle, or do they fight each other?</p>

<img class="mx-auto block h-auto w-auto max-h-[min(70vh,26rem)] max-w-full rounded-md border border-base-300" src="https://abkydcstowozoggfxaei.supabase.co/storage/v1/object/public/blog_images/aa1a6c25-d1dc-43d7-9b13-a3e8ac48caf1-0.5694145191426435.png" alt="Self-hosting Social Sheduler" data-storage-path="aa1a6c25-d1dc-43d7-9b13-a3e8ac48caf1-0.5694145191426435.png">

<p>Pick the <strong>scheduler stack</strong> first—web, API, workers, and durability model. Then pick how agents reach that stack. OpenQuok keeps those layers separate: you self-host the scheduler while agents run on a harness you already use. For bring-your-own-model hosts (OpenClaw, MausBot, Tucano, OpenBot, Cursor MCP, and others), read <a href="/blog/how-to-choose-your-own-ai-agent-harness-for-social-media-management">How to Choose Your Own AI Agent Harness for Social Media Management</a>. For features and pricing, read <a href="/blog/openquok-vs-postiz-two-open-source-schedulers-different-strengths">OpenQuok vs Postiz — two open-source schedulers, different strengths</a> and the <a href="/compare/openquok/postiz">compare page</a>.</p>

<h2>Horizontal, vertical, and custom software</h2>

<p>Product thinkers often sort software into three buckets:</p>

<ul>
<li><p><strong>Horizontal software</strong> serves many industries with one platform. It optimizes for breadth: many features, one vendor, one way to run the product.</p></li>
<li><p><strong>Vertical software</strong> serves one industry or job deeply. It optimizes for fit in a niche, often with presets and opinions baked in.</p></li>
<li><p><strong>Custom software</strong> serves one organization’s rules, integrations, and constraints. It optimizes for adaptability, even when the starting point is open source.</p></li>
</ul>

<p>Social schedulers look horizontal at first glance. Under self-host, you still choose how <strong>custom</strong> the result becomes. You fork workflows, add agents, wire MCP, trim services to match budget, or reshape marketing surfaces. AI coding assistants make that path more realistic because they help you edit plain modules across web, API, and workers.</p>

<p><strong>Congruence</strong> asks which bucket you actually want. If your principle is “run the vendor’s full cloud-shaped stack,” a horizontal bundle can be congruent. If your principle is “one team, modest infra, agents, and our own glue,” you need a stack that stays easy to change—including how you publish SEO content without a separate headless CMS project.</p>

<h2>Congruent architecture: what it means</h2>

<p>“Good architecture” is a wide answer. Context and trade-offs always matter. A tighter test is congruence: do your design choices move toward one guiding principle, or do they fight each other?</p>

<p><strong>Congruent</strong> means internally consistent. Every trade-off should support the same goal. When goals conflict, the architecture feels broken even if each piece is clever. When choices contradict each other, we call that <strong>incongruence</strong>.</p>

<p><strong>Example — speed vs maintainability.</strong> You pick Java because the team can maintain it. Someone asks for Rust because it is faster. You say Rust is hard to read. Suddenly the real goal is unclear. Will you optimize for speed or for maintainability? The design is incongruent.</p>

<p><strong>Example — reliability vs cost.</strong> You invest in queues, jobs, and replication to survive outages. Infra then allows one machine with no redundant site. You wanted stability and cheap ops at the same time, without resolving the conflict. That is incongruence.</p>

<p><strong>Example — SEO vs product.</strong> You self-host a scheduler but bolt on a third-party blog with its own URL scheme, cache rules, and schema markup. Product pages live in one app. Articles live elsewhere. Crawlers and your team see two systems. That split is incongruent unless you planned for it.</p>

<p>Before you pick OpenQuok or Postiz, write down <strong>one guiding principle</strong> and <strong>hard constraints</strong>. Examples: lowest monthly cost, Temporal durability, MCP-first automation, or strict human review before publish on specific networks.</p>

<h2>Scheduler stack vs agent harness</h2>

<p>Self-host teams often blend two decisions into one checklist. Split them. <strong>Scheduler stack</strong> is everything that stores channels, enqueues publishes, serves the calendar, and renders your marketing site. <strong>Agent harness</strong> is where prompts run—desktop app, messaging gateway, or editor—and which model keys you attach.</p>

<p>Congruence breaks when you buy a heavy scheduler stack because you want Grok on Telegram, or when you self-host a slim scheduler but force every marketer into an IDE. OpenQuok assumes the harness stays swappable: MCP and CLI are integration surfaces, not a locked-in chat product. Postiz often ships agentic scheduling closer to the product UI—a valid choice when you want one horizontal bundle.</p>

<table>
<thead>
<tr>
<th>Decision</th>
<th>OpenQuok self-host pattern</th>
<th>Postiz self-host pattern</th>
</tr>
</thead>
<tbody>
<tr>
<td>Scheduler runtime</td>
<td>SvelteKit + Express + BullMQ on Redis</td>
<td>React + NestJS + Temporal (typical OSS tree)</td>
</tr>
<tr>
<td>Where agents live</td>
<td>Your harness—gateway, desktop, or editor</td>
<td>Often inside the scheduler product experience</td>
</tr>
<tr>
<td>Model choice</td>
<td>You pick harness + subscriptions (BYO model)</td>
<td>Depends on product AI features and vendor limits</td>
</tr>
<tr>
<td>OpenQuok connect path</td>
<td><code>openquok-core</code>, CLI, hosted MCP tools</td>
<td>Product APIs and integrations as documented</td>
</tr>
</tbody>
</table>

<p>If OpenQuok is your scheduler, use this shortcut after deploy. It does not replace the full harness article—it orients ops teams who already know their infra shape.</p>

<table>
<thead>
<tr>
<th>If your team…</th>
<th>Start with this harness path</th>
<th>OpenQuok wiring</th>
</tr>
</thead>
<tbody>
<tr>
<td>Messages from Telegram or WhatsApp</td>
<td><a href="/agents/openclaw">OpenClaw</a> or <a href="/agents/hermes">Hermes Agent</a> on a gateway host</td>
<td><code>openquok-core</code> skill on the gateway; approvals in workspace</td>
</tr>
<tr>
<td>Runs parallel desktop bots with BYO CLIs</td>
<td><a href="/agents/mausbot">MausBot</a> or <a href="/agents/tucano">Tucano</a></td>
<td>Per-bot skill; calendar/kanban stays in OpenQuok</td>
</tr>
<tr>
<td>Prefers multi-agent rooms on a Mac or PC</td>
<td><a href="/agents/openbot">OpenBot</a></td>
<td>Provider keys on the admin machine; staff chat only</td>
</tr>
<tr>
<td>Schedules from the repo editor</td>
<td><a href="/agents/cursor">Cursor</a> MCP</td>
<td><a href="/docs/getting-started-for-mcp">MCP getting started</a> + programmatic token</td>
</tr>
<tr>
<td>Wants self-hosted sandboxes per client</td>
<td><a href="/agents/rakazo">Rakazo</a></td>
<td><code>openquok-core</code> per sandbox; OAuth still in OpenQuok</td>
</tr>
</tbody>
</table>

<p>For scoring every BYO host, comparison tables, and Cursor billing notes, read <a href="/blog/how-to-choose-your-own-ai-agent-harness-for-social-media-management">choose your agent harness for social media management</a>. Browse setup guides on the <a href="/agents">Agents hub</a>.</p>

<h2>Built-in CMS and SEO—not only for schedulers</h2>

<p>OpenQuok is not only a scheduling engine inside a thin wrapper. The same monorepo ships a <strong>marketing and content system built for SEO</strong>, wired to the product you run.</p>

<p>Operators use <strong>blog-manager</strong> in the dashboard to publish posts with topics, meta descriptions, reading time, hero images, FAQ blocks, optional HowTo steps, and product summaries. Public posts at <a href="/blog">/blog</a> render CMS HTML with internal links normalized for crawl equity, table markup wrapped for accessibility, and structured data emitted at SSR—<code>BlogPosting</code>, breadcrumbs, optional <code>FAQPage</code>, and <code>HowTo</code> from the same fields you edit in the admin UI.</p>

<p>That pattern applies whenever you run <strong>any SaaS</strong> on this stack—not only social scheduling: programmatic hubs (<a href="/compare">compare</a>, <a href="/channels">channels</a>, <a href="/tools">tools</a>), config-driven landing and FAQ copy, in-app <a href="/docs">docs</a> with tech-article schema, and one origin for product plus content. For a <strong>custom or vertical SaaS</strong> fork, you extend routes and CMS posts on the same deployment instead of bolting on WordPress or a separate docs vendor on day one.</p>

<h2>Framework fit in the AI coding era</h2>

<p><strong>OpenQuok</strong> centers on <strong>Svelte 5</strong> (SvelteKit) for web and <strong>Express.js</strong> for the API. Svelte keeps component logic close to markup. Express is a thin Node routing layer. That combination is congruent with <strong>custom software</strong> and AI-assisted edits across plain modules.</p>

<p><strong>Postiz</strong> typically ships <strong>React</strong> and <strong>NestJS</strong> in the open-source tree—a strong horizontal product stack with conventions and Temporal at the center. It fits teams who will run the product as designed rather than reshape internals often.</p>

<p>Agents are the other half of “AI era” fit. OpenQuok does not ship a single vendor chat UI; it exposes MCP, public API, CLI, and skills so your harness can change without re-OAuthing networks. Postiz leans agentic inside the product—congruent when you want scheduling and agent UX in one repo, less congruent when your principle is “harness on Telegram, scheduler on a small VPS.”</p>

<h2>OpenQuok self-host architecture and tech stack</h2>

<p>OpenQuok splits runtime into separate services: web, API, orchestrator workers, optional browser extension, and programmatic clients. Data and async work use Supabase (or your Postgres path), Redis with BullMQ, and storage you configure.</p>

<img class="mx-auto block h-auto w-auto max-h-[min(70vh,26rem)] max-w-full rounded-md border border-base-300" src="https://abkydcstowozoggfxaei.supabase.co/storage/v1/object/public/blog_images/aa1a6c25-d1dc-43d7-9b13-a3e8ac48caf1-0.42775488853151433.png" alt="OpenQuok Project Diagram" data-storage-path="aa1a6c25-d1dc-43d7-9b13-a3e8ac48caf1-0.42775488853151433.png">

<p>See <a href="/docs/getting-started-for-dev/architecture">Project Architecture</a>. In short:</p>

<ul>
<li><p><strong>Web</strong> — SvelteKit (marketing, workspace, docs, blog, SEO landings).</p></li>
<li><p><strong>Backend API</strong> — Express.js (REST, auth, blog-system APIs, enqueue).</p></li>
<li><p><strong>Orchestrator</strong> — BullMQ workers (publish, tokens, email, reconciliation).</p></li>
<li><p><strong>Clients</strong> — CLI, Node SDK, MCP, browser extension.</p></li>
</ul>

<p>Self-host: <a href="/self-hosting">Self-hosting</a>, <a href="/docs/installation/docker-compose">Docker Compose</a>, <a href="/docs/getting-started-for-mcp">MCP getting started</a>.</p>

<h2>Web layering: separate UI from business logic</h2>

<p>OpenQuok keeps Svelte templates thin. Repositories fetch the API and map wire shapes to domain programmer models (PM). Presenters turn those into view models (VM) for each screen—loading state, errors, toasts—and call repositories instead of embedding fetch logic in markup. Page presenters in <code>area-protected</code>, <code>area-public</code>, and <code>area-admin</code> orchestrate a route; feature presenters own reusable slices (scheduler, blog upsert, settings).</p>

<p>That separation of concerns improves maintainability: you change an API contract in one repository file without rewriting every table and modal. You can unit-test presenters with stubbed repositories. AI coding tools can target a single layer instead of mixing business rules into <code>.svelte</code> files. The same pattern covers the workspace, secret-admin blog CMS, and public compare pages—congruent with a custom SaaS you will extend over time.</p>

<p>Contributor rules for this layering live in the repo under <code>.cursor/rules/web-repository-presenter-architecture.mdc</code>. Human-oriented summary: <a href="/docs/getting-started-for-dev/architecture#presenters-repositories">Presenters and repositories</a> on the architecture doc.</p>

<p>You can review the full source in our <a href="https://github.com/Ratimon/openquok-monorepo" rel="noopener noreferrer nofollow" target="_blank">GitHub repository</a>.</p>

<h2>Postiz self-host architecture and tech stack</h2>

<p>Postiz documents frontend, backend, and orchestrator services—often in one Docker image—with SQL database, Redis, Temporal, and storage. Hosted operations use a multi-service cloud layout (compute, managed database, cache, workflow visibility, Temporal roles). That fits high availability; it is a different congruence target than one modest VPS.</p>

<p>For Postiz infrastructure, the backend starts Temporal workflows; the orchestrator runs durable publish and token jobs. The OSS tree typically uses React and NestJS.</p>

<h2>Self-host cost and congruence</h2>

<p>License price can be zero for both AGPL schedulers. Infra price follows architecture. Postiz’s production-style cloud layout adds fixed monthly cost at scale (multiple hosts, Multi-AZ database, Temporal cluster, search for workflow visibility). That is congruent when your principle is cloud production. It is incongruent when your principle is one small server.</p>

<p>OpenQuok emphasizes web + API + BullMQ workers without a mandatory Temporal cluster for the default story in <a href="/docs/getting-started-for-dev/architecture">Project Architecture</a>. Many teams use Docker Compose on hardware they size. AGPL has no software fee; you fund what you provision—including CMS and SEO on the same stack.</p>

<h2>Social scheduler tech stack compared</h2>

<table>
<thead>
<tr>
<th>Dimension</th>
<th>OpenQuok</th>
<th>Postiz</th>
</tr>
</thead>
<tbody>
<tr>
<td>Software model</td>
<td>Custom-friendly OSS + in-repo marketing SEO</td>
<td>Horizontal scheduler product</td>
</tr>
<tr>
<td>Built-in CMS / SEO</td>
<td>Blog manager, FAQ/HowTo fields, programmatic hubs</td>
<td>Scheduler-centric; marketing often separate</td>
</tr>
<tr>
<td>Web maintainability</td>
<td>Presenter/repository layering; thin Svelte templates</td>
<td>React/Nest product conventions</td>
</tr>
<tr>
<td>UI / API</td>
<td>SvelteKit + Express</td>
<td>React + NestJS (typical OSS)</td>
</tr>
<tr>
<td>Async jobs</td>
<td>Redis + BullMQ</td>
<td>Temporal</td>
</tr>
<tr>
<td>Agent / automation surface</td>
<td>External harness—MCP, CLI, <code>openquok-core</code>; see <a href="/blog/how-to-choose-your-own-ai-agent-harness-for-social-media-management">harness guide</a></td>
<td>Agentic features bundled in product UI (typical positioning)</td>
</tr>
<tr>
<td>Congruent when you need</td>
<td>Modular self-host, MCP/API, CMS on one origin, BYO model</td>
<td>Temporal durability, integrated agentic scheduler</td>
</tr>
</tbody>
</table>

<h2>When OpenQuok is the better self-host fit</h2>

<ul>
<li><p>Custom behavior, agents on your harness, and marketing on one monorepo with built-in blog CMS and SEO.</p></li>
<li><p>Svelte + Express and presenter/repository layering for long-term maintainability.</p></li>
<li><p>BullMQ instead of operating Temporal at your scale.</p></li>
<li><p>Public API, MCP, CLI, and extension handoffs (<a href="/browser-extension">Browser extension</a>); harness map in <a href="/blog/how-to-choose-your-own-ai-agent-harness-for-social-media-management">choose your agent harness</a>.</p></li>
<li><p>Small-footprint self-host (<a href="/self-hosting">Self-hosting</a>).</p></li>
</ul>

<h2>When Postiz is the better self-host fit</h2>

<ul>
<li><p>Temporal-first scheduling and Nest/React as your stack.</p></li>
<li><p>Many networks and agentic automation inside one product bundle.</p></li>
<li><p>Production-grade cloud infra and cost as a trade-off for availability.</p></li>
<li><p>Marketing stack already lives outside the scheduler repo.</p></li>
</ul>

<p>Feature compare: <a href="/blog/openquok-vs-postiz-two-open-source-schedulers-different-strengths">strengths</a>, <a href="/alternatives/postiz">Postiz alternatives</a>, <a href="/compare">compare</a>.</p>

<h2>Summary</h2>

<p><strong>How to choose:</strong> match tech stack and growth stack to one principle—then match agents to a harness that does not fight that principle.</p>

<p>OpenQuok uses SvelteKit, Express, BullMQ, presenter/repository web layering, built-in CMS SEO, MCP/API—fits custom and cost-aware self-host. Pair it with the harness from <a href="/blog/how-to-choose-your-own-ai-agent-harness-for-social-media-management">choose your agent harness</a>. Start with <a href="/docs/getting-started-for-dev/architecture">Project Architecture</a> (see <a href="/docs/getting-started-for-dev/architecture#presenters-repositories">presenters and repositories</a>) and <a href="/compare/openquok/postiz">compare</a>.</p>

<p>Postiz fits Temporal-centric, framework-integrated horizontal scheduling at cloud scale when agent UX inside the product is congruent with your plan.</p>
```

---

## After paste — checklist

- [ ] **Audience card** fields match sections above (admin block, not in `content`).
- [ ] **FAQ** and **HowTo** pasted from form sections; no duplicate accordions in body.
- [ ] **Product** block filled (`OpenQuok Self-Hosting` → `/self-hosting`).
- [ ] Bump **last updated** date in blog-manager when publishing.
- [ ] **Inline images** — intro self-host diagram + OpenQuok project diagram (hero/featured image is separate in blog-manager).
- [ ] Smoke: live post, `/compare/openquok/postiz`, `/blog/how-to-choose-your-own-ai-agent-harness-for-social-media-management`, table JSON-LD (`#blog-table-N` for each comparison table).
- [ ] Optional reciprocal sentence on harness post → link this architecture URL in a future harness refresh (not required for this edit).