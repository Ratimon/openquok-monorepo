<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/ui/helpers/common';
	import DesktopSidebar from '$lib/ui/sidebar-expandable/DesktopSidebar.svelte';
	import MobileSidebar from '$lib/ui/sidebar-expandable/MobileSidebar.svelte';

	type Props = {
		class?: string;
		children?: Snippet;
	};

	let { class: className = '', children }: Props = $props();
</script>

<div class={cn(className)}>
	<DesktopSidebar className="h-full min-h-0">
		{@render children?.()}
	</DesktopSidebar>
	<MobileSidebar>
		{@render children?.()}
	</MobileSidebar>
</div>
