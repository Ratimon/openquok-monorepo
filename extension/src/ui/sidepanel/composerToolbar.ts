import { insertAtTextareaCursor, wrapTextareaSelection } from './composerTextarea.js';

const TOOLBAR_ICON = {
	emoji:
		'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>',
	hash:
		'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>',
	mention:
		'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></svg>',
	bold:
		'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 12h9a4 4 0 0 0 0-8H6v8z"/><path d="M6 4v16"/></svg>',
	italic:
		'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>',
	underline:
		'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/></svg>',
} as const;

const QUICK_EMOJIS = ['😀', '😊', '👍', '❤️', '🔥', '🎉', '✨', '🙏', '💯', '👏', '🚀', '✅'];

export type ComposerToolbarOptions = {
	getTextarea: () => HTMLTextAreaElement | null;
};

function toolbarButton(label: string, iconSvg: string): HTMLButtonElement {
	const btn = document.createElement('button');
	btn.type = 'button';
	btn.className = 'composer-toolbar-btn';
	btn.setAttribute('aria-label', label);
	btn.title = label;
	btn.innerHTML = iconSvg;
	return btn;
}

export function mountComposerToolbar(host: HTMLElement, opts: ComposerToolbarOptions): () => void {
	const cleanupFns: Array<() => void> = [];
	host.replaceChildren();

	const bar = document.createElement('div');
	bar.className = 'composer-toolbar';
	bar.setAttribute('role', 'toolbar');
	bar.setAttribute('aria-label', 'Post formatting');

	const emojiWrap = document.createElement('div');
	emojiWrap.className = 'composer-toolbar-emoji-wrap';

	const emojiBtn = toolbarButton('Insert emoji', TOOLBAR_ICON.emoji);
	const emojiPanel = document.createElement('div');
	emojiPanel.className = 'composer-emoji-panel';
	emojiPanel.hidden = true;
	emojiPanel.setAttribute('role', 'listbox');
	emojiPanel.setAttribute('aria-label', 'Emoji');

	for (const glyph of QUICK_EMOJIS) {
		const pick = document.createElement('button');
		pick.type = 'button';
		pick.className = 'composer-emoji-pick';
		pick.textContent = glyph;
		pick.setAttribute('aria-label', `Insert ${glyph}`);
		const onPick = () => {
			const textarea = opts.getTextarea();
			if (!textarea) return;
			insertAtTextareaCursor(textarea, glyph);
			emojiPanel.hidden = true;
		};
		pick.addEventListener('click', onPick);
		cleanupFns.push(() => pick.removeEventListener('click', onPick));
		emojiPanel.appendChild(pick);
	}

	const toggleEmojiPanel = (e: MouseEvent) => {
		e.stopPropagation();
		emojiPanel.hidden = !emojiPanel.hidden;
	};
	emojiBtn.addEventListener('click', toggleEmojiPanel);
	cleanupFns.push(() => emojiBtn.removeEventListener('click', toggleEmojiPanel));

	emojiWrap.append(emojiBtn, emojiPanel);

	const hashBtn = toolbarButton('Insert hashtag', TOOLBAR_ICON.hash);
	const mentionBtn = toolbarButton('Insert mention', TOOLBAR_ICON.mention);
	const boldBtn = toolbarButton('Bold selected text', TOOLBAR_ICON.bold);
	const italicBtn = toolbarButton('Italic selected text', TOOLBAR_ICON.italic);
	const underlineBtn = toolbarButton('Underline selected text', TOOLBAR_ICON.underline);

	const wireInsert = (btn: HTMLButtonElement, text: string) => {
		const onClick = () => {
			const textarea = opts.getTextarea();
			if (!textarea) return;
			insertAtTextareaCursor(textarea, text);
		};
		btn.addEventListener('click', onClick);
		cleanupFns.push(() => btn.removeEventListener('click', onClick));
	};

	const wireWrap = (btn: HTMLButtonElement, before: string, after: string) => {
		const onClick = () => {
			const textarea = opts.getTextarea();
			if (!textarea) return;
			wrapTextareaSelection(textarea, before, after);
		};
		btn.addEventListener('click', onClick);
		cleanupFns.push(() => btn.removeEventListener('click', onClick));
	};

	wireInsert(hashBtn, '#');
	wireInsert(mentionBtn, '@');
	wireWrap(boldBtn, '**', '**');
	wireWrap(italicBtn, '*', '*');
	wireWrap(underlineBtn, '__', '__');

	bar.append(emojiWrap, hashBtn, mentionBtn, boldBtn, italicBtn, underlineBtn);
	host.appendChild(bar);

	const onDocClick = (e: MouseEvent) => {
		if (emojiPanel.hidden) return;
		const target = e.target as HTMLElement | null;
		if (target?.closest('.composer-toolbar-emoji-wrap')) return;
		emojiPanel.hidden = true;
	};
	document.addEventListener('click', onDocClick, true);
	cleanupFns.push(() => document.removeEventListener('click', onDocClick, true));

	return () => {
		for (const fn of cleanupFns) fn();
		host.replaceChildren();
	};
}
