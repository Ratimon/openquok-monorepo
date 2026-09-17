<script lang="ts">
	import { RangeCalendar as RangeCalendarPrimitive } from 'bits-ui';
	import { cn } from '$lib/ui/helpers/common';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: RangeCalendarPrimitive.DayProps = $props();
</script>

<RangeCalendarPrimitive.Day
	bind:ref
	class={cn(
		'flex size-(--cell-size) flex-col items-center justify-center gap-1 rounded-(--cell-radius) p-0 leading-none font-normal whitespace-nowrap select-none',
		'not-data-selected:hover:bg-base-200/80 not-data-selected:hover:text-base-content',
		'data-[range-middle]:rounded-none',
		'[&[data-today]:not([data-selected])]:bg-accent/30 [&[data-today]:not([data-selected])]:text-base-content [&[data-today][data-disabled]]:text-base-content/45',
		'data-[range-start]:bg-primary data-[range-start]:text-primary-content data-[range-start]:hover:text-primary-content',
		'data-[range-end]:bg-primary data-[range-end]:text-primary-content data-[range-end]:hover:text-primary-content',
		'[&[data-outside-month]:not([data-selected])]:text-base-content/45 [&[data-outside-month]:not([data-selected])]:hover:text-base-content/70',
		'data-[disabled]:text-base-content/40 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
		'data-[unavailable]:text-base-content/45 data-[unavailable]:line-through',
		'focus:border-primary focus:ring-primary/35 focus:relative',
		'[&>span]:text-xs [&>span]:opacity-70',
		className
	)}
	{...restProps}
/>
