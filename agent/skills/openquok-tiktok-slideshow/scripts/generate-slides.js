#!/usr/bin/env node
/**
 * Generate 6 TikTok slideshow images using the configured image provider.
 *
 * Prefers prompts composed from character-profile.json (LOCKED + per-slide VARIATIONS)
 * plus face/body lock reference images when the provider supports them.
 *
 * Supported providers:
 *   - openai (gpt-image-1.5 recommended)
 *   - stability
 *   - replicate
 *   - local (user provides pre-made images)
 *
 * Usage: node generate-slides.js --config <config.json> --output <dir> --prompts <prompts.json>
 *
 * prompts.json formats:
 *   { "base": "…", "slides": ["slide1 extras", …6 strings] }
 *   { "slides": [ { "outfit":"…", "pose":"…", … }, …6 variation objects ] }
 *   { "base": "…", "slides": [ { "prompt": "full slide text" }, … ] }
 */

const fs = require('fs');
const path = require('path');
const { Blob } = require('buffer');

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
}

const configPath = getArg('config');
const outputDir = getArg('output');
const promptsPath = getArg('prompts');

if (!configPath || !outputDir || !promptsPath) {
  console.error('Usage: node generate-slides.js --config <config.json> --output <dir> --prompts <prompts.json>');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const prompts = JSON.parse(fs.readFileSync(promptsPath, 'utf-8'));

if (!prompts.slides || prompts.slides.length !== 6) {
  console.error('ERROR: prompts.json must have exactly 6 slides');
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });

const provider = config.imageGen?.provider || 'openai';
const model = config.imageGen?.model || 'gpt-image-1.5';
const apiKey = config.imageGen?.apiKey;

if (!apiKey && provider !== 'local') {
  console.error(`ERROR: No API key found in config.imageGen.apiKey for provider "${provider}"`);
  process.exit(1);
}

if (provider === 'openai' && model && !model.includes('1.5')) {
  console.warn(`\nWARNING: You're using "${model}" — prefer "gpt-image-1.5" for photorealistic results.\n`);
}

