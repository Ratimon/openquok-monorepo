<script lang="ts">
	import { Calendar as CalendarPrimitive } from "bits-ui";
	import * as Calendar from "./index";
	import { cn } from "$lib/ui/helpers/common";
	import type { ButtonVariant } from '$lib/ui/buttons/Button.svelte';
	import { isEqualMonth, type DateValue } from "@internationalized/date";
	import type { Snippet } from "svelte";

	let {
		ref = $bindable(null),
		value = $bindable(),
		placeholder = $bindable(),
		class: className,
		type = "single" as const,
		weekdayFormat = "short" as const,
		buttonVariant = "ghost" satisfies ButtonVariant,
		captionLayout = "label",
		locale = "en-US",
		months: monthsProp = undefined,
		years = undefined,
		monthFormat: monthFormatProp = undefined,
		yearFormat = "numeric" as const,
		day,
		disableDaysOutsideMonth = false,
		...restProps
	} = $props();

	const monthFormat = $derived.by((): Intl.DateTimeFormatOptions["month"] | ((month: number) => string) => {
		if (monthFormatProp) return monthFormatProp;
		return captionLayout.startsWith("dropdown") ? "short" : "long";
	});
</script>

<!--
Discriminated Unions + Destructing (required for bindable) do not
get along, so we shut typescript up by casting `value` to `never`.
-->
<CalendarPrimitive.Root
	bind:value={value as never}
	bind:ref
	bind:placeholder
	{type}
	{weekdayFormat}
	{disableDaysOutsideMonth}
	class={cn(
		'cn-calendar [--cell-radius:0.375rem] [--cell-size:2.25rem] group/calendar bg-base-100',
		className
	)}
	{locale}
	{monthFormat}
	{yearFormat}
	{...restProps}
>
	{#snippet children({ months, weekdays })}
		<Calendar.Months>
			<Calendar.Nav>
				<Calendar.PrevButton variant={buttonVariant} />
				<Calendar.NextButton variant={buttonVariant} />
			</Calendar.Nav>
			{#each months as month, monthIndex (month)}
				<Calendar.Month>
					<Calendar.Header>
						<Calendar.Caption
							captionLayout={captionLayout as
								| 'dropdown'
								| 'dropdown-months'
								| 'dropdown-years'
								| 'label'}
							months={monthsProp}
							{monthFormat}
							{years}
							{yearFormat}
							month={month.value}
							bind:placeholder
							{locale}
							{monthIndex}
						/>
					</Calendar.Header>
					<Calendar.Grid>
						<Calendar.GridHead>
							<Calendar.GridRow class="select-none">
								{#each weekdays as weekday, i (i)}
									<Calendar.HeadCell>
										{weekday.slice(0, 2)}
									</Calendar.HeadCell>
								{/each}
							</Calendar.GridRow>
						</Calendar.GridHead>
						<Calendar.GridBody>
							{#each month.weeks as weekDates (weekDates)}
								<Calendar.GridRow class="mt-2 w-full">
									{#each weekDates as date (date)}
										<Calendar.Cell {date} month={month.value}>
											{#if day}
												{@render day({
													day: date,
													outsideMonth: !isEqualMonth(date, month.value),
												})}
											{:else}
												<Calendar.Day />
											{/if}
										</Calendar.Cell>
									{/each}
								</Calendar.GridRow>
							{/each}
						</Calendar.GridBody>
					</Calendar.Grid>
				</Calendar.Month>
			{/each}
		</Calendar.Months>
	{/snippet}
</CalendarPrimitive.Root>
