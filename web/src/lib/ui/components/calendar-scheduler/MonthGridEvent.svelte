<script lang="ts">
	import CalendarItem from '$lib/ui/components/calendar-scheduler/CalendarItem.svelte';

	type Props = {
		calendarEvent: any;
	};

	let { calendarEvent }: Props = $props();
</script>

<CalendarItem {calendarEvent} variant="monthGrid" />
