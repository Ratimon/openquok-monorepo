# Cursor project skills

Agent skills for this repo live here (same layout as `serp-analysis/`).

## Vendored from upstream

| Skill | Source | Update |
| --- | --- | --- |
| `modern-web-guidance` | [GoogleChrome/modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance) | See NOTICE in each folder |
| `chrome-extensions` | same repo (`skills/chrome-extensions`) | See NOTICE in each folder |

The `npx skills add` CLI installs to `.agents/skills/` even with `-a cursor`. This project **copies** bundles into `.cursor/skills/` and removes `.agents/` so skills sit next to repo rules.

To refresh from upstream:

```bash
npx skills add GoogleChrome/modern-web-guidance -a cursor -y --copy
rsync -a --delete .agents/skills/chrome-extensions/ .cursor/skills/chrome-extensions/
rsync -a --delete .agents/skills/modern-web-guidance/ .cursor/skills/modern-web-guidance/
npx skills remove chrome-extensions modern-web-guidance -y
rm -rf .agents
```

Then re-apply any local NOTICE files if upstream overwrote them.

## OpenQuok-adapted

| Skill | Notes |
| --- | --- |
| `serp-analysis` | Blog SERP workflow; see `serp-analysis/NOTICE.md` |
