<script lang="ts">
	import Card from '$lib/ui/card/Card.svelte';
	import CardContent from '$lib/ui/card/CardContent.svelte';
	import CircularProgressBar from '$lib/ui/circular-progress-bar/CircularProgressBar.svelte';
	import { cn } from '$lib/ui/helpers/common';

	export type AccountStatsRadialItem = {
		name: string;
		usageLabel: string;
		capacity: number;
		/** When set, shown in the ring center instead of a percentage. */
		centerLabel?: string;
	};

	type Props = {
		items: AccountStatsRadialItem[];
		class?: string;
	};

	let { items, class: className = '' }: Props = $props();
</script>

<dl class={cn('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4', className)}>
	{#each items as item (item.name)}
		<Card class="gap-0 p-4 shadow-sm">
			<CardContent class="flex items-center gap-4 p-0">
				<div class="relative flex shrink-0 items-center justify-center">
					<CircularProgressBar
						value={item.capacity}
						size={80}
						strokeWidth={6}
						glow={false}
						showLabel={item.centerLabel == null}
					/>
					{#if item.centerLabel != null}
						<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
							<span class="text-sm font-semibold tabular-nums tracking-tight text-primary">
								{item.centerLabel}
							</span>
						</div>
					{/if}
				</div>
				<div class="min-w-0">
					<dt class="text-sm font-medium text-base-content">{item.name}</dt>
					<dd class="text-sm text-base-content/65">{item.usageLabel}</dd>
				</div>
			</CardContent>
		</Card>
	{/each}
</dl>
