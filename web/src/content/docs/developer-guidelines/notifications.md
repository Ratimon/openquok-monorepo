---
title: Notifications (in-app + email)
description: How OpenQuok creates in-app notifications and sends notification emails (immediate vs digest), including BullMQ worker setup and troubleshooting.
order: 4
lastUpdated: 2026-04-25
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

# Notifications (in-app + email)

OpenQuok notifications have two layers:

- **In-app notifications** — always persisted to the database and shown in the UI.
- **Notification emails** — optional; sent immediately or batched into a digest depending on the caller.

## Where the code lives

- **API entrypoint**: <code>backend/services/NotificationService.ts</code> (<code>inAppNotification</code>)
- **Recipient + digest logic**: <code>backend/services/TransactionalNotificationEmailService.ts</code>
- **Email HTML fragments**: <code>backend/emails/notificationTransactionalEmailHtml.ts</code>
- **Flowcraft “send plain” + “digest flush” workflows**:
  - <code>orchestrator/blueprints/notificationEmailBlueprint.ts</code>
  - <code>orchestrator/nodes/notificationEmailNodes.ts</code>
  - <code>orchestrator/activities/emailActivities.ts</code> (organization helpers; similar role to OpenQuok activities)
- **BullMQ worker** (executes queued email sends + periodic digest flush):
  - <code>orchestrator/worker/runNotificationEmailBullMqWorker.ts</code>

## Behavior: <code>sendEmail</code> and <code>digest</code>

The API always writes the in-app row first. Email is only attempted when:

- <code>sendEmail === true</code>, and
- email is enabled (<Badge text="EMAIL_ENABLED" variant="envBackend" />), and
- the user’s org-member preferences allow that type (success vs failure).

<Callout type="note" title="Digest vs immediate">
Digest mode (<code>digest: true</code>) stores entries in Redis and relies on the <Badge text="notification-email" variant="path" /> worker to flush them on an interval. Immediate mode (<code>digest: false</code>) sends one email per call.
</Callout>

### Current callers (production code)

- **Scheduled post success** → <code>sendEmail: true</code>, <code>digest: true</code> (avoid spam when many channels publish).
- **Scheduled post errors / preflight blocks** → <code>sendEmail: true</code>, <code>digest: false</code> (action needed now).
- **Integration refresh failure** → <code>sendEmail: true</code>, <code>digest: false</code> (match OpenQuok “needs attention” urgency).

## Setup (local development)

<Steps>

### Enable email sending

Follow the email provider setup guide, then ensure the backend has email enabled.

```bash
EMAIL_ENABLED=true
```

See <a href="/docs/configuration-backend/resend">Resend - Email Setup</a> for the full provider configuration.

### Run Redis locally

Notification email digest + BullMQ transport require Redis.

```bash
docker compose -f infra/docker-compose.yml up -d redis
```

See <a href="/docs/configuration-worker">Orchestrator workers</a> for the recommended local Redis settings.

### Choose transport (BullMQ vs in-process)

The backend supports two transports for notification email:

- <code>in_process</code> — send directly from the API process (no queue).
- <code>bullmq</code> — enqueue sends to Redis and run a worker to deliver them.

Override the transport at runtime with:

- <Badge text="ORCHESTRATOR_NOTIFICATION_EMAIL_TRANSPORT" variant="envBackend" />

### Run the notification-email worker (BullMQ transport)

When transport is <code>bullmq</code>, you must run the worker:

```bash
pnpm orchestrator:dev:worker:notification-email-bullmq
```

</Steps>

## Troubleshooting: “I don’t receive notification emails”

- **Check email is enabled**: <Badge text="EMAIL_ENABLED" variant="envBackend" /> must be true.
- **Check transport**: if <code>bullmq</code>, the notification-email worker must be running.
- **Check Redis**: worker and API must point at the same Redis (<Badge text="REDIS_*" variant="envBackend" />).
- **Check user preferences**: success/fail emails may be opted out per member (digest flush emails are type <code>info</code> and are always eligible).
- **Check digest timing**: digest entries flush on an interval (default ~5 minutes) from the worker process.

## Related docs

<CardGrid>
<LinkCard title="Orchestrator workflows" description="Flowcraft + BullMQ overview for refresh, email, scheduled posts" href="/docs/developer-guidelines/orchestrator-workflows" />
<LinkCard title="Orchestrator workers" description="Worker env + local/prod start commands" href="/docs/configuration-worker" />
<LinkCard title="Resend - Email Setup" description="Email provider + local inbox configuration" href="/docs/configuration-backend/resend" />
<LinkCard title="Redis cache" description="REDIS_* config shared by cache and BullMQ" href="/docs/configuration-backend/redis" />
</CardGrid>

