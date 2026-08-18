import { describe, expect, it } from 'vitest';

import { HUMANIZE_REGISTER_OVERLAYS } from '$lib/ai-humanize/constants/config';
import { HUMANIZE_TIER1_LEXICON } from '$lib/ai-humanize/constants/lexicon';
import {
	COMPOSER_HUMANIZE_HUMAN_SHARED_CONTEXT,
	COMPOSER_HUMANIZE_ROUGHEN_SHARED_CONTEXT
} from '$lib/ai-humanize/constants/sharedContext';
import {
	buildComposerHumanizeCreateOptions,
	buildComposerHumanizeSharedContext,
	createComposerHumanizeSessionKey
} from '$lib/ai-humanize/utils/buildCreateOptions';

describe('buildComposerHumanizeCreateOptions', () => {
	it('keeps Rewriter tone and length the same across modes', () => {
		const human = buildComposerHumanizeCreateOptions({ mode: 'human' });
		const roughen = buildComposerHumanizeCreateOptions({ mode: 'roughen' });

		expect(human.tone).toBe('more-casual');
		expect(human.length).toBe('as-is');
		expect(roughen.tone).toBe(human.tone);
		expect(roughen.length).toBe(human.length);
	});

	it('puts Human vs Roughen rules into sharedContext', () => {
		const human = buildComposerHumanizeSharedContext('human', {
			maxCharacters: 500,
			composerMode: 'global'
		});
		const roughen = buildComposerHumanizeSharedContext('roughen', {
			maxCharacters: 500,
			composerMode: 'global'
		});

		expect(human).toContain(COMPOSER_HUMANIZE_HUMAN_SHARED_CONTEXT);
		expect(human).toContain('reads less machine-written');
		expect(human).toContain('Target: Global Edit');
		expect(human).toContain('500 characters');
		expect(roughen).toContain(COMPOSER_HUMANIZE_ROUGHEN_SHARED_CONTEXT);
		expect(roughen).toContain('live-draft voice');
		expect(human).not.toBe(roughen);
	});

	it('uses the focused platform as the target on channel pages', () => {
		const context = buildComposerHumanizeSharedContext('human', {
			maxCharacters: 3000,
			providerIdentifiers: ['linkedin'],
			composerMode: 'custom'
		});

		expect(context).toContain('Target: LinkedIn');
		expect(context).toContain('3000 characters');
	});

	it('includes mode in the Rewriter session cache key even when tone and length match', () => {
		const constraints = { maxCharacters: 500, composerMode: 'global' as const };
		const human = buildComposerHumanizeCreateOptions({ mode: 'human', constraints });
		const roughen = buildComposerHumanizeCreateOptions({ mode: 'roughen', constraints });

		const humanKey = createComposerHumanizeSessionKey(human);
		const roughenKey = createComposerHumanizeSessionKey(roughen);

		expect(humanKey.startsWith('human:more-casual:as-is:')).toBe(true);
		expect(roughenKey.startsWith('roughen:more-casual:as-is:')).toBe(true);
		expect(humanKey).not.toBe(roughenKey);
	});

	it('builds sharedContext from writing catalogs, including a lexicon term', () => {
		const context = buildComposerHumanizeSharedContext('human', {
			maxCharacters: 500,
			composerMode: 'global'
		});
		expect(HUMANIZE_TIER1_LEXICON.some((entry) => entry.term === 'ideate')).toBe(true);
		expect(context).toContain('ideate');
		expect(context).toContain('delve into → look at');
		expect(context).toContain('in conclusion → (drop)');
	});

	it('leaves the simplified-technical-English overlay off by default', () => {
		expect(HUMANIZE_REGISTER_OVERLAYS.simplifiedTechnicalEnglish.enabled).toBe(false);
		const context = buildComposerHumanizeSharedContext('human', {
			maxCharacters: 500,
			composerMode: 'global'
		});
		expect(context).not.toContain(
			HUMANIZE_REGISTER_OVERLAYS.simplifiedTechnicalEnglish.sharedContext
		);
	});
});
