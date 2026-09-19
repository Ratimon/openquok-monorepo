---
title: Jev decision routing example
description: Use Jev to decide what to post — relevant, engaging, actionable, and channel-fit — then create OpenQuok social scheduler drafts in Global or per-channel mode via @openquok/node-sdk.
order: 4
lastUpdated: 2026-09-19
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
import { DocsExternalLink } from '$lib/ui/components/docs/mdx/index.js';
</script>

<Callout type="note">
<p><strong>OpenQuok does not operate Jev.</strong> <DocsExternalLink href="https://typesafe.ai/blog/introducing-system-one-models-and-jev">Jev</DocsExternalLink> is a decision model from TypeSafe AI. You install <code>@typesafe-ai/sdk</code> in <strong>your</strong> app and call OpenQuok with an <Badge text="opo_" variant="default" /> token — from OAuth (this section) or from a workspace programmatic token. Nothing in OpenQuok connects to Jev automatically.</p>
</Callout>

## What this example does

Before you schedule anything, ask whether the post is worth publishing. Classic social guidance boils down to three checks — <strong>relevant</strong>, <strong>engaging</strong>, and <strong>actionable</strong> — plus whether copy and visuals fit each network (<DocsExternalLink href="https://www.productionsolutions.com/decide-post-social-media/">decide what to post on social media</DocsExternalLink>).

This guide encodes those checks as **Jev questions**, then maps the answers to OpenQuok JSON:

1. <strong>Decide</strong> — Is the post ready? Does it need media? Should it use <strong>Global</strong> mode (one caption everywhere) or <strong>per-channel</strong> overrides?
2. <strong>Execute</strong> — <code>@openquok/node-sdk</code> creates a <Badge text="draft" variant="default" /> with the right shape (<code>body</code> only, or <code>bodiesByIntegrationId</code> / <code>providerSettingsByIntegrationId</code>).
3. <strong>Approve</strong> — A human reviews on the calendar or kanban before publish.

Dashboard equivalents: <a href="/docs/creating-posts/global-vs-per-channel">Global vs per-channel</a> in the composer. API equivalents: <code>isGlobal</code>, <code>bodiesByIntegrationId</code>, and <code>mediaByIntegrationId</code> on <Badge text="POST /public/posts" variant="path" />.

## Decision rules (what to post)

| Check | Question for Jev | OpenQuok follow-up |
| --- | --- | --- |
| <strong>Relevant</strong> | Is this useful to the audience (inform, entertain, or community)? | Low score → <Badge text="human_review" variant="default" />, do not create a draft |
| <strong>Engaging</strong> | Would someone want to read and react? | Very low → revise copy or discard |
| <strong>Actionable</strong> | Would someone share, comment, or click? | Optional gate for automated scheduling |
| <strong>Visuals</strong> | Does the post need photo or video? | <Badge text="needs_media" variant="default" /> high → draft with <code>media[]</code> or kanban note to attach assets |
| <strong>Channel fit</strong> | Same copy on every network, or customized per channel? | Maps to Global vs per-channel JSON (see below) |

<p>Do not cross-post identical copy when networks need different tone, length, or format. OpenQuok supports one shared caption (<strong>Global</strong>) or per-integration overrides — the same split as “customized for the channel it’s on.”</p>

## Global vs per-channel in the API

| Composer mode | When to use | Public API shape |
| --- | --- | --- |
| <strong>Global</strong> | Same announcement and attachments everywhere | <code>body</code>, <code>media</code>, <code>integrationIds[]</code>, <code>isGlobal: true</code> |
| <strong>Per-channel copy</strong> | Different caption or media per network | <code>bodiesByIntegrationId</code>, optional <code>mediaByIntegrationId</code> |
| <strong>Global copy, per-channel settings</strong> | Same words; only YouTube title, Instagram post type, etc. differ | Shared <code>body</code> + <code>providerSettingsByIntegrationId</code> per UUID |

See <a href="/docs/creating-posts/global-vs-per-channel">Global vs per-channel</a> and recipe <Badge text="multi-platform-campaign.json" variant="path" /> under <Badge text="agent/skills/openquok-core/resources/examples/" variant="path" />.

## Prerequisites

