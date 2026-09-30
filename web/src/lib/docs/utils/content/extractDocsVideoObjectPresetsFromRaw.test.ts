import { describe, expect, it } from 'vitest';

import { extractDocsVideoObjectPresetsFromRaw } from '$lib/docs/utils/content/extractDocsVideoObjectPresetsFromRaw';

describe('extractDocsVideoObjectPresetsFromRaw', () => {
	it('reads videoObjectPreset from VideoModal markup', () => {
		const raw = `<VideoModal videoObjectPreset="connectChannels" youtubeVideoId="x" />`;
		expect(extractDocsVideoObjectPresetsFromRaw(raw)).toEqual(['connectChannels']);
	});

	it('ignores unknown presets', () => {
		const raw = `<VideoModal videoObjectPreset="unknown" />`;
		expect(extractDocsVideoObjectPresetsFromRaw(raw)).toEqual([]);
	});
});
