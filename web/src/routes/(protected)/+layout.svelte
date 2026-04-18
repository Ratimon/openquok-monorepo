<script lang="ts">
	import type { Snippet } from 'svelte';

	import SetPostingScheduleTimezone from '$lib/ui/components/SetPostingScheduleTimezone.svelte';

	type ProtectedLayoutProps = {
		children: Snippet;
	};

	let { children }: ProtectedLayoutProps = $props();
</script>

<SetPostingScheduleTimezone />
{@render children?.()}