| Requirement | Notes |
| --- | --- |
| <Badge text="TYPESAFE_API_KEY" variant="envRuntime" /> | From <DocsExternalLink href="https://console.typesafe.ai/">console.typesafe.ai</DocsExternalLink> |
| <Badge text="opo_" variant="default" /> access token | Per user after <a href="/docs/oauth2-for-apps/nodejs-example">OAuth2 Authorization Code</a>, or a workspace token for scripts |
| Channel UUIDs | From <Badge text="GET /public/integrations" variant="path" /> — one or more for Global / multi-channel drafts |

```bash
npm install @typesafe-ai/sdk @openquok/node-sdk
```

Runnable copy: <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/sdk/examples/jev-route-draft.mjs">sdk/examples/jev-route-draft.mjs</DocsExternalLink>.

## TypeScript reference

Pass proposed caption, target channels, and optional per-channel variants in <code>state</code>. Jev returns compose mode and quality gates; your code builds <code>PublicCreatePostDto</code>.

```typescript
import { choice, noul, score, TypeSafeClient } from "@typesafe-ai/sdk";
import Openquok from "@openquok/node-sdk";
import type { PublicCreatePostDto } from "@openquok/node-sdk";

type ChannelTargets = {
  threadsId: string;
  linkedInId?: string;
};

type InboundPostProposal = {
  globalCaption: string;
  /** Optional per-channel overrides when the author already supplied them */
  bodiesByChannel?: Partial<Record<"threads" | "linkedin", string>>;
  channelTargets: ChannelTargets;
};

function buildPostPayload(
  proposal: InboundPostProposal,
  composeMode: string,
): PublicCreatePostDto | null {
  const { globalCaption, bodiesByChannel, channelTargets } = proposal;
  const ids = [channelTargets.threadsId, channelTargets.linkedInId].filter(
    Boolean,
  ) as string[];

  const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  if (composeMode === "not_ready") return null;

  if (composeMode === "global_same_copy") {
    return {
      scheduledAt,
      status: "draft",
      body: globalCaption,
      integrationIds: ids,
      isGlobal: true,
      note: "Jev: global copy — review before scheduling",
      isAgent: true,
    };
  }

  if (composeMode === "per_channel_copy" && channelTargets.linkedInId) {
    return {
      scheduledAt,
      status: "draft",
      body: globalCaption,
      integrationIds: ids,
      isGlobal: false,
      bodiesByIntegrationId: {
        [channelTargets.threadsId]:
          bodiesByChannel?.threads ?? globalCaption,
        [channelTargets.linkedInId]:
          bodiesByChannel?.linkedin ??
          `${globalCaption}\n\nRead more on our site.`,
      },
      note: "Jev: per-channel copy — review before scheduling",
      isAgent: true,
    };
  }

  if (composeMode === "global_copy_per_channel_settings") {
    return {
      scheduledAt,
      status: "draft",
      body: globalCaption,
      integrationIds: ids,
      isGlobal: true,
      providerSettingsByIntegrationId: channelTargets.linkedInId
        ? {
            [channelTargets.linkedInId]: {
              linkedin: { postAsImagesCarousel: false },
            },
          }
        : undefined,
      note: "Jev: global copy, per-channel settings only",
      isAgent: true,
    };
  }

  return null;
}

export async function evaluateAndCreateDraft(params: {
  proposal: InboundPostProposal;
  openquokAccessToken: string;
  relevanceFloor?: number;
}) {
  const { proposal, openquokAccessToken, relevanceFloor = 0.55 } = params;

  const jev = new TypeSafeClient();
  const decision = await jev.systemOne({
    state: {
      proposal: {
        caption: proposal.globalCaption,
        targets: Object.keys(proposal.channelTargets),
        perChannelBodies: proposal.bodiesByChannel ?? {},
      },
    },
    questions: {
      relevant: noul(
        "The post is relevant — it informs, entertains, or serves the audience",
      ),
      engaging: score("How engaging is this copy for social feeds?", [
        "Flat or generic — little reason to react",
        "Acceptable — clear but not compelling",
        "Strong — likely to earn likes or replies",
      ]),
      actionable: noul(
        "A reader would want to share, comment, or take a clear next step",
      ),
      needs_media: noul(
        "The post requires or strongly benefits from a photo or video asset",
      ),
      compose_mode: choice(
        "How should OpenQuok compose this post?",
        {
          global_same_copy:
            "One caption and shared media for every selected channel",
          per_channel_copy:
            "Different caption or tone per network (e.g. casual Threads, formal LinkedIn)",
          global_copy_per_channel_settings:
            "Same caption everywhere; only platform settings differ (title, post type, tags)",
          not_ready: "Copy is not ready to schedule — needs human edit",
        },
      ),
    },
  });

  const { relevant, engaging, actionable, needs_media, compose_mode } =
    decision.answers;

  if (relevant.noul < relevanceFloor) {
    return { action: "human_review", reason: "Not relevant enough to post" };
  }

  if (engaging.score < 0.8 && engaging.confidence > 0.6) {
    return { action: "human_review", reason: "Low engagement — revise copy" };
  }

  if (actionable.noul < 0.35) {
    return { action: "human_review", reason: "Weak actionable signal" };
  }

  const payload = buildPostPayload(
    proposal,
    compose_mode.choice,
  );

  if (!payload) {
    return { action: "human_review", reason: "Jev marked post as not ready" };
  }

  if (needs_media.noul > 0.7 && !payload.media?.length) {
    payload.note = `${payload.note ?? ""} — attach media before scheduling`;
  }

  const openquok = new Openquok(openquokAccessToken, {
    baseUrl: process.env.OPENQUOK_API_URL ?? "https://api.openquok.com",
  });

  await openquok.isConnected();
  const created = await openquok.postAsAgent(payload);

  return {
    action: "draft_created",
    composeMode: compose_mode.choice,
    postGroup: (created as { data?: { postGroup?: string } })?.data?.postGroup,
  };
}
```

