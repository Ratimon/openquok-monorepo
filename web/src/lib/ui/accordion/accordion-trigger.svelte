<script lang="ts">
	import { Collapsible as CollapsiblePrimitive } from 'bits-ui';
	import { cn } from '$lib/ui/helpers/common';

	let { class: className, children, ...restProps }: CollapsiblePrimitive.TriggerProps = $props();
</script>

<CollapsiblePrimitive.Trigger data-slot="accordion-trigger" class={cn('w-full', className)} {...restProps}>
	{@render children?.()}
</CollapsiblePrimitive.Trigger>

