<script lang="ts">
	import { onMount } from 'svelte';

	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		value: string;
		placeholder?: string;
		class?: string;
		onchange?: (value: string) => void;
	};

	let {
		value = $bindable(''),
		placeholder = 'Search extensions…',
		class: className = '',
		onchange
	}: Props = $props();

	let inputEl: HTMLInputElement | undefined = $state();

	onMount(() => {
		function onKeyDown(event: KeyboardEvent) {
			const target = event.target as HTMLElement | null;
			const tag = target?.tagName?.toLowerCase();
			if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) return;
			if (event.key !== '/') return;
			event.preventDefault();
			inputEl?.focus();
		}

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	});

	function handleInput(event: Event) {
		const next = (event.currentTarget as HTMLInputElement).value;
		value = next;
		onchange?.(next);
	}
</script>

<div class={cn('relative', className)}>
	<label class="sr-only" for="extensions-search">Search extensions</label>
	<input
		bind:this={inputEl}
		id="extensions-search"
		type="search"
		class="input input-bordered w-full pr-16"
		{placeholder}
		{value}
		oninput={handleInput}
		autocomplete="off"
	/>
	<kbd
		class="kbd kbd-sm pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 opacity-60"
		aria-hidden="true"
	>
		/
	</kbd>
</div>
