# SDK examples

Runnable samples for `@openquok/node-sdk`. Not published to npm (`package.json` `files` only includes `dist/`, `README.md`, `LICENSE`).

## OAuth2 third-party app

[`oauth2-express.mjs`](./oauth2-express.mjs) — Authorization Code flow for apps registered under **Developers → Apps** (`oqc_` / `oqs_`), then calls the public API with the returned `opo_` token via the SDK.

```bash
cd sdk/examples
npm install express @openquok/node-sdk
export OPENQUOK_OAUTH_CLIENT_ID=oqc_...
export OPENQUOK_OAUTH_CLIENT_SECRET=oqs_...
node oauth2-express.mjs
# open http://localhost:3000/connect
```

Keep this file aligned with [`web/src/content/docs/oauth2-for-apps/nodejs-example.md`](../../web/src/content/docs/oauth2-for-apps/nodejs-example.md) (see `.cursor/rules/sdk-maintenance.mdc`).

## Jev decision routing + OpenQuok draft

[`jev-route-draft.mjs`](./jev-route-draft.mjs) — classify inbound text with `@typesafe-ai/sdk`, then create an OpenQuok **draft** with `@openquok/node-sdk` when intent is `schedule_social`.

```bash
cd sdk/examples
npm install @typesafe-ai/sdk @openquok/node-sdk
export TYPESAFE_API_KEY="sk-..."
export OPENQUOK_API_KEY="opo_..."
export OPENQUOK_THREADS_INTEGRATION_ID="<integration-id>"
export OPENQUOK_LINKEDIN_INTEGRATION_ID="<integration-id>"
node jev-route-draft.mjs "Launch update: same news on Threads and LinkedIn, but LinkedIn should sound more formal."
```

Keep aligned with [`web/src/content/docs/oauth2-for-apps/jev-decision-routing.md`](../../web/src/content/docs/oauth2-for-apps/jev-decision-routing.md).
