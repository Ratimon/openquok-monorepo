<script lang="ts">
	import type { McpToolProgrammerModel } from '$lib/listings/Listing.repository.svelte';

	import {
		buildingBlockCatalogTableClass,
		buildingBlockCatalogTableHeadCellClass,
		buildingBlockCatalogTableRowClass,
		buildingBlockCatalogTableShellClass
	} from '$lib/ui/components/building-blocks/buildingBlockCatalogTableClasses';

	type Props = {
		toolsVm: McpToolProgrammerModel[];
		/** Hub card style: smaller padding and text. */
		compact?: boolean;
	};

	let { toolsVm, compact = false }: Props = $props();
</script>

{#if toolsVm.length > 0}
	<div class={buildingBlockCatalogTableShellClass}>
		<table class="{buildingBlockCatalogTableClass} {compact ? 'table-sm' : ''}">
			<thead>
				<tr>
					<th class={buildingBlockCatalogTableHeadCellClass}>Tool</th>
					<th class={buildingBlockCatalogTableHeadCellClass}>Description</th>
				</tr>
			</thead>
			<tbody>
				{#each toolsVm as tool (tool.name)}
					<tr class={buildingBlockCatalogTableRowClass}>
						<td class="px-3 py-2 font-mono {compact ? 'text-xs' : 'text-sm'} whitespace-nowrap">
							{tool.name}
						</td>
						<td class="px-3 py-2 {compact ? 'text-sm' : ''}">{tool.description}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
