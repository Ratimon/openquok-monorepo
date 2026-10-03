<script lang="ts">
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		filteredCount: number;
		itemLabelSingular: string;
		itemLabelPlural: string;
		class?: string;
	};

	let {
		filteredCount,
		itemLabelSingular,
		itemLabelPlural,
		class: className = ''
	}: Props = $props();

	const itemLabel = $derived(filteredCount === 1 ? itemLabelSingular : itemLabelPlural);
</script>

<div
	class={cn(
		'rounded-xl border border-primary/25 bg-primary/5 p-3.5 shadow-sm shadow-primary/5',
		className
	)}
>
	<p class="text-sm leading-relaxed text-base-content/75">
		<span class="font-semibold text-base-content">{filteredCount.toLocaleString()}</span>
		{itemLabel}
	</p>
</div>
