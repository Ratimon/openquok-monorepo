<script lang="ts">
	import { CalendarDate, getLocalTimeZone, type DateValue } from '@internationalized/date';

	import {
		calendarDateFromYyyyMmDd,
		dateRangeFromYyyyMmDd,
		detectListViewRangePreset,
		getListViewRangeForPreset,
		LIST_VIEW_RANGE_PRESET_OPTIONS,
		type ListViewRangePresetId,
		validateListViewDateRange,
		yyyyMmDdFromDateRange
	} from '$lib/posts/utils/scheduler/listViewRangePresets';
	import { formatCalendarDateRangeLabel } from '$lib/utils/postingSchedulePreferences';

	import { icons } from '$data/icons';
	import { RangeCalendar } from '$lib/ui/calendar';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Popover from '$lib/ui/popover';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		startDate: string;
		endDate: string;
		disabled?: boolean;
		class?: string;
		onApply: (start: string, end: string) => void;
	};

	let { startDate, endDate, disabled = false, class: className, onApply }: Props = $props();

	let open = $state(false);

	type CalendarDateRange = {
		start: DateValue | undefined;
		end: DateValue | undefined;
	};

	function defaultPlaceholder(): CalendarDate {
		const n = new Date();
		return new CalendarDate(n.getFullYear(), n.getMonth() + 1, n.getDate());
	}

	let draftStart = $state('');
	let draftEnd = $state('');
	let draftPreset = $state<ListViewRangePresetId>('this-week');
	let calRange = $state<CalendarDateRange>({ start: undefined, end: undefined });
	let calPlaceholder = $state<CalendarDate>(defaultPlaceholder());

	const committedLabel = $derived.by(() => {
		if (!startDate || !endDate) return 'Select date range';
		return formatCalendarDateRangeLabel(startDate, endDate) || 'Select date range';
	});

	const draftLabel = $derived.by(() => {
		if (!draftStart || !draftEnd) return 'Select a date range';
		return formatCalendarDateRangeLabel(draftStart, draftEnd) || 'Select a date range';
	});

	const validationError = $derived.by(() => validateListViewDateRange(draftStart, draftEnd));

	const canApply = $derived.by(() => Boolean(draftStart && draftEnd && !validationError));

	function isWeekendDay(d: DateValue): boolean {
		const js = d.toDate(getLocalTimeZone());
		const w = js.getDay();
		return w === 0 || w === 6;
	}

	function isSelectedRangeDay(day: DateValue): boolean {
		const { start, end } = calRange;
		if (!start && !end) return false;
		if (start && day.compare(start) === 0) return true;
		if (end && day.compare(end) === 0) return true;
		return false;
	}

	function syncDraftFromCalendar(range: CalendarDateRange = calRange) {
		const next = yyyyMmDdFromDateRange(range);
		draftStart = next.start;
		draftEnd = next.end;
		draftPreset =
			next.start && next.end ? detectListViewRangePreset(next.start, next.end) : 'custom';
	}

	function resetDraftFromCommitted() {
		draftStart = startDate;
		draftEnd = endDate;
		draftPreset = detectListViewRangePreset(startDate, endDate);
		calRange = dateRangeFromYyyyMmDd(startDate, endDate);
		const placeholder = calendarDateFromYyyyMmDd(startDate) ?? calendarDateFromYyyyMmDd(endDate);
		if (placeholder) calPlaceholder = placeholder;
	}

	function selectPreset(presetId: Exclude<ListViewRangePresetId, 'custom'>) {
		const next = getListViewRangeForPreset(presetId);
		draftStart = next.start;
		draftEnd = next.end;
		draftPreset = presetId;
		calRange = dateRangeFromYyyyMmDd(next.start, next.end);
		const placeholder = calendarDateFromYyyyMmDd(next.start) ?? calendarDateFromYyyyMmDd(next.end);
		if (placeholder) calPlaceholder = placeholder;
	}

	function cancel() {
		resetDraftFromCommitted();
		open = false;
	}

	function apply() {
		if (!canApply) return;
		onApply(draftStart, draftEnd);
		open = false;
	}

	$effect(() => {
		if (!open) return;
		resetDraftFromCommitted();
	});

	function handleCalendarRangeChange(next: CalendarDateRange) {
		calRange = next;
		syncDraftFromCalendar(next);
	}
