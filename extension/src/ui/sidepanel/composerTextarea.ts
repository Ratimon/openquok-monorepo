export function insertAtTextareaCursor(textarea: HTMLTextAreaElement, text: string): void {
	const start = textarea.selectionStart ?? textarea.value.length;
	const end = textarea.selectionEnd ?? start;
	const before = textarea.value.slice(0, start);
	const after = textarea.value.slice(end);
	textarea.value = `${before}${text}${after}`;
	const nextPos = start + text.length;
	textarea.selectionStart = nextPos;
	textarea.selectionEnd = nextPos;
	textarea.focus();
	textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

export function wrapTextareaSelection(
	textarea: HTMLTextAreaElement,
	before: string,
	after: string
): void {
	const start = textarea.selectionStart ?? 0;
	const end = textarea.selectionEnd ?? start;
	const selected = textarea.value.slice(start, end);
	const insertion = selected ? `${before}${selected}${after}` : `${before}${after}`;
	const valueStart = textarea.value.slice(0, start);
	const valueEnd = textarea.value.slice(end);
	textarea.value = `${valueStart}${insertion}${valueEnd}`;
	if (selected) {
		textarea.selectionStart = start + before.length;
		textarea.selectionEnd = start + before.length + selected.length;
	} else {
		const cursor = start + before.length;
		textarea.selectionStart = cursor;
		textarea.selectionEnd = cursor;
	}
	textarea.focus();
	textarea.dispatchEvent(new Event('input', { bubbles: true }));
}
