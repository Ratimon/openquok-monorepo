---
title: LinkedIn CLI examples
description: openquok CLI recipes for LinkedIn and LinkedIn Page
order: 7
lastUpdated: 2026-06-19
---

<script>
import { Badge } from '$lib/ui/components/docs/mdx/index.js';
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

## Analytics (Page)

```bash
openquok analytics:platform -i "<integration-id>" -d 30
openquok analytics:post -i "<integration-id>" -p "<post-id>" -d 7
```
