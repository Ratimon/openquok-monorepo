---
title: LinkedIn CLI examples
description: openquok CLI recipes for LinkedIn and LinkedIn Page
order: 7
lastUpdated: 2026-08-31
---

<script>
import { Badge, Callout } from '$lib/ui/components/docs/mdx/index.js';
</script>

## List channels

```bash
openquok integrations:list
```

Filter by provider:

```bash
openquok integrations:list --provider linkedin
openquok integrations:list --provider linkedin-page
```

## Schedule a text post

```bash
openquok posts:create \
  -i "<integration-id>" \
  -c "Shipping a small update on what we learned this week." \
  -t schedule \
  -s "2026-06-20T14:00:00.000Z"
```

## LinkedIn Page document carousel

```bash
openquok posts:create \
  -i "<integration-id>" \
  -c "Our Q2 product slides — swipe through the deck." \
  -t schedule \
  -s "2026-06-22T10:00:00.000Z" \
  -j '{"providerSettingsByIntegrationId":{"<integration-id>":{"linkedin":{"postAsImagesCarousel":true,"carouselName":"Q2 update"}}}}'
```

## Scheduled follow-up comments

<Badge text="providerSettings.linkedin.replies[]" variant="param" /> carries follow-up replies that publish as comments on the main post after a fixed delay. Use the <Badge text="linkedin" variant="default" /> bucket for both personal and Page integrations (<Badge text="linkedin-page" variant="default" /> maps to the same bucket). Pass them on <Badge text="posts:create" variant="default" /> with <Badge text="--providerSettingsByIntegrationId" variant="param" />:

```bash
openquok posts:create \
  -i "<integration-id>" \
  -c "Root post — details in the first comment." \
  -t schedule \
  -s "2026-06-20T14:00:00.000Z" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "<integration-id>" '
    {
      ($id): {
        linkedin: {
          replies: [
            { message: "Follow-up comment on the post", delaySeconds: 60 },
            { message: "Second comment with extra context", delaySeconds: 120 }
          ]
        }
      }
    }
  ')"
```

<Callout type="note" title="Text-only follow-ups">
<p>LinkedIn follow-up rows are <strong>text only</strong> — attach images and video on the main post via <Badge text="-m" variant="param" />. Do not pass <Badge text="media" variant="param" /> on <Badge text="replies[]" variant="param" /> rows.</p>
</Callout>

## Analytics (Page)

```bash
openquok analytics:platform -i "<integration-id>" -d 30
openquok analytics:post -i "<integration-id>" -p "<post-id>" -d 7
```
