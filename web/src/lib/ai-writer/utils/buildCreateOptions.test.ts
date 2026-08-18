import { describe, expect, it } from 'vitest';

import { COMPOSER_HUMANIZE_HUMAN_SHARED_CONTEXT } from '$lib/ai-humanize/constants/sharedContext';
import {
	buildComposerHumanizeCreateOptions,
	toComposerRewriterCreateOptions
} from '$lib/ai-humanize/utils/buildCreateOptions';
import { COMPOSER_REWRITER_REFINE_ACTIONS } from '$lib/ai-writer/constants/config';
import {
	buildComposerRewriterCreateOptionsFromAction,
	createComposerRewriterSessionKey,
	rewriterRefineActionUsesHumanSharedContext
} from '$lib/ai-writer/utils/buildCreateOptions';

describe('composer Rewriter refine actions', () => {
	it('keeps Sound more human on the same Rewriter tone/length as More casual', () => {
		const human = COMPOSER_REWRITER_REFINE_ACTIONS.find((action) => action.id === 'sound-more-human');
		const casual = COMPOSER_REWRITER_REFINE_ACTIONS.find((action) => action.id === 'more-casual');

		expect(human).toMatchObject({ tone: 'more-casual', length: 'as-is', label: 'Sound more human' });
		expect(casual).toMatchObject({ tone: 'more-casual', length: 'as-is' });
		expect(human?.tone).toBe(casual?.tone);
		expect(human?.length).toBe(casual?.length);
	});

	it('uses distinct session keys so Sound more human does not reuse More casual', () => {
		const human = COMPOSER_REWRITER_REFINE_ACTIONS.find((action) => action.id === 'sound-more-human')!;
		const casual = COMPOSER_REWRITER_REFINE_ACTIONS.find((action) => action.id === 'more-casual')!;

		const humanKey = createComposerRewriterSessionKey(human);
		const casualKey = createComposerRewriterSessionKey(casual);

		expect(humanKey).toBe('sound-more-human:more-casual:as-is');
		expect(casualKey).toBe('more-casual:more-casual:as-is');
		expect(humanKey).not.toBe(casualKey);
	});

	it('marks only Sound more human as using Human sharedContext', () => {
		expect(rewriterRefineActionUsesHumanSharedContext({ id: 'sound-more-human' })).toBe(true);
		expect(rewriterRefineActionUsesHumanSharedContext({ id: 'more-casual' })).toBe(false);
	});

	it('gives Sound more human Human-mode sharedContext, not Writer More casual context', () => {
		const constraints = { maxCharacters: 500, composerMode: 'global' as const };
		const humanAction = COMPOSER_REWRITER_REFINE_ACTIONS.find(
			(action) => action.id === 'sound-more-human'
		)!;
		const humanOptions = toComposerRewriterCreateOptions(
			buildComposerHumanizeCreateOptions({ mode: 'human', constraints })
		);
		const casualOptions = buildComposerRewriterCreateOptionsFromAction(
			{ tone: humanAction.tone, length: humanAction.length },
			constraints
		);

		expect(humanOptions.tone).toBe(casualOptions.tone);
		expect(humanOptions.length).toBe(casualOptions.length);
		expect(humanOptions.sharedContext).toContain(COMPOSER_HUMANIZE_HUMAN_SHARED_CONTEXT);
		expect(casualOptions.sharedContext).not.toContain(COMPOSER_HUMANIZE_HUMAN_SHARED_CONTEXT);
	});
});
