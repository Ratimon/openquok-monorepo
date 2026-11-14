# OpenQuok blog SERP checklist

Use after [analysis-templates.md](analysis-templates.md) when the deliverable is a **blog-manager** post.

## Target queries (browser extension walkthrough — 2026-11-13)

| Query cluster | Dominant intent | Content implication |
| --- | --- | --- |
| `chrome extension social media scheduler` | Commercial + how-to | Lead with side panel + multi-channel workspace; compare to clip-to-share competitors |
| `schedule social media from chrome` | Informational / commercial | Early definition paragraph; steps + install CTA to `/docs/installation/chrome-extension` |
| `skool post scheduler` / `schedule skool posts` | Commercial | H2 with direct answer: Skool has no native feed scheduler; cookie/extension path |
| `reddit scheduler browser extension` | Informational | `awaiting member` handoff; autofill does not submit |

## Snippet and AI-citation patterns

1. **Definition block** — first 40–60 words under an early `h2`: what the OpenQuok extension is and what it is not (not a replacement for Add Channel OAuth).
2. **Table** — “Use case | Extension role” or “OpenQuok vs clip-only extensions” (SERP competitors use feature grids).
3. **Numbered install path** — aligns with HowTo JSON-LD in admin fields.
4. **FAQ** — questions phrased like PAA (“Can you schedule Skool posts without logging in daily?”).

## Internal link priority (equity)

1. `/browser-extension` — primary product URL for this topic  
2. `/docs/installation/chrome-extension`  
3. Self-host per browser: `/docs/configuration-web/browser-extension-chrome`, `browser-extension-edge`, `browser-extension-firefox`  
4. `/docs/platforms/connect-rules`  
5. `/docs/social-integration/skool`, `/docs/social-integration/reddit`  
6. `/docs/directory-submission`  
7. `/tools/humanizer` — when AI copy is discussed  
8. `/docs/getting-started-for-mcp` — agents vs extension boundary  

## Avoid

- Keyword stuffing (“AI” without a shipped feature tie-in).
- Duplicating FAQ or HowTo bodies inside `content` HTML.
- `nofollow` on internal `/…` links.
- Claiming Reddit server-side publish or directory auto-submit.

## Handoff file

Store finalized copy-paste HTML in:

`docs/blog/browser-extension-walkthrough-blog-manager-copy-paste.md`
