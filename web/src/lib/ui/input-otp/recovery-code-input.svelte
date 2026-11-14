<script lang="ts">
	import { REGEXP_ONLY_DIGITS } from 'bits-ui';

	import Group from './input-otp-group.svelte';
	import Root from './input-otp.svelte';
	import Separator from './input-otp-separator.svelte';
	import Slot from './input-otp-slot.svelte';
	import { recoveryCodeVisibleCellCount } from './recoveryCodeVisibleCellCount';

	type Props = {
		value?: string;
		maxlength?: number;
		/** Minimum visible cells before expanding to `maxlength` (default 6). */
		minDisplayLength?: number;
		disabled?: boolean;
		name?: string;
		class?: string;
		onComplete?: () => void;
	};

	let {
		value = $bindable(''),
		maxlength = 8,
		minDisplayLength = 6,
		disabled = false,
		name,
		class: className,
		onComplete
	}: Props = $props();

	const visibleCells = $derived(
		recoveryCodeVisibleCellCount(value.length, minDisplayLength, maxlength)
	);
	const firstGroupEnd = $derived(Math.ceil(visibleCells / 2));
	const showOptionalTrailingCells = $derived(
		visibleCells === maxlength && value.length <= minDisplayLength
	);

	function isOptionalCell(index: number): boolean {
		return showOptionalTrailingCells && index >= minDisplayLength;
	}
</script>

<Root
	bind:value
	{maxlength}
	{disabled}
	{name}
	{onComplete}
	pattern={REGEXP_ONLY_DIGITS}
	autocomplete="one-time-code"
	class={className}
>
	{#snippet children({ cells })}
		<Group>
			{#each cells.slice(0, firstGroupEnd) as cell, index (cell)}
				<Slot {cell} optional={isOptionalCell(index)} />
			{/each}
		</Group>
		<Separator />
		<Group>
			{#each cells.slice(firstGroupEnd, visibleCells) as cell, index (cell)}
				<Slot {cell} optional={isOptionalCell(firstGroupEnd + index)} />
			{/each}
		</Group>
	{/snippet}
</Root>
