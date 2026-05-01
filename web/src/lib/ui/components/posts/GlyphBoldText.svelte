<script lang="ts">
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		textarea?: HTMLTextAreaElement | null;
		disabled?: boolean;
		class?: string;
	};

	let { textarea = null, disabled = false, class: className = '' }: Props = $props();

	const boldMap: Record<string, string> = {
		a: '𝗮',
		b: '𝗯',
		c: '𝗰',
		d: '𝗱',
		e: '𝗲',
		f: '𝗳',
		g: '𝗴',
		h: '𝗵',
		i: '𝗶',
		j: '𝗷',
		k: '𝗸',
		l: '𝗹',
		m: '𝗺',
		n: '𝗻',
		o: '𝗼',
		p: '𝗽',
		q: '𝗾',
		r: '𝗿',
		s: '𝘀',
		t: '𝘁',
		u: '𝘂',
		v: '𝘃',
		w: '𝘄',
		x: '𝘅',
		y: '𝘆',
		z: '𝘇',
		A: '𝗔',
		B: '𝗕',
		C: '𝗖',
		D: '𝗗',
		E: '𝗘',
		F: '𝗙',
		G: '𝗚',
		H: '𝗛',
		I: '𝗜',
		J: '𝗝',
		K: '𝗞',
		L: '𝗟',
		M: '𝗠',
		N: '𝗡',
		O: '𝗢',
		P: '𝗣',
		Q: '𝗤',
		R: '𝗥',
		S: '𝗦',
		T: '𝗧',
		U: '𝗨',
		V: '𝗩',
		W: '𝗪',
		X: '𝗫',
		Y: '𝗬',
		Z: '𝗭',
		'1': '𝟭',
		'2': '𝟮',
		'3': '𝟯',
		'4': '𝟰',
		'5': '𝟱',
		'6': '𝟲',
		'7': '𝟳',
		'8': '𝟴',
		'9': '𝟵',
		'0': '𝟬'
	};

	const reverseBoldMap: Record<string, string> = Object.fromEntries(
		Object.entries(boldMap).map(([k, v]) => [v, k])
	);

	function applyBoldToggle(selected: string): string {
		if (!selected) return selected;
		let out = '';
		for (const ch of selected) {
			out += reverseBoldMap[ch] ?? boldMap[ch] ?? ch;
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
		replaceTextareaSelection(textarea, applyBoldToggle);
	}
</script>

<button
	type="button"
	class={className}
	disabled={disabled || !textarea}
	onclick={onClick}
	aria-label="Bold text"
>
	<AbstractIcon name={icons.Bold.name} class="size-5" width="20" height="20" />
</button>
