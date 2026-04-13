<script lang="ts">
	import { applyPostingScheduleTimezoneDefaultFromStorage } from '$lib/utils/postingSchedulePreferences';

	import { onMount } from 'svelte';

	/** Applies stored IANA timezone to `dayjs.tz` default for protected app shell (posting schedules, etc.). */
	onMount(() => {
		applyPostingScheduleTimezoneDefaultFromStorage();
	});
</script>
