#!/usr/bin/env node
/**
 * Channel research helpers — save & query findings for any niche/handle.
 *
 * The agent does the browsing; this script manages channel-research.json.
 *
 * Usage:
 *   node competitor-research.js --dir tiktok-marketing/ --summary
 *   node competitor-research.js --dir tiktok-marketing/ --add-account '{"name":"…","handle":"@…",…}'
 *   node competitor-research.js --dir tiktok-marketing/ --gaps
 *
 * Legacy: --add-competitor is accepted as an alias for --add-account.
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const dir = args.includes('--dir') ? args[args.indexOf('--dir') + 1] : 'tiktok-marketing';
const filePath = path.join(dir, 'channel-research.json');
const legacyPath = path.join(dir, 'competitor-research.json');

function emptyData() {
  return {
    researchDate: '',
    niche: '',
    accounts: [],
    nicheInsights: {
      trendingSounds: [],
      commonFormats: [],
      gapOpportunities: '',
      avoidPatterns: ''
    }
  };
}

function normalize(raw) {
  const data = { ...emptyData(), ...raw };
  // Migrate older competitor-research.json shape
  if ((!data.accounts || data.accounts.length === 0) && Array.isArray(raw.competitors)) {
    data.accounts = raw.competitors.map((c) => ({
      name: c.name,
      handle: c.handle || c.tiktokHandle || '',
      platform: c.platform || 'tiktok',
      followers: c.followers,
      topHooks: c.topHooks,
      avgViews: c.avgViews,
      bestPost: c.bestPost || c.bestVideo,
      format: c.format,
      postingFrequency: c.postingFrequency,
      cta: c.cta,
      strengths: c.strengths,
      weaknesses: c.weaknesses
    }));
  }
  if (!Array.isArray(data.accounts)) data.accounts = [];
  return data;
}

function resolvePath() {
  if (fs.existsSync(filePath)) return filePath;
  if (fs.existsSync(legacyPath)) return legacyPath;
  return filePath;
}

function loadData() {
  const p = resolvePath();
  if (!fs.existsSync(p)) return emptyData();
  return normalize(JSON.parse(fs.readFileSync(p, 'utf-8')));
}

function saveData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

const wantsHelp =
  !args.includes('--summary') &&
  !args.includes('--add-account') &&
  !args.includes('--add-competitor') &&
  !args.includes('--gaps');

if (wantsHelp) {
  console.log('Usage:');
  console.log('  node competitor-research.js --dir tiktok-marketing/ --summary');
  console.log('  node competitor-research.js --dir tiktok-marketing/ --add-account \'<json>\'');
  console.log('  node competitor-research.js --dir tiktok-marketing/ --gaps');
  process.exit(1);
}

if (args.includes('--summary')) {
  const data = loadData();
  if (data.accounts.length === 0) {
    console.log('No channel research yet. Research accounts in the niche, then --add-account.');
    process.exit(0);
  }
  console.log(`Channel research (${data.researchDate || 'undated'})${data.niche ? ` — ${data.niche}` : ''}\n`);
  console.log(`${data.accounts.length} account(s):\n`);
  data.accounts.forEach((a) => {
    console.log(`  ${a.name} (${a.handle || 'no handle'})${a.platform ? ` [${a.platform}]` : ''}`);
    console.log(`    Followers: ${a.followers ?? '?'} | Avg views: ${a.avgViews ?? '?'}`);
    const best = a.bestPost || a.bestVideo;
    if (best) console.log(`    Best: ${best.views} views — "${best.hook}"`);
    if (a.strengths) console.log(`    Strengths: ${a.strengths}`);
    if (a.weaknesses) console.log(`    Weaknesses: ${a.weaknesses}`);
    console.log('');
  });
  if (data.nicheInsights?.gapOpportunities) {
    console.log(`Gap opportunities: ${data.nicheInsights.gapOpportunities}`);
  }
  if (data.nicheInsights?.avoidPatterns) {
    console.log(`Avoid: ${data.nicheInsights.avoidPatterns}`);
  }
}

const addFlag = args.includes('--add-account')
  ? '--add-account'
  : args.includes('--add-competitor')
    ? '--add-competitor'
    : null;

if (addFlag) {
  const json = args[args.indexOf(addFlag) + 1];
  try {
    const account = JSON.parse(json);
    if (account.tiktokHandle && !account.handle) account.handle = account.tiktokHandle;
    const data = loadData();
    data.accounts.push(account);
    data.researchDate = new Date().toISOString().split('T')[0];
    saveData(data);
    console.log(`Added account: ${account.name || account.handle || '(unnamed)'}`);
  } catch (e) {
    console.error('Invalid JSON for account:', e.message);
    process.exit(1);
  }
}

if (args.includes('--gaps')) {
  const data = loadData();
  if (!data.nicheInsights) {
    console.log('No niche insights yet.');
    process.exit(0);
  }
  console.log('Gap analysis:\n');
  console.log(`  Opportunities: ${data.nicheInsights.gapOpportunities || 'None recorded'}`);
  console.log(`  Avoid: ${data.nicheInsights.avoidPatterns || 'None recorded'}`);
  console.log(`  Common formats: ${(data.nicheInsights.commonFormats || []).join(', ') || 'None recorded'}`);
  console.log(`  Trending sounds: ${(data.nicheInsights.trendingSounds || []).join(', ') || 'None recorded'}`);
}
