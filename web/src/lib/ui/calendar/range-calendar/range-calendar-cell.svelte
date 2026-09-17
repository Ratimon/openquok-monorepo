<script lang="ts">
	import { RangeCalendar as RangeCalendarPrimitive } from 'bits-ui';
	import { cn } from '$lib/ui/helpers/common';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: RangeCalendarPrimitive.CellProps = $props();
</script>

<RangeCalendarPrimitive.Cell
	bind:ref
	class={cn(
		'relative size-(--cell-size) p-0 text-center text-sm focus-within:z-20',
		'[&:first-child[data-selected]_[data-bits-day]]:rounded-s-(--cell-radius) [&:last-child[data-selected]_[data-bits-day]]:rounded-e-(--cell-radius)',
		'[&:has([data-range-end])]:rounded-e-(--cell-radius)',
		'[&:has([data-range-middle])]:rounded-none [&:has([data-range-middle])]:bg-base-200/60',
		'first:[&:has([data-range-middle])]:rounded-s-(--cell-radius) last:[&:has([data-range-middle])]:rounded-e-(--cell-radius)',
		'[&:has([data-range-start])]:rounded-s-(--cell-radius)',
		'[&:has([data-selected])]:bg-base-200/60',
		className
	)}
	{...restProps}
/>
