# Slide Structure & Hook Writing

## The 6-Slide Formula (EXACTLY 6 — TikTok minimum)

| Slide | Purpose | Text Style |
|-------|---------|------------|
| 1 | HOOK — stop the scroll | Relatable problem, full hook text |
| 2 | PROBLEM — amplify pain | Build tension |
| 3 | DISCOVERY — turning point | "So I tried this" / "Then I found..." |
| 4 | TRANSFORM 1 — first result | Reaction: "Wait... this actually looks good?" |
| 5 | TRANSFORM 2 — escalate | Reaction: "Okay I'm obsessed" |
| 6 | CTA — call to action | Follow / series tease / link in bio |

**SAME locked character, SAME camera language, DIFFERENT VARIATIONS (outfit / pose / setting / style) across all 6 slides.**

## Proven Hook Formulas

### Tier 1: Person + Conflict → Reveal → Changed Mind (BEST)
- "I showed my mum what this would look like" 
- "My landlord said I can't change anything so I showed her this"
- "My boyfriend said our flat looks like [insult] so I showed him"
- "My flatmate wouldn't believe this is the same room"

### Tier 2: Relatable Budget Pain
- "POV: You have good taste but no budget"
- "IKEA budget, designer taste"
- "I can't afford a pro so I tried this instead"

### Tier 3: Curiosity / Self-Discovery
- "I've always wondered what I'd look like with..."
- "I had to see if it would even suit me"
- "Everyone's getting [thing] but would it suit MY face?"

### What DOESN'T Work
- Self-focused complaints without conflict: "My flat is ugly" (low views)
- Fear/insecurity hooks for beauty: "Am I ugly without..." (people scroll past)
- Price comparison without story: "$500 vs $5000" (needs character)

## Hook adaptation by niche

Reuse conflict + curiosity patterns; swap the subject for the channel niche (home, beauty, fitness, productivity, comedy persona, etc.). Keep the **locked character** constant so the feed feels like one creator.

## Image prompts (with character lock)

Prefer composing from `character-profile.json`:

1. Paste **LOCKED** identity / face / body / signature every time
2. Attach **face_lock** + **body_lock** when the provider supports refs
3. Change only **VARIATIONS** per slide (outfit, pose, expression, setting, visual_style, framing)

See [character-lock.md](./character-lock.md). Portrait **1024×1536** only.

### What to lock (same across all 6)
- Face geometry and distinctive marks
- Body proportions / silhouette
- Signature accessory (when always_present)
- Camera height / subject scale when framing is fixed

### What changes per slide (ONLY)
- Outfit, pose, expression
- Setting / background energy
- Style / colors / textures within VARIATIONS

## Caption template

```
[hook matching slide 1] [2-3 sentences of relatable struggle].
So I [discovery] — you just [simple action] and it [result]. I tried [variation 1]
and [variation 2] and honestly?? [emotional reaction]. [funny/relatable closer]
#[niche1] #[niche2] #[niche3] #[niche4] #fyp
```

Keep it conversational. Tell a mini-story. Mention the handle or series naturally, not salesy.

## Music (CRITICAL — Do NOT Skip)

Prefer posting as a **private TikTok draft** (`privacy_level: SELF_ONLY` + `content_posting_method: DIRECT_POST`) via OpenQuok so a human can add trending audio before going public:

1. Open the private draft in the TikTok app (kanban: Scheduled posts → Private on TikTok)
2. Tap "Add sound" and browse trending sounds in your niche
3. Pick something popular — trending audio gets an algorithmic boost
4. Set privacy to public, preview, then publish

**Why private drafts?** TikTok’s algorithm strongly favours posts with trending sounds. Silent slideshows look like ads and get buried. An API cannot pick what is trending right now — browse the sound library on-device.

This takes ~30 seconds per post. Do not skip it.

See openquok-core TikTok examples (`SELF_ONLY` private draft vs `UPLOAD` inbox) for the exact `posts:create` payload.
