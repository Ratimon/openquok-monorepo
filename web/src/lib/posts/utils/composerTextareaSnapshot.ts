export type ComposerTextSnapshot = {
	text: string;
	selectionStart: number;
	selectionEnd: number;
};

export function snapshotFromTextarea(
	el: HTMLTextAreaElement | null | undefined,
	fallbackText = ''
): ComposerTextSnapshot {
	if (!el) {
		const len = fallbackText.length;
		return { text: fallbackText, selectionStart: len, selectionEnd: len };
	}
	return {
		text: el.value ?? '',
		selectionStart: el.selectionStart ?? 0,
		selectionEnd: el.selectionEnd ?? 0
	};
}
