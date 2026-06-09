<h1>OpenQuok monorepo</h1>

**Your AI-ready social media scheduling workspace**. It helps individuals or teams to run many social accounts at scale (especially as AI multiplies output) with an automation pipeline—draft, schedule, and publish—plus review and approval workflows so humans give final sign-off before anything goes live

**OpenQuok** — a forkable, self-hosted alternative to closed SaaS schedulers (Buffer, Hypefury, and similar "post later" stacks) when you want publishing power without renting your whole workflow.

Use the **dashboard** to review, schedule and approve with a clear path from draft to post. Fits naturally on top of AI tooling like **OpenClaw**. Forkable and self-hostable.

Use the **`@openquok/auto-cli`**, CLI-first for AI agents and scripts, to give them the same scheduling surface to autonomously schedule posts, manage integrations, and upload media from the terminal.


### Links

- [Website](https://www.openquok.com)
- [Doc for Agent Users](https://www.openquok.com/docs)
- [Doc For Contributors/mainteners](https://www.openquok.com/docs/getting-started-for-dev)
- [Doc Public API](https://localhost:5173/docs/getting-started-for-public-api)
- [Architecture](https://www.openquok.com/docs/getting-started-for-dev/architecture)
- [Installation](https://www.openquok.com/docs/installation)
- [Developer Guidelines](https://www.openquok.com/docs/developer-guidelines)
- [Security Guidelines](https://www.openquok.com/docs/developer-guidelines/security)
- [Documentation Contribution Guidelines](how-to-write-docs)

---

### Prerequisites

- Node.js 24+
- Corepack (for pnpm)

```bash
corepack enable
```

---

### Tech stack

- Supabase DB & Auth
- Clouldflare R2
- Express.js
- Svelte 5
- Tailwind CSS
- DaisyUI
- Redis
- Stripe
- Resend
- Sentry
- Posthog
- Vercel
- Railway

### Quick start

To have the project up and running, please follow the [Quick Start Guide](https://www.openquok.com/docs/getting-started-for-dev/quick-start).


### License

| Path | License |
|------|---------|
| Repository default (`backend/`, `web/`, `orchestrator/`, `sdk/`, `agent/src/`, …) | [AGPL-3.0-or-later](LICENSE) |
| `agent/skills/` | [MIT](agent/skills/LICENSE) |

Compiled CLI code published as [`@openquok/auto-cli`](https://www.npmjs.com/package/@openquok/auto-cli) is AGPL-3.0-or-later. Agent skills under `agent/skills/` are MIT so they can be copied into other agent setups without AGPL obligations on the skill text alone.
