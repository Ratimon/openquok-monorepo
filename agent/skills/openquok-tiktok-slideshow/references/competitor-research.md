# Channel Research Guide

## Why This Matters

Before locking a character or writing hooks, understand the landscape for **this niche / handle** — not a store listing. Which accounts win attention? What hooks and formats work? Where are the gaps?

## Research Process

### 1. Ask for Browser Permission

Always ask the user before browsing:

> "I want to research what’s working in your niche on TikTok (and peers if you want) — accounts, hooks, formats, sounds. Can I use the browser?"

### 2. Social channel research

Search TikTok (and Instagram / YouTube Shorts if the user cares) for the niche:

- **Accounts** posting similar content (aim for 3–5)
- **Top-performing posts** — hooks, formats, view bands
- **Formats** — slideshow, POV, listicle, tutorial, reaction, skit
- **Posting frequency** of successful accounts
- **CTAs** — follow, comment prompt, link in bio, series tease
- **Trending sounds** in the niche
- **Comment sentiment** — questions, complaints, what people want next

### 3. Gap analysis

Identify what peers are **not** doing:

- **Content gaps** — unused formats
- **Hook gaps** — emotional angles nobody tried
- **Platform gaps** — strong on one app, weak on another
- **Audience gaps** — underserved segment
- **Quality gaps** — low-effort visuals you can beat with a locked character

### 4. Save findings

Store in `tiktok-marketing/channel-research.json`:

```json
{
  "researchDate": "2026-08-03",
  "niche": "example niche",
  "accounts": [
    {
      "name": "Example Creator",
      "handle": "@example",
      "platform": "tiktok",
      "followers": 50000,
      "topHooks": ["hook text 1", "hook text 2"],
      "avgViews": 15000,
      "bestPost": {
        "views": 500000,
        "hook": "The hook that went viral",
        "format": "photo carousel",
        "url": "https://tiktok.com/..."
      },
      "format": "photo carousels",
      "postingFrequency": "daily",
      "cta": "follow for part 2",
      "strengths": "Strong hooks, consistent face",
      "weaknesses": "Same setting every time"
    }
  ],
  "nicheInsights": {
    "trendingSounds": ["sound name 1"],
    "commonFormats": ["photo carousel", "POV"],
    "averageViews": 15000,
    "topPerformingViews": 500000,
    "gapOpportunities": "Nobody pairs a locked character with conflict hooks in this niche",
    "avoidPatterns": "Text-wall slides with no face get buried here"
  }
}
```

Helpers: `scripts/competitor-research.js` (`--summary`, `--add-account`, `--gaps`) against that file.

### 5. Share findings conversationally

Don’t dump the JSON. Summarize accounts, winning formats, and the gap you’ll aim for — then move to locking the character.

## Ongoing research

During weekly reviews: new viral posts, new entrants, sounds/formats, update `channel-research.json`. Cite peer hooks when proposing your own (“@x got strong reach with a conflict hook — here’s our character’s take”).
