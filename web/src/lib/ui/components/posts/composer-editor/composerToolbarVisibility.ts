import type { IntegrationEditorMode } from '$lib/integrations/integrationEditorMode';

export type ComposerToolbarVisibility = {
	signatures: boolean;
	ai: boolean;
	undoRedo: boolean;
	boldUnderline: boolean;
	linkHeadingsLists: boolean;
	emoji: boolean;
	hashtag: boolean;
	mention: boolean;
	linkedInCompany: boolean;
};

/** Toolbar button visibility per integration editor mode (see writing-the-post plan). */
export function getComposerToolbarVisibility(
	mode: IntegrationEditorMode
): ComposerToolbarVisibility {
	switch (mode) {
		case 'none':
			return {
				signatures: true,
				ai: true,
				undoRedo: true,
				boldUnderline: false,
				linkHeadingsLists: false,
				emoji: true,
				hashtag: false,
				mention: false,
				linkedInCompany: false
			};
		case 'markdown':
		case 'html':
			return {
				signatures: true,
				ai: true,
				undoRedo: true,
				boldUnderline: true,
				linkHeadingsLists: true,
				emoji: true,
				hashtag: true,
				mention: true,
				linkedInCompany: true
			};
		case 'normal':
		default:
			return {
				signatures: true,
				ai: true,
				undoRedo: true,
				boldUnderline: true,
				linkHeadingsLists: false,
				emoji: true,
				hashtag: true,
				mention: true,
				linkedInCompany: true
			};
	}
}

export function usesRichComposerEditor(mode: IntegrationEditorMode): boolean {
	return mode !== 'normal';
}

/** Follow-up replies are plain text (+ optional image on some networks) — no rich formatting or signatures. */
export function getFollowUpCommentToolbarVisibility(): ComposerToolbarVisibility {
	return {
		signatures: false,
		ai: true,
		undoRedo: false,
		boldUnderline: false,
		linkHeadingsLists: false,
		emoji: true,
		hashtag: true,
		mention: true,
		linkedInCompany: false
	};
}
