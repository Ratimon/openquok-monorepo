const ICONS = {
	undo:
		'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6.69 3L3 13"/></svg>',
	redo:
		'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6.69 3L21 13"/></svg>',
	bold:
		'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 0 8H6z"/><path d="M6 12h9a4 4 0 0 1 0 8H6z"/></svg>',
	italic:
		'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 4h-9"/><path d="M14 20H5"/><path d="M15 4 9 20"/></svg>',
	underline:
		'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><path d="M4 20h16"/></svg>',
	emoji:
		'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/></svg>',
	hash:
		'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h16"/><path d="M4 15h16"/><path d="M10 3 8 21"/><path d="M16 3l-2 18"/></svg>',
	at:
		'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>',
	sparkles:
		'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.94 15.56 8 21l1.94-5.44L15.56 14 21 12l-5.44-1.94L14 4.44 12 10 9.94 15.56Z"/><path d="M4 5h.01"/><path d="M6 2h.01"/></svg>',
	image:
		'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
} as const;

export type ComposerMiniToolbarOptions = {
	textarea: HTMLTextAreaElement;
	onOpenFullComposer: () => void;
	onBodyChange?: () => void;
};

function pushHistory(stack: string[], value: string, max = 40): void {
	stack.push(value);
	if (stack.length > max) stack.shift();
}

function wrapSelection(textarea: HTMLTextAreaElement, before: string, after: string): void {
	const start = textarea.selectionStart;
	const end = textarea.selectionEnd;
	const value = textarea.value;
	const selected = value.slice(start, end);
	const insertion = selected ? `${before}${selected}${after}` : `${before}${after}`;
	const next = value.slice(0, start) + insertion + value.slice(end);
	textarea.value = next;
	const cursor = selected
		? start + insertion.length
		: start + before.length;
	textarea.setSelectionRange(cursor, cursor);
	textarea.dispatchEvent(new Event('input', { bubbles: true }));
	textarea.focus();
}

function insertText(textarea: HTMLTextAreaElement, text: string): void {
	const start = textarea.selectionStart;
	const end = textarea.selectionEnd;
	const value = textarea.value;
	textarea.value = value.slice(0, start) + text + value.slice(end);
	const cursor = start + text.length;
	textarea.setSelectionRange(cursor, cursor);
	textarea.dispatchEvent(new Event('input', { bubbles: true }));
	textarea.focus();
}

function toolbarButton(label: string, icon: string, onClick: () => void): HTMLButtonElement {
	const btn = document.createElement('button');
	btn.type = 'button';
	btn.className = 'composer-toolbar-btn';
	btn.setAttribute('aria-label', label);
	btn.title = label;
	btn.innerHTML = icon;
	btn.addEventListener('click', onClick);
	return btn;
}

export function mountComposerMiniToolbar(host: HTMLElement, opts: ComposerMiniToolbarOptions): () => void {
	const { textarea, onOpenFullComposer, onBodyChange } = opts;
	const undoStack: string[] = [];
	const redoStack: string[] = [];
	let lastSnapshot = textarea.value;
	let applyingHistory = false;

	const row = document.createElement('div');
	row.className = 'composer-toolbar';
	row.setAttribute('role', 'toolbar');
	row.setAttribute('aria-label', 'Post formatting');

	const cleanupFns: Array<() => void> = [];

	const snapshot = () => {
		if (applyingHistory) return;
		const current = textarea.value;
		if (current === lastSnapshot) return;
		pushHistory(undoStack, lastSnapshot);
		redoStack.length = 0;
		lastSnapshot = current;
		onBodyChange?.();
	};

	const onInput = () => snapshot();
	textarea.addEventListener('input', onInput);
	cleanupFns.push(() => textarea.removeEventListener('input', onInput));

	const applyValue = (value: string) => {
		applyingHistory = true;
		textarea.value = value;
		lastSnapshot = value;
		textarea.dispatchEvent(new Event('input', { bubbles: true }));
		applyingHistory = false;
		onBodyChange?.();
	};

	const undo = () => {
		if (!undoStack.length) return;
		pushHistory(redoStack, textarea.value);
		const prev = undoStack.pop()!;
		applyValue(prev);
	};

	const redo = () => {
		if (!redoStack.length) return;
		pushHistory(undoStack, textarea.value);
		const next = redoStack.pop()!;
		applyValue(next);
	};

	const buttons: Array<{ label: string; icon: string; action: () => void }> = [
		{ label: 'Undo', icon: ICONS.undo, action: undo },
		{ label: 'Redo', icon: ICONS.redo, action: redo },
		{ label: 'Bold', icon: ICONS.bold, action: () => wrapSelection(textarea, '**', '**') },
		{ label: 'Italic', icon: ICONS.italic, action: () => wrapSelection(textarea, '*', '*') },
		{ label: 'Underline', icon: ICONS.underline, action: () => wrapSelection(textarea, '<u>', '</u>') },
		{ label: 'Insert emoji', icon: ICONS.emoji, action: () => insertText(textarea, '🙂') },
		{ label: 'Insert hashtag', icon: ICONS.hash, action: () => insertText(textarea, '#') },
		{ label: 'Insert mention', icon: ICONS.at, action: () => insertText(textarea, '@') },
		{
			label: 'AI tools (full composer)',
			icon: ICONS.sparkles,
			action: onOpenFullComposer,
		},
		{
			label: 'Add media (full composer)',
			icon: ICONS.image,
			action: onOpenFullComposer,
		},
	];

	for (const { label, icon, action } of buttons) {
		const btn = toolbarButton(label, icon, action);
		row.appendChild(btn);
	}

	host.replaceChildren(row);

	return () => {
		for (const fn of cleanupFns) fn();
		host.replaceChildren();
	};
}
