import { describe, expect, it } from 'vitest';

import { buildAgentChannelSeoExtras } from './seo-extras';

describe('buildAgentChannelSeoExtras', () => {
	it('adds Meta ecosystem phrases for Meta Muse on Facebook', () => {
		const extras = buildAgentChannelSeoExtras('meta-muse', 'Facebook');
		expect(extras).toContain('Meta Muse Facebook');
		expect(extras).toContain('Meta Muse WhatsApp');
	});

	it('adds Manus vs Cue host-wide extras on every Manus channel', () => {
		const extras = buildAgentChannelSeoExtras('manus', 'Bluesky');
		expect(extras).toContain('Manus vs Cue social media');
	});

	it('returns only host globals when platform has no mapping', () => {
		const extras = buildAgentChannelSeoExtras('openclaw', 'Bluesky');
		expect(extras).toContain('OpenClaw Telegram scheduler');
		expect(extras.some((k) => k.includes('Bluesky'))).toBe(false);
	});

	it('includes Cursor and xAI Grok extras for Grok Bot channel pages', () => {
		const extras = buildAgentChannelSeoExtras('grok-bot', 'X');
		expect(extras).toContain('Cursor Grok Bot scheduling');
		expect(extras).toContain('xAI Grok Bot OpenQuok');
	});
});
