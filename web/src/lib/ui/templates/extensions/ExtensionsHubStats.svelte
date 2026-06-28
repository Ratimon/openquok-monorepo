<script lang="ts">
	import type { ExtensionsHubStatsViewModel } from '$lib/listings/index';

	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		stats: ExtensionsHubStatsViewModel;
		class?: string;
	};

	let { stats, class: className = '' }: Props = $props();

	const pills = $derived([
		{ label: 'Total', value: stats.total, tone: 'bg-base-200 text-base-content' },
		{ label: 'Official', value: stats.official, tone: 'bg-primary/10 text-primary' },
		{ label: 'Skills', value: stats.skills, tone: 'bg-secondary/10 text-secondary' },
		{ label: 'MCP', value: stats.mcp, tone: 'bg-accent/10 text-accent' },
		{ label: 'Both', value: stats.both, tone: 'bg-info/10 text-info' }
	]);
</script>

<div class={cn('flex flex-wrap gap-2', className)} aria-label="Extension counts">
	{#each pills as pill (pill.label)}
		<span
			class={cn(
				'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
				pill.tone
			)}
		>
			<span>{pill.label}</span>
			<span class="tabular-nums">{pill.value}</span>
		</span>
	{/each}
</div>
