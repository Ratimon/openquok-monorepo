import type { IntegrationMentionProgrammerModel } from '$lib/integrations';
import type { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';

const POPUP_CLASS =
	'composer-mention-suggestion border-base-300 bg-base-100 z-50 max-h-48 overflow-y-auto rounded-lg border shadow-lg';

type MentionSuggestionProps = SuggestionProps<IntegrationMentionProgrammerModel>;

function renderMentionAvatar(mention: IntegrationMentionProgrammerModel): HTMLElement {
	if (mention.image) {
		const img = document.createElement('img');
		img.src = mention.image;
		img.alt = '';
		img.loading = 'lazy';
		img.className = 'size-7 shrink-0 rounded-full object-cover';
		return img;
	}

	const fallback = document.createElement('span');
	fallback.className =
		'bg-base-300/70 text-base-content/70 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold uppercase';
	fallback.setAttribute('aria-hidden', 'true');
	fallback.textContent = mention.label.charAt(0) || '?';
	return fallback;
}

function buildMentionOptionButton(
	mention: IntegrationMentionProgrammerModel,
	index: number,
	highlightedIndex: number,
	onSelect: () => void
): HTMLButtonElement {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = `hover:bg-base-200/80 flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
		index === highlightedIndex ? 'bg-base-200/90' : ''
	}`;
	button.setAttribute('role', 'option');
	button.setAttribute('aria-selected', index === highlightedIndex ? 'true' : 'false');
	button.addEventListener('mousedown', (e) => e.preventDefault());
	button.addEventListener('click', onSelect);

	const avatar = renderMentionAvatar(mention);
	const label = document.createElement('span');
	label.className = 'min-w-0 truncate';
	label.textContent = mention.label;

	button.append(avatar, label);
	return button;
}

/** TipTap suggestion `render` factory — DOM listbox styled like Standard-mode autocomplete. */
export function createComposerMentionSuggestionRenderer(): () => {
	onStart: (props: MentionSuggestionProps) => void;
	onUpdate: (props: MentionSuggestionProps) => void;
	onKeyDown: (props: SuggestionKeyDownProps) => boolean;
	onExit: () => void;
} {
	let popup: HTMLDivElement | null = null;
	let unmountPositioner: (() => void) | null = null;
	let highlightedIndex = 0;
	let lastProps: MentionSuggestionProps | null = null;

	function destroy() {
		unmountPositioner?.();
		unmountPositioner = null;
		popup?.remove();
		popup = null;
		highlightedIndex = 0;
		lastProps = null;
	}

	function paintList(props: MentionSuggestionProps) {
		lastProps = props;
		if (!popup) return;
		popup.replaceChildren();

		if (props.loading) {
			const loading = document.createElement('p');
			loading.className = 'text-base-content/60 px-3 py-2 text-xs';
			loading.textContent = 'Searching…';
			popup.append(loading);
			return;
		}

		const items = props.items ?? [];
		if (!items.length) {
			const empty = document.createElement('p');
			empty.className = 'text-base-content/60 px-3 py-2 text-xs';
			empty.textContent = 'No accounts found.';
			popup.append(empty);
			return;
		}

		if (highlightedIndex >= items.length) highlightedIndex = 0;

		const list = document.createElement('ul');
		list.className = 'divide-base-300/70 divide-y';

		items.forEach((mention, index) => {
			const row = document.createElement('li');
			const button = buildMentionOptionButton(mention, index, highlightedIndex, () => {
				props.command(mention);
			});
			row.append(button);
			list.append(row);
		});

		popup.append(list);
	}

	return () => ({
		onStart(props) {
			destroy();
			popup = document.createElement('div');
			popup.className = POPUP_CLASS;
			popup.setAttribute('role', 'listbox');
			popup.setAttribute('aria-label', 'Mention suggestions');
			unmountPositioner = props.mount(popup);
			highlightedIndex = 0;
			paintList(props);
		},
		onUpdate(props) {
			highlightedIndex = 0;
			paintList(props);
		},
		onKeyDown(props) {
			const suggestionProps = lastProps;
			const items = suggestionProps?.items ?? [];
			if (!items.length || !suggestionProps) return false;

			if (props.event.key === 'ArrowDown') {
				props.event.preventDefault();
				highlightedIndex = (highlightedIndex + 1) % items.length;
				paintList(suggestionProps);
				return true;
			}
			if (props.event.key === 'ArrowUp') {
				props.event.preventDefault();
				highlightedIndex = (highlightedIndex - 1 + items.length) % items.length;
				paintList(suggestionProps);
				return true;
			}
			if (props.event.key === 'Enter' || props.event.key === 'Tab') {
				props.event.preventDefault();
				const mention = items[highlightedIndex];
				if (mention) suggestionProps.command(mention);
				return true;
			}
			if (props.event.key === 'Escape') {
				props.event.preventDefault();
				destroy();
				return true;
			}
			return false;
		},
		onExit() {
			destroy();
		}
	});
}