</script>

{#snippet daySnippet({ day, outsideMonth }: { day: DateValue; outsideMonth: boolean })}
	<RangeCalendar.Day
		class={cn(
			isWeekendDay(day) && !outsideMonth && !isSelectedRangeDay(day) && '!text-primary/85',
			outsideMonth && 'opacity-70'
		)}
	/>
{/snippet}

<Popover.Root bind:open>
	<Popover.Trigger
		type="button"
		disabled={disabled}
		aria-label="Choose date range"
		class={cn(
			'border-base-300 flex h-11 min-w-0 flex-1 cursor-pointer select-none items-center justify-center gap-2 rounded-lg border px-4 text-[15px] font-semibold text-base-content/80 outline-none transition-colors hover:bg-base-200 hover:text-base-content focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100',
			disabled && 'pointer-events-none opacity-50',
			className
		)}
	>
		<AbstractIcon name={icons.CalendarClock.name} class="size-4 shrink-0" width="16" height="16" />
		<span class="min-w-0 truncate">{committedLabel}</span>
		<AbstractIcon
			name={icons.ChevronDown.name}
			class={cn('size-4 shrink-0 text-base-content/60 transition-transform', open && 'rotate-180')}
			width="16"
			height="16"
			aria-hidden="true"
		/>
	</Popover.Trigger>

	<Popover.Content
		side="bottom"
		align="start"
		sideOffset={8}
		collisionPadding={16}
		class={cn(
			'border-base-300 bg-base-200 text-base-content z-[300] flex w-[min(100vw-2rem,52rem)] max-w-[min(100vw-2rem,52rem)] flex-col gap-0 overflow-hidden rounded-2xl border p-0 shadow-2xl ring-1 ring-base-300 outline-none'
		)}
		onclick={(e) => e.stopPropagation()}
	>
		<div class="flex min-h-0 flex-col sm:flex-row">
			<aside
				class="border-base-300 bg-base-300/40 flex shrink-0 flex-col gap-0.5 border-b p-2 sm:w-36 sm:border-r sm:border-b-0"
				aria-label="Date range presets"
			>
				{#each LIST_VIEW_RANGE_PRESET_OPTIONS as option (option.id)}
					<button
						type="button"
						class={cn(
							'rounded-md px-3 py-2 text-left text-sm transition-colors',
							draftPreset === option.id
								? 'bg-primary/10 text-primary font-medium'
								: 'text-base-content/80 hover:bg-base-200/80'
						)}
						onclick={() => selectPreset(option.id)}
					>
						{option.label}
					</button>
				{/each}
				<button
					type="button"
					class={cn(
						'rounded-md px-3 py-2 text-left text-sm transition-colors',
						draftPreset === 'custom'
							? 'bg-primary/10 text-primary font-medium'
							: 'text-base-content/80 hover:bg-base-200/80'
					)}
					disabled
					aria-current={draftPreset === 'custom' ? 'true' : undefined}
				>
					Custom
				</button>
			</aside>

			<div class="min-w-0 flex-1 overflow-x-auto p-4">
				<RangeCalendar.RangeCalendar
					value={calRange}
					onValueChange={handleCalendarRangeChange}
					bind:placeholder={calPlaceholder}
					numberOfMonths={2}
					pagedNavigation={true}
					weekStartsOn={1}
					weekdayFormat="short"
					captionLayout="dropdown"
					disableDaysOutsideMonth={false}
					locale="en-US"
					class="w-full min-w-[34rem]"
					day={daySnippet}
				/>
			</div>
		</div>

		<div class="border-base-300 flex flex-col gap-2 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
			<div class="min-w-0 flex-1">
				<p class="truncate text-sm font-medium text-base-content">{draftLabel}</p>
				{#if validationError}
					<p class="text-error mt-1 text-xs">{validationError}</p>
				{/if}
			</div>
			<div class="flex shrink-0 items-center justify-end gap-2">
				<Button type="button" variant="ghost" size="sm" onclick={cancel}>Cancel</Button>
				<Button type="button" variant="primary" size="sm" disabled={!canApply} onclick={apply}>
					Apply
				</Button>
			</div>
		</div>
	</Popover.Content>
</Popover.Root>
