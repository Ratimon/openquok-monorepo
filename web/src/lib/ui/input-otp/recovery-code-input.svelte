<script lang="ts">
	import { REGEXP_ONLY_DIGITS } from 'bits-ui';

	import Group from './input-otp-group.svelte';
	import Root from './input-otp.svelte';
	import Separator from './input-otp-separator.svelte';
	import Slot from './input-otp-slot.svelte';

	type Props = {
		value?: string;
		maxlength?: number;
		/** Visible cell count (≤ maxlength). Use for variable-length OTP (e.g. 6 or 8 digits). */
		displayLength?: number;
		disabled?: boolean;
		name?: string;
		class?: string;
		onComplete?: () => void;
	};

	let {
		value = $bindable(''),
		maxlength = 8,
		displayLength,
		disabled = false,
		name,
		class: className,
		onComplete
	}: Props = $props();

	const visibleCells = $derived(
		Math.min(maxlength, Math.max(1, displayLength ?? maxlength))
	);
	const firstGroupEnd = $derived(Math.ceil(visibleCells / 2));
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
			{#each cells.slice(0, firstGroupEnd) as cell (cell)}
				<Slot {cell} />
			{/each}
		</Group>
		<Separator />
		<Group>
			{#each cells.slice(firstGroupEnd, visibleCells) as cell (cell)}
				<Slot {cell} />
			{/each}
		</Group>
	{/snippet}
</Root>
