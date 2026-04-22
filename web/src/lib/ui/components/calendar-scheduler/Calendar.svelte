<script lang="ts">
	import type { CalendarEventExternal } from '@schedule-x/calendar';
	import type { CalendarDisplayViewModel } from '$lib/posts';

	import 'temporal-polyfill/global';
	import { onDestroy, onMount } from 'svelte';
	import { ScheduleXCalendar as ScheduleXCalendarHost } from '@schedule-x/svelte';
	import {
		createCalendar,
		createViewDay,
		createViewWeek,
		createViewMonthGrid,
		createViewList,
	} from '@schedule-x/calendar';
	import '@schedule-x/theme-default/dist/index.css';

	import TimeGridEvent from '$lib/ui/components/calendar-scheduler/TimeGridEvent.svelte';
	import DateGridEvent from '$lib/ui/components/calendar-scheduler/DateGridEvent.svelte';
	import MonthGridEvent from '$lib/ui/components/calendar-scheduler/MonthGridEvent.svelte';
	import {
		registerEditPostGroupHandler,
		registerRefreshCalendarHandler
	} from '$lib/posts/SchedulerPresenter.svelte';

	type CreateCalendarConfig = Parameters<typeof createCalendar>[0];
	type DefaultViewName = NonNullable<CreateCalendarConfig['defaultView']>;

	type BackgroundEvent = {
		start: Temporal.PlainDate | Temporal.ZonedDateTime;
		end: Temporal.PlainDate | Temporal.ZonedDateTime;
		style: Record<string, string | number>;
		title?: string;
	};

	type Props = {
		display: CalendarDisplayViewModel;
		rangeStartDate: string;
		events: CalendarEventExternal[];
		backgroundEvents?: BackgroundEvent[];
		onEditPostGroup?: (postGroup: string) => void;
		openActionsForPostGroup?: (postGroup: string) => void;
		onRefresh?: () => void;
	};

	let {
		display,
		rangeStartDate,
		events,
		backgroundEvents = [],
		onEditPostGroup,
		openActionsForPostGroup,
		onRefresh
	}: Props = $props();

	$effect(() => {
		registerEditPostGroupHandler(onEditPostGroup ?? null);
	});

	$effect(() => {
		registerRefreshCalendarHandler(onRefresh ?? null);
	});

	type CalendarRuntime = {
		events: { set: (next: CalendarEventExternal[]) => void };
		destroy: () => void;
		$app: {
			calendarState: {
				setView: (view: DefaultViewName, selectedDate: Temporal.PlainDate) => void;
			};
			calendarEvents: {
				backgroundEvents: { value: BackgroundEvent[] };
			};
		};
	};

	type AnyView = ReturnType<typeof createViewDay>;

	const views: [AnyView, ...AnyView[]] = [
		createViewDay(),
		createViewWeek(),
		createViewMonthGrid(),
		createViewList()
	];

	function viewNameForDisplay(d: CalendarDisplayViewModel): string {
		if (d === 'month') return 'month-grid';
		return d;
	}

	function selectedPlainDateFromProps(): Temporal.PlainDate {
		if (/^\d{4}-\d{2}-\d{2}$/.test(rangeStartDate)) {
			return Temporal.PlainDate.from(rangeStartDate);
		}
		return Temporal.Now.plainDateISO('UTC');
	}

	function buildCalendarApp(initialEvents: CalendarEventExternal[]) {
		return createCalendar(
			{
				timezone: 'UTC',
				views,
				events: initialEvents,
				backgroundEvents,
				selectedDate: selectedPlainDateFromProps(),
				defaultView: viewNameForDisplay(display) as DefaultViewName
			},
			[]
		);
	}

	let calendarApp = $state.raw(buildCalendarApp([]));
	let hostEl = $state<HTMLElement | null>(null);

	$effect(() => {
		(calendarApp as unknown as CalendarRuntime).events.set(events);
	});

	$effect(() => {
		(calendarApp as unknown as CalendarRuntime).$app.calendarEvents.backgroundEvents.value = backgroundEvents;
	});

	$effect(() => {
		const view = viewNameForDisplay(display);
		const date = selectedPlainDateFromProps();
		(calendarApp as unknown as CalendarRuntime).$app.calendarState.setView(view as DefaultViewName, date);
	});

	onMount(() => {
		const el = hostEl;
		if (!el) return;

		const onClick = (ev: MouseEvent) => {
			const target = ev.target as HTMLElement | null;
			const chip = target?.closest?.('[data-post-group]') as HTMLElement | null;
			const postGroup = chip?.dataset?.postGroup ?? '';
			if (postGroup) {
				ev.preventDefault();
				ev.stopPropagation();
				openActionsForPostGroup?.(postGroup);
			}
		};

		const setXY = (ev: MouseEvent) => {
			const rect = el.getBoundingClientRect();
			const x = ev.clientX - rect.left;
			const y = ev.clientY - rect.top;
			el.style.setProperty('--date-passed-x', `${x}px`);
			el.style.setProperty('--date-passed-y', `${y}px`);
		};

		const onMove = (ev: MouseEvent) => {
			const target = ev.target as HTMLElement | null;
			const bg = target?.closest?.('.sx__time-grid-background-event') as HTMLElement | null;
			if (!bg) return;
			setXY(ev);
		};

		const onOver = (ev: MouseEvent) => {
			const target = ev.target as HTMLElement | null;
			const bg = target?.closest?.('.sx__time-grid-background-event') as HTMLElement | null;
			if (!bg) return;
			el.classList.add('date-passed-hovering');
			setXY(ev);
		};

		const onOut = (ev: MouseEvent) => {
			const target = ev.target as HTMLElement | null;
			const bg = target?.closest?.('.sx__time-grid-background-event') as HTMLElement | null;
			if (!bg) return;
			el.classList.remove('date-passed-hovering');
		};

		el.addEventListener('mousemove', onMove);
		el.addEventListener('mouseover', onOver);
		el.addEventListener('mouseout', onOut);
		el.addEventListener('click', onClick, true);

		return () => {
			el.removeEventListener('mousemove', onMove);
			el.removeEventListener('mouseover', onOver);
			el.removeEventListener('mouseout', onOut);
			el.removeEventListener('click', onClick, true);
		};
	});

	onDestroy(() => {
		registerEditPostGroupHandler(null);
		registerRefreshCalendarHandler(null);
		(calendarApp as unknown as CalendarRuntime).destroy();
	});
