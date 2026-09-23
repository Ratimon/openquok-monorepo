---
title: Activation and login
description: Email verification links, sign-in problems, and what logged-out API responses mean in OpenQuok.
order: 3
lastUpdated: 2026-09-23
---

<script>
import { Badge, Callout, CardGrid, LinkCard, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Activation and login

> Sign-up, email verification, and session checks behave differently on Cloud, local dev, and self-host without mail.

## Verification link does not work

When <Badge text="EMAIL_ENABLED" variant="envBackend" /> is on, new accounts must confirm email before full access. Links point to <Badge text="/verify-signup" variant="path" /> with a <Badge text="token" variant="param" /> and <Badge text="email" variant="param" /> query.

| Problem | What to try |
| --- | --- |
| Link opens Home with no success message | Token missing, expired, or already used. Request a new email from the sign-in or verify page. |
| Truncated link | Copy the full URL from the message. Mail clients sometimes break long lines. |
| Wrong browser | Open the link in the same browser profile you used to sign up when possible. |

<Tabs items={["OpenQuok Cloud", "Self-hosted without email", "Local dev with inbox"]} variant="line">
<TabItem label="OpenQuok Cloud">

<p>Check spam. Use <strong>Resend verification email</strong> on the verify page. Still nothing? Email <a href="mailto:admin@openquok.com">admin@openquok.com</a> from the address you signed up with — see <a href="/docs/help">Help</a>.</p>

</TabItem>
<TabItem label="Self-hosted without email">

<p>Typical Docker and self-host defaults set <Badge text="EMAIL_ENABLED=false" variant="envBackend" />. New users are marked verified automatically and can sign in right away. No inbox is required.</p>

<p>Details: <a href="/docs/configuration-backend/resend#self-hosted--no-email-provider">Resend → Self-hosted / no email provider</a>.</p>

</TabItem>
<TabItem label="Local dev with inbox">

<p>Run <Badge text="pnpm dev:with-local-email" variant="default" /> and open the local inbox at <Badge text="http://localhost:8005" variant="new" /> to read verification messages. See <a href="/docs/configuration-backend/resend">Resend setup</a>.</p>

</TabItem>
</Tabs>

## I cannot sign in after sign-up

- Confirm email when verification is enabled.
- Reset password from the login page if you forgot it.
- On self-host, check <Badge text="DISABLE_REGISTRATION" variant="envBackend" /> if sign-up itself is closed — <a href="/docs/installation/docker-compose">Docker Compose</a>.

## Logged-out API responses

When you are not signed in, some session checks return empty or not-found style responses by design. The web app uses that to show the login screen. That is normal in the network tab while logged out.

<Callout type="note">
<p>If you <strong>are</strong> signed in but the app keeps asking you to log in, the browser may be hitting the wrong API host. On self-host, align <Badge text="VITE_BACKEND_DOMAIN_URL" variant="envWeb" /> with <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> and CORS — <a href="/docs/configuration-web/vite">Vite configuration</a>.</p>
</Callout>

## CLI device login

The <Badge text="openquok" variant="default" /> CLI uses a browser step at <Badge text="/cli/device/verify" variant="path" />. If the code page fails to load, confirm <Badge text="BROWSER_ORIGIN" variant="envBackend" /> and auth server URLs — <a href="/docs/getting-started-for-cli/authentication">CLI authentication</a>.

## Related

<CardGrid>
<LinkCard title="Help" description="Email and Discord when you need a person" href="/docs/help" />
<LinkCard title="Resend - Email setup" description="EMAIL_ENABLED, Cloud mail, and local inbox" href="/docs/configuration-backend/resend" />
<LinkCard title="Troubleshooting overview" description="Connect, uploads, and failed posts" href="/docs/troubleshooting" />
</CardGrid>