function loadCharacterProfile() {
  const profilePath = config.character?.profilePath;
  if (!profilePath || !fs.existsSync(profilePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
  } catch (e) {
    console.warn(`Could not parse character profile at ${profilePath}: ${e.message}`);
    return null;
  }
}

function resolveRefPaths() {
  const refs = config.character?.referenceImages || {};
  const paths = [];
  for (const key of ['faceLock', 'bodyLock']) {
    const p = refs[key];
    if (p && fs.existsSync(p)) paths.push(p);
  }
  // Also honour paths declared on the profile itself (relative to profile dir)
  const profile = loadCharacterProfile();
  if (profile?.reference_assets && config.character?.profilePath) {
    const baseDir = path.dirname(config.character.profilePath);
    for (const key of ['face_lock', 'body_lock']) {
      const rel = profile.reference_assets[key];
      if (!rel) continue;
      const abs = path.isAbsolute(rel) ? rel : path.join(baseDir, rel);
      if (fs.existsSync(abs) && !paths.includes(abs)) paths.push(abs);
    }
  }
  return paths;
}

function formatLockedBlock(locked) {
  if (!locked) return '';
  const lines = ['LOCKED CHARACTER (immutable — wins on any conflict):'];
  if (locked.identity) {
    lines.push('Identity:', JSON.stringify(locked.identity, null, 0));
  }
  if (locked.face) {
    lines.push('Face (do not alter):', JSON.stringify(locked.face, null, 0));
  }
  if (locked.body) {
    lines.push('Body (do not alter):', JSON.stringify(locked.body, null, 0));
  }
  if (locked.signature) {
    lines.push('Signature accessory:', JSON.stringify(locked.signature, null, 0));
  }
  if (locked.conflict_rule) {
    lines.push(`Conflict rule: ${locked.conflict_rule}`);
  }
  return lines.join('\n');
}

function formatVariationBlock(variation, defaults) {
  const v = {
    outfit: '',
    pose: '',
    expression: '',
    setting: '',
    visual_style: '',
    framing: 'portrait 1024x1536, subject centered',
    ...(defaults || {}),
    ...(typeof variation === 'object' && variation ? variation : {})
  };
  // Strip helper keys that are not visual fields
  delete v.prompt;
  delete v.base;
  delete v.slide_role;
  delete v.slide_index;
  const parts = Object.entries(v)
    .filter(([, val]) => val != null && String(val).trim() !== '')
    .map(([k, val]) => `${k}: ${val}`);
  return parts.length ? `VARIATIONS for this frame:\n${parts.join('\n')}` : '';
}

function composeSlidePrompt(profile, slideEntry, slideIndex) {
  if (typeof slideEntry === 'string') {
    const base = prompts.base || config.imageGen?.basePrompt || '';
    if (profile?.LOCKED) {
      return [formatLockedBlock(profile.LOCKED), formatVariationBlock(profile.VARIATIONS || {}), base, slideEntry]
        .filter(Boolean)
        .join('\n\n');
    }
    return [base, slideEntry].filter(Boolean).join('\n\n');
  }

  if (slideEntry && typeof slideEntry.prompt === 'string') {
    const base = prompts.base || config.imageGen?.basePrompt || '';
    if (profile?.LOCKED) {
      return [formatLockedBlock(profile.LOCKED), base, slideEntry.prompt].filter(Boolean).join('\n\n');
    }
    return [base, slideEntry.prompt].filter(Boolean).join('\n\n');
  }

  // Variation object
  const locked = formatLockedBlock(profile?.LOCKED);
  const variation = formatVariationBlock(slideEntry, profile?.VARIATIONS);
  const base = prompts.base || config.imageGen?.basePrompt || '';
  const contract = profile?.generation_contract?.provider_notes || '';
  const sizeNote = 'Output a single portrait image, size 1024x1536.';
  const refNote =
    'Match the attached face_lock and body_lock reference images exactly for identity and proportions.';
  return [locked, variation, base, contract, refNote, sizeNote, `Slide ${slideIndex + 1} of 6.`]
    .filter(Boolean)
    .join('\n\n');
}

// ─── Provider: OpenAI ───────────────────────────────────────────────
async function generateOpenAI(prompt, outPath, refPaths) {
  // With reference locks, use the edits endpoint so face/body can be attached.
  if (refPaths.length > 0) {
    const form = new FormData();
    form.append('model', model);
    form.append('prompt', prompt);
    form.append('n', '1');
    form.append('size', '1024x1536');
    form.append('quality', 'high');
    for (const ref of refPaths) {
      const buf = fs.readFileSync(ref);
      const blob = new Blob([buf], { type: 'image/png' });
      form.append('image[]', blob, path.basename(ref));
    }
    const res = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      signal: global.__abortSignal
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) throw new Error('OpenAI edits response missing b64_json');
    fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
    return;
  }

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      size: '1024x1536',
      quality: 'high'
    }),
    signal: global.__abortSignal
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  fs.writeFileSync(outPath, Buffer.from(data.data[0].b64_json, 'base64'));
}

