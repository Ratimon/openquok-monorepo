# Character lock (LOCKED vs VARIATIONS)

Keep a single on-screen persona consistent across every slideshow frame. Consistency comes from an immutable **LOCKED** profile plus fixed **reference images**, not from rewriting the whole prompt each time.

## Files (workspace)

| Path | Role |
|------|------|
| `tiktok-marketing/character-profile.json` | Copied from `references/character-profile.template.json`, then filled in with the user |
| `tiktok-marketing/refs/face-lock.png` | Approved face / head reference — never regenerate after lock |
| `tiktok-marketing/refs/body-lock.png` | Approved full-body / proportions reference — never regenerate after lock |

Config points at these via `character.profilePath` and `character.referenceImages`.

## LOCKED (immutable after approval)

Write once, then treat as contract:

- **identity** — who they are (persona, age presentation, personality one-liner)
- **face** — shape, features, skin/fur/hair, **distinctive marks**, plus a do-not-change rule
- **body** — height/build, proportions, default posture
- **signature** — one accessory that must appear every frame (when `always_present` is true)
- **conflict_rule** — LOCKED wins when VARIATIONS disagree

Do not tweak LOCKED mid-campaign. If the look must change, start a new profile + new lock images.

## VARIATIONS (per post / per slide)

Safe to change every run:

- outfit, pose, expression, setting, visual_style, framing

Default framing for this skill: portrait **1024×1536**, subject centered.

## Reference assets + generation contract

1. After the user approves identity in conversation, generate **face_lock** and **body_lock** once; save under `refs/`.
2. Every image request must attach both locks when the provider supports reference images (`generation_contract.must_attach_reference_images`).
3. Always paste LOCKED face/body/signature text into the prompt even when attaching images.
4. On conflict (e.g. variation says “new hairstyle” but LOCKED hair is fixed), follow **LOCKED**.

## `post_template.image_generation_request`

Per slide, fill `variation_block` (and `slide_index` / `slide_role`) while leaving the locked block as a verbatim dump of LOCKED fields. `generate-slides.js` can compose prompts from the profile + a `prompts.json` that supplies six variation objects (or six plain strings).

## Approval checklist

- [ ] User confirmed identity and distinctive marks
- [ ] `character-profile.json` LOCKED sections complete
- [ ] `face-lock.png` and `body-lock.png` saved and paths set in config
- [ ] Test set of six frames reviewed before first public post
- [ ] No further edits to LOCKED or lock images without an explicit new character version
