<script lang="ts">
	import { cn } from '$lib/ui/helpers/common';
	import * as DropdownMenu from '$lib/ui/dropdown-menu';

	interface Props {
		class?: string;
		children?: import("svelte").Snippet;
	}

	let { class: className, children, ...props }: Props = $props();
</script>

<DropdownMenu.Content preventScroll={false} align="start" class={cn(className)} {...props}>
	{#if children}
		{@render children()}
	{/if}
</DropdownMenu.Content>
