<script lang="ts">
	import type { CalendarDisplay, CalendarGranularity, CalendarLayoutMode, ChannelVm } from './types';
	import type { CalendarEventExternal } from '@schedule-x/calendar';

	import { postsRepository } from '$lib/posts';
	import { toast } from '$lib/ui/sonner';
	import { deriveCalendarIntegrationFilter } from './calendarIntegrationFilter';
	import { CALENDAR_UNGROUPED_SENTINEL } from './types';
	import { isoToUtcZdt } from './scheduleXTemporal';
	import CalendarGroupFilter from './CalendarGroupFilter.svelte';
	import CalendarFilters from './CalendarFilters.svelte';
	import Calendar from './Calendar.svelte';

	type BackgroundEvent = {
		start: Temporal.PlainDate | Temporal.ZonedDateTime;
		end: Temporal.PlainDate | Temporal.ZonedDateTime;
		style: Record<string, string | number>;
		title?: string;
	};

	type Props = {
		organizationId: string;
		channels: ChannelVm[];
		groupId?: string | null;
		refreshKey?: string | number;
		onTargetedChannelsChange?: (channels: ChannelVm[]) => void;
	};

	let { organizationId, channels, groupId = null, refreshKey = 0, onTargetedChannelsChange }: Props = $props();

	let granularity = $state<CalendarGranularity>('week');
	let layoutMode = $state<CalendarLayoutMode>('calendar');
	let allGroups = $state(true);
	let selectedGroupIds = $state<string[]>([]);
	let rangeStartDate = $state<string>('');
	let rangeEndDate = $state<string>('');
	let loading = $state(false);

	let prevUrlGroupId = $state<string | null | undefined>(undefined);

	/** Avoid duplicate `listPosts` calls when params match the last successful fetch (e.g. Schedule-X range churn). */
	let lastSuccessfulPostsKey = $state('');

	const display = $derived<CalendarDisplay>(layoutMode === 'list' ? 'list' : granularity);

	// schedule-x events (untyped: schedule-x event allows arbitrary extra props)
	let events = $state<CalendarEventExternal[]>([]);

	const backgroundEvents = $derived.by<BackgroundEvent[]>(() => {
		if (layoutMode !== 'calendar') return [];
		if (!rangeStartDate || !rangeEndDate) return [];
		// Month grid doesn't have "time cells" to shade.
		if (granularity === 'month') return [];

		const now = Temporal.Now.zonedDateTimeISO('UTC');
		const startD = new Date(`${rangeStartDate}T00:00:00Z`);
		const endD = new Date(`${rangeEndDate}T00:00:00Z`);
		if (Number.isNaN(startD.getTime()) || Number.isNaN(endD.getTime())) return [];

		const out: BackgroundEvent[] = [];
		for (let d = new Date(startD); d <= endD; d.setUTCDate(d.getUTCDate() + 1)) {
			const yyyy = d.getUTCFullYear();
			const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
			const dd = String(d.getUTCDate()).padStart(2, '0');
			const dayStart = Temporal.ZonedDateTime.from(`${yyyy}-${mm}-${dd}T00:00:00+00:00[UTC]`);
			const dayEnd = dayStart.add({ days: 1 });
			if (Temporal.ZonedDateTime.compare(now, dayStart) <= 0) continue;

			const end = Temporal.ZonedDateTime.compare(now, dayEnd) >= 0 ? dayEnd : now;
			if (Temporal.ZonedDateTime.compare(end, dayStart) <= 0) continue;

			out.push({
				start: dayStart,
				end,
				title: 'Date passed',
				style: {
					backgroundImage:
						'repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 8px, rgba(255,255,255,0.02) 8px, rgba(255,255,255,0.02) 16px)',
					backgroundColor: 'rgba(0,0,0,0.25)'
				}
			});
		}
		return out;
	});

	function yyyyMmDd(d: Date): string {
		const pad = (n: number) => String(n).padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
	}

	function today(): string {
		return yyyyMmDd(new Date());
	}

	function startOfIsoWeek(dateStr: string): string {
		const d = new Date(`${dateStr}T00:00:00Z`);
		// Convert Sunday=0 to 7
		const day = d.getUTCDay() === 0 ? 7 : d.getUTCDay();
		d.setUTCDate(d.getUTCDate() - (day - 1));
		return yyyyMmDd(d);
	}

	function endOfIsoWeek(dateStr: string): string {
		const d = new Date(`${startOfIsoWeek(dateStr)}T00:00:00Z`);
		d.setUTCDate(d.getUTCDate() + 6);
		return yyyyMmDd(d);
	}

	function startOfMonth(dateStr: string): string {
		const d = new Date(`${dateStr}T00:00:00Z`);
		const first = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
		return yyyyMmDd(first);
	}

	function endOfMonth(dateStr: string): string {
		const d = new Date(`${dateStr}T00:00:00Z`);
		const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
		return yyyyMmDd(last);
	}

	function setInitialRangeForGranularity(next: CalendarGranularity) {
		const base = today();
		if (next === 'day') {
			rangeStartDate = base;
			rangeEndDate = base;
		} else if (next === 'week') {
			rangeStartDate = startOfIsoWeek(base);
			rangeEndDate = endOfIsoWeek(base);
		} else {
			rangeStartDate = startOfMonth(base);
			rangeEndDate = endOfMonth(base);
		}
	}

	$effect(() => {
		if (!rangeStartDate || !rangeEndDate) {
			setInitialRangeForGranularity(granularity);
		}
	});

	$effect(() => {
		const g = groupId ?? null;
		if (prevUrlGroupId === g) return;
		prevUrlGroupId = g;
		if (g) {
			allGroups = false;
			selectedGroupIds = [g];
		} else {
			allGroups = true;
			selectedGroupIds = [];
		}
	});

	$effect(() => {
		// When "All groups" is active, keep selection populated so the UI can render badges
		// and allow unchecking a single group without first switching modes.
		if (!allGroups) return;
		if (!channels.length) return;
		if (selectedGroupIds.length) return;
		const ids: string[] = [];
		const seen = new Set<string>();
		let hasUngrouped = false;
		for (const c of channels) {
			if (!c.group?.id) {
				hasUngrouped = true;
				continue;
			}
			if (seen.has(c.group.id)) continue;
			seen.add(c.group.id);
			ids.push(c.group.id);
		}
		ids.sort((a, b) => a.localeCompare(b));
		if (hasUngrouped) ids.push(CALENDAR_UNGROUPED_SENTINEL);
		selectedGroupIds = ids;
	});

	$effect(() => {
		refreshKey;
		allGroups;
		selectedGroupIds;
		channels;
		void loadRange({ startDate: rangeStartDate, endDate: rangeEndDate });
	});

	const channelById = $derived.by(() => {
		const m = new Map<string, ChannelVm>();
		for (const c of channels) m.set(c.id, c);
		return m;
	});

	function onGroupFilterChange(next: { allGroups: boolean; selectedGroupIds: string[] }) {
		allGroups = next.allGroups;
		selectedGroupIds = next.selectedGroupIds;
	}

	const targetedChannels = $derived.by(() => {
		const filt = deriveCalendarIntegrationFilter(channels, allGroups, selectedGroupIds);
		if (filt.kind === 'none') return [];
		if (filt.kind === 'all') return channels;
		const ids = new Set(filt.integrationIds);
		return channels.filter((c) => ids.has(c.id));
	});

	$effect(() => {
		onTargetedChannelsChange?.(targetedChannels);
	});

	async function loadRange({ startDate, endDate }: { startDate: string; endDate: string }) {
		rangeStartDate = startDate;
		rangeEndDate = endDate;

		const filt = deriveCalendarIntegrationFilter(channels, allGroups, selectedGroupIds);
		if (filt.kind === 'none') {
			events = [];
			lastSuccessfulPostsKey = `none|${startDate}|${endDate}|${refreshKey}`;
			return;
		}
		const integrationIds = filt.kind === 'all' ? null : filt.integrationIds;
		const idsKey = integrationIds?.length ? [...integrationIds].sort().join(',') : 'all';
		const requestKey = `${refreshKey}|${startDate}|${endDate}|${idsKey}`;
		if (requestKey === lastSuccessfulPostsKey) {
			return;
		}

		loading = true;
		try {
			const startIso = new Date(`${startDate}T00:00:00.000Z`).toISOString();
			const endIso = new Date(`${endDate}T23:59:59.999Z`).toISOString();

			const r = await postsRepository.listPosts({
				organizationId,
				startIso,
				endIso,
				integrationIds
			});

			if (!r.ok) {
				toast.error(r.error);
				events = [];
				lastSuccessfulPostsKey = '';
				return;
			}

			lastSuccessfulPostsKey = requestKey;

			events = r.posts
				.filter((p) => typeof p.publishDate === 'string' && p.publishDate.length > 0)
				.map((p) => {
					const zdt = isoToUtcZdt(p.publishDate);
					// Display duration for Schedule‑X layout (OpenQuok-like cards need more vertical room).
					const end = zdt.add({ minutes: 60 });
					const channel = p.integrationId ? channelById.get(p.integrationId) : null;
					const title = channel ? channel.name : 'Draft';
					return {
						id: p.id,
						title,
						start: zdt,
						end,
						channel,
						post: p
					};
				});
		} finally {
			loading = false;
		}
	}

	function labelForRange(): string {
		if (!rangeStartDate || !rangeEndDate) return '';
		const fmt = (yyyyMmDd: string) => {
			const [y, m, d] = yyyyMmDd.split('-').map((x) => Number(x));
			if (!y || !m || !d) return yyyyMmDd;
			// Match the product reference: MM/DD/YYYY (stable, calendar-navigation label).
			const mm = String(m).padStart(2, '0');
			const dd = String(d).padStart(2, '0');
			return `${mm}/${dd}/${y}`;
		};

		if (granularity === 'month') return rangeStartDate.slice(0, 7);
		if (granularity === 'day') return fmt(rangeStartDate);
		return `${fmt(rangeStartDate)} → ${fmt(rangeEndDate)}`;
	}

	function shiftRange(delta: number) {
		if (!rangeStartDate) return;
		const start = new Date(`${rangeStartDate}T00:00:00Z`);
		if (granularity === 'day') {
			start.setUTCDate(start.getUTCDate() + delta);
			const d = yyyyMmDd(start);
			void loadRange({ startDate: d, endDate: d });
			return;
		}
		if (granularity === 'week') {
			start.setUTCDate(start.getUTCDate() + delta * 7);
			const base = yyyyMmDd(start);
			void loadRange({ startDate: startOfIsoWeek(base), endDate: endOfIsoWeek(base) });
			return;
		}
		// month
		start.setUTCMonth(start.getUTCMonth() + delta);
		const base = yyyyMmDd(start);
		void loadRange({ startDate: startOfMonth(base), endDate: endOfMonth(base) });
	}

	function setGranularity(next: CalendarGranularity) {
		granularity = next;
		setInitialRangeForGranularity(next);
		void loadRange({ startDate: rangeStartDate, endDate: rangeEndDate });
	}

	function setLayoutMode(next: CalendarLayoutMode) {
		layoutMode = next;
		void loadRange({ startDate: rangeStartDate, endDate: rangeEndDate });
	}

	function goToday() {
		setInitialRangeForGranularity(granularity);
		void loadRange({ startDate: rangeStartDate, endDate: rangeEndDate });
	}
</script>

<div class="space-y-3">
	<CalendarFilters
		{granularity}
		{layoutMode}
		label={labelForRange()}
		onToday={goToday}
		onPrev={() => shiftRange(-1)}
		onNext={() => shiftRange(1)}
		onSetGranularity={setGranularity}
		onSetLayoutMode={setLayoutMode}
	>
		{#snippet groupFilter()}
			{#if channels.length > 0}
				<CalendarGroupFilter {channels} {allGroups} {selectedGroupIds} onChange={onGroupFilterChange} />
			{/if}
		{/snippet}
	</CalendarFilters>

	{#if loading}
		<div class="text-sm text-base-content/70">Loading scheduled posts…</div>
	{/if}

	<Calendar {display} rangeStartDate={rangeStartDate} {events} {backgroundEvents} />
</div>

