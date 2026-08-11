<script lang="ts">
	import type { BestTimeCalendarPreviewViewModel } from '$lib/best-time-to-post';

	import CalendarView from '$lib/ui/components/calendar-scheduler/CalendarView.svelte';

	type Props = {
		preview: BestTimeCalendarPreviewViewModel | null;
	};

	let { preview }: Props = $props();

	const previewKey = $derived(
		preview
			? `${preview.instanceId}:${preview.rangeStartDate}:${preview.dayBoundaries.start}:${preview.dayBoundaries.end}`
			: 'empty'
	);
</script>

{#if preview && preview.events.length > 0}
	<div
		class="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-base-300 bg-base-100 lg:overflow-x-visible"
		aria-hidden="true"
	>
		{#key previewKey}
			<CalendarView
				display="week"
				rangeStartDate={preview.rangeStartDate}
				events={preview.events}
				embeddedToolPreview
				calendarTimezone={preview.timezone}
				dayBoundaries={preview.dayBoundaries}
			/>
		{/key}
	</div>
{:else}
	<div
		class="border-base-300 bg-base-200/40 text-base-content/60 flex min-h-[200px] items-center justify-center rounded-xl border border-dashed px-4 text-center text-sm"
	>
		Week calendar preview appears after you generate a timing test plan.
	</div>
{/if}
