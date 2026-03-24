<script lang="ts">
	import { cn } from '$lib/ui/helpers/common';

	type LegendVariant = 'legend' | 'label';

	// Keep typing permissive here: Svelte $props typing + WithElementRef generics
	// can collapse to `never` in our setup.
	let {
		ref = $bindable(null),
		class: className,
		variant = 'legend' satisfies LegendVariant,
		children,
		...restProps
	}: any = $props();
</script>

<legend
	bind:this={ref}
	data-slot="field-legend"
	class={cn(
		'text-sm font-medium text-base-content',
		variant === 'label' ? 'px-1' : '',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</legend>

