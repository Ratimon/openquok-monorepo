<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		id: string;
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		required?: boolean;
		class?: string;
		onblur?: () => void;
		oninput?: (event: Event) => void;
	};

	let {
		id,
		value = $bindable(''),
		placeholder = '',
		disabled = false,
		required = false,
		class: className = '',
		onblur,
		oninput
	}: Props = $props();

	const showClear = $derived(Boolean(value.trim()) && !disabled);

	function clearValue() {
		value = '';
	}
</script>

<div class={cn('relative', className)}>
	<input
		{id}
		type="text"
		class={cn(
			'border-base-300 bg-base-100 w-full rounded-md border py-2 pl-3 pr-10 text-sm text-base-content shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
			disabled && 'text-base-content/60'
		)}
		{placeholder}
		bind:value
		{disabled}
		{required}
		onblur={onblur}
		oninput={oninput}
	/>
	{#if showClear}
		<button
			type="button"
			class="absolute top-1/2 right-1.5 inline-flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-error hover:bg-error/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error"
			aria-label="Clear link"
			onclick={clearValue}
		>
			<AbstractIcon
				name={icons.CircleX.name}
				class="size-4"
				width="16"
				height="16"
				aria-hidden="true"
			/>
		</button>
	{/if}
</div>
