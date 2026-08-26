import { describe, expect, it } from 'vitest';

import {
	planComposerMentionRichInsert,
	type ComposerMentionRichInsertPlan
} from '$lib/posts/utils/composerMentionRichInsert';

describe('planComposerMentionRichInsert', () => {
	it('uses a mention node for X handles', () => {
		const plan = planComposerMentionRichInsert('x', {
			id: '123',
			label: 'Jane Doe (@janedoe)',
			image: ''
		});

		expect(plan).toEqual<ComposerMentionRichInsertPlan>({
			useMentionNode: true,
			insertText: '@janedoe',
			nodeAttrs: { id: 'janedoe', label: 'janedoe' }
		});
	});

	it('inserts LinkedIn organization tokens as plain text', () => {
		const plan = planComposerMentionRichInsert('linkedin', {
			id: '987654',
			label: 'OpenQuok',
			image: ''
		});

		expect(plan).toEqual<ComposerMentionRichInsertPlan>({
			useMentionNode: false,
			insertText: '@[OpenQuok](urn:li:organization:987654)'
		});
	});
});
