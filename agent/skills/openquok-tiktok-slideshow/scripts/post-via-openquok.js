#!/usr/bin/env node
/**
 * Upload slideshow images via the openquok CLI and create a TikTok photo carousel.
 *
 * Requires `openquok` on PATH (install openquok-core / @openquok/auto-cli separately).
 * Follows openquok-core media Rule 2: every media entry is {id, path} from `openquok upload`.
 *
 * Usage:
 *   node post-via-openquok.js --config <config.json> --dir <slides-dir> --caption "text" [--title "text"]
 *
 * Config (openquok.*):
 *   integrationId          TikTok integration UUID (required)
 *   status                 "scheduled" | "draft" (default: scheduled)
 *   privacyLevel           default SELF_ONLY (private draft — finish with trending audio in TikTok)
 *   contentPostingMethod   default DIRECT_POST
 *   scheduledAt            ISO timestamp; defaults to ~5 minutes from now when status=scheduled
 *   title                  short photo carousel title (optional; --title flag overrides)
 *   note                   kanban review note (optional)
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
}

const configPath = getArg('config');
const dir = getArg('dir');
const caption = getArg('caption');
const titleFlag = getArg('title');

if (!configPath || !dir || !caption) {
  console.error(
    'Usage: node post-via-openquok.js --config <config.json> --dir <dir> --caption "text" [--title "text"]'
  );
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const oq = config.openquok || {};
const integrationId = oq.integrationId;

if (!integrationId) {
  console.error('Missing openquok.integrationId in config (from `openquok integrations:list`)');
  process.exit(1);
}

function runOpenquok(argv) {
  try {
    return execFileSync('openquok', argv, {
      encoding: 'utf-8',
      maxBuffer: 20 * 1024 * 1024
    });
  } catch (err) {
    const stderr = err.stderr?.toString?.() || err.message;
    throw new Error(`openquok ${argv.join(' ')} failed:\n${stderr}`);
  }
}

function parseUpload(stdout) {
  let parsed;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    throw new Error(`Upload response was not JSON:\n${stdout.slice(0, 500)}`);
  }
  const data = parsed.data || parsed;
  const id = data.id;
  const mediaPath = data.path || data.filePath;
  if (!id || !mediaPath) {
    throw new Error(`Upload missing id/path:\n${stdout.slice(0, 500)}`);
  }
  return { id, path: mediaPath };
}

function defaultScheduledAt() {
  return new Date(Date.now() + 5 * 60 * 1000).toISOString();
}

(async () => {
  const slideFiles = [];
  for (let i = 1; i <= 35; i++) {
    const pngPath = path.join(dir, `slide${i}.png`);
    const jpgPath = path.join(dir, `slide${i}.jpg`);
    if (fs.existsSync(pngPath)) {
      slideFiles.push(pngPath);
    } else if (fs.existsSync(jpgPath)) {
      slideFiles.push(jpgPath);
    } else {
      break;
    }
  }

  if (slideFiles.length === 0) {
    console.error('No slide images found in', dir);
    console.error('Expected: slide1.png, slide2.png, ... (after add-text-overlay)');
    process.exit(1);
  }

  const privacyLevel = oq.privacyLevel || 'SELF_ONLY';
  const contentPostingMethod = oq.contentPostingMethod || 'DIRECT_POST';
  const status = oq.status || 'scheduled';
  const title = titleFlag || oq.title || '';
  const scheduledAt =
    oq.scheduledAt || (status === 'draft' ? new Date().toISOString() : defaultScheduledAt());

  const defaultNote =
    privacyLevel === 'SELF_ONLY' && contentPostingMethod === 'DIRECT_POST'
      ? 'Finish in TikTok app: add trending audio, set privacy to public, then publish.'
      : contentPostingMethod === 'UPLOAD'
        ? 'Finish in TikTok app: open inbox, add trending audio, pick cover, then publish.'
        : undefined;
  const note = oq.note || defaultNote;

  console.log(`Uploading ${slideFiles.length} slides via openquok…`);
  console.log(`  Integration: ${integrationId}`);
  console.log(`  Status: ${status}`);
  console.log(`  Privacy: ${privacyLevel} / ${contentPostingMethod}`);
  console.log(`  Caption: ${caption.substring(0, 60)}${caption.length > 60 ? '…' : ''}`);
  if (title) console.log(`  Title: ${title}`);

  const media = [];
  for (const filePath of slideFiles) {
    console.log(`  upload ${path.basename(filePath)}`);
    const stdout = runOpenquok(['upload', filePath]);
    media.push(parseUpload(stdout));
  }

  const payload = {
    scheduledAt,
    status,
    body: caption,
    integrationIds: [integrationId],
    media,
    providerSettingsByIntegrationId: {
      [integrationId]: {
        ...(title ? { title } : {}),
        privacy_level: privacyLevel,
        content_posting_method: contentPostingMethod
      }
    }
  };
  if (note) payload.note = note;

  const tmpJson = path.join(os.tmpdir(), `openquok-tiktok-slideshow-${Date.now()}.json`);
  fs.writeFileSync(tmpJson, JSON.stringify(payload, null, 2));

  console.log('\nCreating post…');
  let createOut;
  try {
    createOut = runOpenquok(['posts:create', '--json', tmpJson]);
  } finally {
    try {
      fs.unlinkSync(tmpJson);
    } catch {
      /* ignore */
    }
  }

  let result;
  try {
    result = JSON.parse(createOut);
  } catch {
    console.log(createOut);
    result = { raw: createOut };
  }

  const postId =
    result?.data?.id ||
    result?.id ||
    result?.data?.posts?.[0]?.id ||
    result?.posts?.[0]?.id ||
    null;

  console.log('Post created.');
  if (postId) console.log(`  Post ID: ${postId}`);
  if (privacyLevel === 'SELF_ONLY') {
    console.log('  Private draft — finish with trending audio in the TikTok app.');
  }

  const metaPath = path.join(dir, 'meta.json');
  const meta = {
    postId,
    integrationId,
    caption,
    title,
    privacyLevel,
    contentPostingMethod,
    status,
    scheduledAt,
    postedAt: new Date().toISOString(),
    slides: slideFiles.length,
    media
  };
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  console.log(`Metadata saved to ${metaPath}`);
})().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