</script>

<div bind:this={hostEl} class="schedule-x-calendar-host w-full">
	<ScheduleXCalendarHost
		{calendarApp}
		timeGridEvent={TimeGridEvent}
		dateGridEvent={DateGridEvent}
		monthGridEvent={MonthGridEvent}
	/>
</div>

<style>
	/*
	  Schedule-X theme sets --sx-z-index-week-header to 100 on :root. Our dialogs use z-50 (50),
	  so sticky week/day headers were painting above Create Post and other modals.
	  Scoped overrides keep internal stacking order while staying below the dialog layer.
	*/
	.schedule-x-calendar-host {
		--sx-z-index-week-header: 10;
		--sx-z-index-event-modal: 20;
		--sx-calendar-header-popup-z-index: 15;
		position: relative;
	}

	.schedule-x-calendar-host :global(.sx__calendar-header) {
		display: none;
	}

	.schedule-x-calendar-host :global(.sx-svelte-calendar-wrapper) {
		width: 100%;
		height: min(900px, 78vh);
	}

	/* Shade past time cells and show a hover label. */
	.schedule-x-calendar-host :global(.sx__time-grid-background-event) {
		pointer-events: auto;
		cursor: not-allowed;
	}

	:global(.schedule-x-calendar-host.date-passed-hovering)::after {
		content: 'Date passed';
		position: absolute;
		left: var(--date-passed-x, 50%);
		top: var(--date-passed-y, 50%);
		transform: translate(-50%, -120%);
		padding: 0.25rem 0.5rem;
		border-radius: 0.5rem;
		background: rgba(0, 0, 0, 0.65);
		border: 1px solid rgba(255, 255, 255, 0.12);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
		pointer-events: none;
		white-space: nowrap;
		font-weight: 600;
		font-size: 0.875rem;
		letter-spacing: 0.02em;
		color: rgba(255, 255, 255, 0.75);
		z-index: 2;
	}
</style>

