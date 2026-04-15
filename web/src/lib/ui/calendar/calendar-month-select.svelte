<script lang="ts">
	import { Calendar as CalendarPrimitive } from 'bits-ui';
	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { cn, type WithoutChildrenOrChild } from '$lib/ui/helpers/common';

	let {
		ref = $bindable(null),
		class: className,
		value,
		onchange,
		...restProps
	}: WithoutChildrenOrChild<CalendarPrimitive.MonthSelectProps> = $props();
</script>

<span
	class={cn(
		'border-base-300 has-focus:border-primary has-focus:ring-primary/40 relative flex rounded-md border shadow-xs has-focus:ring-[3px]',
		className
	)}
>
	<CalendarPrimitive.MonthSelect
		bind:ref
		class="bg-base-100 text-base-content absolute inset-0 opacity-0"
		{...restProps}
	>
		{#snippet child({ props, monthItems, selectedMonthItem })}
			<select {...props} {value} {onchange}>
				{#each monthItems as monthItem (monthItem.value)}
					<option
						value={monthItem.value}
						selected={value !== undefined
							? monthItem.value === value
							: monthItem.value === selectedMonthItem.value}
					>
						{monthItem.label}
					</option>
				{/each}
			</select>
			<span
				class="[&>svg]:text-base-content/60 flex h-(--cell-size) items-center gap-1 rounded-md ps-2 pe-1 text-sm font-medium select-none [&>svg]:size-3.5"
				aria-hidden="true"
			>
				{monthItems.find((item) => item.value === value)?.label || selectedMonthItem.label}
				<AbstractIcon name={icons.ChevronDown.name} class="size-4 shrink-0" width="16" height="16" />
			</span>
		{/snippet}
	</CalendarPrimitive.MonthSelect>
</span>
