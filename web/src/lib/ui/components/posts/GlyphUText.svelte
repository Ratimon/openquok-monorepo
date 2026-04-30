<script lang="ts">
	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		textarea?: HTMLTextAreaElement | null;
		disabled?: boolean;
		class?: string;
	};

	let { textarea = null, disabled = false, class: className = '' }: Props = $props();

	const COMBINING_UNDERLINE = '\u0332';

	const underlineMap: Record<string, string> = {
		a: `a${COMBINING_UNDERLINE}`,
		b: `b${COMBINING_UNDERLINE}`,
		c: `c${COMBINING_UNDERLINE}`,
		d: `d${COMBINING_UNDERLINE}`,
		e: `e${COMBINING_UNDERLINE}`,
		f: `f${COMBINING_UNDERLINE}`,
		g: `g${COMBINING_UNDERLINE}`,
		h: `h${COMBINING_UNDERLINE}`,
		i: `i${COMBINING_UNDERLINE}`,
		j: `j${COMBINING_UNDERLINE}`,
		k: `k${COMBINING_UNDERLINE}`,
		l: `l${COMBINING_UNDERLINE}`,
		m: `m${COMBINING_UNDERLINE}`,
		n: `n${COMBINING_UNDERLINE}`,
		o: `o${COMBINING_UNDERLINE}`,
		p: `p${COMBINING_UNDERLINE}`,
		q: `q${COMBINING_UNDERLINE}`,
		r: `r${COMBINING_UNDERLINE}`,
		s: `s${COMBINING_UNDERLINE}`,
		t: `t${COMBINING_UNDERLINE}`,
		u: `u${COMBINING_UNDERLINE}`,
		v: `v${COMBINING_UNDERLINE}`,
		w: `w${COMBINING_UNDERLINE}`,
		x: `x${COMBINING_UNDERLINE}`,
		y: `y${COMBINING_UNDERLINE}`,
		z: `z${COMBINING_UNDERLINE}`,
		A: `A${COMBINING_UNDERLINE}`,
		B: `B${COMBINING_UNDERLINE}`,
		C: `C${COMBINING_UNDERLINE}`,
		D: `D${COMBINING_UNDERLINE}`,
		E: `E${COMBINING_UNDERLINE}`,
		F: `F${COMBINING_UNDERLINE}`,
		G: `G${COMBINING_UNDERLINE}`,
		H: `H${COMBINING_UNDERLINE}`,
		I: `I${COMBINING_UNDERLINE}`,
		J: `J${COMBINING_UNDERLINE}`,
		K: `K${COMBINING_UNDERLINE}`,
		L: `L${COMBINING_UNDERLINE}`,
		M: `M${COMBINING_UNDERLINE}`,
		N: `N${COMBINING_UNDERLINE}`,
		O: `O${COMBINING_UNDERLINE}`,
		P: `P${COMBINING_UNDERLINE}`,
		Q: `Q${COMBINING_UNDERLINE}`,
		R: `R${COMBINING_UNDERLINE}`,
		S: `S${COMBINING_UNDERLINE}`,
		T: `T${COMBINING_UNDERLINE}`,
		U: `U${COMBINING_UNDERLINE}`,
		V: `V${COMBINING_UNDERLINE}`,
		W: `W${COMBINING_UNDERLINE}`,
		X: `X${COMBINING_UNDERLINE}`,
		Y: `Y${COMBINING_UNDERLINE}`,
		Z: `Z${COMBINING_UNDERLINE}`,
		'1': `1${COMBINING_UNDERLINE}`,
		'2': `2${COMBINING_UNDERLINE}`,
		'3': `3${COMBINING_UNDERLINE}`,
		'4': `4${COMBINING_UNDERLINE}`,
		'5': `5${COMBINING_UNDERLINE}`,
		'6': `6${COMBINING_UNDERLINE}`,
		'7': `7${COMBINING_UNDERLINE}`,
		'8': `8${COMBINING_UNDERLINE}`,
		'9': `9${COMBINING_UNDERLINE}`,
		'0': `0${COMBINING_UNDERLINE}`
	};

	function applyUnderlineToggle(selected: string): string {
		if (!selected) return selected;
		if (selected.includes(COMBINING_UNDERLINE)) {
			return selected.replaceAll(COMBINING_UNDERLINE, '');
		}

		let out = '';
		for (const ch of selected) {
			out += underlineMap[ch] ?? ch;
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
		replaceTextareaSelection(textarea, applyUnderlineToggle);
	}
</script>

<button
	type="button"
	class={className}
	disabled={disabled || !textarea}
	onclick={onClick}
	aria-label="Underline text"
	title="Underline"
>
	<AbstractIcon name={icons.Underline.name} class="size-5" width="20" height="20" />
</button>