## Recipe mapping

Each Jev <code>compose_mode</code> maps to an <code>openquok-core</code> recipe and Public API fields:

- <strong><code>global_same_copy</code></strong> — <code>threads-text-only.json</code> — <code>body</code>, <code>isGlobal: true</code>
- <strong><code>per_channel_copy</code></strong> — <code>multi-platform-campaign.json</code> — <code>bodiesByIntegrationId</code>, <code>isGlobal: false</code>
- <strong><code>global_copy_per_channel_settings</code></strong> — <code>youtube-video-title-privacy.json</code> (settings-heavy) — shared <code>body</code> + <code>providerSettingsByIntegrationId</code>
- <strong>Media required</strong> — <code>threads-with-image.json</code> — add <code>media[]</code> after <code>openquok.upload()</code>

Install recipes from <a href="/docs/getting-started-for-cli">CLI getting started</a>. Build flows in <a href="/tools/skill-builder">Skill Builder</a>.

<Callout type="tip" title="Prefer drafts from automation">
<p>Automated pipelines should set <Badge text="status" variant="param" /> to <Badge text="draft" variant="default" />. Teammates promote to <Badge text="scheduled" variant="default" /> after they confirm relevance, visuals, and per-channel fit in the composer.</p>
</Callout>

## Wire OAuth tokens per user

1. Complete <a href="/docs/oauth2-for-apps/nodejs-example">Node.js OAuth example</a> and store each user’s <Badge text="opo_" variant="default" /> token.
2. Load channel UUIDs with <code>openquok.integrations()</code>.
3. Call <code>evaluateAndCreateDraft</code> with the user’s token and proposal.
4. Surface <Badge text="human_review" variant="default" /> when Jev confidence is low or <code>compose_mode</code> is <code>not_ready</code>.

Single-workspace test:

```bash
export TYPESAFE_API_KEY="sk-..."
export OPENQUOK_API_KEY="opo_..."
export OPENQUOK_THREADS_INTEGRATION_ID="<integration-id>"
export OPENQUOK_LINKEDIN_INTEGRATION_ID="<integration-id>"
node jev-route-draft.mjs "Launch post: same news everywhere, but LinkedIn should sound more formal."
```

## Confidence gates

Use **stricter thresholds** for creating OpenQuok drafts than for ignoring noise. <code>compose_mode</code> confidence below your bar → ask a human to pick Global vs per-channel manually in the dashboard (<a href="/docs/creating-posts/global-vs-per-channel">Global vs per-channel</a>).

## Related

<CardGrid>
<LinkCard title="Global vs per-channel" description="Composer Global mode and per-network overrides" href="/docs/creating-posts/global-vs-per-channel" />
<LinkCard title="Node.js OAuth example" description="Authorization Code flow and Bearer opo_ token" href="/docs/oauth2-for-apps/nodejs-example" />
<LinkCard title="Create post API" description="body, bodiesByIntegrationId, media, isGlobal" href="/docs/apis-posts/create" />
<LinkCard title="CLI getting started" description="openquok-core JSON examples" href="/docs/getting-started-for-cli" />
<LinkCard title="Skill Builder" description="Assemble channel recipes" href="/tools/skill-builder" />
</CardGrid>
