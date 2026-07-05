<script lang="ts">
	import type { SkillCommandViewModel } from '$lib/listings/index';

	import {
		buildingBlockCatalogCommandTemplateClass,
		buildingBlockCatalogTableClass,
		buildingBlockCatalogTableHeadCellClass,
		buildingBlockCatalogTableRowClass,
		buildingBlockCatalogTableShellClass
	} from '$lib/ui/components/building-blocks/buildingBlockCatalogTableClasses';

	type Props = {
		commandsVm: SkillCommandViewModel[];
		/** Hub card style: compact rows, name + description only (no command templates). */
		compact?: boolean;
	};

	let { commandsVm, compact = false }: Props = $props();
</script>

{#if commandsVm.length > 0}
	<div class={buildingBlockCatalogTableShellClass}>
		<table class="{buildingBlockCatalogTableClass} {compact ? 'table-sm' : ''}">
			<thead>
				<tr>
					<th class={buildingBlockCatalogTableHeadCellClass}>Command</th>
					<th class={buildingBlockCatalogTableHeadCellClass}>Description</th>
				</tr>
			</thead>
			<tbody>
				{#each commandsVm as command (command.name)}
					<tr class={buildingBlockCatalogTableRowClass}>
						<td class="px-3 py-2 font-mono text-xs whitespace-nowrap">{command.name}</td>
						<td class="px-3 py-2 {compact ? 'text-sm align-top' : 'align-top'}">
							{#if compact}
								{command.description}
							{:else}
								<p>{command.description}</p>
								{#if command.commandTemplate}
									<pre class={buildingBlockCatalogCommandTemplateClass}>{command.commandTemplate}</pre>
								{/if}
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
