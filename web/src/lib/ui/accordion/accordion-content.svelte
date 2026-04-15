<script lang="ts">
	import { Collapsible as CollapsiblePrimitive } from 'bits-ui';
	import { cn } from '$lib/ui/helpers/common';

	let { class: className, children, ...restProps }: CollapsiblePrimitive.ContentProps = $props();
</script>

<CollapsiblePrimitive.Content data-slot="accordion-content" class={cn('w-full', className)} {...restProps}>
	{@render children?.()}
</CollapsiblePrimitive.Content>

