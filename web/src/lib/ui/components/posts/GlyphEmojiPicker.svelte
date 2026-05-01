<script lang="ts">
	import 'emoji-picker-element';

	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		textarea?: HTMLTextAreaElement | null;
		disabled?: boolean;
		class?: string;
	};

	let { textarea = null, disabled = false, class: className = '' }: Props = $props();

	let open = $state(false);
	let rootEl = $state.raw<HTMLDivElement | null>(null);

	function close() {
		open = false;
	}

	function onToggle() {
		if (disabled) return;
		open = !open;
		if (!open) textarea?.focus();
	}

	function insertAtSelection(el: HTMLTextAreaElement, text: string) {
		const start = el.selectionStart ?? 0;
		const end = el.selectionEnd ?? 0;
		const value = el.value ?? '';
		const nextValue = value.slice(0, start) + text + value.slice(end);
		el.value = nextValue;
		el.dispatchEvent(new Event('input', { bubbles: true }));
		el.focus();
		el.setSelectionRange(start + text.length, start + text.length);
	}

	function onEmojiClick(e: CustomEvent<{ unicode: string }>) {
		const emoji = e.detail?.unicode ?? '';
		if (!emoji || !textarea) return;
		insertAtSelection(textarea, emoji);
		close();
	}

	function handleDocumentPointerDown(e: PointerEvent) {
		if (!open) return;
		const target = e.target as Node | null;
		if (!target) return;
		if (rootEl?.contains(target)) return;
		close();
	}

	function handleDocumentKeyDown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') {
			e.stopPropagation();
			close();
		}
	}

	$effect(() => {
		if (!open) return;
		document.addEventListener('pointerdown', handleDocumentPointerDown, { capture: true });
		document.addEventListener('keydown', handleDocumentKeyDown, { capture: true });
		return () => {
			document.removeEventListener('pointerdown', handleDocumentPointerDown, { capture: true });
			document.removeEventListener('keydown', handleDocumentKeyDown, { capture: true });
		};
	});
</script>

<div class="relative" bind:this={rootEl}>
	<button
		type="button"
		class={className}
		disabled={disabled || !textarea}
		onclick={onToggle}
		aria-label="Insert emoji"
	>
		<AbstractIcon name={icons.Smile.name} class="size-5" width="20" height="20" />
	</button>

	{#if open}
		<div
			class="border-base-300 bg-base-100/95 absolute bottom-full left-0 z-50 mb-2 overflow-hidden rounded-xl border shadow-xl backdrop-blur-md"
			role="dialog"
			aria-label="Emoji picker"
		>
			<emoji-picker onemoji-click={onEmojiClick}></emoji-picker>
		</div>
	{/if}
</div>

<style>
	:global(emoji-picker) {
		width: 340px;
		height: 380px;
		--background: hsl(var(--b1));
		--border-color: hsl(var(--b3));
		--indicator-color: hsl(var(--p));
		--button-hover-background: hsl(var(--b2));
		--button-active-background: hsl(var(--b3));
	}
</style>

