<script lang="ts">
	import CalendarItem from './CalendarItem.svelte';

	export let calendarEvent: any;
</script>

<CalendarItem {calendarEvent} variant="timeGrid" />

