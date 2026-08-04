#!/usr/bin/env node
/**
 * TikTok slideshow skill — workspace init / config validator.
 *
 * Onboarding is conversational (agent ↔ user). This script scaffolds a channel
 * + character workspace and validates config for the generate → overlay → post pipeline.
 *
 * Usage:
 *   node onboarding.js --init --dir tiktok-marketing/
 *   node onboarding.js --validate --config tiktok-marketing/config.json
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const configPath = args.includes('--config') ? args[args.indexOf('--config') + 1] : null;
const validate = args.includes('--validate');
const init = args.includes('--init');
const dir = args.includes('--dir') ? args[args.indexOf('--dir') + 1] : 'tiktok-marketing';

const skillRoot = path.resolve(__dirname, '..');
const profileTemplatePath = path.join(skillRoot, 'references', 'character-profile.template.json');

if (init) {
  const dirs = [
    dir,
    path.join(dir, 'posts'),
    path.join(dir, 'refs'),
    path.join(dir, 'hooks')
  ];
  dirs.forEach((d) => {
    if (!fs.existsSync(d)) {
      fs.mkdirSync(d, { recursive: true });
      console.log(`Created ${d}/`);
    }
  });

  const configTemplate = {
    channel: {
      name: '',
      handle: '',
      niche: '',
      audience: '',
      painPoint: '',
      platforms: ['tiktok']
    },
    character: {
      profilePath: path.join(dir, 'character-profile.json'),
      referenceImages: {
        faceLock: path.join(dir, 'refs', 'face-lock.png'),
        bodyLock: path.join(dir, 'refs', 'body-lock.png')
      }
    },
    imageGen: {
      provider: 'openai',
      apiKey: '',
      model: 'gpt-image-1.5'
    },
    openquok: {
      integrationId: '',
      status: 'scheduled',
      privacyLevel: 'SELF_ONLY',
      contentPostingMethod: 'DIRECT_POST',
      scheduledAt: null,
      title: ''
    },
    posting: {
      schedule: ['07:30', '16:30', '21:00']
    },
    research: path.join(dir, 'channel-research.json'),
    strategy: path.join(dir, 'strategy.json')
  };

  const cfgPath = path.join(dir, 'config.json');
  if (!fs.existsSync(cfgPath)) {
    fs.writeFileSync(cfgPath, JSON.stringify(configTemplate, null, 2));
    console.log(`Created ${cfgPath}`);
  }

  const profilePath = path.join(dir, 'character-profile.json');
  if (!fs.existsSync(profilePath)) {
    if (fs.existsSync(profileTemplatePath)) {
      fs.copyFileSync(profileTemplatePath, profilePath);
    } else {
      fs.writeFileSync(profilePath, JSON.stringify({ LOCKED: {}, VARIATIONS: {} }, null, 2));
    }
    console.log(`Created ${profilePath}`);
  }

  const researchPath = path.join(dir, 'channel-research.json');
  if (!fs.existsSync(researchPath)) {
    fs.writeFileSync(
      researchPath,
      JSON.stringify(
        {
          researchDate: '',
          niche: '',
          accounts: [],
          nicheInsights: {
            trendingSounds: [],
            commonFormats: [],
            gapOpportunities: '',
            avoidPatterns: ''
          }
        },
        null,
        2
      )
    );
    console.log(`Created ${researchPath}`);
  }

  const stratPath = path.join(dir, 'strategy.json');
  if (!fs.existsSync(stratPath)) {
    fs.writeFileSync(
      stratPath,
      JSON.stringify(
        {
          hooks: [],
          postingSchedule: ['07:30', '16:30', '21:00'],
          hookCategories: { testing: [], proven: [], dropped: [] },
          notes: ''
        },
        null,
        2
      )
    );
    console.log(`Created ${stratPath}`);
  }

  console.log('\nWorkspace ready. Define channel + lock character, then --validate.');
  process.exit(0);
}

if (validate && configPath) {
  if (!fs.existsSync(configPath)) {
    console.error(`Config not found: ${configPath}`);
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const required = [];
  const optional = [];

  if (!config.channel?.name && !config.channel?.handle) {
    required.push('channel.name or channel.handle — What is this channel called?');
  }
  if (!config.channel?.niche) required.push('channel.niche — What niche / topic?');
  if (!config.channel?.audience) required.push('channel.audience — Who is it for?');
  if (!config.channel?.painPoint) required.push('channel.painPoint — What pain or desire drives the feed?');

  const profilePath = config.character?.profilePath;
  if (!profilePath) {
    required.push('character.profilePath — Path to character-profile.json');
  } else if (!fs.existsSync(profilePath)) {
    required.push(`character.profilePath — File missing: ${profilePath}`);
  } else {
    try {
      const profile = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
      if (!profile.LOCKED?.face || !profile.LOCKED?.body) {
        required.push('character-profile.json — Fill LOCKED.face and LOCKED.body before generating');
      }
      if (!profile.LOCKED?.identity) {
        optional.push('character-profile.json — LOCKED.identity still empty');
      }
    } catch (e) {
      required.push(`character-profile.json — Invalid JSON: ${e.message}`);
    }
  }

  const faceLock = config.character?.referenceImages?.faceLock;
  const bodyLock = config.character?.referenceImages?.bodyLock;
  if (!faceLock || !fs.existsSync(faceLock)) {
    optional.push('character.referenceImages.faceLock — Generate and save face-lock.png after identity approval');
  }
  if (!bodyLock || !fs.existsSync(bodyLock)) {
    optional.push('character.referenceImages.bodyLock — Generate and save body-lock.png after identity approval');
  }

  if (!config.imageGen?.provider) required.push('imageGen.provider — openai | stability | replicate | local');
  if (config.imageGen?.provider && config.imageGen.provider !== 'local' && !config.imageGen?.apiKey) {
    required.push('imageGen.apiKey — API key for image generation');
  }

  if (!config.openquok?.integrationId) {
    required.push('openquok.integrationId — TikTok integration UUID from `openquok integrations:list`');
  }

  const researchPath = config.research || config.competitors;
  if (researchPath && fs.existsSync(researchPath)) {
    const research = JSON.parse(fs.readFileSync(researchPath, 'utf-8'));
    const accounts = research.accounts || research.competitors || [];
    if (accounts.length === 0) {
      optional.push('Channel research — no accounts analyzed yet');
    }
  } else {
    optional.push('Channel research — file not created yet');
  }

  const stratPath = config.strategy;
  if (stratPath && fs.existsSync(stratPath)) {
    const strat = JSON.parse(fs.readFileSync(stratPath, 'utf-8'));
    if (!strat.hooks || strat.hooks.length === 0) {
      optional.push('Content strategy — no hooks planned yet');
    }
  } else {
    optional.push('Content strategy — file not created yet');
  }

  if (required.length === 0) {
    console.log('Core config complete. Ready to generate and post.\n');
  } else {
    console.log('Missing required config:\n');
    required.forEach((r) => console.log(`   [ ] ${r}`));
    console.log('');
  }

  if (optional.length > 0) {
    console.log('Recommended (not blocking):\n');
    optional.forEach((o) => console.log(`   ( ) ${o}`));
    console.log('');
  }

  const label = config.channel?.name || config.channel?.handle || '(not set)';
  console.log('Setup summary:');
  console.log(`   Channel: ${label}`);
  console.log(`   Niche: ${config.channel?.niche || '(not set)'}`);
  console.log(`   Character profile: ${config.character?.profilePath || '(not set)'}`);
  console.log(
    `   Image Gen: ${config.imageGen?.provider || '(not set)'}${
      config.imageGen?.model ? ` (${config.imageGen.model})` : ''
    }`
  );
  console.log(`   OpenQuok integration: ${config.openquok?.integrationId || '(not set)'}`);
  console.log(`   Privacy: ${config.openquok?.privacyLevel || 'SELF_ONLY'}`);
  console.log(`   Posting method: ${config.openquok?.contentPostingMethod || 'DIRECT_POST'}`);
  console.log(`   Schedule: ${(config.posting?.schedule || []).join(', ')}`);

  process.exit(required.length > 0 ? 1 : 0);
}

console.log('Usage:');
console.log('  node onboarding.js --init --dir tiktok-marketing/     Create directory structure');
console.log('  node onboarding.js --validate --config config.json    Validate config completeness');
process.exit(1);