// ─── Provider: Stability AI ─────────────────────────────────────────
async function generateStability(prompt, outPath) {
  const engineId = model || 'stable-diffusion-xl-1024-v1-0';
  const res = await fetch(`https://api.stability.ai/v1/generation/${engineId}/text-to-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      text_prompts: [{ text: prompt, weight: 1 }],
      cfg_scale: 7,
      height: 1536,
      width: 1024,
      steps: 30,
      samples: 1
    }),
    signal: global.__abortSignal
  });
  const data = await res.json();
  if (data.message) throw new Error(data.message);
  fs.writeFileSync(outPath, Buffer.from(data.artifacts[0].base64, 'base64'));
}

// ─── Provider: Replicate ────────────────────────────────────────────
async function generateReplicate(prompt, outPath) {
  const replicateModel = model || 'black-forest-labs/flux-1.1-pro';

  const createRes = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: replicateModel,
      input: {
        prompt,
        width: 1024,
        height: 1536,
        num_outputs: 1
      }
    }),
    signal: global.__abortSignal
  });
  let prediction = await createRes.json();
  if (prediction.error) throw new Error(prediction.error.detail || prediction.error);

  while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
    await new Promise((r) => setTimeout(r, 2000));
    const pollRes = await fetch(prediction.urls.get, {
      headers: { Authorization: `Token ${apiKey}` },
      signal: global.__abortSignal
    });
    prediction = await pollRes.json();
  }
  if (prediction.status === 'failed') throw new Error(prediction.error || 'Prediction failed');

  const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
  const imgRes = await fetch(imageUrl, { signal: global.__abortSignal });
  const buf = Buffer.from(await imgRes.arrayBuffer());
  fs.writeFileSync(outPath, buf);
}

// ─── Provider: Local (skip generation) ──────────────────────────────
async function generateLocal(_prompt, outPath) {
  const slideNum = path.basename(outPath).match(/\d+/)?.[0];
  const localPath = path.join(outputDir, `local_slide${slideNum}.png`);
  if (fs.existsSync(localPath)) {
    fs.copyFileSync(localPath, outPath);
  } else {
    throw new Error(`Place your image at ${localPath} — local provider skips generation`);
  }
}

async function withRetry(fn, retries = 2, timeoutMs = 120000) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      global.__abortSignal = controller.signal;
      const result = await fn();
      clearTimeout(timer);
      return result;
    } catch (e) {
      if (attempt < retries) {
        const isTimeout =
          e.name === 'AbortError' || e.message?.includes('timeout') || e.message?.includes('abort');
        console.log(`  ${isTimeout ? 'Timeout' : 'Error'}: ${e.message}. Retrying (${attempt + 1}/${retries})...`);
        await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
      } else {
        throw e;
      }
    }
  }
}

const providers = {
  openai: generateOpenAI,
  stability: generateStability,
  replicate: generateReplicate,
  local: generateLocal
};

async function generate(prompt, outPath, refPaths) {
  const fn = providers[provider];
  if (!fn) {
    console.error(`Unknown provider: "${provider}". Supported: ${Object.keys(providers).join(', ')}`);
    process.exit(1);
  }
  const refNote = provider === 'openai' && refPaths.length ? ` +${refPaths.length} ref(s)` : '';
  console.log(`  Generating ${path.basename(outPath)} [${provider}/${model}${refNote}]...`);
  await withRetry(() => fn(prompt, outPath, refPaths));
  console.log(`  OK ${path.basename(outPath)}`);
}

(async () => {
  const profile = loadCharacterProfile();
  const refPaths = resolveRefPaths();
  const label = config.channel?.name || config.channel?.handle || profile?.display_name || 'channel';

  console.log(`Generating 6 slides for ${label} using ${provider}/${model}`);
  if (profile?.LOCKED) console.log('  Using LOCKED character profile');
  if (refPaths.length) {
    console.log(`  Reference images: ${refPaths.map((p) => path.basename(p)).join(', ')}`);
  } else if (provider === 'openai') {
    console.log('  No face/body lock images found — text LOCKED block only (see character-lock.md)');
  }
  console.log('');

  let success = 0;
  let skipped = 0;
  for (let i = 0; i < 6; i++) {
    const outPath = path.join(outputDir, `slide${i + 1}_raw.png`);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 10000) {
      console.log(`  slide${i + 1}_raw.png already exists, skipping`);
      success++;
      skipped++;
      continue;
    }
    const fullPrompt = composeSlidePrompt(profile, prompts.slides[i], i);
    try {
      // Only OpenAI path consumes refPaths today; others rely on LOCKED text in the prompt.
      await generate(fullPrompt, outPath, provider === 'openai' ? refPaths : []);
      success++;
    } catch (e) {
      console.error(`  Slide ${i + 1} failed after retries: ${e.message}`);
      console.error(`     Re-run this script to retry — completed slides will be skipped.`);
    }
  }
  console.log(
    `\nGenerated ${success}/6 slides in ${outputDir}${skipped > 0 ? ` (${skipped} skipped — already existed)` : ''}`
  );
  if (success < 6) {
    console.error(`\n${6 - success} slides failed. Re-run to retry — completed slides are preserved.`);
    process.exit(1);
  }
})();
