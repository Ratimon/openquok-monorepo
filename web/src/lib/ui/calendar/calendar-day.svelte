<script lang="ts">
	import { cn } from '$lib/ui/helpers/common';
	import { Calendar as CalendarPrimitive } from 'bits-ui';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: CalendarPrimitive.DayProps = $props();
</script>

<CalendarPrimitive.Day
	bind:ref
	class={cn(
		'flex size-(--cell-size) flex-col items-center justify-center gap-1 rounded-(--cell-radius) p-0 leading-none font-normal whitespace-nowrap select-none',
		'[&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius)',
		'not-data-selected:hover:bg-base-200/80 not-data-selected:hover:text-base-content',
		'[&[data-today]:not([data-selected])]:bg-accent/30 [&[data-today]:not([data-selected])]:text-base-content [&[data-today][data-disabled]]:text-base-content/45',
		'data-[selected]:bg-primary data-[selected]:text-primary-content data-[selected]:hover:text-primary-content',
		'[&[data-outside-month]:not([data-selected])]:text-base-content/45 [&[data-outside-month]:not([data-selected])]:hover:text-base-content/70',
		'data-[disabled]:text-base-content/40 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
		'data-[unavailable]:text-base-content/45 data-[unavailable]:line-through',
		'focus:border-primary focus:ring-primary/35 focus:relative',
		'[&>span]:text-xs [&>span]:opacity-70',
		className
	)}
	{...restProps}
/>
