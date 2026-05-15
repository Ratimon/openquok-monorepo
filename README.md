<h1>OpenQuok monorepo</h1>

**Your AI-ready social media scheduling workspace**

**OpenQuok** — a forkable, self-hosted alternative to closed SaaS schedulers (Buffer, Hypefury, and similar "post later" stacks) when you want publishing power without renting your whole workflow.

Use the **dashboard** to review, schedule and approve with a clear path from draft to post. Fits naturally on top of AI tooling like **OpenClaw**. Forkable and self-hostable.

Use the **`@openquok/auto-cli`**, CLI-first for AI agents and scripts, to give them the same scheduling surface to autonomously schedule posts, manage integrations, and upload media purely from the terminal.


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
- Vercel

### Quick start

To have the project up and running, please follow the [Quick Start Guide](https://www.openquok.com/docs/getting-started-for-dev/quick-start).


### License

This repository's source code is available under the [AGPL-3.0 license](LICENSE).
