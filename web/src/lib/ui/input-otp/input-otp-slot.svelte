<script lang="ts">
	import { PinInput as InputOTPPrimitive } from 'bits-ui';

	import { cn } from '$lib/ui/helpers/common';

	let {
		ref = $bindable(null),
		cell,
		class: className,
		...restProps
	}: InputOTPPrimitive.CellProps = $props();
</script>

<InputOTPPrimitive.Cell
	{cell}
	bind:ref
	data-slot="input-otp-slot"
	class={cn(
		'focus-override relative flex h-12 w-9 items-center justify-center text-lg font-medium tabular-nums sm:h-14 sm:w-10 sm:text-xl',
		'border-base-300 bg-base-100 text-base-content border-y border-r transition-colors outline-none',
		'first:rounded-l-md first:border-l last:rounded-r-md',
		'data-active:z-10 data-active:border-primary data-active:ring-2 data-active:ring-primary/40',
		className
	)}
	{...restProps}
>
	{#if cell.char !== null}
		<span>{cell.char}</span>
	{/if}
	{#if cell.hasFakeCaret}
		<div
			class="pointer-events-none absolute inset-0 flex items-center justify-center"
			aria-hidden="true"
		>
			<div class="bg-base-content h-7 w-px animate-pulse sm:h-8"></div>
		</div>
	{/if}
</InputOTPPrimitive.Cell>
