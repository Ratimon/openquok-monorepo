<script lang="ts">
	// Minimal accordion built on bits-ui Collapsible primitives.
	// This keeps API consistent with our other ui wrappers.
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		class?: string;
		children?: () => unknown;
	};

	let { class: className, children }: Props = $props();
</script>

<div data-slot="accordion" class={cn('w-full', className)}>
	{@render children?.()}
</div>

