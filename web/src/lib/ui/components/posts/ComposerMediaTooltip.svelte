<script module lang="ts">
	export function composeTooltipTriggerClick(
		triggerProps: Record<string, unknown>,
		handler: (e: MouseEvent) => void
	): (e: MouseEvent) => void {
		return (e: MouseEvent) => {
			const tipClick = triggerProps.onclick as ((ev: MouseEvent) => void) | undefined;
			tipClick?.(e);
			handler(e);
		};
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	import * as Tooltip from '$lib/ui/tooltip';

	type Props = {
		label: string;
		side?: 'top' | 'right' | 'bottom' | 'left';
		sideOffset?: number;
		trigger: Snippet<[{ props: Record<string, unknown> }]>;
	};

	let {
		label,
		side = 'top',
		sideOffset = 6,
		trigger
	}: Props = $props();
</script>

<Tooltip.Root>
	<Tooltip.Trigger>
		{#snippet child({ props })}
			{@render trigger({ props })}
		{/snippet}
	</Tooltip.Trigger>
	<Tooltip.Content {side} {sideOffset}>{label}</Tooltip.Content>
</Tooltip.Root>
