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

	import {
		registerEditPostGroupHandler,
		registerOpenActionsForPostGroupHandler,
		registerRefreshCalendarHandler,
		triggerOpenActionsForPostGroup
	} from '$lib/posts/SchedulerPresenter.svelte';
	import { icons } from '$data/icons';
	import { socialProviderIcon } from '$data/social-providers';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import DateGridEvent from '$lib/ui/components/calendar-scheduler/DateGridEvent.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import TimeGridEvent from '$lib/ui/components/calendar-scheduler/TimeGridEvent.svelte';
	import MonthGridEvent from '$lib/ui/components/calendar-scheduler/MonthGridEvent.svelte';
	

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
		openActionsForPostGroup?: (postGroup: string, focusPostId?: string, focusIntegrationId?: string) => void;
		onCreatePostAtIso?: (iso: string) => void;
		onRefresh?: () => void;
	};

	let {
		display,
		rangeStartDate,
		events,
		backgroundEvents = [],
		onEditPostGroup,
		openActionsForPostGroup,
		onCreatePostAtIso,
		onRefresh
	}: Props = $props();

	$effect(() => {
		registerEditPostGroupHandler(onEditPostGroup ?? null);
	});

	$effect(() => {
		registerOpenActionsForPostGroupHandler(openActionsForPostGroup ?? null);
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
				defaultView: viewNameForDisplay(display) as DefaultViewName,
				callbacks: {
					onClickDateTime: (dt, e) => {
						// Only act on empty-cell clicks (ignore clicks on an event chip).
						const target = (e?.target ?? null) as HTMLElement | null;
						if (target?.closest?.('[data-post-group]')) return;
						// Ignore the "date passed" shaded background.
						if (target?.closest?.('.sx__time-grid-background-event')) return;

						const now = Temporal.Now.zonedDateTimeISO('UTC');
						const min = now.add({ minutes: 5 });

						// Start of clicked cell hour (UTC), but never earlier than now + 5 minutes.
						let scheduled = dt.with({ minute: 0, second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 });
						if (Temporal.ZonedDateTime.compare(scheduled, min) < 0) {
							scheduled = min.with({ second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 });
						}
						if (Temporal.ZonedDateTime.compare(scheduled, now) <= 0) return;
						openCreatePostAtIsoFromCalendar(scheduled.toInstant().toString());
					}
				}
			},
			[]
		);
	}

	let calendarApp = $state.raw(buildCalendarApp([]));
	let hostEl = $state<HTMLElement | null>(null);
	let lastAppliedGridHeight = $state<number | null>(null);

	type SlotSummaryItem = {
		/** DB post row id — unique per channel row in a multi-channel `post_group`. */
		postId?: string;
		postGroup: string;
		integrationId?: string;
		content: string;
		channelPicture?: string;
		channelName?: string;
		/** Scheduled / publish instant (ISO); shown in the slot dialog */
		publishDate?: string;
		/** DB row state, e.g. DRAFT | QUEUE | PUBLISHED | ERROR */
		state?: string;
		/** Integration `identifier` for platform icon (instagram, facebook, …) */
		channelIdentifier?: string;
	};

	/** Drop duplicate slot rows (same post id or same group+integration); keep one row per channel in a group. */
	function dedupeSlotDialogItems(items: SlotSummaryItem[]): SlotSummaryItem[] {
		const seen = new Set<string>();
		const out: SlotSummaryItem[] = [];
		for (const item of items) {
			const pid = String(item.postId ?? '').trim();
			if (pid) {
				if (seen.has(`id:${pid}`)) continue;
				seen.add(`id:${pid}`);
				out.push(item);
				continue;
			}
			const g = String(item.postGroup ?? '').trim();
			const iid = String(item.integrationId ?? '').trim();
			const key = iid ? `g:${g}|i:${iid}` : `g:${g}|c:${String(item.channelIdentifier ?? '').trim()}`;
			if (seen.has(key)) continue;
			seen.add(key);
			out.push(item);
		}
		return out;
	}

	function formatSlotSummaryTime(iso: string | undefined): string {
		if (!iso || typeof iso !== 'string') return '';
		const ms = Date.parse(iso);
		if (!Number.isFinite(ms)) return '';
		return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	function slotSummaryStatusLine(stateRaw: string | undefined, publishDateIso: string | undefined): string {
		const state = String(stateRaw ?? '').toUpperCase();
		const time = formatSlotSummaryTime(publishDateIso);

		if (state === 'DRAFT') return 'draft';

		if (state === 'PUBLISHED') {
			return time ? `published at ${time}` : 'published';
		}

		if (state === 'ERROR') {
			return 'publish failed';
		}

		// QUEUE and anything schedule-like / unknown with a time
		if (time) return `scheduled at ${time}`;
		return state === 'QUEUE' ? 'scheduled' : '';
	}
	let slotDialogOpen = $state(false);
	let slotDialogItems = $state<SlotSummaryItem[]>([]);

	let createStripVisible = $state(false);
	let createStripTopPx = $state('0px');
	let createStripLeftPx = $state('0px');
	let createStripHeightPx = $state('0px');
	let createStripIso = $state<string | null>(null);
	let createStripHoverKey = $state('');
	let createStripHoverDate = $state('');
	let createStripHoverHour = $state<number | null>(null);

	function clearCreateUi(): void {
		const el = hostEl;
		el?.classList.remove('create-post-hovering');
		el?.removeAttribute('data-create-post-label');
		createStripVisible = false;
		createStripIso = null;
		createStripHoverKey = '';
		createStripHoverDate = '';
		createStripHoverHour = null;
	}

	function openCreatePostAtIsoFromCalendar(iso: string): void {
		clearCreateUi();
		onCreatePostAtIso?.(iso);
	}

	function syncCreateStripPosition(): void {
		const el = hostEl;
		if (!el) return;
		if (!createStripVisible || !createStripIso) return;
		if (!createStripHoverDate || createStripHoverHour == null) return;
		if (display === 'month' || display === 'list') return;

		// If the pinned hover cell becomes fully past (or otherwise invalid), hide the strip.
		try {
			const dt = Temporal.ZonedDateTime.from(
				`${createStripHoverDate}T${String(createStripHoverHour).padStart(2, '0')}:00:00+00:00[UTC]`
			);
			const now = Temporal.Now.zonedDateTimeISO('UTC');
			const cellEnd = dt.add({ hours: 1 });
			if (Temporal.ZonedDateTime.compare(cellEnd, now) <= 0) {
				clearCreateUi();
				return;
			}
		} catch {
			clearCreateUi();
			return;
		}

		const hostRect = el.getBoundingClientRect();
		const headerEl =
			(el.querySelector('.sx__week-grid__date-axis') as HTMLElement | null) ??
			(el.querySelector('.sx__date-axis') as HTMLElement | null);
		const headerBottomPx = headerEl ? headerEl.getBoundingClientRect().bottom - hostRect.top : 0;
		const dayEl = el.querySelector(
			`.sx__time-grid-day[data-time-grid-date="${createStripHoverDate}"]`
		) as HTMLElement | null;
		if (!dayEl) {
			// Hovered day scrolled out of view; don't leave the strip orphaned.
			clearCreateUi();
			return;
		}
		const rect = dayEl.getBoundingClientRect();
		const slotHeight = rect.height / 24;

		const stripW = CREATE_STRIP_WIDTH_PX;
		const stripH = Math.max(24, Math.round(slotHeight));

		let left = Math.round(rect.left - hostRect.left);
		let top = Math.round(rect.top - hostRect.top + createStripHoverHour * slotHeight);

		// Clamp inside the calendar host viewport so it never spills outside on scroll.
		left = Math.max(0, Math.min(left, Math.round(hostRect.width - stripW)));
		top = Math.max(Math.ceil(headerBottomPx), Math.min(top, Math.round(hostRect.height - stripH)));

		createStripLeftPx = `${left}px`;
		createStripTopPx = `${top}px`;
		createStripHeightPx = `${stripH}px`;
	}

	const TIME_GRID_HEIGHT_PX = 3600;
	const CREATE_STRIP_WIDTH_PX = 32;

	$effect(() => {
		// Update Schedule‑X grid height in-place (do NOT destroy/recreate, it breaks rendering).
		// Schedule‑X computes row heights from `weekOptions.gridHeight` and applies them via CSS vars.
		const nextDisplay = display;
		if (nextDisplay === 'month' || nextDisplay === 'list') {
			lastAppliedGridHeight = null;
			return;
		}

		// We bucket posts into a single chip per slot (+N), so the time-grid height can be constant.
		// Schedule‑X default is 1600; we run a denser constant height.
		const gridHeight = TIME_GRID_HEIGHT_PX;
		if (lastAppliedGridHeight === gridHeight) return;

		const app = (calendarApp as any)?.$app;
		const weekOptionsSignal = app?.config?.weekOptions;
		const current = weekOptionsSignal?.value;
		if (!current || typeof current !== 'object') return;
		if (current.gridHeight === gridHeight) return;
		weekOptionsSignal.value = { ...current, gridHeight };
		lastAppliedGridHeight = gridHeight;
	});

	$effect(() => {
		(calendarApp as unknown as CalendarRuntime).events.set(events);
	});

	$effect(() => {
		(calendarApp as unknown as CalendarRuntime).$app.calendarEvents.backgroundEvents.value = backgroundEvents;
	});

	$effect(() => {
		const view = viewNameForDisplay(display);
		const date = selectedPlainDateFromProps();
		const app = calendarApp as unknown as CalendarRuntime;
		app.$app.calendarState.setView(view as DefaultViewName, date);

		// Week/day columns (`createWeek` in Schedule‑X) follow `datePickerState.selectedDate`, while toolbar
		// navigation only updates `rangeStartDate` → `setView` → `calendarState.range`. If those diverge,
		// `data-time-grid-date` stays on the previous week and create-strip positioning/querySelector fails.
		const dpSelected = (app.$app as { datePickerState?: { selectedDate?: { value: Temporal.PlainDate } } })
			.datePickerState?.selectedDate;
		const cur = dpSelected?.value;
		if (cur && !date.equals(cur)) {
			dpSelected!.value = date;
		}
	});

	onMount(() => {
		const el = hostEl;
		if (!el) return;

		const onClick = (ev: MouseEvent) => {
			const target = ev.target as HTMLElement | null;

			// Plus strip on an event chip: schedule a new post for that slot.
			const add = target?.closest?.('[data-create-post-at-iso]') as HTMLElement | null;
			if (add && onCreatePostAtIso) {
				const rawIso = add.dataset.createPostAtIso ?? '';
				if (rawIso) {
					const ms = Date.parse(rawIso);
					if (Number.isFinite(ms)) {
						const dt = Temporal.Instant.from(new Date(ms).toISOString()).toZonedDateTimeISO('UTC');
						const now = Temporal.Now.zonedDateTimeISO('UTC');
						const min = now.add({ minutes: 5 });
						let scheduled = dt.with({ minute: 0, second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 });
						if (Temporal.ZonedDateTime.compare(scheduled, min) < 0) {
							scheduled = min.with({ second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 });
						}
						if (Temporal.ZonedDateTime.compare(scheduled, now) > 0) {
							openCreatePostAtIsoFromCalendar(scheduled.toInstant().toString());
							ev.preventDefault();
							ev.stopPropagation();
							return;
						}
					}
				}
			}

			// If a time cell is visually "full" (event chip covers it), allow Shift+click on the chip to create a new post
			// at that hovered hour. This preserves normal click-to-open-actions behavior.
			if (ev.shiftKey && onCreatePostAtIso && target?.closest?.('[data-post-group]')) {
				const dayEl = target?.closest?.('.sx__time-grid-day') as HTMLElement | null;
				if (dayEl && !target?.closest?.('.sx__time-grid-background-event')) {
					const dateStr = dayEl.getAttribute('data-time-grid-date') ?? '';
					if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
						const rect = dayEl.getBoundingClientRect();
						const y = ev.clientY - rect.top;
						const frac = Math.min(1, Math.max(0, y / rect.height));
						const minutes = Math.floor(frac * 24 * 60);
						const hour = Math.min(23, Math.max(0, Math.floor(minutes / 60)));
						const dt = Temporal.ZonedDateTime.from(
							`${dateStr}T${String(hour).padStart(2, '0')}:00:00+00:00[UTC]`
						);
						const now = Temporal.Now.zonedDateTimeISO('UTC');
						const cellEnd = dt.add({ hours: 1 });
						if (Temporal.ZonedDateTime.compare(cellEnd, now) <= 0) return;
						const min = now.add({ minutes: 5 });
						let scheduled = dt;
						if (Temporal.ZonedDateTime.compare(scheduled, min) < 0) {
							scheduled = min.with({ second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 });
						}
						if (Temporal.ZonedDateTime.compare(scheduled, now) > 0) {
							openCreatePostAtIsoFromCalendar(scheduled.toInstant().toString());
							ev.preventDefault();
							ev.stopPropagation();
							return;
						}
					}
				}
			}
			const multiChip = target?.closest?.('[data-multi-post="true"]') as HTMLElement | null;
			if (multiChip) {
				const raw = multiChip.dataset?.slotSummary ?? '';
				if (raw) {
					try {
						const decoded = decodeURIComponent(raw);
						const parsed = JSON.parse(decoded);
						if (Array.isArray(parsed) && parsed.length) {
							slotDialogItems = dedupeSlotDialogItems(parsed as SlotSummaryItem[]);
							slotDialogOpen = true;
							ev.preventDefault();
							ev.stopPropagation();
							return;
						}
					} catch {
						// ignore malformed payload
					}
				}
				// If multi-chip has no payload, do nothing.
				return;
			}
			const chip = target?.closest?.('[data-post-group]') as HTMLElement | null;
			const postGroup = chip?.dataset?.postGroup ?? '';
			if (postGroup) {
				ev.preventDefault();
				ev.stopPropagation();
				const focusId = String(chip?.dataset?.postId ?? '').trim();
				const focusInt = String(chip?.dataset?.integrationId ?? '').trim();
				openActionsForPostGroup?.(postGroup, focusId || undefined, focusInt || undefined);
			}
		};

		const setXY = (ev: MouseEvent) => {
			const rect = el.getBoundingClientRect();
			const x = ev.clientX - rect.left;
			const y = ev.clientY - rect.top;
			el.style.setProperty('--date-passed-x', `${x}px`);
			el.style.setProperty('--date-passed-y', `${y}px`);
		};

		const clearCreateHover = () => {
			clearCreateUi();
		};

		const setCreateHover = (ev: MouseEvent, label: string) => {
			const rect = el.getBoundingClientRect();
			const x = ev.clientX - rect.left;
			const y = ev.clientY - rect.top;
			el.style.setProperty('--create-post-x', `${x}px`);
			el.style.setProperty('--create-post-y', `${y}px`);
			el.dataset.createPostLabel = label;
			el.classList.add('create-post-hovering');
		};

		function maybeCreatePostHover(ev: MouseEvent): void {
			const target = ev.target as HTMLElement | null;
			// Only for time grid day/week.
			if (display === 'month' || display === 'list') return clearCreateHover();
			// Do not show over the calendar header.
			if (target?.closest?.('.sx__week-grid__date-axis')) return clearCreateHover();
			// Do not show on "date passed" shading.
			if (target?.closest?.('.sx__time-grid-background-event')) return clearCreateHover();
			const dayEl = target?.closest?.('.sx__time-grid-day') as HTMLElement | null;
			if (!dayEl) return clearCreateHover();

			const dateStr = dayEl.getAttribute('data-time-grid-date') ?? '';
			if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return clearCreateHover();

			const rect = dayEl.getBoundingClientRect();
			const y = ev.clientY - rect.top;
			const frac = Math.min(1, Math.max(0, y / rect.height));
			const minutes = Math.floor(frac * 24 * 60);
			const hour = Math.min(23, Math.max(0, Math.floor(minutes / 60)));
			const slotHeight = rect.height / 24;
			const hoverKey = `${dateStr}|${hour}`;

			const now = Temporal.Now.zonedDateTimeISO('UTC');
			const min = now.add({ minutes: 5 });
			const dt = Temporal.ZonedDateTime.from(`${dateStr}T${String(hour).padStart(2, '0')}:00:00+00:00[UTC]`);

			// Never show the create affordance for hour-cells that are fully in the past.
			// If we're partway through the current hour, keep it available (we'll clamp to now+5m below).
			const cellEnd = dt.add({ hours: 1 });
			if (Temporal.ZonedDateTime.compare(cellEnd, now) <= 0) return clearCreateHover();

			let scheduled = dt;
			if (Temporal.ZonedDateTime.compare(scheduled, min) < 0) {
				scheduled = min.with({ second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 });
			}
			if (Temporal.ZonedDateTime.compare(scheduled, now) <= 0) return clearCreateHover();

			const localLabel = new Date(scheduled.toInstant().toString()).toLocaleTimeString([], {
				hour: '2-digit',
				minute: '2-digit'
			});
			const isOverEvent = Boolean(target?.closest?.('[data-post-group]'));
			setCreateHover(
				ev,
				isOverEvent ? `Shift+click to schedule (${localLabel})` : `Schedule at (${localLabel})`
			);

			// Outer left "+": align to the hovered hour row, on the far left of the time grid.
			if (onCreatePostAtIso) {
				const hostRect = el?.getBoundingClientRect();
				if (!hostRect) return;
				if (hoverKey !== createStripHoverKey) {
					createStripHoverKey = hoverKey;
					createStripHoverDate = dateStr;
					createStripHoverHour = hour;
					createStripLeftPx = `${Math.round(rect.left - hostRect.left)}px`;
					createStripTopPx = `${Math.round(rect.top - hostRect.top + hour * slotHeight)}px`;
					createStripHeightPx = `${Math.max(24, Math.round(slotHeight))}px`;
					createStripIso = scheduled.toInstant().toString();
					createStripVisible = true;
				}
				// Keep it clamped even when hovering near edges.
				syncCreateStripPosition();
			}
		}

		const onMove = (ev: MouseEvent) => {
			const target = ev.target as HTMLElement | null;
			const bg = target?.closest?.('.sx__time-grid-background-event') as HTMLElement | null;
			if (bg) setXY(ev);
			maybeCreatePostHover(ev);
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

		let raf = 0;
		const scheduleSync = () => {
			if (raf) return;
			raf = window.requestAnimationFrame(() => {
				raf = 0;
				syncCreateStripPosition();
			});
		};

		// Schedule-X scroll container can vary by view/build; listen on a few candidates so the
		// pinned create strip can't get "stuck" when scrolling without moving the mouse.
		const scrollEls = new Set<HTMLElement>();
		const addScrollEl = (n: Element | null) => {
			if (n && n instanceof HTMLElement) scrollEls.add(n);
		};
		addScrollEl(el.querySelector('.sx-svelte-calendar-wrapper'));
		addScrollEl(el.querySelector('.sx__calendar-wrapper'));
		addScrollEl(el.querySelector('.sx__week-grid'));
		addScrollEl(el.querySelector('.sx__time-grid'));
		addScrollEl(el); // capture scrolls from nested elements

		for (const s of scrollEls) {
			s.addEventListener('scroll', scheduleSync, { passive: true, capture: true } as AddEventListenerOptions);
			// Track wheel/touch scrolling too (some containers don't emit scroll the way we expect).
			s.addEventListener('wheel', scheduleSync, { passive: true, capture: true } as AddEventListenerOptions);
			s.addEventListener('touchmove', scheduleSync, { passive: true, capture: true } as AddEventListenerOptions);
		}
		window.addEventListener('resize', scheduleSync);

		return () => {
			clearCreateHover();
			el.removeEventListener('mousemove', onMove);
			el.removeEventListener('mouseover', onOver);
			el.removeEventListener('mouseout', onOut);
			el.removeEventListener('click', onClick, true);
			for (const s of scrollEls) {
				s.removeEventListener('scroll', scheduleSync as any, true as any);
				s.removeEventListener('wheel', scheduleSync as any, true as any);
				s.removeEventListener('touchmove', scheduleSync as any, true as any);
			}
			window.removeEventListener('resize', scheduleSync);
			if (raf) window.cancelAnimationFrame(raf);
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

	{#if createStripVisible && createStripIso}
		<button
			type="button"
			class="oq-create-strip bg-primary text-primary-content"
			style={`left:${createStripLeftPx};top:${createStripTopPx};height:${createStripHeightPx};width:${CREATE_STRIP_WIDTH_PX}px;`}
			aria-label="Schedule a new post"
			onclick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				openCreatePostAtIsoFromCalendar(createStripIso!);
			}}
		>
			<AbstractIcon name={icons.Plus.name} class="size-4" width="16" height="16" />
		</button>
	{/if}
</div>

<Dialog.Root bind:open={slotDialogOpen} onOpenChange={(o) => (!o ? (slotDialogItems = []) : null)}>
	<Dialog.Content class="max-w-md p-0" showCloseButton={true}>
		<div class="border-b border-base-300 px-4 py-3">
			<div class="text-base font-semibold text-base-content">
				Posts in this slot
			</div>
			<div class="text-xs text-base-content/60">
				{slotDialogItems.length} posts</div>
		</div>
		<div class="max-h-[60vh] overflow-auto p-2">
			{#each slotDialogItems as item, idx (`${String(item.postId ?? item.integrationId ?? '')}:${String(item.postGroup ?? '')}:${idx}`)}
				{@const statusLine = slotSummaryStatusLine(item.state, item.publishDate)}
				{@const channelIconName = socialProviderIcon(item.channelIdentifier)}
				<button
					type="button"
					class="hover:bg-base-200/60 grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-3 rounded px-3 py-2 text-start outline-none"
					onclick={() => {
						if (!item.postGroup) return;
						slotDialogOpen = false;
						const rowPostId = String(item.postId ?? '').trim();
						const rowInt = String(item.integrationId ?? '').trim();
						triggerOpenActionsForPostGroup(
							item.postGroup,
							rowPostId || undefined,
							rowInt || undefined
						);
					}}
				>
					<div class="flex min-w-0 items-start gap-3">
						<div class="relative mt-0.5 h-9 w-9 shrink-0">
							{#if item.channelPicture}
								<img src={item.channelPicture} alt="" class="h-9 w-9 rounded-md object-cover" />
							{:else}
								<div class="flex h-9 w-9 items-center justify-center rounded-md bg-base-200 text-[10px] font-semibold text-base-content/60">
									{(item.channelName || 'CH').slice(0, 2).toUpperCase()}
								</div>
							{/if}
							<span
								class="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-base-100 text-base-content shadow-sm ring-1 ring-base-300"
								aria-hidden="true"
							>
								<AbstractIcon name={channelIconName} class="size-3.5" width="14" height="14" />
							</span>
						</div>
						<div class="min-w-0">
							<div class="text-xs font-semibold text-base-content/70">
								{item.channelName || 'Channel'}
							</div>
							<div class="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-base-content/90">
								{item.content || 'No content'}
							</div>
						</div>
					</div>
					{#if statusLine}
						<div class="pointer-events-none max-w-[min(100%,11rem)] justify-self-center px-1 text-center text-xs leading-snug text-base-content/65">
							{statusLine}
						</div>
					{:else}
						<div aria-hidden="true"></div>
					{/if}
					<div class="justify-self-end text-xs text-base-content/50">
						Open</div>
				</button>
			{/each}
		</div>
	</Dialog.Content>
</Dialog.Root>

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

		/*
		  Schedule-X ships light/dark tokens under `:root` and `.is-dark`. This app themes via
		  `html[data-theme]` (DaisyUI), so bridge SX variables to DaisyUI semantic colors here.
		*/
		--sx-color-background: var(--color-base-100);
		--sx-color-on-background: var(--color-base-content);
		--sx-color-surface: var(--color-base-100);
		--sx-color-surface-dim: color-mix(in oklab, var(--color-base-content) 7%, var(--color-base-100));
		--sx-color-surface-bright: var(--color-base-200);
		--sx-color-on-surface: var(--color-base-content);
		--sx-color-surface-container: var(--color-base-200);
		--sx-color-surface-container-low: var(--color-base-100);
		--sx-color-surface-container-high: var(--color-base-300);
		--sx-color-outline: color-mix(in oklab, var(--color-base-content) 38%, transparent);
		--sx-color-outline-variant: color-mix(in oklab, var(--color-base-content) 14%, transparent);
		--sx-color-neutral: color-mix(in oklab, var(--color-base-content) 52%, transparent);
		--sx-color-neutral-variant: color-mix(in oklab, var(--color-base-content) 38%, transparent);
		--sx-color-primary: var(--color-primary);
		--sx-color-on-primary: var(--color-primary-content);
		--sx-color-primary-container: color-mix(in oklab, var(--color-primary) 28%, var(--color-base-100));
		--sx-color-on-primary-container: var(--color-base-content);
		--sx-color-secondary: var(--color-secondary);
		--sx-color-on-secondary: var(--color-secondary-content);
		--sx-color-secondary-container: color-mix(in oklab, var(--color-secondary) 24%, var(--color-base-100));
		--sx-color-on-secondary-container: var(--color-base-content);
		--sx-color-tertiary: var(--color-accent);
		--sx-color-on-tertiary: var(--color-accent-content);
		--sx-color-tertiary-container: color-mix(in oklab, var(--color-accent) 24%, var(--color-base-100));
		--sx-color-on-tertiary-container: var(--color-base-content);
		--sx-color-surface-tint: var(--color-primary);
		--sx-internal-color-text: var(--color-base-content);
		--sx-internal-color-gray-ripple-background: color-mix(
			in oklab,
			var(--color-base-content) 12%,
			var(--color-base-100)
		);
		--sx-internal-color-light-gray: var(--color-base-200);

		/* Past-range background events (Scheduler.svelte inline styles reference these) */
		--oq-cal-past-overlay: color-mix(in oklab, var(--color-base-content) 16%, var(--color-base-100));
		--oq-cal-past-stripe-strong: color-mix(in oklab, var(--color-base-content) 11%, transparent);
		--oq-cal-past-stripe-weak: color-mix(in oklab, var(--color-base-content) 5%, transparent);
	}

	.schedule-x-calendar-host :global(.sx__calendar-header) {
		display: none;
	}

	.schedule-x-calendar-host :global(.sx-svelte-calendar-wrapper) {
		width: 100%;
		height: min(900px, 78vh);
	}

	.oq-create-strip {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0 8px 8px 0;
		/* Keep below modal dialogs (Create Post / Edit) */
		z-index: 20;
		opacity: 0.98;
		pointer-events: auto;
		min-height: 24px;
		box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
		border: 1px solid rgba(255, 255, 255, 0.18);
	}

	.oq-create-strip:hover {
		opacity: 1;
	}

	/*
	  IMPORTANT:
	  Allowing time-grid events to overflow makes adjacent slots overlap visually (e.g. 10:45 bucket vs 11:00 bucket).
	  We keep Schedule‑X’s default clipping so each event stays within its slot height.
	*/

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
		/* Above the create-strip (+) but below dialogs */
		z-index: 30;
	}

	:global(.schedule-x-calendar-host.create-post-hovering)::before {
		content: attr(data-create-post-label);
		position: absolute;
		left: var(--create-post-x, 50%);
		top: var(--create-post-y, 50%);
		transform: translate(-50%, -140%);
		padding: 0.25rem 0.5rem;
		border-radius: 0.5rem;
		background: rgba(0, 0, 0, 0.65);
		border: 1px solid rgba(255, 255, 255, 0.12);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
		pointer-events: none;
		white-space: nowrap;
		font-weight: 600;
		font-size: 0.8rem;
		letter-spacing: 0.02em;
		color: rgba(255, 255, 255, 0.8);
		/* Above the create-strip (+) but below dialogs */
		z-index: 30;
	}
</style>

