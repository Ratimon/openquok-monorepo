<script lang="ts">
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		textarea?: HTMLTextAreaElement | null;
		disabled?: boolean;
		class?: string;
	};

	let { textarea = null, disabled = false, class: className = '' }: Props = $props();

	const italicMap: Record<string, string> = {
		a: '𝘢',
		b: '𝘣',
		c: '𝘤',
		d: '𝘥',
		e: '𝘦',
		f: '𝘧',
		g: '𝘨',
		h: '𝘩',
		i: '𝘪',
		j: '𝘫',
		k: '𝘬',
		l: '𝘭',
		m: '𝘮',
		n: '𝘯',
		o: '𝘰',
		p: '𝘱',
		q: '𝘲',
		r: '𝘳',
		s: '𝘴',
		t: '𝘵',
		u: '𝘶',
		v: '𝘷',
		w: '𝘸',
		x: '𝘹',
		y: '𝘺',
		z: '𝘻',
		A: '𝘈',
		B: '𝘉',
		C: '𝘊',
		D: '𝘋',
		E: '𝘌',
		F: '𝘍',
		G: '𝘎',
		H: '𝘏',
		I: '𝘐',
		J: '𝘑',
		K: '𝘒',
		L: '𝘓',
		M: '𝘔',
		N: '𝘕',
		O: '𝘖',
		P: '𝘗',
		Q: '𝘘',
		R: '𝘙',
		S: '𝘚',
		T: '𝘛',
		U: '𝘜',
		V: '𝘝',
		W: '𝘞',
		X: '𝘟',
		Y: '𝘠',
		Z: '𝘡'
	};

	const reverseItalicMap: Record<string, string> = Object.fromEntries(
		Object.entries(italicMap).map(([k, v]) => [v, k])
	);

	function applyItalicToggle(selected: string): string {
		if (!selected) return selected;
		let out = '';
		for (const ch of selected) {
			out += reverseItalicMap[ch] ?? italicMap[ch] ?? ch;
		}
		return out;
	}

	function replaceTextareaSelection(el: HTMLTextAreaElement, transform: (s: string) => string) {
		const start = el.selectionStart ?? 0;
		const end = el.selectionEnd ?? 0;
		if (start === end) return;

		const value = el.value ?? '';
		const selected = value.slice(start, end);
		const nextSelected = transform(selected);
		const nextValue = value.slice(0, start) + nextSelected + value.slice(end);

		el.value = nextValue;
		el.dispatchEvent(new Event('input', { bubbles: true }));
		el.focus();
		el.setSelectionRange(start, start + nextSelected.length);
	}

	function onClick() {
		if (disabled || !textarea) return;
		replaceTextareaSelection(textarea, applyItalicToggle);
	}
</script>

<button
	type="button"
	class={className}
	disabled={disabled || !textarea}
	onclick={onClick}
	aria-label="Italic text"
>
	<AbstractIcon name={icons.Italic.name} class="size-5" width="20" height="20" />
</button>

