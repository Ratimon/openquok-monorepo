<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		id: string;
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		onblur?: () => void;
	};

	let {
		id,
		value = $bindable(''),
		placeholder = '',
		disabled = false,
		onblur
	}: Props = $props();

	const showClear = $derived(Boolean(value.trim()) && !disabled);

	function clearValue() {
		value = '';
	}
</script>

<div class="relative">
	<input
		{id}
		type="text"
		class="border-base-300 bg-base-100 w-full rounded-md border py-2 pl-3 pr-10 text-sm"
		{placeholder}
		bind:value
		{disabled}
		onblur={onblur}
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
