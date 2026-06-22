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

Keep this file aligned with [`web/src/content/docs/developer-guidelines/oauth2-authentication.md`](../../web/src/content/docs/developer-guidelines/oauth2-authentication.md) (see `.cursor/rules/sdk-maintenance.mdc`).
