<script lang="ts">
	import type {
		CalendarDisplayViewModel,
		CalendarGranularityViewModel,
		CalendarLayoutModeViewModel,
		ChannelViewModel,
		SchedulerPresenter
	} from '$lib/posts';

	import { toast } from '$lib/ui/sonner';

	import CalendarGroupFilter from '$lib/ui/components/calendar-scheduler/CalendarGroupFilter.svelte';
	import CalendarFilters from '$lib/ui/components/calendar-scheduler/CalendarFilters.svelte';
	import Calendar from '$lib/ui/components/calendar-scheduler/Calendar.svelte';

	type BackgroundEvent = {
		start: Temporal.PlainDate | Temporal.ZonedDateTime;
		end: Temporal.PlainDate | Temporal.ZonedDateTime;
		style: Record<string, string | number>;
		title?: string;
	};

	let {
		presenter,
		organizationId,
		channels,
		groupId = null,
		refreshKey = 0,
		onTargetedChannelsChange,
		onEditPostGroup,
		openActionsForPostGroup,
		onCreatePostAtIso,
		onRefresh
	}: {
		presenter: SchedulerPresenter;
		organizationId: string;
		channels: ChannelViewModel[];
		groupId?: string | null;
		refreshKey?: string | number;
		onTargetedChannelsChange?: (channels: ChannelViewModel[]) => void;
		onEditPostGroup?: (postGroup: string) => void;
		openActionsForPostGroup?: (postGroup: string) => void;
		onCreatePostAtIso?: (iso: string) => void;
		onRefresh?: () => void;
	} = $props();

	const scheduledPostsVm = $derived(presenter.scheduledPostsCalendarVm);

	const display = $derived<CalendarDisplayViewModel>(
		scheduledPostsVm.layoutMode === 'list' ? 'list' : scheduledPostsVm.granularity
	);

	const backgroundEvents = $derived.by<BackgroundEvent[]>(() => {
		if (scheduledPostsVm.layoutMode !== 'calendar') return [];
		if (!scheduledPostsVm.rangeStartDate || !scheduledPostsVm.rangeEndDate) return [];
		if (scheduledPostsVm.granularity === 'month') return [];

		const now = Temporal.Now.zonedDateTimeISO('UTC');
		const startD = new Date(`${scheduledPostsVm.rangeStartDate}T00:00:00Z`);
		const endD = new Date(`${scheduledPostsVm.rangeEndDate}T00:00:00Z`);
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

	$effect(() => {
		presenter.ensureRangeInitialized();
	});

	$effect(() => {
		const g = groupId ?? null;
		presenter.applyGroupIdFromUrl(g);
	});

	$effect(() => {
		presenter.populateAllGroupSelectionWhenEmpty(channels);
	});

	/**
	 * Primitive reload fingerprint — when only `events` / `loading` / `lastSuccessfulPostsKey` change,
	 * this string stays equal so the load `$effect` does not run again (avoids `effect_update_depth_exceeded`).
	 */
	const reloadScheduleKey = $derived.by(() => {
		const s = presenter.scheduledPostsCalendarVm;
		return [
			String(refreshKey),
			organizationId,
			s.rangeStartDate,
			s.rangeEndDate,
			String(s.allGroups),
			s.selectedGroupIds.slice().sort().join(','),
			s.granularity,
			s.layoutMode,
			channels.map((c) => c.id).sort().join(',')
		].join('\x1e');
	});

	$effect(() => {
		reloadScheduleKey;
		// Defer past this effect flush — `loadPostsForCurrentRange` patches `scheduledPostsCalendarVm` (e.g. `loading`)
		// synchronously before its first `await`; doing that inside the same `$effect` run triggers
		// `effect_update_depth_exceeded` because this effect depends on `presenter.scheduledPostsCalendarVm`.
		queueMicrotask(() => {
			void (async () => {
				const r = await presenter.loadPostsForCurrentRange({
					organizationId,
					channels,
					refreshKey
				});
				if (!r.ok) toast.error(r.error);
			})();
		});
	});

	const targetedChannels = $derived.by(() => {
		const filt = presenter.deriveIntegrationFilter(
			channels,
			scheduledPostsVm.allGroups,
			scheduledPostsVm.selectedGroupIds
		);
		if (filt.kind === 'none') return [];
		if (filt.kind === 'all') return channels;
		const ids = new Set(filt.integrationIds);
		return channels.filter((c) => ids.has(c.id));
	});

	$effect(() => {
		onTargetedChannelsChange?.(targetedChannels);
	});

	function onGroupFilterChange(next: { allGroups: boolean; selectedGroupIds: string[] }) {
		presenter.setGroupFilter(next);
	}

	function setGranularity(next: CalendarGranularityViewModel) {
		presenter.setGranularity(next);
	}

	function setLayoutMode(next: CalendarLayoutModeViewModel) {
		presenter.setLayoutMode(next);
	}

	function goToday() {
		presenter.goToday();
	}

	function shiftRange(delta: number) {
		presenter.shiftRange(delta);
	}
</script>

<div class="space-y-3">
	<CalendarFilters
		granularity={scheduledPostsVm.granularity}
		layoutMode={scheduledPostsVm.layoutMode}
		label={presenter.labelForRange()}
		onToday={goToday}
		onPrev={() => shiftRange(-1)}
		onNext={() => shiftRange(1)}
		onSetGranularity={setGranularity}
		onSetLayoutMode={setLayoutMode}
	>
		{#snippet groupFilter()}
			{#if channels.length > 0}
				<CalendarGroupFilter
					{channels}
					allGroups={scheduledPostsVm.allGroups}
					selectedGroupIds={scheduledPostsVm.selectedGroupIds}
					onChange={onGroupFilterChange}
				/>
			{/if}
		{/snippet}
	</CalendarFilters>

	{#if scheduledPostsVm.loading}
		<div class="text-sm text-base-content/70">Loading scheduled posts…</div>
	{/if}

	<Calendar
		{display}
		rangeStartDate={scheduledPostsVm.rangeStartDate}
		events={scheduledPostsVm.events}
		{backgroundEvents}
		{onEditPostGroup}
		{openActionsForPostGroup}
		{onCreatePostAtIso}
		{onRefresh}
	/>
</div>
