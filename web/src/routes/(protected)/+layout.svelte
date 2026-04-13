<script lang="ts">
	import type { Snippet } from 'svelte';

	import SetPostingScheduleTimezone from '$lib/ui/components/SetPostingScheduleTimezone.svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<SetPostingScheduleTimezone />
{@render children?.()}