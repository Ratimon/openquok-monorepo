<script lang="ts">
	import { CalendarDate, getLocalTimeZone, type DateValue } from '@internationalized/date';
	import { icons } from '$data/icon';
	import { Calendar, Day } from '$lib/ui/calendar';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Popover from '$lib/ui/popover';
	import { cn } from '$lib/ui/helpers/common';
	import { getDateMetricUsStyle, newDayjs } from '$lib/utils/postingSchedulePreferences';

	type Props = {
		value?: string;
		disabled?: boolean;
		class?: string;
	};

	let { value = $bindable(''), disabled = false, class: className }: Props = $props();

	let open = $state(false);

	let calValue = $state<CalendarDate | undefined>(undefined);
	let calPlaceholder = $state<CalendarDate>(defaultCalendarDate());
	let timeStr = $state(defaultTimeStr());

	function defaultCalendarDate(): CalendarDate {
		const n = new Date();
		return new CalendarDate(n.getFullYear(), n.getMonth() + 1, n.getDate());
	}

	function defaultTimeStr(): string {
		const n = new Date();
		const pad = (x: number) => String(x).padStart(2, '0');
		return `${pad(n.getHours())}:${pad(n.getMinutes())}`;
	}

	function pad2(n: number) {
		return String(n).padStart(2, '0');
	}

	function parseLocal(s: string): { cal: CalendarDate; time: string } | null {
		if (!s || !s.includes('T')) return null;
		const [datePart, timePart] = s.split('T');
		const [y, m, d] = datePart.split('-').map((x) => Number.parseInt(x, 10));
		const [hh, mm] = (timePart ?? '00:00').slice(0, 5).split(':').map((x) => Number.parseInt(x, 10));
		if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
		return {
			cal: new CalendarDate(y, m, d),
			time: `${pad2(Number.isFinite(hh) ? hh : 0)}:${pad2(Number.isFinite(mm) ? mm : 0)}`
		};
	}

	function toLocalString(cal: CalendarDate, time: string): string {
		const [hh, mm] = time.split(':').map((x) => Number.parseInt(x, 10));
		const h = Number.isFinite(hh) ? hh : 0;
		const m = Number.isFinite(mm) ? mm : 0;
		return `${cal.year}-${pad2(cal.month)}-${pad2(cal.day)}T${pad2(h)}:${pad2(m)}`;
	}

	function isWeekendDay(d: DateValue): boolean {
		const js = d.toDate(getLocalTimeZone());
		const w = js.getDay();
		return w === 0 || w === 6;
	}

	const labelText = $derived.by(() => {
		if (!value) return 'Select date & time';
		const d = newDayjs(value);
		if (!d.isValid()) return 'Select date & time';
		return getDateMetricUsStyle()
			? d.format('MM/DD/YYYY hh:mm A')
			: d.format('DD/MM/YYYY HH:mm');
	});

	$effect(() => {
		const p = parseLocal(value);
		if (!p) return;
		calValue = p.cal;
		timeStr = p.time;
		calPlaceholder = p.cal;
	});

	$effect(() => {
		if (!calValue) return;
		const next = toLocalString(calValue, timeStr);
		if (next !== value) value = next;
	});

	$effect(() => {
		if (!open || disabled) return;
		if (!calValue) {
			const n = new Date();
			calValue = new CalendarDate(n.getFullYear(), n.getMonth() + 1, n.getDate());
			timeStr = defaultTimeStr();
			calPlaceholder = calValue;
		}
	});

	function close() {
		open = false;
	}
</script>

{#snippet daySnippet({ day, outsideMonth }: { day: DateValue; outsideMonth: boolean })}
	<Day
		class={cn(
			isWeekendDay(day) && !outsideMonth && '!text-primary/85',
			outsideMonth && 'opacity-70'
		)}
	/>
{/snippet}

<Popover.Root bind:open>
	<Popover.Trigger
		type="button"
		disabled={disabled}
		class={cn(
			'border-base-300 flex h-11 min-w-0 flex-1 cursor-pointer select-none items-center justify-center gap-2 rounded-lg border px-4 text-[15px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100',
			disabled && 'pointer-events-none opacity-50',
			className
		)}
	>
		<AbstractIcon name={icons.CalendarClock.name} class="size-4 shrink-0" width="16" height="16" />
		<span class="truncate">{labelText}</span>
	</Popover.Trigger>

	<Popover.Content
		side="top"
		align="center"
		sideOffset={12}
		collisionPadding={16}
		class={cn(
			'border-base-300 bg-base-100 text-base-content z-[300] flex w-[min(100vw-2rem,22rem)] max-w-[min(100vw-2rem,22rem)] flex-col gap-3 rounded-2xl border p-4 shadow-xl outline-none'
		)}
		onclick={(e) => e.stopPropagation()}
	>
		<Calendar
			type="single"
			bind:value={calValue as never}
			bind:placeholder={calPlaceholder as never}
			weekStartsOn={1}
			weekdayFormat="short"
			captionLayout="dropdown"
			disableDaysOutsideMonth={false}
			locale="en-US"
			class="w-full"
			day={daySnippet}
		/>
		<div class="flex flex-col gap-1.5">
			<span class="text-base-content/80 text-sm">Pick time</span>
			<input
				type="time"
				bind:value={timeStr}
				disabled={disabled}
				class="border-base-300 bg-base-100 text-base-content focus:ring-primary/40 h-10 w-full rounded-md border px-3 text-sm outline-none focus:ring-2"
			/>
		</div>
		<Button type="button" variant="primary" class="w-full" size="default" onclick={close}>
			Close
		</Button>
	</Popover.Content>
</Popover.Root>
