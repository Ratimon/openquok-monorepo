import type { Editor } from '@tiptap/core';
import type { IntegrationMentionProgrammerModel } from '$lib/integrations';

import { formatIntegrationMentionText } from '$lib/posts/utils/composerMention';

export type ComposerMentionRichInsertPlan = {
	/** Insert a TipTap mention atom (X handles). */
	useMentionNode: boolean;
	/** Plain-text value stored in the body / sent to publish pipelines. */
	insertText: string;
	/** Mention node attrs when `useMentionNode` is true. */
	nodeAttrs?: { id: string; label: string };
};

/** Map an API mention row to rich-editor insertion (mention node vs plain token). */
export function planComposerMentionRichInsert(
	providerIdentifier: string | null | undefined,
	mention: IntegrationMentionProgrammerModel
): ComposerMentionRichInsertPlan {
	const insertText = formatIntegrationMentionText(providerIdentifier, mention);

	if (providerIdentifier === 'x') {
		const handle = insertText.startsWith('@') ? insertText.slice(1) : insertText;
		return {
			useMentionNode: true,
			insertText,
			nodeAttrs: { id: handle, label: handle }
		};
	}

	return { useMentionNode: false, insertText };
}

/** Replace the active `@query` range with a formatted mention in TipTap. */
export function applyComposerMentionToRichEditor(
	editor: Editor,
	range: { from: number; to: number },
	providerIdentifier: string | null | undefined,
	mention: IntegrationMentionProgrammerModel
): void {
	const plan = planComposerMentionRichInsert(providerIdentifier, mention);
	const nodeAfter = editor.view.state.selection.$to.nodeAfter;
	const trailingSpace = nodeAfter?.text?.startsWith(' ') ?? false;
	const to = trailingSpace ? range.to + 1 : range.to;

	if (plan.useMentionNode && plan.nodeAttrs) {
		editor
			.chain()
			.focus()
			.insertContentAt({ from: range.from, to }, [
				{
					type: 'mention',
					attrs: {
						id: plan.nodeAttrs.id,
						label: plan.nodeAttrs.label,
						mentionSuggestionChar: '@'
					}
				},
				{ type: 'text', text: ' ' }
			])
			.run();
		return;
	}

	editor.chain().focus().insertContentAt({ from: range.from, to }, `${plan.insertText} `).run();
}
