import type { Extensions } from '@tiptap/core';
import type { IntegrationEditorMode } from '$lib/integrations/integrationEditorMode';

import { Placeholder, UndoRedo } from '@tiptap/extensions';
import StarterKit from '@tiptap/starter-kit';

import {
	buildComposerMentionExtension,
	type ComposerMentionExtensionConfig
} from '$lib/ui/components/posts/composer-editor/buildComposerMentionExtension';
import { validateComposerLinkHref } from '$lib/ui/components/posts/composer-editor/validateComposerLinkHref';

export type { ComposerMentionExtensionConfig };

const HISTORY_DEPTH = 100;
const HISTORY_GROUP_DELAY_MS = 100;

function historyExtension() {
	return UndoRedo.configure({
		depth: HISTORY_DEPTH,
		newGroupDelay: HISTORY_GROUP_DELAY_MS
	});
}

const plainOnlyStarterKit = StarterKit.configure({
	bold: false,
	italic: false,
	underline: false,
	heading: false,
	bulletList: false,
	orderedList: false,
	blockquote: false,
	code: false,
	codeBlock: false,
	horizontalRule: false,
	strike: false,
	link: false,
	undoRedo: false
});

const richStarterKit = StarterKit.configure({
	heading: { levels: [1, 2, 3] },
	undoRedo: false,
	link: {
		openOnClick: false,
		validate: (href) => validateComposerLinkHref(href) !== null
	}
});

/** TipTap extension sets for each social composer editor mode. */
export function buildComposerEditorExtensions(
	mode: IntegrationEditorMode,
	placeholder = 'Write something…',
	mentionConfig: ComposerMentionExtensionConfig | null = null
): Extensions {
	const placeholderExt = Placeholder.configure({ placeholder });
	const history = historyExtension();

	if (mode === 'none') {
		return [plainOnlyStarterKit, placeholderExt, history];
	}

	const extensions: Extensions = [richStarterKit, placeholderExt, history];
	const mentionExtension = mentionConfig ? buildComposerMentionExtension(mentionConfig) : null;
	if (mentionExtension) extensions.push(mentionExtension);

	return extensions;
}
